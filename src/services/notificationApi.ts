import { baseApi } from "@/store/baseApi";
import {
    AppNotification,
    NotificationListData,
    NotificationListParams,
} from "@/types/Notification";

const unwrapResponse = (response: any) =>
  response?.data?.data ?? response?.data ?? response;

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      NotificationListData,
      NotificationListParams | void
    >({
      query: (params) => ({
        url: "/api/notifications/",
        method: "GET",
        params: params ? { ...params } : undefined,
      }),

      transformResponse: unwrapResponse,

      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map((n: AppNotification) => ({
                type: "Notifications" as const,
                id: n.id,
              })),
              {
                type: "Notifications" as const,
                id: "LIST",
              },
            ]
          : [
              {
                type: "Notifications" as const,
                id: "LIST",
              },
            ],
    }),

    getUnreadCount: builder.query<number, void>({
      query: () => ({
        url: "/api/notifications/unread-count/",
        method: "GET",
      }),

      transformResponse: (response: any) =>
        unwrapResponse(response)?.unread_count,

      providesTags: [
        {
          type: "Notifications",
          id: "COUNT",
        },
      ],
    }),

    markNotificationRead: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/notifications/${id}/mark-read/`,
        method: "POST",
      }),

      invalidatesTags: (result, error, id) => [
        {
          type: "Notifications",
          id,
        },
        {
          type: "Notifications",
          id: "COUNT",
        },
      ],
    }),

    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({
        url: "/api/notifications/mark-all-read/",
        method: "POST",
      }),

      invalidatesTags: [
        {
          type: "Notifications",
          id: "LIST",
        },
        {
          type: "Notifications",
          id: "COUNT",
        },
      ],
    }),

    registerPushToken: builder.mutation<
      void,
      {
        token: string;
        platform: string;
      }
    >({
      query: (body) => ({
        url: "/api/notifications/push-token/",
        method: "POST",
        data: body,
      }),
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useRegisterPushTokenMutation,
} = notificationApi;
