import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useOnboarding } from "@/hooks/use-onboarding";

export const IntelligentRedirect = ({ children }: { children: React.ReactNode }) => {
  const { authState } = useAuth();
  const isMobile = useIsMobile();
  const { shouldShowOnboarding } = useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect if we're already on the correct pages
    if (
      location.pathname === "/onboarding" ||
      location.pathname === "/login" ||
      location.pathname === "/register" ||
      location.pathname.startsWith("/dashboard")
    ) {
      return;
    }

    // Mobile redirect logic when clicking on logo
    if (isMobile && location.pathname === "/") {
      // If mobile user should see onboarding, redirect there first
      if (shouldShowOnboarding) {
        navigate("/onboarding");
        return;
      }

      // Otherwise, check auth status
      if (authState.isAuthenticated) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }
  }, [isMobile, authState.isAuthenticated, shouldShowOnboarding, navigate, location.pathname]);

  return <>{children}</>;
};
