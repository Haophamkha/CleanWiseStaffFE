import { ChatRoom } from "@/components/chat/ChatRoom";
import { useLocalSearchParams } from "expo-router";

export default function ChatDetailScreen() {
  const { id, assignmentId } = useLocalSearchParams<{ id: string; assignmentId?: string }>();
  return <ChatRoom id={Number(id)} assignmentId={assignmentId ? Number(assignmentId) : undefined} staff />;
}
