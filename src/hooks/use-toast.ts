import { toast as sonnerToast } from "sonner";
import { ToastProps } from "sonner";

export type { ToastProps };

// Enhanced toast with fallback to direct invocation
export const toast = Object.assign(
  // Direct invocation
  (props: ToastProps | string): void => {
    if (typeof props === "string") {
      sonnerToast(props);
    } else {
      sonnerToast(props);
    }
  },
  // Methods
  {
    success: sonnerToast.success,
    error: sonnerToast.error,
    info: sonnerToast.info,
    warning: sonnerToast.warning,
    // Add any other methods from sonner toast here
  }
);

// Compatibility hook to match shadcn's useToast interface
export function useToast() {
  return {
    toast,
    // This is for legacy toast compatibility
    toasts: []
  };
}
