import { translate as defaultTranslate } from "@/features/language/i18n";
import { useTranslation } from "react-i18next";
import { ActiveProfileGate } from "@/components/common/ActiveProfileGate";
import { ChatInbox } from "@/features/chat/components/ChatInbox";

function getLocalizedCopy(translateText = defaultTranslate) {
  return {
    draft: translateText("Hãy hoàn tất hồ sơ và gửi duyệt để bắt đầu nhắn tin với khách hàng."),
    pending:
      translateText("Quản trị viên đang xem xét hồ sơ của bạn. Bạn sẽ nhắn tin được sau khi hồ sơ được duyệt."),
  };
}

export default function MessagesScreen() {
  const { t: tr } = useTranslation();

  return (
    <ActiveProfileGate copy={getLocalizedCopy(tr)}>
      <ChatInbox staff />
    </ActiveProfileGate>
  );
}
