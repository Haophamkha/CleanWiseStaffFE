import { DetailHeader } from "@/components/common/DetailHeader";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { FadeInView } from "@/components/ui/FadeInView";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { COLORS } from "@/constants/theme";
import { JobActions } from "@/features/job/components/JobActions";
import { JobInfoCard } from "@/features/job/components/JobInfoCard";
import { JobRouteMap } from "@/features/job/components/JobRouteMap";
import {
  PackageClaimBar,
  PackageSessionsCard,
} from "@/features/job/components/PackageSessions";
import { ProofImagesSection } from "@/features/job/components/ProofImagesSection";
import { ServiceDetailReadOnly } from "@/features/job/components/ServiceDetailReadOnly";
import { useJobDetail } from "@/features/job/hooks/useJobDetail";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function JobDetailScreen() {
  const insets = useSafeAreaInsets();
  const job = useJobDetail();
  const { item, mineItem, summary, actions } = job;

  if (job.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  if (!item || !summary) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas px-5">
        <EmptyState
          icon="alert-circle"
          title={job.missingTitle}
          message={job.missingMessage}
          actionLabel="Quay lại"
          onAction={job.goBack}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <DetailHeader
        title="Chi tiết đơn"
        subtitle={summary.codeLine}
        onBack={job.goBack}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: 20,
          paddingHorizontal: 20,
          paddingBottom: (job.hasOpenSessions ? 120 : 40) + insets.bottom,
        }}
      >
        <FadeInView>
          <JobInfoCard
            summary={summary}
            isPackage={job.isPackage}
            customerName={item.customer_name}
            customerAvatar={item.customer_avatar}
            onDirections={job.openDirections}
            map={
              job.showRouteMap && job.destination ? (
                <JobRouteMap
                  destination={job.destination}
                  onOpenMaps={job.openDirections}
                />
              ) : undefined
            }
          />
        </FadeInView>

        {job.isPackage ? (
          <FadeInView delay={90}>
            <PackageSessionsCard
              sessions={job.visibleSessions}
              totalSessions={job.totalSessions}
              openSessions={job.openSessions}
              actions={actions}
            />
          </FadeInView>
        ) : null}

        <FadeInView delay={150}>
          <ServiceDetailReadOnly
            fields={item.form_schema?.fields}
            values={item.service_data}
            taskChecklist={item.form_schema?.task_checklist}
          />
        </FadeInView>

        {!job.isPackage && job.showImages && mineItem ? (
          <FadeInView delay={200}>
            <ProofImagesSection
              images={mineItem.images}
              canEdit={job.canEditImages}
              localImages={actions.localImages}
              isUploadingImages={actions.isCheckingOut}
              onPickImage={actions.handlePickImage}
              onRemoveImage={actions.handleRemoveStagedImage}
            />
          </FadeInView>
        ) : null}

        <JobActions
          isMine={job.isMine}
          isPackage={job.isPackage}
          item={item}
          mineItem={mineItem}
          actions={actions}
        />
      </ScrollView>

      {job.hasOpenSessions ? <PackageClaimBar actions={actions} /> : null}
      <ConfirmModal
        visible={actions.claimConfirm.visible}
        tone="dark"
        icon="check-circle"
        title={actions.claimConfirm.title}
        message={actions.claimConfirm.message}
        confirmLabel="Nhận việc"
        cancelLabel="Để sau"
        onConfirm={actions.confirmClaim}
        onCancel={actions.dismissClaimConfirm}
      />

      <ConfirmModal
        visible={actions.cancelConfirm.visible}
        tone="danger"
        icon="alert-triangle"
        title={actions.cancelConfirm.title}
        message={actions.cancelConfirm.message}
        confirmLabel="Hủy nhận việc"
        cancelLabel="Giữ lại"
        loading={actions.isCancelling}
        onConfirm={actions.confirmCancel}
        onCancel={actions.dismissCancelConfirm}
      />

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
