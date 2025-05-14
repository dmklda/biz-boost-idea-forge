
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string | React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

export const toast = {
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
  }
};

export const useToast = () => {
  return {
    toast,
  };
};
