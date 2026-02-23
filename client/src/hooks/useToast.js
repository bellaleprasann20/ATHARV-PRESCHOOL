import { toast } from 'react-toastify';

export const useToast = () => {
  const notifySuccess = (msg) => toast.success(msg);
  const notifyError = (msg) => toast.error(msg);
  const notifyInfo = (msg) => toast.info(msg);
  const notifyWarning = (msg) => toast.warn(msg);

  return { notifySuccess, notifyError, notifyInfo, notifyWarning };
};