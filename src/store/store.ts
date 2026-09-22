import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import { baseApi, registerAuthDispatch } from "./baseApi";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefault) => getDefault().concat(baseApi.middleware),
});

registerAuthDispatch(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
