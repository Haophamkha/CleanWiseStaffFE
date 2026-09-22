import { baseApi } from "@/store/baseApi";
import type {
  ChatAssignment, ChatConversation, ChatMessage, ConversationPage, MessagePage,
} from "@/types/chat";

const unwrap = (response: any) =>
  response?.data?.data ?? response?.data ?? response;

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query<ConversationPage, number>({
      query: (page) => ({ url: "/api/chat/conversations/", method: "GET", params: { page } }),
      transformResponse: unwrap,
      providesTags: ["ChatConversations"],
    }),
    getConversation: builder.query<{ conversation: ChatConversation; assignments: ChatAssignment[] }, number>({
      query: (id) => ({ url: `/api/chat/conversations/${id}/`, method: "GET" }),
      transformResponse: unwrap,
    }),
    getAssignmentConversation: builder.query<{ conversation: ChatConversation; assignment: ChatAssignment }, number>({
      query: (id) => ({ url: `/api/chat/assignments/${id}/conversation/`, method: "GET" }),
      transformResponse: unwrap,
    }),
    listChatMessages: builder.mutation<MessagePage, { conversation_id: number; cursor?: number | null; limit?: number }>({
      query: (data) => ({ url: "/api/chat/messages/list/", method: "POST", data }),
      transformResponse: unwrap,
    }),
    sendChatMessage: builder.mutation<ChatMessage, { conversation_id: number; message: string }>({
      query: (data) => ({ url: "/api/chat/messages/send/", method: "POST", data }),
      transformResponse: unwrap,
      invalidatesTags: ["ChatConversations"],
    }),
    readChatMessages: builder.mutation<{ marked_read: number }, { conversation_id: number }>({
      query: (data) => ({ url: "/api/chat/messages/read/", method: "POST", data }),
      transformResponse: unwrap,
      invalidatesTags: ["ChatConversations"],
      async onQueryStarted({ conversation_id }, { dispatch, getState, queryFulfilled }) {
        const pages = chatApi.util.selectCachedArgsForQuery(getState(), "getConversations");
        const unreadCount = pages.reduce((count, page) => {
          const conversation = chatApi.endpoints.getConversations
            .select(page)(getState()).data?.results.find((item) => item.id === conversation_id);
          return Math.max(count, conversation?.unread_count ?? 0);
        }, 0);
        for (const page of pages) {
          dispatch(chatApi.util.updateQueryData("getConversations", page, (draft) => {
            draft.total_unread = Math.max(0, draft.total_unread - unreadCount);
            const conversation = draft.results.find((item) => item.id === conversation_id);
            if (conversation) conversation.unread_count = 0;
          }));
        }
        try {
          await queryFulfilled;
        } catch {
          dispatch(chatApi.util.invalidateTags(["ChatConversations"]));
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetConversationsQuery, useGetConversationQuery,
  useLazyGetAssignmentConversationQuery, useListChatMessagesMutation,
  useSendChatMessageMutation, useReadChatMessagesMutation,
} = chatApi;
