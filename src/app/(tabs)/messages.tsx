import { ActiveProfileGate } from "@/components/common/ActiveProfileGate";
import { ChatInbox } from "@/features/chat/components/ChatInbox";

const COPY = {
  draft: "Hãy hoàn tất hồ sơ và gửi duyệt để bắt đầu nhắn tin với khách hàng.",
  pending:
    "Quản trị viên đang xem xét hồ sơ của bạn. Bạn sẽ nhắn tin được sau khi hồ sơ được duyệt.",
};

export default function MessagesScreen() {
  return (
    <ActiveProfileGate copy={COPY}>
      <ChatInbox staff />
    </ActiveProfileGate>
  );
}
