import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { AppState, AppStateStatus } from "react-native";
import authReducer from "../features/auth/stores/authSlice";
import notificationReducer from "../features/notification/stores/notificationSlice";
import { baseApi, registerAuthDispatch } from "./baseApi";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    notification: notificationReducer,
  },
  middleware: (getDefault) => getDefault().concat(baseApi.middleware),
});

registerAuthDispatch(store.dispatch);

// RTK Query mặc định dựa vào sự kiện `focus` của web để refetch —
// không tồn tại trong React Native, nên nối tay qua AppState: mỗi lần
// app quay lại foreground, các query có refetchOnFocus: true sẽ tự gọi lại.
setupListeners(store.dispatch, (dispatch, { onFocus, onFocusLost }) => {
  const subscription = AppState.addEventListener(
    "change",
    (state: AppStateStatus) => {
      if (state === "active") dispatch(onFocus());
      else dispatch(onFocusLost());
    },
  );
  return () => subscription.remove();
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
