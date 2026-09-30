import { DetailHeader } from "@/components/common/DetailHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { COLORS } from "@/constants/theme";
import { JobActions } from "@/features/job/components/JobActions";
import { JobInfoCard } from "@/features/job/components/JobInfoCard";
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
      <DetailHeader title="Chi tiết đơn" onBack={job.goBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 20,
          paddingHorizontal: 20,
          paddingBottom: (job.hasOpenSessions ? 120 : 40) + insets.bottom,
        }}
      >
        <JobInfoCard
          summary={summary}
          isPackage={job.isPackage}
          customerName={item.customer_name}
          customerAvatar={item.customer_avatar}
          onDirections={job.openDirections}
        />

        {job.isPackage ? (
          <PackageSessionsCard
            sessions={job.visibleSessions}
            totalSessions={job.totalSessions}
            openSessions={job.openSessions}
            actions={actions}
          />
        ) : null}

        <ServiceDetailReadOnly
          fields={item.form_schema?.fields}
          values={item.service_data}
          taskChecklist={item.form_schema?.task_checklist}
        />

        {!job.isPackage && job.showImages && mineItem ? (
          <ProofImagesSection
            images={mineItem.images}
            canEdit={job.canEditImages}
            localImages={actions.localImages}
            isUploadingImages={actions.isCheckingOut}
            onPickImage={actions.handlePickImage}
            onRemoveImage={actions.handleRemoveStagedImage}
          />
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
