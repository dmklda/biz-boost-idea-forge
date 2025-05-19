
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { User } from "@/types/auth";

// Define feature costs
export const FEATURE_COSTS = {
  analysis: 1,      // Basic idea analysis
  reanalysis: 1,    // Re-analyzing an idea
  advanced: 2,      // Advanced analysis 
  compare: 1,       // Comparing ideas
  download: 1,      // PDF download
  share: 0,         // Sharing is free
};

// Feature names for display
export const FEATURE_NAMES = {
  analysis: "Análise de Ideia",
  reanalysis: "Reanálise de Ideia",
  advanced: "Análise Avançada",
  compare: "Comparação de Ideias",
  download: "Download de PDF",
  share: "Compartilhamento",
};

// Plan definitions
export type PlanType = "free" | "basic" | "pro" | "enterprise";

export interface Plan {
  id: PlanType;
  name: string;
  monthlyPrice: string;
  quarterlyPrice?: string;
  annualPrice?: string;
  features: string[];
  recommended: boolean;
  color: string;
  freeCredits: number;
  monthlyCost: number;
  quarterlyCost?: number;
  annualCost?: number;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: "$0",
    features: [
      "3 análises de ideias por mês",
      "Relatório básico",
      "Acesso à comunidade",
    ],
    recommended: false,
    color: "from-gray-400/20 to-gray-500/30",
    freeCredits: 3,
    monthlyCost: 0,
  },
  {
    id: "basic",
    name: "Basic",
    monthlyPrice: "$19.90",
    quarterlyPrice: "$53.73",
    annualPrice: "$179.10",
    features: [
      "10 análises de ideias por mês",
      "Relatórios detalhados",
      "Suporte por email",
      "Acesso à comunidade",
    ],
    recommended: false,
    color: "from-blue-400/20 to-blue-500/30",
    freeCredits: 10,
    monthlyCost: 19.9,
    quarterlyCost: 53.73,
    annualCost: 179.1,
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: "$49.90",
    quarterlyPrice: "$134.73",
    annualPrice: "$449.10",
    features: [
      "Análises ilimitadas",
      "Relatórios detalhados",
      "Suporte prioritário",
      "Ferramentas avançadas",
      "Acesso a webinars exclusivos",
      "Downloads ilimitados",
    ],
    recommended: true,
    color: "from-brand-purple/20 via-indigo-500/20 to-brand-purple/30",
    freeCredits: 50,
    monthlyCost: 49.9,
    quarterlyCost: 134.73,
    annualCost: 449.1,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: "Custom",
    features: [
      "Análises ilimitadas",
      "API dedicada",
      "Suporte prioritário",
      "Ferramentas avançadas personalizadas",
      "Treinamentos exclusivos",
      "Downloads ilimitados",
      "Acesso antecipado a novos recursos"
    ],
    recommended: false,
    color: "from-purple-600/20 to-purple-800/30",
    freeCredits: 100,
    monthlyCost: 0, // Custom pricing
  }
];

// Credit packages
export interface CreditPackage {
  id: number;
  amount: number;
  price: string;
  rawPrice: number;
  savings: string;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: 1, amount: 5, price: "$24.90", rawPrice: 24.9, savings: "" },
  { id: 2, amount: 10, price: "$44.90", rawPrice: 44.9, savings: "10% de desconto" },
  { id: 3, amount: 25, price: "$99.90", rawPrice: 99.9, savings: "20% de desconto" },
];

// Check if user can afford a feature
export const canAffordFeature = (user: User | null, feature: keyof typeof FEATURE_COSTS): boolean => {
  if (!user) return false;
  
  // Pro users get most features for free
  if ((user.plan === "pro" || user.plan === "enterprise") && feature === "download") {
    return true;
  }
  
  return (user.credits >= FEATURE_COSTS[feature]);
};

// Use credits for a feature with proper tracking
export const useCreditsForFeature = async (
  user: User, 
  feature: keyof typeof FEATURE_COSTS, 
  itemId?: string,
  customDescription?: string
): Promise<boolean> => {
  // If feature is free, succeed immediately
  if (FEATURE_COSTS[feature] === 0) return true;
  
  // Pro and Enterprise users get download for free
  if ((user.plan === "pro" || user.plan === "enterprise") && feature === "download") return true;
  
  // First analysis is free
  if (feature === "analysis") {
    const { data: firstAnalysis, error: checkError } = await supabase
      .rpc('is_first_analysis', { user_id_param: user.id });
      
    if (!checkError && firstAnalysis === true) {
      // Log the free first analysis
      const { error: logError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: 0, // Free
          description: "Primeira análise (grátis)",
          feature: feature,
          item_id: itemId ? itemId : null
        });
        
      if (logError) {
        console.error("Error logging free analysis:", logError);
      }
      
      return true;
    }
  }
  
  // Create description
  const description = customDescription || `${FEATURE_NAMES[feature]}`;
  
  // Use RPC to deduct credits and log transaction
  const { data: success, error } = await supabase
    .rpc('use_credits_for_feature', {
      user_id_param: user.id,
      amount_param: FEATURE_COSTS[feature],
      description_param: description,
      feature_param: feature,
      item_id_param: itemId || null
    });
  
  if (error || !success) {
    console.error("Error using credits:", error);
    toast.error(`Créditos insuficientes para ${FEATURE_NAMES[feature]}.`);
    return false;
  }
  
  return true;
};

// Get plan details
export const getPlan = (planId: PlanType): Plan => {
  return PLANS.find(plan => plan.id === planId) || PLANS[0];
};
