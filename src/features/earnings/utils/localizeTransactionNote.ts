type Translate = (key: string, options?: Record<string, string>) => string;

// Recognize only system-generated note templates. Free-form customer/admin
// notes must remain exactly as entered, even when they contain Vietnamese.
export function localizeTransactionNote(note: string, t: Translate): string {
  const templates: [RegExp, string][] = [
    [/^Giữ chỗ hoa hồng buổi (\d+) - (\S+)$/, "Giữ chỗ hoa hồng buổi {{value0}} - {{value1}}"],
    [/^Hoàn giữ chỗ hoa hồng buổi (\d+) - (\S+)$/, "Hoàn giữ chỗ hoa hồng buổi {{value0}} - {{value1}}"],
    [/^Hoa hồng buổi (\d+) - (\S+)$/, "Hoa hồng buổi {{value0}} - {{value1}}"],
    [/^Thu nhập buổi (\d+) - (\S+)$/, "Thu nhập buổi {{value0}} - {{value1}}"],
    [/^Thanh toán đơn (\S+)$/, "Thanh toán đơn {{value0}}"],
    [/^Hoàn tiền hủy đơn (\S+)$/, "Hoàn tiền hủy đơn {{value0}}"],
    [/^Hoàn tiền hủy buổi (\d+) - (\S+)$/, "Hoàn tiền hủy buổi {{value0}} - {{value1}}"],
    [/^Hoàn phần chuyển dư - (\S+)$/, "Hoàn phần chuyển dư - {{value0}}"],
    [/^Nạp tiền vào ví \(mã (\d+)\)$/, "Nạp tiền vào ví (mã {{value0}})"],
    [/^Rút tiền về (.+)$/, "Rút tiền về {{value0}}"],
    [/^Thanh toán đến sau khi đơn đã hủy\/hết hạn - (\S+)$/, "Thanh toán đến sau khi đơn đã hủy/hết hạn - {{value0}}"],
    [/^Chuyển thiếu \(([\d,.]+đ) \/ ([\d,.]+đ)\)(?: - (\S+))?$/, "Chuyển thiếu ({{value0}} / {{value1}}){{value2}}"],
  ];
  for (const [pattern, key] of templates) {
    const match = note.match(pattern);
    if (!match) continue;
    const values = Object.fromEntries(match.slice(1).map((value, index) => [
      `value${index}`, key.endsWith("{{value2}}") && index === 2 ? (value ? ` - ${value}` : "") : value ?? "",
    ]));
    return t(key, values);
  }
  return note;
}
