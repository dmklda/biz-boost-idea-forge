
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

// Credit cost for each feature
export const CREDIT_COSTS = {
  BASIC_ANALYSIS: 1,
  REANALYSIS: 1,
  COMPARE_IDEAS: 1,
  ADVANCED_ANALYSIS: 2,
  PDF_DOWNLOAD: 1,
  AI_CHAT: 1
};

// Features available for each plan
export const PLAN_FEATURES = {
  free: {
    analysesPerMonth: 1, // First one free
    compareIdeas: false, // Not available
    advancedAnalysis: false, // Not available
    pdfDownload: false, // Not available
    aiChat: false // Not available
  },
  basic: {
    analysesPerMonth: 5,
    compareIdeas: true,
    advancedAnalysis: false,
    pdfDownload: false,
    aiChat: true
  },
  pro: {
    analysesPerMonth: "unlimited",
    compareIdeas: true,
    advancedAnalysis: true,
    pdfDownload: true,
    aiChat: true
  }
};

// Define feature types
export type FeatureType = 'BASIC_ANALYSIS' | 'REANALYSIS' | 'COMPARE_IDEAS' | 'ADVANCED_ANALYSIS' | 'PDF_DOWNLOAD' | 'AI_CHAT';

export const useCreditSystem = () => {
  const { t } = useTranslation();
  const { authState, updateUserCredits } = useAuth();
  const { user } = authState;
  const [userCredits, setUserCredits] = useState<number>(0);
  const [userPlan, setUserPlan] = useState<string>('free');

  useEffect(() => {
    if (user) {
      setUserCredits(user.credits || 0);
      setUserPlan(user.plan || 'free');
    } else {
      setUserCredits(0);
      setUserPlan('free');
    }
  }, [user]);

  // Check if the user has enough credits for a feature
  const checkCredits = async (featureType: FeatureType): Promise<boolean> => {
    if (!user) {
      return false;
    }

    // Pro plan users don't need to check credits for most features
    if (user.plan === 'pro') {
      return true;
    }
    
    const requiredCredits = CREDIT_COSTS[featureType];
    const hasEnoughCredits = user.credits >= requiredCredits;
    
    if (!hasEnoughCredits) {
      toast.error(
        t('credits.insufficientCredits', "Créditos insuficientes para esta ação"), 
        {
          action: {
            label: t('credits.buyMore', "Comprar créditos"),
            onClick: () => window.location.href = '/dashboard/creditos'
          }
        }
      );
    }
    
    return hasEnoughCredits;
  };

  // Deduct credits from the user's account
  const deductCredits = async (featureType: FeatureType, itemId?: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    // Pro plan users don't need to spend credits
    if (user.plan === 'pro') {
      // But we still log the transaction with 0 credit cost
      await logCreditTransaction(0, featureType, itemId);
      return true;
    }

    const creditCost = CREDIT_COSTS[featureType];
    const newCreditBalance = user.credits - creditCost;

    if (newCreditBalance < 0) {
      toast.error(t('credits.insufficientCredits', "Créditos insuficientes para esta ação"));
      return false;
    }

    try {
      // Update user's credits locally first for immediate feedback
      updateUserCredits(newCreditBalance);
      
      // Call Supabase RPC function to update credits
      const { error } = await supabase.rpc('update_user_credits', { 
        user_id: user.id, 
        amount: -creditCost 
      });
      
      if (error) {
        throw error;
      }
      
      // Log the transaction
      await logCreditTransaction(-creditCost, featureType, itemId);
      
      return true;
    } catch (error) {
      console.error("Error deducting credits:", error);
      
      // Revert local credits update on error
      updateUserCredits(user.credits);
      
      toast.error(t('credits.errorDeducting', "Erro ao deduzir créditos. Tente novamente."));
      return false;
    }
  };

  // Log a credit transaction
  const logCreditTransaction = async (amount: number, featureType: FeatureType, itemId?: string): Promise<void> => {
    if (!user) return;
    
    let description = '';
    
    switch (featureType) {
      case 'BASIC_ANALYSIS':
        description = t('credits.transactions.basicAnalysis', "Análise básica");
        break;
      case 'REANALYSIS':
        description = t('credits.transactions.reanalysis', "Reanálise de ideia");
        break;
      case 'COMPARE_IDEAS':
        description = t('credits.transactions.compareIdeas', "Comparação de ideias");
        break;
      case 'ADVANCED_ANALYSIS':
        description = user.plan === 'pro' 
          ? t('credits.transactions.advancedAnalysisPro', "Análise avançada (Plano Pro)") 
          : t('credits.transactions.advancedAnalysis', "Análise avançada");
        break;
      case 'PDF_DOWNLOAD':
        description = t('credits.transactions.pdfDownload', "Download de PDF");
        break;
      case 'AI_CHAT':
        description = t('credits.transactions.aiChat', "Chat com IA");
        break;
    }
    
    try {
      await supabase.from('credit_transactions').insert({
        user_id: user.id,
        amount: amount,
        description: description,
        feature: featureType.toLowerCase(),
        item_id: itemId
      });
    } catch (error) {
      console.error("Error logging credit transaction:", error);
    }
  };

  // Check if the user has access to a specific feature based on their plan
  const hasFeatureAccess = (feature: string): boolean => {
    if (!user) return false;
    
    const plan = user.plan || 'free';
    
    switch (feature) {
      case 'compareIdeas':
        return PLAN_FEATURES[plan as keyof typeof PLAN_FEATURES].compareIdeas;
      case 'advancedAnalysis':
        return PLAN_FEATURES[plan as keyof typeof PLAN_FEATURES].advancedAnalysis;
      case 'pdfDownload':
        return PLAN_FEATURES[plan as keyof typeof PLAN_FEATURES].pdfDownload;
      case 'aiChat':
        return PLAN_FEATURES[plan as keyof typeof PLAN_FEATURES].aiChat;
      default:
        return false;
    }
  };

  return { 
    checkCredits, 
    deductCredits, 
    hasFeatureAccess,
    logCreditTransaction,
    userCredits,
    userPlan
  };
};
