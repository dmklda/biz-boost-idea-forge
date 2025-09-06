import { useAuth } from "./useAuth";

export type PlanType = 'free' | 'entrepreneur' | 'business';
export type FeatureType = 
  | 'marketplace' 
  | 'simulator' 
  | 'regulatory-analysis' 
  | 'benchmarks'
  | 'advanced-analysis'
  | 'logo-generator'
  | 'prd-mvp'
  | 'pdf-export'
  | 'user-research'
  | 'valuation-calculator'
  | 'marketing-strategy'
  | 'business-plan'
  | 'seo-analyzer'
  | 'landing-page-generator';

const FEATURE_PLAN_REQUIREMENTS: Record<FeatureType, PlanType[]> = {
  'marketplace': ['entrepreneur', 'business'],
  'simulator': ['entrepreneur', 'business'],
  'regulatory-analysis': ['entrepreneur', 'business'],
  'benchmarks': ['business'],
  'advanced-analysis': ['free', 'entrepreneur', 'business'], // Now available to all plans
  'logo-generator': ['free', 'entrepreneur', 'business'],
  'prd-mvp': ['free', 'entrepreneur', 'business'],
  'pdf-export': ['entrepreneur', 'business'],
  'user-research': ['free', 'entrepreneur', 'business'],
  'valuation-calculator': ['free', 'entrepreneur', 'business'],
  'marketing-strategy': ['free', 'entrepreneur', 'business'],
  'business-plan': ['free', 'entrepreneur', 'business'],
  'seo-analyzer': ['free', 'entrepreneur', 'business'],
  'landing-page-generator': ['free', 'entrepreneur', 'business']
};

const PLAN_CREDITS: Record<PlanType, { initial: number; monthly: number }> = {
  'free': { initial: 3, monthly: 0 },
  'entrepreneur': { initial: 50, monthly: 50 },
  'business': { initial: 200, monthly: 200 }
};

const FEATURE_COSTS: Record<FeatureType | 'basic-analysis' | 'reanalysis' | 'comparison', number> = {
  'basic-analysis': 1,
  'reanalysis': 1,
  'advanced-analysis': 10,
  'regulatory-analysis': 2,
  'simulator': 2,
  'comparison': 1,
  'logo-generator': 3,
  'prd-mvp': 5,
  'benchmarks': 2,
  'pdf-export': 1,
  'marketplace': 0,
  'user-research': 6,
  'valuation-calculator': 7,
  'marketing-strategy': 8,
  'business-plan': 12,
  'seo-analyzer': 5,
  'landing-page-generator': 18
};

export const usePlanAccess = () => {
  const { authState } = useAuth();
  const user = authState.user;

  const hasFeatureAccess = (feature: FeatureType): boolean => {
    if (!user) return false;
    
    const requiredPlans = FEATURE_PLAN_REQUIREMENTS[feature];
    return requiredPlans.includes(user.plan);
  };

  const getRequiredPlan = (feature: FeatureType): PlanType => {
    const requiredPlans = FEATURE_PLAN_REQUIREMENTS[feature];
    return requiredPlans[0]; // Return the minimum required plan
  };

  const hasCredits = (feature: FeatureType | 'basic-analysis' | 'reanalysis' | 'comparison'): boolean => {
    if (!user) return false;
    
    const cost = FEATURE_COSTS[feature];
    
    // Special case: first analysis is free for all users
    if (feature === 'basic-analysis' && !user.first_analysis_done) {
      return true;
    }
    
    // PDF export is free for business plan
    if (feature === 'pdf-export' && user.plan === 'business') {
      return true;
    }
    
    // Check if user has enough credits
    return user.credits >= cost;
  };

  const canAccessFeature = (feature: FeatureType): boolean => {
    if (!user) return false;
    
    // Check plan access first
    const requiredPlans = FEATURE_PLAN_REQUIREMENTS[feature];
    const hasPlanAccess = requiredPlans.includes(user.plan);
    
    // Then check credits if needed
    const hasEnoughCredits = hasCredits(feature);
    
    return hasPlanAccess && hasEnoughCredits;
  };

  const getFeatureCost = (feature: FeatureType | 'basic-analysis' | 'reanalysis' | 'comparison'): number => {
    // First analysis is free
    if (feature === 'basic-analysis' && !user?.first_analysis_done) {
      return 0;
    }
    
    // PDF export is free for business plan
    if (feature === 'pdf-export' && user?.plan === 'business') {
      return 0;
    }
    
    return FEATURE_COSTS[feature];
  };

  const getPlanCredits = (plan: PlanType) => PLAN_CREDITS[plan];

  const getCurrentPlanCredits = () => {
    if (!user) return { initial: 0, monthly: 0 };
    return PLAN_CREDITS[user.plan];
  };

  return {
    hasFeatureAccess,
    getRequiredPlan,
    hasCredits,
    getFeatureCost,
    getPlanCredits,
    getCurrentPlanCredits,
    canAccessFeature,
    userPlan: user?.plan || 'free',
    userCredits: user?.credits || 0
  };
};