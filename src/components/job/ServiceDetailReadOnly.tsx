import { Feather } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";

import type {
  ConditionalOptionGroup,
  FieldOption,
  FormField,
  FormFieldType,
} from "@/types/ServiceForm";

type ServiceDetailReadOnlyProps = {
  fields?: FormField[] | null;
  values?: Record<string, unknown> | null;
  taskChecklist?: string | null;
};

const WEEKDAY_LABELS: Record<string, string> = {
  MON: "Thứ 2",
  TUE: "Thứ 3",
  WED: "Thứ 4",
  THU: "Thứ 5",
  FRI: "Thứ 6",
  SAT: "Thứ 7",
  SUN: "Chủ nhật",
};

function isEmptyValue(raw: unknown): boolean {
  if (raw === null || raw === undefined) return true;
  if (typeof raw === "string") return raw.trim() === "";
  if (Array.isArray(raw)) return raw.length === 0;
  return false;
}

function isConditionalGroups(
  options: FieldOption[] | ConditionalOptionGroup[] | undefined,
): options is ConditionalOptionGroup[] {
  return (
    !!options &&
    options.length > 0 &&
    (options[0] as ConditionalOptionGroup).when !== undefined
  );
}

function resolveOptions(
  field: FormField,
  scope: Record<string, unknown>,
): FieldOption[] {
  if (!field.options || field.options.length === 0) return [];
  if (!isConditionalGroups(field.options)) return field.options;
  const matched = field.options.find((group) =>
    Object.entries(group.when).every(
      ([key, expected]) => String(scope[key]) === String(expected),
    ),
  );
  return matched?.items ?? [];
}

function findOption(
  options: FieldOption[],
  raw: unknown,
): FieldOption | undefined {
  return options.find((o) => o.value === String(raw));
}

function optionLabel(options: FieldOption[], raw: unknown): string {
  return findOption(options, raw)?.label ?? String(raw);
}

function formatDateValue(raw: unknown): string {
  const d = new Date(String(raw));
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTimeValue(raw: unknown): string {
  const str = String(raw);
  if (/^\d{1,2}:\d{2}/.test(str)) return str.slice(0, 5);
  const d = new Date(str);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return str;
}

function iconForType(
  type: FormFieldType,
): React.ComponentProps<typeof Feather>["name"] {
  switch (type) {
    case "SINGLE_SELECT":
      return "list";
    case "WEEKDAY_MULTI_SELECT":
      return "calendar";
    case "QUANTITY":
      return "hash";
    case "TEXT":
    case "TEXTAREA":
      return "edit-3";
    case "BOOLEAN":
      return "toggle-right";
    case "DATE":
      return "calendar";
    case "TIME":
      return "clock";
    case "REPEATABLE_GROUP":
      return "layers";
    default:
      return "info";
  }
}

function FieldRow({
  icon,
  label,
  children,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-row items-start mb-3">
      <View className="w-8 h-8 rounded-full bg-[#EEF2FF] items-center justify-center mr-3">
        <Feather name={icon} size={13} color="#2563EB" />
      </View>
      <View className="flex-1">
        <Text className="text-[#9CA3AF] text-xs mb-0.5">{label}</Text>
        {children}
      </View>
    </View>
  );
}

function formatSimpleValue(
  field: FormField,
  raw: unknown,
  scope: Record<string, unknown>,
): string {
  switch (field.type) {
    case "WEEKDAY_MULTI_SELECT": {
      const options = resolveOptions(field, scope);
      const arr = Array.isArray(raw) ? raw : [raw];
      return arr
        .map((v) =>
          options.length > 0
            ? optionLabel(options, v)
            : (WEEKDAY_LABELS[String(v)] ?? String(v)),
        )
        .join(", ");
    }
    case "QUANTITY":
    case "TEXT":
    case "TEXTAREA":
      return String(raw);
    case "BOOLEAN":
      return raw ? "Có" : "Không";
    case "DATE":
      return formatDateValue(raw);
    case "TIME":
      return formatTimeValue(raw);
    default:
      return String(raw);
  }
}

function TaskChecklistBlock({ label, text }: { label: string; text: string }) {
  const items = text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (items.length === 0) return null;

  return (
    <View className="mb-3">
      <Text className="text-[#9CA3AF] text-xs mb-1.5">
        {label || "Công việc bao gồm"}
      </Text>
      {items.map((line, idx) => (
        <View key={idx} className="flex-row items-start mb-1">
          <Feather
            name="check"
            size={13}
            color="#15803D"
            style={{ marginTop: 2 }}
          />
          <Text className="text-[#111827] text-sm ml-2 flex-1">{line}</Text>
        </View>
      ))}
    </View>
  );
}

function MultiSelectBlock({
  field,
  raw,
  scope,
}: {
  field: FormField;
  raw: unknown;
  scope: Record<string, unknown>;
}) {
  const options = resolveOptions(field, scope);
  const arr = Array.isArray(raw) ? raw : [raw];

  if (options.length === 0) {
    return (
      <FieldRow icon="list" label={field.label}>
        <Text className="text-[#111827] text-sm font-medium">
          {arr.map(String).join(", ")}
        </Text>
      </FieldRow>
    );
  }

  const selectedOptions = arr
    .map((v) => findOption(options, v))
    .filter((o): o is FieldOption => !!o);

  return (
    <View className="mb-3">
      <Text className="text-[#9CA3AF] text-xs mb-1.5">{field.label}</Text>
      <View className="flex-row flex-wrap" style={{ gap: 8 }}>
        {selectedOptions.map((opt) => (
          <View
            key={opt.value}
            className="flex-row items-center bg-[#F5F8FF] border border-[#DBE7FF] rounded-full pl-1 pr-3 py-1"
          >
            {opt.image ? (
              <Image
                source={{ uri: opt.image }}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  marginRight: 6,
                }}
              />
            ) : null}
            <Text className="text-[#2563EB] text-xs font-semibold">
              {opt.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function FieldList({
  fields,
  values,
  taskChecklist,
}: {
  fields: FormField[];
  values: Record<string, unknown>;
  taskChecklist?: string | null;
}) {
  const visible = fields.filter((f) => {
    if (f.type === "TASK_CHECKLIST") return !!taskChecklist;
    return !isEmptyValue(values[f.key]);
  });
  if (visible.length === 0) return null;

  return (
    <>
      {visible.map((field) => {
        if (field.type === "TASK_CHECKLIST") {
          return (
            <TaskChecklistBlock
              key={field.key}
              label={field.label}
              text={taskChecklist as string}
            />
          );
        }

        const raw = values[field.key];

        if (field.type === "REPEATABLE_GROUP") {
          const items = Array.isArray(raw)
            ? (raw as Record<string, unknown>[])
            : [];
          if (items.length === 0 || !field.item_fields) return null;
          return (
            <View key={field.key} className="mb-3">
              <Text className="text-[#9CA3AF] text-xs mb-2">{field.label}</Text>
              {items.map((itemValues, idx) => (
                <View
                  key={`${field.key}-${idx}`}
                  className="bg-[#F8F9FC] rounded-xl p-3 mb-2 border border-[#F3F4F6]"
                >
                  <Text className="text-[#111827] text-xs font-semibold mb-2">
                    {field.label} {idx + 1}
                  </Text>
                  <FieldList fields={field.item_fields!} values={itemValues} />
                </View>
              ))}
            </View>
          );
        }

        if (field.type === "MULTI_SELECT") {
          return (
            <MultiSelectBlock
              key={field.key}
              field={field}
              raw={raw}
              scope={values}
            />
          );
        }

        if (field.type === "SINGLE_SELECT") {
          const options = resolveOptions(field, values);
          const selectedOption = findOption(options, raw);
          const label = selectedOption?.label ?? String(raw);
          return (
            <FieldRow
              key={field.key}
              icon={iconForType(field.type)}
              label={field.label}
            >
              <View className="flex-row items-center">
                {selectedOption?.image ? (
                  <Image
                    source={{ uri: selectedOption.image }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      marginRight: 8,
                    }}
                  />
                ) : null}
                <Text className="text-[#111827] text-sm font-medium">
                  {label}
                </Text>
              </View>
            </FieldRow>
          );
        }

        return (
          <FieldRow
            key={field.key}
            icon={iconForType(field.type)}
            label={field.label}
          >
            <Text className="text-[#111827] text-sm font-medium">
              {formatSimpleValue(field, raw, values)}
            </Text>
          </FieldRow>
        );
      })}
    </>
  );
}

export function ServiceDetailReadOnly({
  fields,
  values,
  taskChecklist,
}: ServiceDetailReadOnlyProps) {
  if (!fields || fields.length === 0) return null;
  const scope = values ?? {};
  const hasVisible = fields.some((f) =>
    f.type === "TASK_CHECKLIST" ? !!taskChecklist : !isEmptyValue(scope[f.key]),
  );
  if (!hasVisible) return null;

  return (
    <View className="bg-white rounded-2xl p-4 mb-4 border border-[#F3F4F6]">
      <Text className="text-[#111827] text-base font-bold mb-3">
        Thông tin dịch vụ
      </Text>
      <FieldList fields={fields} values={scope} taskChecklist={taskChecklist} />
    </View>
  );
}
