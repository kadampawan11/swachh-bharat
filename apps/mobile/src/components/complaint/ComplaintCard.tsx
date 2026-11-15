import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { StatusBadge } from './StatusBadge';
import { API_BASE } from '../../constants/config';
import { CATEGORY_LABELS } from '@swachh/shared';

export function ComplaintCard({ complaint, onPress }: { complaint: any; onPress?: () => void }) {
  const img = complaint.images?.[0]?.imageUrl;
  return (
    <Pressable style={s.card} onPress={onPress}>
      {img ? <Image source={{ uri: img.startsWith('http') ? img : API_BASE + img }} style={s.thumb} /> : null}
      <View style={s.body}>
        <Text style={s.title} numberOfLines={1}>{complaint.title}</Text>
        <Text style={s.meta}>{(CATEGORY_LABELS as any)[complaint.category] ?? complaint.category} · {complaint.ward?.name ?? complaint.pincode ?? ''}</Text>
        <Text style={s.date}>{new Date(complaint.createdAt).toLocaleDateString()}</Text>
      </View>
      <StatusBadge status={complaint.status} />
    </Pressable>
  );
}
const s = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginVertical: 6, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, alignItems: 'center' },
  thumb: { width: 56, height: 56, borderRadius: 8, marginRight: 12 },
  body: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  meta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  date: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
});
