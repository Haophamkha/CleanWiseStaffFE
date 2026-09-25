import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CancelSection } from "@/components/job/CancelSection";
import { CheckInSection } from "@/components/job/CheckInSection";
import { CheckOutSection } from "@/components/job/CheckOutSection";
import { CustomerHeader } from "@/components/job/CustomerHeader";
import { JobSummaryCard } from "@/components/job/JobSummaryCard";
import { PackageClaimBar } from "@/components/job/PackageClaimBar";
import { PackageSessionsCard } from "@/components/job/PackageSessionsCard";
import { ProofImagesSection } from "@/components/job/ProofImagesSection";
import { ServiceDetailReadOnly } from "@/components/job/ServiceDetailReadOnly";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { useJobActions } from "@/hooks/useJobActions";
import { useJobDetailData } from "@/hooks/useJobDetailData";

export default function JobDetailScreen() {
  const insets = useSafeAreaInsets();
  const {
    id,
    source,
    bookingId: bookingIdParam,
    view,
  } = useLocalSearchParams<{
    id: string;
    source?: string;
    bookingId?: string;
    view?: string;
  }>();
  const scheduleId = Number(id);
  const isMine = source === "mine";
  const isSingleSessionView = view === "session";
  const paramBookingId = Number(bookingIdParam) || undefined;

  const {
    item,
    mineItem,
    bookingSchedules,
    openSessions,
    isLoading,
    isPackage,
    totalSessions,
    bookingId,
    refetchBookingSchedules,
    refetchMineSchedules,
  } = useJobDetailData({
    scheduleId,
    isMine,
    isSingleSessionView,
    paramBookingId,
  });

  const actions = useJobActions({
    scheduleId,
    isMine,
    item,
    mineItem,
    bookingId,
    bookingSchedules,
    openSessions,
    refetchBookingSchedules,
    refetchMineSchedules,
  });

  /* ----- Trạng thái tải / không có dữ liệu ----- */

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8F9FC]">
        <ActivityIndicator color="#2563EB" />
      </View>
    );
  }

  if (!item) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8F9FC] px-6">
        <Text className="text-[#111827] font-semibold text-base mb-1">
          {isMine ? "Không tìm thấy buổi làm" : "Đơn này không còn buổi trống"}
        </Text>
        {!isMine ? (
          <Text className="text-[#9CA3AF] text-sm text-center">
            Có thể các buổi đã được nhân viên khác nhận.
          </Text>
        ) : null}
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-[#2563EB] font-medium">Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  const showImagesSection =
    isMine &&
    mineItem &&
    !["PENDING", "CANCELLED", "MISSED"].includes(mineItem.status);
  const canEditImages = mineItem?.status === "IN_PROGRESS";

  return (
    <View className="flex-1 bg-[#F8F9FC]">
      <View
        style={{ paddingTop: insets.top + 12 }}
        className="flex-row items-center px-5 pb-4 bg-white border-b border-[#F3F4F6]"
      >
        <Pressable onPress={() => router.back()} className="mr-3">
          <Feather name="arrow-left" size={22} color="#111827" />
        </Pressable>
        <Text className="text-[#111827] text-base font-bold">Chi tiết đơn</Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: 20,
          paddingHorizontal: 20,
          paddingBottom:
            (isPackage && openSessions.length > 0 ? 120 : 40) + insets.bottom,
        }}
      >
        <JobSummaryCard
          item={item}
          mineItem={mineItem}
          isPackage={isPackage}
          totalSessions={totalSessions}
          openSessionsCount={openSessions.length}
        />

        <View className="bg-white rounded-2xl p-4 mb-4 border border-[#F3F4F6]">
          <CustomerHeader
            avatar={item.customer_avatar}
            name={item.customer_name}
          />
        </View>

        {isPackage ? (
          <PackageSessionsCard
            bookingSchedules={bookingSchedules}
            totalSessions={totalSessions}
            openSessions={openSessions}
            validSelected={actions.validSelected}
            allSelected={actions.allSelected}
            selectedIncome={actions.selectedIncome}
            expandedSessionId={actions.expandedSessionId}
            sessionCancelReason={actions.sessionCancelReason}
            isCancelling={actions.isCancelling}
            onToggleAll={actions.toggleAll}
            onSessionPress={actions.handleSessionPress}
            onChangeCancelReason={actions.setSessionCancelReason}
            onConfirmCancel={actions.handleCancelSession}
          />
        ) : null}

        <ServiceDetailReadOnly
          fields={item.form_schema?.fields}
          values={item.service_data}
          taskChecklist={item.form_schema?.task_checklist}
        />

        {!isPackage && showImagesSection && mineItem && (
          <ProofImagesSection
            images={mineItem.images}
            canEdit={canEditImages}
            localImages={actions.localImages}
            isUploadingImages={actions.isCheckingOut}
            onPickImage={actions.handlePickImage}
            onRemoveImage={actions.handleRemoveStagedImage}
          />
        )}

        {!isMine &&
          !isPackage &&
          (item.claim_state === "OPEN" ? (
            <Pressable
              onPress={actions.handleClaim}
              disabled={actions.isClaiming}
              className="bg-[#2563EB] rounded-xl py-4 items-center"
            >
              <Text className="text-white font-semibold text-base">
                {actions.isClaiming ? "Đang xử lý..." : "Nhận việc"}
              </Text>
            </Pressable>
          ) : (
            <View className="bg-[#F3F4F6] rounded-xl py-4 items-center">
              <Text className="text-[#6B7280] font-semibold text-sm">
                {item.claim_state === "MINE"
                  ? "Bạn đã nhận buổi này."
                  : "Đã có nhân viên khác nhận buổi này."}
              </Text>
            </View>
          ))}

        {!isPackage &&
          isMine &&
          mineItem?.status === "PENDING" &&
          mineItem.assignment_id && (
            <CheckInSection
              scheduledStart={item.scheduled_start}
              addressHint={item.address_ward}
              loading={actions.isCheckingIn}
              onCheckIn={actions.handleCheckIn}
            />
          )}

        {!isPackage && isMine && mineItem?.status === "IN_PROGRESS" && (
          <CheckOutSection
            loading={actions.isCheckingOut}
            onCheckOut={actions.handleCheckOut}
          />
        )}

        {!isPackage && isMine && mineItem?.assignment_id && (
          <Pressable
            onPress={actions.handleOpenChat}
            disabled={actions.openingChat}
            className="border border-[#2563EB] bg-white rounded-xl py-3.5 items-center flex-row justify-center mb-3"
          >
            {actions.openingChat ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : (
              <Feather name="message-circle" size={18} color="#2563EB" />
            )}
            <Text className="text-[#2563EB] font-semibold text-base ml-2">
              {actions.openingChat ? "Đang mở..." : "Liên hệ khách hàng"}
            </Text>
          </Pressable>
        )}

        {!isPackage && isMine && mineItem && mineItem.status === "PENDING" && (
          <CancelSection
            canCancel={mineItem.can_cancel}
            showForm={actions.showCancelForm}
            reason={actions.reason}
            isCancelling={actions.isCancelling}
            onChangeReason={actions.setReason}
            onToggleForm={actions.setShowCancelForm}
            onConfirmCancel={actions.handleCancel}
          />
        )}
      </ScrollView>

      {isPackage && openSessions.length > 0 ? (
        <PackageClaimBar
          selectedCount={actions.validSelected.length}
          selectedIncome={actions.selectedIncome}
          isClaiming={actions.isClaimingPackage}
          onClaim={actions.handleClaimSelected}
        />
      ) : null}

      <SuccessModal
        visible={actions.successModal.visible}
        title={actions.successModal.title}
        message={actions.successModal.message}
        details={actions.successModal.details}
        onClose={actions.closeSuccessModal}
      />
    </View>
  );
}
