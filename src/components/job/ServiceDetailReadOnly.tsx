import type {
    ConditionalOptionGroup,
    FieldOption,
    FormField,
} from "@/types/ServiceForm";
import { Text, View } from "react-native";

type Values = Record<string, any>;

const isConditional = (
  options: FieldOption[] | ConditionalOptionGroup[] | undefined,
): options is ConditionalOptionGroup[] =>
  !!options && options.length > 0 && "when" in options[0];

function resolveOptions(
  field: FormField,
  siblingValues: Values,
): FieldOption[] {
  if (!field.options) return [];
  if (!isConditional(field.options)) return field.options;
  if (!field.options_by) return [];
  const currentValue = siblingValues[field.options_by];
  const match = field.options.find(
    (group) => group.when[field.options_by!] === currentValue,
  );
  return match?.items ?? [];
}

function labelForValue(
  field: FormField,
  siblingValues: Values,
  value: string,
): string {
  const options = resolveOptions(field, siblingValues);
  return options.find((o) => o.value === value)?.label ?? value;
}

function isEmptyValue(value: any): boolean {
  if (value === null || value === undefined || value === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-[#F3F4F6]">
      <Text className="text-[#6B7280] text-sm flex-1 pr-3">{label}</Text>
      <Text className="text-[#111827] text-sm font-medium flex-1 text-right">
        {value}
      </Text>
    </View>
  );
}

function SimpleFieldRow({
  field,
  values,
}: {
  field: FormField;
  values: Values;
}) {
  const value = values[field.key];
  if (isEmptyValue(value)) return null;

  let display: string;
  switch (field.type) {
    case "SINGLE_SELECT":
      display = labelForValue(field, values, value);
      break;
    case "MULTI_SELECT":
    case "WEEKDAY_MULTI_SELECT": {
      const arr: string[] = Array.isArray(value) ? value : [];
      display = arr.map((v) => labelForValue(field, values, v)).join(", ");
      break;
    }
    case "BOOLEAN":
      display = value ? "Có" : "Không";
      break;
    case "QUANTITY":
      display = String(value);
      break;
    default:
      display = String(value);
  }

  if (!display) return null;
  return <DetailRow label={field.label} value={display} />;
}

function RepeatableGroupBlock({
  field,
  values,
}: {
  field: FormField;
  values: Values;
}) {
  const items: Values[] = Array.isArray(values[field.key])
    ? values[field.key]
    : [];
  if (items.length === 0) return null;

  const itemFields = field.item_fields ?? [];
  const categoryField = itemFields[0];
  const optionField = itemFields.find(
    (f) => f.key !== categoryField?.key && f.options_by === categoryField?.key,
  );
  const quantityField = itemFields.find((f) => f.type === "QUANTITY");
  const innerFields = itemFields.filter(
    (f) =>
      f.key !== categoryField?.key &&
      f.key !== optionField?.key &&
      f.type !== "QUANTITY",
  );

  return (
    <View className="mb-1">
      <Text className="text-[#111827] font-bold text-[15px] mb-2">
        {field.label}
      </Text>
      {items.map((item, idx) => {
        const categoryLabel = categoryField
          ? labelForValue(categoryField, item, item[categoryField.key])
          : null;
        const optionLabel = optionField
          ? labelForValue(optionField, item, item[optionField.key])
          : null;
        const title = [categoryLabel, optionLabel].filter(Boolean).join(" · ");

        return (
          <View key={idx} className="bg-[#F8F9FC] rounded-xl px-3 py-2.5 mb-2">
            <View className="flex-row justify-between mb-1">
              <Text className="text-[#111827] text-sm font-semibold flex-1 pr-2">
                {title || `Mục ${idx + 1}`}
              </Text>
              {quantityField && !isEmptyValue(item.quantity) && (
                <Text className="text-[#2563EB] text-sm font-bold">
                  x{item.quantity}
                </Text>
              )}
            </View>
            {innerFields.map((sub) =>
              isEmptyValue(item[sub.key]) ? null : (
                <Text key={sub.key} className="text-[#6B7280] text-xs mt-0.5">
                  {sub.label}:{" "}
                  {sub.type === "BOOLEAN"
                    ? item[sub.key]
                      ? "Có"
                      : "Không"
                    : labelForValue(sub, item, item[sub.key])}
                </Text>
              ),
            )}
          </View>
        );
      })}
    </View>
  );
}

export function ServiceDetailReadOnly({
  fields,
  values,
}: {
  fields: FormField[] | undefined;
  values: Values | undefined;
}) {
  if (!fields || fields.length === 0 || !values) return null;

  // Bỏ TASK_CHECKLIST (không phải dữ liệu để hiển thị) và DATE/TIME —
  // 2 loại này luôn trùng với scheduled_start/scheduled_end đã hiển thị
  // ở khối "Bắt đầu"/"Kết thúc" phía trên, hiện lại sẽ bị dư thừa.
  const visibleFields = fields.filter(
    (f) =>
      f.type !== "TASK_CHECKLIST" && f.type !== "DATE" && f.type !== "TIME",
  );
  const hasAnyValue = visibleFields.some((f) => !isEmptyValue(values[f.key]));
  if (!hasAnyValue) return null;

  return (
    <View className="bg-white rounded-2xl p-4 mb-4 border border-[#F3F4F6]">
      <Text className="text-[#111827] text-base font-bold mb-3">
        Chi tiết dịch vụ khách chọn
      </Text>
      {visibleFields.map((field) =>
        field.type === "REPEATABLE_GROUP" ? (
          <RepeatableGroupBlock key={field.key} field={field} values={values} />
        ) : (
          <SimpleFieldRow key={field.key} field={field} values={values} />
        ),
      )}
    </View>
  );
}
