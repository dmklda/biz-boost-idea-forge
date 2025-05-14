
import { toast as sonnerToast } from "sonner";

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
      return sonnerToast(props.title || "", {
        description: props.description,
        action: props.action,
        ...props
      });
    }
  };
  
  // Add method properties that correctly handle object parameters
  toast.success = (props: ToastProps | string) => {
    if (typeof props === "string") {
      return sonnerToast.success(props);
    } else {
      return sonnerToast.success(props.title || "", {
        description: props.description,
        action: props.action,
        ...props
      });
    }
  };

  toast.error = (props: ToastProps | string) => {
    if (typeof props === "string") {
      return sonnerToast.error(props);
    } else {
      return sonnerToast.error(props.title || "", {
        description: props.description,
        action: props.action,
        ...props
      });
    }
  };

  toast.info = (props: ToastProps | string) => {
    if (typeof props === "string") {
      return sonnerToast.info(props);
    } else {
      return sonnerToast.info(props.title || "", {
        description: props.description,
        action: props.action,
        ...props
      });
    }
  };

  toast.warning = (props: ToastProps | string) => {
    if (typeof props === "string") {
      return sonnerToast.warning(props);
    } else {
      return sonnerToast.warning(props.title || "", {
        description: props.description,
        action: props.action,
        ...props
      });
    }
  };
  
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
