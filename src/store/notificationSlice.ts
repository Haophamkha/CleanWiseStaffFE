import { notificationApi } from "@/services/notificationApi";
import { createSlice } from "@reduxjs/toolkit";

type NotificationState = {
  unreadCount: number;
};

const initialState: NotificationState = {
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    clearUnreadCount: (state) => {
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
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
      );
  },
});

export const { clearUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;
