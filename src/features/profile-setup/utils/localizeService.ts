import type { FieldOption, FormField } from "../types/ServiceForm";

type Translate = (key: string) => string;

// Translate presentation metadata only. Keys, option values and conditions are
// API contracts; customer-entered values and pricing must never be translated.
export function localizeServiceField(field: FormField, t: Translate): FormField {
  const option = (item: FieldOption): FieldOption => ({
    ...item,
    label: t(item.label),
    ...(item.description ? { description: t(item.description) } : {}),
  });
  return {
    ...field,
    label: t(field.label),
    ...(field.description ? { description: t(field.description) } : {}),
    ...(field.placeholder ? { placeholder: t(field.placeholder) } : {}),
    ...(field.item_fields ? { item_fields: field.item_fields.map(f => localizeServiceField(f, t)) } : {}),
    ...(field.options ? { options: field.options.map(item =>
      "when" in item ? { ...item, items: item.items.map(option) } : option(item),
    ) as FormField["options"] } : {}),
  };
}
