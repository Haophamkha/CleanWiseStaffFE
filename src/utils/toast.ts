import Toast from "react-native-toast-message";

type ToastType = "success" | "error" | "warning" | "info";

const DURATION: Record<ToastType, number> = {
  success: 3000,
  info: 3500,
  warning: 4500,
  error: 5000,
};

const show = (type: ToastType, title: string, message?: string) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    visibilityTime: DURATION[type],
    props: { duration: DURATION[type] },
  });
};

export const showSuccessToast = (title: string, message?: string) =>
  show("success", title, message);

export const showErrorToast = (title: string, message?: string) =>
  show("error", title, message);

export const showWarningToast = (title: string, message?: string) =>
  show("warning", title, message);

export const showInfoToast = (title: string, message?: string) =>
  show("info", title, message);
