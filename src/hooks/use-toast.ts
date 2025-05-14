
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string | React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

// Direct callable function + methods
export const toast = Object.assign(
  // Main toast function
  (props: ToastProps) => {
    return sonnerToast(props.title || "", {
      description: typeof props.description === "object" 
        ? JSON.stringify(props.description) 
        : props.description,
      action: props.action,
    });
  },
  // Methods
  {
    success: (message: string | ToastProps) => {
      if (typeof message === "string") {
        return sonnerToast.success(message);
      } else {
        // Handle object with title, description, etc.
        return sonnerToast.success(message.title || "", {
          description: typeof message.description === "object" 
            ? JSON.stringify(message.description) 
            : message.description,
          action: message.action,
        });
      }
    },
    error: (message: string | ToastProps) => {
      if (typeof message === "string") {
        return sonnerToast.error(message);
      } else {
        // Handle object with title, description, etc.
        return sonnerToast.error(message.title || "", {
          description: typeof message.description === "object" 
            ? JSON.stringify(message.description) 
            : message.description,
          action: message.action,
        });
      }
    },
    info: (message: string | ToastProps) => {
      if (typeof message === "string") {
        return sonnerToast.info(message);
      } else {
        // Handle object with title, description, etc.
        return sonnerToast.info(message.title || "", {
          description: typeof message.description === "object" 
            ? JSON.stringify(message.description) 
            : message.description,
          action: message.action,
        });
      }
    },
    warning: (message: string | ToastProps) => {
      if (typeof message === "string") {
        return sonnerToast.warning(message);
      } else {
        // Handle object with title, description, etc.
        return sonnerToast.warning(message.title || "", {
          description: typeof message.description === "object" 
            ? JSON.stringify(message.description) 
            : message.description,
          action: message.action,
        });
      }
    },
    // Add toasts property for compatibility with Radix Toast
    toasts: []
  }
);

// Implement useToast hook to provide the toast object
export const useToast = () => {
  return {
    toast,
    // For compatibility with Radix Toast
    toasts: toast.toasts
  };
};
