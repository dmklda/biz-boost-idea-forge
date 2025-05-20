
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

// Key used for localStorage
const ONBOARDING_COMPLETED_KEY = "onboardingCompleted";
const USER_PREFERENCES_KEY = "userPreferences";

export type UserPreferences = {
  objective: string;
  hasBusinessIdea: boolean;
  experienceLevel: "beginner" | "intermediate" | "advanced";
  preferenceType: "suggestions" | "analysis";
};

export function useOnboarding() {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(true); // Default to true to avoid flash
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  
  // Load onboarding status from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem(ONBOARDING_COMPLETED_KEY) === "true";
      setIsOnboardingCompleted(completed);
      
      // Load user preferences if available
      try {
        const storedPreferences = localStorage.getItem(USER_PREFERENCES_KEY);
        if (storedPreferences) {
          setUserPreferences(JSON.parse(storedPreferences));
        }
      } catch (e) {
        console.error("Error loading user preferences:", e);
      }
      
      setIsLoading(false);
    }
  }, []);
  
  // Function to mark onboarding as completed
  const completeOnboarding = (preferences: UserPreferences) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
      localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
      setIsOnboardingCompleted(true);
      setUserPreferences(preferences);
    }
  };
  
  // Calculate if we should show onboarding
  // Only show if: on mobile, onboarding not completed, and not loading
  const shouldShowOnboarding = isMobile && !isOnboardingCompleted && !isLoading;
  
  return {
    isOnboardingCompleted,
    shouldShowOnboarding,
    completeOnboarding,
    userPreferences,
    isLoading
  };
}
