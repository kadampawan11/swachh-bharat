import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COMPLAINT_STATUSES, COMPLAINT_CATEGORIES, CATEGORY_LABELS } from '@swachh/shared';
import { ComplaintMap } from '../../components/map/ComplaintMap';
import { api } from '../../services/api';
import { colors } from '../../constants/colors';
import { BANGALORE } from '../../constants/config';

export default function AdminMap() {
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [wards, setWards] = useState<any[]>([]);
  const [wardId, setWardId] = useState('');
  const load = () => {
    api.get('/complaints/geo', { params: {
      minLat: BANGALORE.latitude - 0.5, maxLat: BANGALORE.latitude + 0.5,
      minLng: BANGALORE.longitude - 0.5, maxLng: BANGALORE.longitude + 0.5,
      status: status || undefined, wardId: wardId || undefined,
    }}).then((r) => setItems(r.data));
  };
  useEffect(() => { api.get('/wards').then((r) => setWards(r.data)); }, []);
  useEffect(() => { load(); }, [status, wardId]);

  return (
    <View style={{ flex: 1 }}>
      <View style={s.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['', ...COMPLAINT_STATUSES].map((st) => (
            <Text key={st} style={[s.chip, status === st && s.chipActive]} onPress={() => setStatus(st)}>{st || 'ALL'}</Text>
          ))}
          <Text style={{ width: 12 }}> </Text>
          <Text style={[s.chip, !wardId && s.chipActive]} onPress={() => setWardId('')}>All wards</Text>
          {wards.map((w) => (
            <Text key={w.id} style={[s.chip, wardId === w.id && s.chipActive]} onPress={() => setWardId(w.id)}>{w.name}</Text>
          ))}
        </ScrollView>
      </View>
      <ComplaintMap complaints={items} onSelect={(c) => router.push(`/(admin)/complaint/${c.id}`)} />
    </View>
  );
}
const s = StyleSheet.create({
  filters: { backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 8, zIndex: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.surface, color: colors.textSecondary, marginHorizontal: 4, fontSize: 12, fontWeight: '600', overflow: 'hidden' },
  chipActive: { backgroundColor: colors.primary, color: '#fff' },
});
