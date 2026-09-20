import type { UserResponse } from "@/types/Response";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthStatus = "idle" | "authenticated" | "unauthenticated";

type AuthState = {
  user: UserResponse | null;
  status: AuthStatus; // "idle" = chưa check xong lúc khởi động app
};

const initialState: AuthState = { user: null, status: "idle" };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserResponse | null>) => {
      state.user = action.payload;
      state.status = action.payload ? "authenticated" : "unauthenticated";
    },
    setAuthStatus: (state, action: PayloadAction<AuthStatus>) => {
      state.status = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.status = "unauthenticated";
    },
  },
});

export const { setUser, setAuthStatus, clearAuth } = authSlice.actions;
export default authSlice.reducer;
