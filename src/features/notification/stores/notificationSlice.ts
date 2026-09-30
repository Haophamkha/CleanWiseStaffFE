import { clearAuth } from "@/features/auth/stores/authSlice";
import { notificationApi } from "@/features/notification/api/notificationApi";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type NotificationState = { unreadCount: number; refreshTick: number };
const initialState: NotificationState = { unreadCount: 0, refreshTick: 0 };

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = Math.max(0, action.payload);
    },
    clearUnreadCount: (state) => {
      state.unreadCount = 0;
    },
    bumpRefreshTick: (state) => {
      state.refreshTick += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(clearAuth, (state) => {
        state.unreadCount = 0;
      })
      .addMatcher(
        notificationApi.endpoints.getUnreadCount.matchFulfilled,
        (state, action) => {
          state.unreadCount = action.payload;
        },
      )
      .addMatcher(
        notificationApi.endpoints.getNotifications.matchFulfilled,
        (state, action) => {
          state.unreadCount = action.payload.unread_count;
        },
      )
      .addMatcher(
        notificationApi.endpoints.markNotificationRead.matchPending,
        (state) => {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        },
      )
      .addMatcher(
        notificationApi.endpoints.markAllNotificationsRead.matchFulfilled,
        (state) => {
          state.unreadCount = 0;
        },
      )
      .addMatcher(
        notificationApi.endpoints.clearAllNotifications.matchFulfilled,
        (state) => {
          state.unreadCount = 0;
        },
      );
  },
});

export const { setUnreadCount, clearUnreadCount, bumpRefreshTick } =
  notificationSlice.actions;
export default notificationSlice.reducer;
