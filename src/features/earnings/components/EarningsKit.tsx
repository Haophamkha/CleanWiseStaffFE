import { EmptyState } from "@/components/ui/EmptyState";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { COLORS, ON_DARK, RADIUS, SHADOWS, TYPE } from "@/constants/theme";
import type { EarningPeriod } from "@/features/earnings/api/earningsApi";
import type {
  EarningsData,
  HistoryRowView,
  PeriodTab,
  SeriesPoint,
  WalletTxRowView,
} from "@/features/earnings/hooks/useEarnings";
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

/* ───────── Thẻ số dư ví ───────── */

export function WalletCard({
  wallet,
  onWithdraw,
}: {
  wallet: EarningsData["wallet"];
  onWithdraw?: () => void; // không truyền = ẩn nút "Rút tiền"
}) {
  return (
    // View ngoài giữ bóng, View trong cắt vòng tròn trang trí
    // (overflow hidden sẽ làm mất bóng nếu để chung một View)
    <View
      className="bg-accent-dark"
      style={[{ borderRadius: RADIUS.hero }, SHADOWS.card]}
    >
      <View
        className="overflow-hidden p-5"
        style={{ borderRadius: RADIUS.hero }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: -50,
            right: -40,
            width: 150,
            height: 150,
            borderRadius: 75,
            backgroundColor: ON_DARK.surface,
          }}
        />

        <Text className="text-sm" style={{ color: ON_DARK.textSoft }}>
          Số dư ví
        </Text>
        <Text
          className="text-3xl font-extrabold mt-1"
          style={{ color: ON_DARK.text }}
        >
          {wallet.balanceText}
        </Text>

        {onWithdraw && (
          <PrimaryButton
            label="Rút tiền"
            variant="soft"
            color={COLORS.surface}
            icon="arrow-down-circle"
            onPress={onWithdraw}
            style={{ marginTop: 16 }}
          />
        )}

        <View
          className="mt-4 pt-3"
          style={{ borderTopWidth: 1, borderTopColor: ON_DARK.border }}
        >
          <View className="flex-row items-center justify-between">
            <Text
              className="text-xs flex-1 pr-3"
              style={{ color: ON_DARK.textSoft }}
            >
              Hoa hồng tiền mặt chưa nộp
            </Text>
            <Text
              className="text-sm"
              style={[TYPE.label, { color: ON_DARK.text }]}
            >
              {wallet.commissionOwedText}
            </Text>
          </View>

          {wallet.hasPending && (
            <View className="mt-3">
              <View className="flex-row items-center justify-between">
                <Text
                  className="text-xs flex-1 pr-3"
                  style={{ color: ON_DARK.textSoft }}
                >
                  Đang chờ giải ngân
                </Text>
                <Text
                  className="text-sm"
                  style={[TYPE.label, { color: ON_DARK.text }]}
                >
                  {wallet.pendingReleaseText}
                </Text>
              </View>
              <Text
                className="text-[11px] mt-1"
                style={{ color: ON_DARK.textSoft }}
              >
                Tối đa 24 giờ sau khi hoàn thành
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

/* ───────── Chọn kỳ: tuần / tháng ───────── */

export function PeriodTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: PeriodTab[];
  value: EarningPeriod;
  onChange: (key: EarningPeriod) => void;
}) {
  return (
    <View className="flex-row bg-accent-light border border-line rounded-full p-1 mt-5">
      {tabs.map((tab) => {
        const active = value === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className={`flex-1 items-center justify-center rounded-full ${
              active ? "bg-ink-soft" : "bg-transparent"
            }`}
            style={{ height: 44 }}
          >
            <Text
              className={`text-[13px] ${
                active ? "text-white" : "text-ink-soft"
              }`}
              style={TYPE.label}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ───────── Thống kê kỳ ───────── */

function BarChart({ data }: { data: SeriesPoint[] }) {
  const values = data.map((d) => Number(d.amount));
  const max = Math.max(...values, 1);

  return (
    <View
      className="flex-row items-end justify-between"
      style={{ height: 120 }}
    >
      {data.map((d, i) => {
        const h = values[i] > 0 ? Math.max((values[i] / max) * 90, 4) : 2;
        return (
          <View key={`${d.label}-${i}`} className="flex-1 items-center">
            <View
              className={`w-4 rounded-t-md ${
                values[i] > 0 ? "bg-ink" : "bg-line"
              }`}
              style={{ height: h }}
            />
            <Text className="text-ink-muted text-[10px] mt-1">{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function StatRow({
  label,
  value,
  valueColor = COLORS.ink,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="text-ink-soft text-sm flex-1 pr-3">{label}</Text>
      <Text className="text-sm" style={[TYPE.label, { color: valueColor }]}>
        {value}
      </Text>
    </View>
  );
}

export function PeriodSummaryCard({
  period,
}: {
  period: EarningsData["period"];
}) {
  return (
    <View
      className="bg-surface border border-line p-5 mt-4"
      style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
    >
      <Text className="text-ink-muted text-xs">{period.rangeText}</Text>
      <Text className="text-ink text-2xl font-extrabold mt-1">
        {period.incomeText}
      </Text>
      <Text className="text-ink-soft text-xs mt-0.5">
        Thu nhập sau hoa hồng
      </Text>

      <View className="mt-4">
        <BarChart data={period.series} />
      </View>

      <View className="mt-4 pt-2 border-t border-line">
        <StatRow label="Đơn hoàn thành" value={period.completedJobs} />
        <StatRow label="Tổng giá trị đơn" value={period.grossText} />
      </View>
    </View>
  );
}

/* ───────── Đối soát ───────── */

export function SettlementCard({
  settlement,
}: {
  settlement: EarningsData["settlement"];
}) {
  return (
    <View
      className="bg-surface border border-line p-5 mt-4"
      style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
    >
      <Text className="text-ink text-base font-extrabold mb-1">
        Đối soát với CleanWise
      </Text>
      <StatRow
        label="Đơn online (app giữ tiền, vào ví sau tối đa 24 giờ)"
        value={settlement.onlineText}
        valueColor={COLORS.success}
      />
      <StatRow
        label="Đơn tiền mặt (bạn đã thu, hoa hồng đã trừ ví)"
        value={settlement.cashText}
        valueColor={COLORS.danger}
      />
    </View>
  );
}

/* ───────── Lịch sử đơn ───────── */

function HistoryRow({ row, last }: { row: HistoryRowView; last: boolean }) {
  return (
    <View
      className={`flex-row items-center py-3.5 ${
        last ? "" : "border-b border-line"
      }`}
    >
      <View
        className={`w-10 h-10 rounded-xl items-center justify-center ${
          row.isCash ? "bg-warning-light" : "bg-info-light"
        }`}
      >
        <Feather
          name={row.isCash ? "dollar-sign" : "credit-card"}
          size={17}
          color={row.isCash ? COLORS.warning : COLORS.info}
        />
      </View>

      <View className="flex-1 ml-3">
        <Text className="text-ink text-sm" style={TYPE.label} numberOfLines={1}>
          {row.serviceName}
        </Text>
        <Text className="text-ink-muted text-xs mt-0.5" numberOfLines={1}>
          {row.metaText}
        </Text>
        <Text className="text-ink-soft text-xs mt-0.5">{row.methodText}</Text>
        {row.pending && (
          <Text className="text-warning-dark text-xs mt-0.5" style={TYPE.label}>
            Đang chờ giải ngân
          </Text>
        )}
      </View>

      <Text
        className="text-sm ml-2"
        style={[TYPE.label, { color: row.amountColor }]}
      >
        {row.amountText}
      </Text>
    </View>
  );
}

export function HistorySection({
  loading,
  rows,
}: {
  loading: boolean;
  rows: HistoryRowView[];
}) {
  return (
    <View className="mt-6">
      <Text
        className="text-ink-muted text-xs mb-2.5 ml-1"
        style={[TYPE.label, { letterSpacing: 1 }]}
      >
        ĐƠN ĐÃ HOÀN THÀNH
      </Text>

      {loading ? (
        <View className="py-8 items-center">
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : rows.length === 0 ? (
        <EmptyState icon="inbox" title="Chưa có đơn nào trong kỳ này" />
      ) : (
        <View
          className="bg-surface border border-line px-4"
          style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
        >
          {rows.map((row, i) => (
            <HistoryRow key={row.id} row={row} last={i === rows.length - 1} />
          ))}
        </View>
      )}
    </View>
  );
}

/* ───────── Giao dịch ví ───────── */

function WalletTxRow({ row, last }: { row: WalletTxRowView; last: boolean }) {
  return (
    <View
      className={`flex-row items-center py-3.5 ${
        last ? "" : "border-b border-line"
      }`}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center"
        style={{
          backgroundColor: row.isCredit
            ? COLORS.successLight
            : COLORS.dangerLight,
        }}
      >
        <Feather
          name={row.isCredit ? "arrow-down-left" : "arrow-up-right"}
          size={17}
          color={row.isCredit ? COLORS.success : COLORS.danger}
        />
      </View>

      <View className="flex-1 ml-3">
        <Text className="text-ink text-sm" style={TYPE.label} numberOfLines={1}>
          {row.title}
        </Text>
        {!!row.subText && (
          <Text className="text-ink-soft text-xs mt-0.5" numberOfLines={2}>
            {row.subText}
          </Text>
        )}
        <Text className="text-ink-muted text-xs mt-0.5">
          {row.timeText}
          {row.statusText ? ` · ${row.statusText}` : ""}
        </Text>
      </View>

      <Text
        className="text-sm ml-2"
        style={[TYPE.label, { color: row.amountColor }]}
      >
        {row.amountText}
      </Text>
    </View>
  );
}

export function WalletTransactionsSection({
  loading,
  rows,
}: {
  loading: boolean;
  rows: WalletTxRowView[];
}) {
  return (
    <View className="mt-6">
      <Text
        className="text-ink-muted text-xs mb-2.5 ml-1"
        style={[TYPE.label, { letterSpacing: 1 }]}
      >
        GIAO DỊCH VÍ GẦN ĐÂY
      </Text>

      {loading ? (
        <View className="py-8 items-center">
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : rows.length === 0 ? (
        <EmptyState icon="inbox" title="Chưa có giao dịch ví nào" />
      ) : (
        <View
          className="bg-surface border border-line px-4"
          style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
        >
          {rows.map((row, i) => (
            <WalletTxRow key={row.id} row={row} last={i === rows.length - 1} />
          ))}
        </View>
      )}
    </View>
  );
}
