import { getLocale } from "@/features/language/i18n";

type Translate = typeof import("@/features/language/i18n").translate;

const FIXED_COPY = new Set([
  "Hồ sơ đã được duyệt 🎉", "CleanWise đã phê duyệt hồ sơ của bạn. Bạn có thể bắt đầu nhận lịch.",
  "Bạn đã bị gỡ khỏi lịch làm", "Bạn đã được gỡ khỏi lịch làm", "Bạn đã bị gỡ khỏi buổi làm",
  "Có lịch mới", "Bạn có lịch mới", "Sắp đến giờ làm", "Khách đã hủy buổi làm",
  "Hồ sơ chưa được duyệt", "Khách chỉ định bạn", "Lời mời nhận việc từ admin",
  "Lời mời đã hết hạn", "Lời chỉ định đã bị thu hồi", "Đơn đã bị CleanWise hủy",
  "Đơn đã bị khách hàng hủy", "Số dư ví được điều chỉnh", "Rút tiền thành công",
  "Rút tiền không thành công", "Nhắc xác nhận thu tiền mặt", "Khiếu nại đã được xử lý",
  "Khiếu nại bị từ chối", "Sau khi xem xét, CleanWise đã hoàn tiền cho khách nên buổi này không tính thu nhập.",
]);

const TEMPLATES: [RegExp, string][] = [
  [/^Quản trị viên đã gán buổi (\d+) của booking (\S+) cho nhân viên khác\.$/, "Quản trị viên đã gán buổi {{value0}} của booking {{value1}} cho nhân viên khác."],
  [/^Bạn có một lịch dọn dẹp mới lúc (.+)\.$/, "Bạn có một lịch dọn dẹp mới lúc {{value0}}."],
  [/^Đơn (\S+) bắt đầu lúc (.+)\.$/, "Đơn {{value0}} bắt đầu lúc {{value1}}."],
  [/^CleanWise đã gỡ bạn khỏi buổi (\d+) của đơn (\S+)\.$/, "CleanWise đã gỡ bạn khỏi buổi {{value0}} của đơn {{value1}}."],
  [/^Buổi (\d+) của đơn (\S+) đã bị khách hàng hủy\.$/, "Buổi {{value0}} của đơn {{value1}} đã bị khách hàng hủy."],
  [/^Đơn (\S+) đã bị CleanWise hủy\.$/, "Đơn {{value0}} đã bị CleanWise hủy."],
  [/^Đơn (\S+) đã bị khách hàng hủy\.$/, "Đơn {{value0}} đã bị khách hàng hủy."],
  [/^Bạn không check-in buổi (\d+) đơn (\S+) trong (\d+) phút sau giờ hẹn\.$/, "Bạn không check-in buổi {{value0}} đơn {{value1}} trong {{value2}} phút sau giờ hẹn."],
  [/^Hồ sơ của bạn chưa được duyệt\.(.*)$/, "Hồ sơ của bạn chưa được duyệt.{{value0}}"],
  [/^(.+) muốn bạn làm đơn (\S+)\. Nhận việc trước (.+) để giữ đơn\.$/, "{{value0}} muốn bạn làm đơn {{value1}}. Nhận việc trước {{value2}} để giữ đơn."],
  [/^(.+) muốn bạn làm đơn (\S+)\.$/, "{{value0}} muốn bạn làm đơn {{value1}}."],
  [/^Bạn được mời nhận buổi (\d+), đơn (\S+)\. Vui lòng phản hồi trước (.+)\.$/, "Bạn được mời nhận buổi {{value0}}, đơn {{value1}}. Vui lòng phản hồi trước {{value2}}."],
  [/^Lời chỉ định của khách cho buổi (\d+) đơn (\S+) đã bị CleanWise thu hồi\.$/, "Lời chỉ định của khách cho buổi {{value0}} đơn {{value1}} đã bị CleanWise thu hồi."],
  [/^Đơn (\S+) đã xong\. Hãy xác nhận đã thu tiền mặt từ khách\.$/, "Đơn {{value0}} đã xong. Hãy xác nhận đã thu tiền mặt từ khách."],
  [/^Đã chuyển (.+đ) về (.+)\.$/, "Đã chuyển {{value0}} về {{value1}}."],
  [/^Yêu cầu rút (.+đ) về (.+) không thành công, tiền đã hoàn lại ví\.$/, "Yêu cầu rút {{value0}} về {{value1}} không thành công, tiền đã hoàn lại ví."],
  [/^Khiếu nại (\S+) cho đơn (\S+) không được chấp nhận\.$/, "Khiếu nại {{value0}} cho đơn {{value1}} không được chấp nhận."],
  [/^Khiếu nại (\S+) cho đơn (\S+) đã được giải quyết\.$/, "Khiếu nại {{value0}} cho đơn {{value1}} đã được giải quyết."],
  [/^Thu nhập (.+đ) đã được cộng vào ví của bạn\.$/, "Thu nhập {{value0}} đã được cộng vào ví của bạn."],
  [/^([+-][\d.]+đ)\.$/, "{{value0}}."],
];

// Recognize generated notification copy only. Personal names, booking codes,
// free-form admin announcements and attached reasons/notes stay unchanged.
export function localizeNotificationText(text: string, tr: Translate): string {
  const suffix = / (Lý do|Ghi chú): ([\s\S]*)$/.exec(text);
  const body = suffix ? text.slice(0, suffix.index) : text;
  let localized: string | undefined;
  if (FIXED_COPY.has(body)) localized = tr(body);
  else if (/^Khiếu nại \S+ cho đơn \S+ đã được giải quyết\. .+$/.test(body)) {
    const [, code, booking, tail] = /^Khiếu nại (\S+) cho đơn (\S+) đã được giải quyết\. (.+)$/.exec(body)!;
    localized = tr("Khiếu nại {{value0}} cho đơn {{value1}} đã được giải quyết.", { value0: code, value1: booking })
      + " " + localizeNotificationText(tail, tr);
  }
  else for (const [pattern, key] of TEMPLATES) {
    const match = pattern.exec(body);
    if (!match) continue;
    const values = Object.fromEntries(match.slice(1).map((value, index) => {
      const number = /^[+-]?[\d.]+đ$/.test(value) ? Number(value.slice(0, -1).replace(/\./g, "")) : NaN;
      return [`value${index}`, Number.isFinite(number)
        ? tr("{{value0}}đ", { value0: number.toLocaleString(getLocale(tr), { signDisplay: value.startsWith("+") ? "always" : "auto" }) }) : value];
    }));
    localized = tr(key, values);
    break;
  }
  if (localized === undefined) return text;
  return localized + (suffix ? tr(suffix[1] === "Lý do" ? " Lý do: {{value0}}" : " Ghi chú: {{value0}}", { value0: suffix[2] }) : "");
}
