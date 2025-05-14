
import { toast as sonnerToast } from "sonner";
import type { ToasterProps } from "sonner";

// Export the correct type
export type ToastProps = ToasterProps["toast"];

// Create a function that can be called directly and also has methods
// This pattern allows both toast() and toast.success() to work
const createToast = () => {
  // Create the base function
  const toast = (props: ToastProps | string) => {
    if (typeof props === "string") {
      return sonnerToast(props);
    } else {
      return sonnerToast(props);
    }
  };
  
  // Add method properties
  toast.success = sonnerToast.success;
  toast.error = sonnerToast.error;
  toast.info = sonnerToast.info;
  toast.warning = sonnerToast.warning;
  
  return toast;
};

// Export the toast with all its methods
export const toast = createToast();

// Compatibility hook to match shadcn's useToast interface
export function useToast() {
  return {
    toast,
    // This is for legacy toast compatibility
    toasts: []
  };
}
