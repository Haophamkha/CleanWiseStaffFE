import { EmptyState } from "@/components/ui/EmptyState";
import { COLORS } from "@/constants/theme";
import {
  HistorySection,
  PeriodSummaryCard,
  PeriodTabs,
  SettlementCard,
  WalletCard,
} from "@/features/earnings/components/EarningsKit";
import TopupModal from "@/features/earnings/components/TopupModal";
import WithdrawModal from "@/features/earnings/components/WithdrawModal";
import { useEarnings } from "@/features/earnings/hooks/useEarnings";
import { SimpleHeader } from "@/features/profile-setup/components/SimpleHeader";
import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EarningsScreen() {
  const insets = useSafeAreaInsets();
  const e = useEarnings();

  return (
    <View className="flex-1 bg-canvas">
      <SimpleHeader title="Thu nhập" />

      {e.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text className="text-ink-soft mt-3">Đang tải thu nhập...</Text>
        </View>
      ) : e.isError || !e.data ? (
        <View className="flex-1 justify-center px-5">
          <EmptyState
            icon="alert-circle"
            title="Không tải được dữ liệu"
            message="Kiểm tra kết nối và thử lại."
            actionLabel="Thử lại"
            onAction={e.onRefresh}
          />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: insets.bottom + 32,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={e.isRefreshing}
              onRefresh={e.onRefresh}
              tintColor={COLORS.primary}
            />
          }
        >
          <WalletCard wallet={e.data.wallet} onWithdraw={e.openWithdraw} />

          <TouchableOpacity
            onPress={e.openTopup}
            activeOpacity={0.85}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 14,
              marginBottom: 16,
              borderRadius: 16,
              backgroundColor: COLORS.primaryLight,
              borderWidth: 1,
              borderColor: COLORS.primaryBorder,
            }}
          >
            <Feather name="plus-circle" size={18} color={COLORS.primaryDark} />
            <Text
              style={{
                marginLeft: 8,
                fontWeight: "700",
                color: COLORS.primaryDark,
              }}
            >
              Nạp tiền ký quỹ
            </Text>
          </TouchableOpacity>

          <PeriodTabs
            tabs={e.periodTabs}
            value={e.period}
            onChange={e.setPeriod}
          />
          <PeriodSummaryCard period={e.data.period} />
          <SettlementCard settlement={e.data.settlement} />
          <HistorySection loading={e.historyLoading} rows={e.historyRows} />
        </ScrollView>
      )}

      <WithdrawModal
        visible={e.showWithdraw}
        onClose={e.closeWithdraw}
        walletBalance={e.walletBalance}
        onSuccess={e.onRefresh}
      />
      <TopupModal visible={e.showTopup} onClose={e.closeTopup} />
    </View>
  );
}
