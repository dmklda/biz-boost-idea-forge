
import { toast as sonnerToast } from "sonner";
import type { ToasterProps } from "sonner";

export type ToastActionElement = React.ReactElement<HTMLButtonElement>;

// Ensure we have the correct type definition that includes title and description
export interface ToastProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  [key: string]: any;
}

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
