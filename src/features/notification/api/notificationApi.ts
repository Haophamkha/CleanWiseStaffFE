import {
  AppNotification,
  NotificationListData,
  NotificationListParams,
} from "@/features/notification/types/Notification";
import { baseApi } from "@/store/baseApi";

const unwrapResponse = (response: any) =>
  response?.data?.data ?? response?.data ?? response;

export interface NotificationPreference {
  push_enabled: boolean;
}

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

    getNotificationPreferences: builder.query<NotificationPreference, void>({
      query: () => ({
        url: "/api/notifications/preferences/",
        method: "GET",
      }),

      transformResponse: (res: { data: NotificationPreference }) => res.data,
    }),

    updateNotificationPreferences: builder.mutation<
      NotificationPreference,
      NotificationPreference
    >({
      query: (body) => ({
        url: "/api/notifications/preferences/",
        method: "PATCH",
        data: body,
      }),

      transformResponse: (res: { data: NotificationPreference }) => res.data,

      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          notificationApi.util.updateQueryData(
            "getNotificationPreferences",
            undefined,
            (draft) => {
              draft.push_enabled = body.push_enabled;
            },
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    clearAllNotifications: builder.mutation<{ deleted: number }, void>({
      query: () => ({
        url: "/api/notifications/clear-all/",
        method: "DELETE",
      }),

      transformResponse: (res: { data: { deleted: number } }) => res.data,

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
  }),

  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useRegisterPushTokenMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useClearAllNotificationsMutation,
} = notificationApi;
