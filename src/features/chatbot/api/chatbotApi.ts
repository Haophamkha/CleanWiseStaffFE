import { baseApi } from "@/store/baseApi";
import { i18n } from "@/features/language/i18n";
import type { ChatbotConversation, ChatbotMessage, ChatbotPage, ChatbotReply, HelpArticle } from "../types/chatbot";

const unwrap = <T>(response: { data: T }): T => response.data;

export const chatbotApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHelpArticles: builder.query<HelpArticle[], void>({
      query: () => ({ url: "/api/chatbot/help-articles/", method: "GET" }),
      transformResponse: unwrap<HelpArticle[]>,
      keepUnusedDataFor: 0,
    }),
    getHelpArticle: builder.query<HelpArticle, number>({
      query: (id) => ({ url: `/api/chatbot/help-articles/${id}/`, method: "GET" }),
      transformResponse: unwrap<HelpArticle>,
      keepUnusedDataFor: 0,
    }),
    getChatbotConversations: builder.query<ChatbotPage<ChatbotConversation>, { page: number }>({
      query: ({ page }) => ({ url: "/api/chatbot/conversations/", method: "GET", params: { page } }),
      transformResponse: unwrap<ChatbotPage<ChatbotConversation>>,
      providesTags: ["ChatbotConversations"],
    }),
    createChatbotConversation: builder.mutation<ChatbotConversation, void>({
      query: () => ({ url: "/api/chatbot/conversations/", method: "POST", data: {} }),
      transformResponse: unwrap<ChatbotConversation>,
      invalidatesTags: ["ChatbotConversations"],
    }),
    deleteChatbotConversation: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/chatbot/conversations/${id}/`, method: "DELETE" }),
      invalidatesTags: (_r, error) => (error ? [] : ["ChatbotConversations"]),
    }),
    getChatbotMessages: builder.query<ChatbotPage<ChatbotMessage>, { conversationId: number; page: number }>({
      query: ({ conversationId, page }) => ({
        url: `/api/chatbot/conversations/${conversationId}/messages/`, method: "GET", params: { page, page_size: 50 },
      }),
      transformResponse: unwrap<ChatbotPage<ChatbotMessage>>,
    }),
    sendChatbotMessage: builder.mutation<ChatbotReply, { conversationId: number; text: string; client_message_id: string }>({
      query: ({ conversationId, ...data }) => ({
        url: `/api/chatbot/conversations/${conversationId}/messages/`, method: "POST", data: { ...data, language: i18n.resolvedLanguage ?? "vi" }, timeout: 130000,
      }),
      transformResponse: unwrap<ChatbotReply>,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetHelpArticlesQuery,
  useGetHelpArticleQuery,
  useLazyGetChatbotConversationsQuery,
  useCreateChatbotConversationMutation,
  useDeleteChatbotConversationMutation,
  useLazyGetChatbotMessagesQuery,
  useSendChatbotMessageMutation,
} = chatbotApi;
