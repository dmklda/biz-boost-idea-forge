
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";

export interface FeatureCreditCost {
  feature: string;
  creditCost: number;
  freeForPro: boolean;
}

// Credit costs for different features
export const FEATURE_COSTS: Record<string, FeatureCreditCost> = {
  BASIC_ANALYSIS: { 
    feature: "basic_analysis", 
    creditCost: 1, 
    freeForPro: false 
  },
  REANALYSIS: { 
    feature: "reanalysis", 
    creditCost: 1, 
    freeForPro: false 
  },
  IDEA_COMPARISON: { 
    feature: "idea_comparison", 
    creditCost: 1, 
    freeForPro: false 
  },
  ADVANCED_ANALYSIS: { 
    feature: "advanced_analysis", 
    creditCost: 2, 
    freeForPro: false 
  },
  PDF_DOWNLOAD: { 
    feature: "pdf_download", 
    creditCost: 1, 
    freeForPro: true 
  }
};

// Plans with their features
export const PLAN_FEATURES = {
  free: {
    analysesPerMonth: 1,
    compareIdeas: false,
    advancedAnalysis: false,
    pdfDownload: false,
    aiChat: false
  },
  basic: {
    analysesPerMonth: 5,
    compareIdeas: true,
    advancedAnalysis: false,
    pdfDownload: false,
    aiChat: true
  },
  pro: {
    analysesPerMonth: "Unlimited",
    compareIdeas: true,
    advancedAnalysis: true,
    pdfDownload: true,
    aiChat: true
  },
  enterprise: {
    analysesPerMonth: "Unlimited",
    compareIdeas: true,
    advancedAnalysis: true,
    pdfDownload: true,
    aiChat: true
  }
};

// Function to check if a user has enough credits for a feature
export const checkCreditsForFeature = async (
  userId: string | undefined, 
  featureType: keyof typeof FEATURE_COSTS
): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // Get user's current credits and plan
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('credits, plan')
      .eq('id', userId)
      .single();
      
    if (error || !profile) {
      console.error("Error checking user credits:", error);
      return false;
    }
    
    const featureCost = FEATURE_COSTS[featureType];
    
    // If user is on Pro plan and the feature is free for Pro users
    if (profile.plan === 'pro' && featureCost.freeForPro) {
      return true;
    }
    
    // Check if user has enough credits
    return profile.credits >= featureCost.creditCost;
  } catch (err) {
    console.error("Error in checkCreditsForFeature:", err);
    return false;
  }
};

// Function to deduct credits for using a feature
export const deductCreditsForFeature = async (
  userId: string | undefined, 
  featureType: keyof typeof FEATURE_COSTS,
  itemId?: string // Optional ID of the related item (idea, analysis, etc.)
): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // Get user's current credits and plan
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('credits, plan')
      .eq('id', userId)
      .single();
      
    if (error || !profile) {
      console.error("Error checking user credits:", error);
      return false;
    }
    
    const featureCost = FEATURE_COSTS[featureType];
    
    // If user is on Pro plan and the feature is free for Pro users
    if (profile.plan === 'pro' && featureCost.freeForPro) {
      // Log the usage but don't deduct credits
      await supabase.from('credit_transactions').insert({
        user_id: userId,
        amount: 0,
        description: `Used ${featureCost.feature} (free with Pro plan)`,
        feature: featureCost.feature,
        item_id: itemId
      });
      return true;
    }
    
    // Check if user has enough credits
    if (profile.credits < featureCost.creditCost) {
      return false;
    }
    
    // Deduct credits using the update_user_credits function and record the transaction
    const { error: updateError } = await supabase.rpc("update_user_credits", { 
      user_id: userId, 
      amount: -featureCost.creditCost 
    });
    
    if (updateError) {
      console.error("Error deducting credits:", updateError);
      return false;
    }
    
    // Log the transaction
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount: -featureCost.creditCost,
      description: `Used ${featureCost.feature}`,
      feature: featureCost.feature,
      item_id: itemId
    });
    
    return true;
  } catch (err) {
    console.error("Error in deductCreditsForFeature:", err);
    return false;
  }
};

// Hook to use credit system functions with context
export const useCreditSystem = () => {
  const { authState } = useAuth();
  
  const checkCredits = async (featureType: keyof typeof FEATURE_COSTS): Promise<boolean> => {
    const hasCredits = await checkCreditsForFeature(authState.user?.id, featureType);
    
    if (!hasCredits) {
      toast.error("Créditos insuficientes", {
        description: "Você não tem créditos suficientes para usar esta funcionalidade.",
        action: {
          label: "Comprar créditos",
          onClick: () => window.location.href = "/dashboard/creditos"
        }
      });
    }
    
    return hasCredits;
  };
  
  const deductCredits = async (
    featureType: keyof typeof FEATURE_COSTS,
    itemId?: string
  ): Promise<boolean> => {
    const result = await deductCreditsForFeature(authState.user?.id, featureType, itemId);
    
    if (!result) {
      toast.error("Créditos insuficientes", {
        description: "Você não tem créditos suficientes para usar esta funcionalidade.",
        action: {
          label: "Comprar créditos",
          onClick: () => window.location.href = "/dashboard/creditos"
        }
      });
    }
    
    return result;
  };
  
  const hasFeatureAccess = (feature: string): boolean => {
    if (!authState.user) return false;
    
    const plan = authState.user.plan as keyof typeof PLAN_FEATURES;
    return Boolean(PLAN_FEATURES[plan]?.[feature as keyof typeof PLAN_FEATURES['free']]);
  };
  
  return {
    checkCredits,
    deductCredits,
    hasFeatureAccess,
    userPlan: authState.user?.plan,
    userCredits: authState.user?.credits
  };
};
