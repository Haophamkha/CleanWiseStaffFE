import { useTranslation } from "react-i18next";
import { translate as tr } from "@/features/language/i18n";
import { ActiveProfileGate } from "@/components/common/ActiveProfileGate";
import { ChatInbox } from "@/features/chat/components/ChatInbox";

function getLocalizedCopy() {
  return {
    draft: tr("Hãy hoàn tất hồ sơ và gửi duyệt để bắt đầu nhắn tin với khách hàng."),
    pending:
      tr("Quản trị viên đang xem xét hồ sơ của bạn. Bạn sẽ nhắn tin được sau khi hồ sơ được duyệt."),
  };
}

export default function MessagesScreen() {
  const { t: tr } = useTranslation();

  return (
    <ActiveProfileGate copy={getLocalizedCopy()}>
      <ChatInbox staff />
    </ActiveProfileGate>
  );
}
