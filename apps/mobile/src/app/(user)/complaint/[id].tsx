import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ImageCarousel } from '../../../components/complaint/ImageCarousel';
import { StatusBadge } from '../../../components/complaint/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { colors } from '../../../constants/colors';
import { CATEGORY_LABELS } from '@swachh/shared';
import { complaintService } from '../../../services/complaint.service';

export default function ComplaintDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [c, setC] = useState<any>(null);
  const [comment, setComment] = useState('');
  const load = () => complaintService.detail(id!).then(setC).catch(() => Alert.alert('Error', 'Could not load complaint'));
  useEffect(() => { load(); }, [id]);
  if (!c) return <View style={s.page} />;
  const complaintImgs = (c.images ?? []).filter((i: any) => i.type === 'COMPLAINT');
  const resolutionImgs = (c.images ?? []).filter((i: any) => i.type === 'RESOLUTION');

  const del = () => Alert.alert('Delete complaint?', 'This cannot be undone.', [
    { text: 'Cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { await complaintService.remove(id!); router.replace('/(user)/my-complaints'); } },
  ]);

  return (
    <ScrollView style={s.page} contentContainerStyle={{ padding: 16, maxWidth: 720, width: '100%', alignSelf: 'center' }}>
      {!!complaintImgs.length && <ImageCarousel images={complaintImgs} />}
      <View style={s.row}>
        <Text style={s.title}>{c.title}</Text>
        <StatusBadge status={c.status} />
      </View>
      <Text style={s.meta}>{(CATEGORY_LABELS as any)[c.category]} · {c.ward?.name ?? ''} {c.pincode ?? ''}</Text>
      <Text style={s.desc}>{c.description}</Text>
      {c.address ? <Text style={s.meta}>📍 {c.address} ({c.latitude.toFixed(5)}, {c.longitude.toFixed(5)})</Text> : null}

      <Text style={s.section}>Timeline</Text>
      {(c.statusHistory ?? []).map((h: any) => (
        <View key={h.id} style={s.hist}>
          <StatusBadge status={h.toStatus} />
          <Text style={s.histMeta}>{new Date(h.changedAt).toLocaleString()} {h.remarks ? `— ${h.remarks}` : ''}</Text>
        </View>
      ))}

      {!!resolutionImgs.length && (
        <>
          <Text style={s.section}>Resolution photos</Text>
          <ImageCarousel images={resolutionImgs} />
        </>
      )}

      {c.status === 'RESOLVED' && (
        <Button title="Not fixed? Reopen complaint" variant="outline" onPress={async () => { await complaintService.reopen(id!); load(); }} />
      )}
      {c.status === 'PENDING' && (
        <Button title="Delete complaint" variant="danger" onPress={del} />
      )}

      <Text style={s.section}>Comments</Text>
      {(c.comments ?? []).map((cm: any) => (
        <View key={cm.id} style={[s.comment, cm.authorRole === 'ADMIN' && s.commentAdmin]}>
          <Text style={s.commentAuthor}>{cm.author.name} {cm.authorRole === 'ADMIN' ? '(Admin)' : ''}</Text>
          <Text>{cm.content}</Text>
        </View>
      ))}
      <Input placeholder="Write a comment…" value={comment} onChangeText={setComment} />
      <Button title="Post comment" variant="outline" disabled={!comment.trim()} onPress={async () => { await complaintService.addComment(id!, comment); setComment(''); load(); }} />
    </ScrollView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.surface },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, flex: 1, marginRight: 8 },
  meta: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  desc: { marginVertical: 12, color: colors.textPrimary, lineHeight: 20 },
  section: { fontSize: 16, fontWeight: '700', marginTop: 16, marginBottom: 8, color: colors.textPrimary },
  hist: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  histMeta: { marginLeft: 8, fontSize: 12, color: colors.textSecondary },
  comment: { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginVertical: 4 },
  commentAdmin: { borderLeftWidth: 3, borderLeftColor: colors.accent },
  commentAuthor: { fontWeight: '700', fontSize: 12, color: colors.textSecondary, marginBottom: 2 },
});
