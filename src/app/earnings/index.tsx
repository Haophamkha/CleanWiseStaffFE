import {
    useGetEarningsHistoryQuery,
    useGetEarningsSummaryQuery,
    type EarningItem,
    type EarningPeriod,
} from "@/services/earningsApi";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const formatVnd = (value: string | number | undefined | null) => {
  const n = Math.round(Number(value ?? 0));
  const digits = Math.abs(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${n < 0 ? "-" : ""}${digits}đ`;
};

// "2026-09-24" -> "24/09"
const formatDayMonth = (ymd?: string) => {
  if (!ymd) return "";
  const [, m, d] = ymd.split("-");
  return `${d}/${m}`;
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm} ${hh}:${mi}`;
};

/* ------------------------------------------------------------------ */
/* Small components                                                   */
/* ------------------------------------------------------------------ */

function BarChart({ data }: { data: { label: string; amount: string }[] }) {
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
                values[i] > 0 ? "bg-[#2563EB]" : "bg-[#E5E7EB]"
              }`}
              style={{ height: h }}
            />
            <Text className="text-[#9CA3AF] text-[10px] mt-1">{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function StatRow({
  label,
  value,
  valueColor = "#111827",
  bold = false,
}: {
  label: string;
  value: string;
  valueColor?: string;
  bold?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="text-[#6B7280] text-sm flex-1 pr-3">{label}</Text>
      <Text
        className={`text-sm ${bold ? "font-bold" : "font-semibold"}`}
        style={{ color: valueColor }}
      >
        {value}
      </Text>
    </View>
  );
}

function HistoryRow({ item }: { item: EarningItem }) {
  const isCash = item.payment_method === "CASH";
  // Tiền mặt: nhân viên đã cầm tiền, phải nộp lại hoa hồng (số âm).
  // Chuyển khoản: app giữ tiền, sẽ chuyển phần của nhân viên (số dương).
  const amountText = isCash
    ? `-${formatVnd(item.commission_amount)}`
    : `+${formatVnd(item.worker_amount)}`;
  const amountColor = isCash ? "#DC2626" : "#16A34A";

  return (
    <View className="flex-row items-center py-3 border-b border-[#F3F4F6]">
      <View
        className={`w-10 h-10 rounded-xl items-center justify-center ${
          isCash ? "bg-[#FEF3C7]" : "bg-[#DBEAFE]"
        }`}
      >
        <Feather
          name={isCash ? "dollar-sign" : "credit-card"}
          size={17}
          color={isCash ? "#D97706" : "#2563EB"}
        />
      </View>

      <View className="flex-1 ml-3">
        <Text
          className="text-[#111827] text-sm font-semibold"
          numberOfLines={1}
        >
          {item.service_name}
        </Text>
        <Text className="text-[#9CA3AF] text-xs mt-0.5" numberOfLines={1}>
          {item.booking_code} · {formatDateTime(item.completed_at)}
        </Text>
        <Text className="text-[#6B7280] text-xs mt-0.5">
          {isCash
            ? "Tiền mặt · hoa hồng nộp app"
            : "Chuyển khoản · app chuyển bạn"}
          {" · đơn "}
          {formatVnd(item.gross_amount)}
        </Text>
      </View>

      <Text className="text-sm font-bold ml-2" style={{ color: amountColor }}>
        {amountText}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Screen                                                             */
/* ------------------------------------------------------------------ */

export default function EarningsScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<EarningPeriod>("week");

  const summaryQuery = useGetEarningsSummaryQuery(period);
  const historyQuery = useGetEarningsHistoryQuery(period);

  const summary = summaryQuery.data;
  const history = historyQuery.data ?? [];
  const p = summary?.period;

  const refreshing =
    (summaryQuery.isFetching || historyQuery.isFetching) &&
    !summaryQuery.isLoading;

  const onRefresh = () => {
    summaryQuery.refetch();
    historyQuery.refetch();
  };

  const net = Number(p?.net_settlement ?? 0);
  const settlementText =
    net > 0
      ? `App chuyển cho bạn ${formatVnd(net)}`
      : net < 0
        ? `Bạn chuyển lại app ${formatVnd(Math.abs(net))}`
        : "Không phát sinh đối soát";
  const settlementColor = net > 0 ? "#16A34A" : net < 0 ? "#DC2626" : "#6B7280";

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8F9FC]"
      edges={["top", "left", "right"]}
    >
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-[#F3F4F6]">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Feather name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-[#111827] text-lg font-bold">Thu nhập</Text>
          <Text className="text-[#6B7280] text-xs mt-0.5">
            Thống kê và đối soát với CleanWise
          </Text>
        </View>
      </View>

      {summaryQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#2563EB" size="large" />
          <Text className="text-[#6B7280] mt-3">Đang tải thu nhập...</Text>
        </View>
      ) : summaryQuery.isError || !summary || !p ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center">
            <Feather name="alert-circle" size={30} color="#DC2626" />
          </View>
          <Text className="text-[#111827] font-bold text-base mt-4">
            Không tải được dữ liệu
          </Text>
          <Text className="text-[#6B7280] text-center mt-2">
            Kiểm tra kết nối và thử lại.
          </Text>
          <TouchableOpacity
            className="bg-[#2563EB] rounded-xl px-5 py-3 mt-5"
            onPress={onRefresh}
          >
            <Text className="text-white font-semibold">Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: insets.bottom + 32,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2563EB"
            />
          }
        >
          {/* Wallet card */}
          <View className="bg-[#2563EB] rounded-3xl p-5">
            <Text className="text-white/80 text-sm">Số dư ví</Text>
            <Text className="text-white text-3xl font-bold mt-1">
              {formatVnd(summary.wallet_balance)}
            </Text>
            <View className="mt-4 pt-3 border-t border-white/20 flex-row items-center justify-between">
              <Text className="text-white/80 text-xs flex-1 pr-3">
                Hoa hồng tiền mặt chưa nộp
              </Text>
              <Text className="text-white text-sm font-semibold">
                {formatVnd(summary.commission_owed)}
              </Text>
            </View>
          </View>

          {/* Period tabs */}
          <View className="flex-row bg-[#E5E7EB] rounded-2xl p-1 mt-5">
            {(["week", "month"] as EarningPeriod[]).map((key) => {
              const active = period === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setPeriod(key)}
                  activeOpacity={0.8}
                  className={`flex-1 py-2.5 rounded-xl items-center ${
                    active ? "bg-white" : ""
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      active ? "text-[#2563EB]" : "text-[#6B7280]"
                    }`}
                  >
                    {key === "week" ? "Tuần này" : "Tháng này"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Period summary */}
          <View className="bg-white rounded-3xl border border-[#E5E7EB] p-5 mt-4">
            <Text className="text-[#9CA3AF] text-xs">
              {formatDayMonth(p.start)} - {formatDayMonth(p.end)}
            </Text>
            <Text className="text-[#111827] text-2xl font-bold mt-1">
              {formatVnd(p.income)}
            </Text>
            <Text className="text-[#6B7280] text-xs mt-0.5">
              Thu nhập sau hoa hồng
            </Text>

            <View className="mt-4">
              <BarChart data={summary.series} />
            </View>

            <View className="mt-4 pt-2 border-t border-[#F3F4F6]">
              <StatRow
                label="Đơn hoàn thành"
                value={String(p.completed_jobs)}
              />
              <StatRow
                label="Tổng giá trị đơn"
                value={formatVnd(p.gross_amount)}
              />
            </View>
          </View>

          {/* Settlement */}
          <View className="bg-white rounded-3xl border border-[#E5E7EB] p-5 mt-4">
            <Text className="text-[#111827] text-base font-bold mb-1">
              Đối soát với CleanWise
            </Text>
            <StatRow
              label="Đơn chuyển khoản (app giữ tiền, chuyển bạn)"
              value={`+${formatVnd(p.bank_earned)}`}
              valueColor="#16A34A"
            />
            <StatRow
              label="Đơn tiền mặt (bạn đã thu, nộp hoa hồng)"
              value={`-${formatVnd(p.cash_commission)}`}
              valueColor="#DC2626"
            />
            <View className="mt-2 pt-3 border-t border-[#F3F4F6]">
              <Text className="text-[#6B7280] text-xs">Kết quả kỳ này</Text>
              <Text
                className="text-base font-bold mt-1"
                style={{ color: settlementColor }}
              >
                {settlementText}
              </Text>
            </View>
          </View>

          {/* History */}
          <Text className="text-[#6B7280] font-semibold text-xs uppercase tracking-wide mt-6 mb-1 ml-1">
            Đơn đã hoàn thành
          </Text>
          <View className="bg-white rounded-3xl border border-[#E5E7EB] px-4">
            {historyQuery.isLoading ? (
              <View className="py-8 items-center">
                <ActivityIndicator color="#2563EB" />
              </View>
            ) : history.length === 0 ? (
              <View className="py-8 items-center">
                <Feather name="inbox" size={26} color="#9CA3AF" />
                <Text className="text-[#9CA3AF] text-sm mt-2">
                  Chưa có đơn nào trong kỳ này
                </Text>
              </View>
            ) : (
              history.map((item) => <HistoryRow key={item.id} item={item} />)
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
