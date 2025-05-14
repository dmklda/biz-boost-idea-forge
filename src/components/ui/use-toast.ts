import { toast as sonnerToast } from "sonner";
import { ToastProps } from "sonner";

export type ToastActionElement = React.ReactElement<HTMLButtonElement>;

// Re-export toast from sonner with enhanced functionality
export const toast = {
  ...sonnerToast,
  // Keep sonner's original methods
  success: sonnerToast.success,
  error: sonnerToast.error,
  info: sonnerToast.info,
  warning: sonnerToast.warning,
  // Support direct invocation for backward compatibility
  (props: ToastProps | string): void {
    if (typeof props === "string") {
      sonnerToast(props);
    } else {
      sonnerToast(props);
    }
  }
};

// Use-toast hook for compatibility with UI
export function useToast() {
  return {
    toast,
    // This is for radix toast compatibility if needed
    toasts: []
  };
}
