
import { toast as sonnerToast } from "sonner";
import type { ToasterProps } from "sonner";

export type ToastActionElement = React.ReactElement<HTMLButtonElement>;
// Fix the type definition
export type ToastProps = Parameters<typeof sonnerToast.success>[0] | Parameters<typeof sonnerToast>[0];

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
  
  // Add method properties that correctly handle object parameters
  toast.success = (props: ToastProps | string) => {
    if (typeof props === "string") {
      return sonnerToast.success(props);
    } else {
      return sonnerToast.success(props);
    }
  };

  toast.error = (props: ToastProps | string) => {
    if (typeof props === "string") {
      return sonnerToast.error(props);
    } else {
      return sonnerToast.error(props);
    }
  };

  toast.info = (props: ToastProps | string) => {
    if (typeof props === "string") {
      return sonnerToast.info(props);
    } else {
      return sonnerToast.info(props);
    }
  };

  toast.warning = (props: ToastProps | string) => {
    if (typeof props === "string") {
      return sonnerToast.warning(props);
    } else {
      return sonnerToast.warning(props);
    }
  };
  
  return toast;
};

// Export the toast with all its methods
export const toast = createToast();

// Use-toast hook for compatibility with UI
export function useToast() {
  return {
    toast,
    // This is for radix toast compatibility if needed
    toasts: []
  };
}
