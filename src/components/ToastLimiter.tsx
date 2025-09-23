import { useEffect } from "react";
import { toast, useToasterStore } from "react-hot-toast";

interface ToastLimiterProps {
  limit?: number;
}

const ToastLimiter: React.FC<ToastLimiterProps> = ({ limit = 4 }) => {
  const { toasts } = useToasterStore();

  useEffect(() => {
    const visibleToasts = toasts.filter((toastItem) => toastItem.visible);
    visibleToasts
      .filter((_, index) => index >= limit)
      .forEach((toastItem) => toast.dismiss(toastItem.id));
  }, [toasts, limit]);

  return null;
};

export default ToastLimiter;
