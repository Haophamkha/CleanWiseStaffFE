import { PrimaryButton } from "@/components/ui/PrimaryButton";

type Props = {
  loading: boolean;
  onCheckOut: () => void;
};

export function CheckOutSection({ loading, onCheckOut }: Props) {
  return (
    <PrimaryButton
      label="Hoàn thành công việc"
      subtitle="Xác nhận đã làm xong buổi này"
      color="#15803D"
      loading={loading}
      loadingLabel="Đang xử lý..."
      icon="check-circle"
      onPress={onCheckOut}
      disabled={loading}
      style={{ marginBottom: 12 }}
    />
  );
}
