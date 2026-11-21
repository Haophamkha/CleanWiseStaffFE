/** General service label for summaries. Keep the original name in job details. */
export function serviceDisplayName(name?: string | null, sectionCode?: string | null): string {
  if (sectionCode?.trim().toUpperCase() === "HOME_CLEANING") return "Dọn dẹp nhà";
  const original = name?.trim() ?? "";
  // Applies to every service, including new section codes configured by admins.
  // Older schedule responses have no section_code; remove only recognized shift suffixes.
  return original.replace(
    /\s*(?:[-–—:]\s*|\(\s*)(?:ca\s+lẻ|ca\s+tháng|gói\s+tháng|định\s+kỳ)(?:\s*(?:&|\/|,)\s*(?:ca\s+lẻ|ca\s+tháng|gói\s+tháng|định\s+kỳ))*\s*\)?$/iu,
    "",
  ).trim() || original;
}
