import { toast as sonner, type ExternalToast } from "sonner";

type ToastOpts = Omit<ExternalToast, "title">;

export const toast = {
  success(message: string, description?: string, opts?: ToastOpts) {
    sonner.success(message, description ? { description, ...opts } : opts);
  },
  error(message: string, description?: string, opts?: ToastOpts) {
    sonner.error(message, description ? { description, ...opts } : opts);
  },
  info(message: string, description?: string, opts?: ToastOpts) {
    sonner.info(message, description ? { description, ...opts } : opts);
  },
};
