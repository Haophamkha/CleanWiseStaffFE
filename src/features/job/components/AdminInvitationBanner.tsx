import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useRespondInvitationMutation } from '@/features/job/api/jobsApi';
import type { WorkerSchedule } from '@/features/schedule/types/Schedule';
import { formatDateTime } from '@/utils/format';
import { getErrorMessage } from '@/utils/apiError';
import * as Crypto from 'expo-crypto';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

export function AdminInvitationBanner({ invitation, bookingId, scheduleId, sequenceNo }: {
  invitation: NonNullable<WorkerSchedule['invitation']>;
  bookingId: number;
  scheduleId: number;
  sequenceNo: number;
}) {
  const [now, setNow] = useState(Date.now());
  const [action, setAction] = useState<'accept' | 'decline' | null>(null);
  const [respond, { isLoading }] = useRespondInvitationMutation();
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const remaining = new Date(invitation.expires_at).getTime() - now;
  const active = invitation.status === 'PENDING' && remaining > 0;
  const labels = { ACCEPTED: 'Bạn đã nhận việc', REJECTED: 'Bạn đã từ chối lời mời', CANCELLED: 'Lời mời đã đóng', EXPIRED: 'Lời mời đã hết hạn', PENDING: 'Lời mời đã hết hạn' };
  const submit = async () => {
    if (!action || !active) { setAction(null); return; }
    try {
      await respond({ invitationId: invitation.id, action, idempotencyKey: Crypto.randomUUID() }).unwrap();
      setAction(null);
      if (action === 'accept') {
        router.replace({ pathname: '/jobs/[id]', params: { id: String(scheduleId), bookingId: String(bookingId), source: 'mine', view: 'session' } });
      } else {
        Alert.alert('Đã từ chối lời mời', 'Bạn đã từ chối lời mời nhận buổi làm này.');
        router.back();
      }
    } catch (error) {
      setAction(null);
      Alert.alert('Không thể phản hồi', getErrorMessage(error) || 'Vui lòng tải lại để kiểm tra trạng thái lời mời.');
    }
  };
  return <View className="rounded-2xl border border-primary bg-surface p-4 mb-4">
    <Text className="font-bold text-ink text-base">{active ? 'Lời mời nhận việc từ admin' : labels[invitation.status]}</Text>
    <Text className="text-ink-muted text-xs mt-1">Buổi #{sequenceNo}</Text>
    <Text className="text-ink-muted text-xs mt-1">Người gửi: {invitation.sender_name}</Text>
    <Text className="text-ink-muted text-xs mt-1">Hạn phản hồi: {formatDateTime(invitation.expires_at)}</Text>
    {active && <Text className="text-ink mt-3">Bạn có lời mời nhận việc mới. Vui lòng xem thông tin và xác nhận trước thời hạn.</Text>}
    {active ? <>
      <Text className="text-primary text-sm mt-3">Còn {Math.ceil(remaining / 60000)} phút để phản hồi.</Text>
      <View className="flex-row gap-3 mt-3">
        <TouchableOpacity disabled={isLoading} onPress={() => setAction('decline')} className="flex-1 border border-line rounded-xl p-3 items-center"><Text className="text-ink font-semibold">Từ chối</Text></TouchableOpacity>
        <TouchableOpacity disabled={isLoading} onPress={() => setAction('accept')} className="flex-1 bg-primary rounded-xl p-3 items-center"><Text className="text-white font-semibold">Nhận việc</Text></TouchableOpacity>
      </View>
    </> : <Text className="text-ink-muted text-sm mt-3">Lời mời này không còn chờ phản hồi. Nếu buổi làm vẫn đang mở, bạn có thể nhận từ danh sách chung.</Text>}
    {invitation.status === 'ACCEPTED' && <TouchableOpacity className="mt-3 bg-primary rounded-xl p-3 items-center" onPress={() => router.replace({ pathname: '/jobs/[id]', params: { id: String(scheduleId), bookingId: String(bookingId), source: 'mine', view: 'session' } })}><Text className="text-white font-semibold">Xem việc của tôi</Text></TouchableOpacity>}
    <ConfirmModal visible={action !== null} tone={action === 'decline' ? 'danger' : 'primary'} icon="user-check" title={action === 'decline' ? 'Từ chối lời mời?' : 'Nhận buổi làm được mời?'} message={action === 'decline' ? 'Bạn sẽ không nhận buổi làm từ lời mời này.' : 'Người xác nhận đầu tiên sẽ nhận buổi làm. Nếu nhận thành công, buổi làm sẽ được thêm vào lịch của bạn.'} confirmLabel={action === 'decline' ? 'Từ chối' : 'Nhận việc'} cancelLabel="Quay lại" loading={isLoading} onConfirm={submit} onCancel={() => setAction(null)} />
  </View>;
}
