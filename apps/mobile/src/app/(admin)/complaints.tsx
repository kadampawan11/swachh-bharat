import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { COMPLAINT_STATUSES, COMPLAINT_CATEGORIES, CATEGORY_LABELS, ComplaintCategory } from '@swachh/shared';
import { ComplaintCard } from '../../components/complaint/ComplaintCard';
import { Input } from '../../components/ui/Input';
import { api } from '../../services/api';
import { colors } from '../../constants/colors';

export default function AdminComplaints() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState({ status: '', category: '', search: '', wardId: '' });
  const [wards, setWards] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const load = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/complaints', { params: {
        status: q.status || undefined, category: q.category || undefined,
        search: q.search || undefined, wardId: q.wardId || undefined,
      }});
      setItems(res.data.items);
    } finally { setRefreshing(false); }
  };
  useEffect(() => { api.get('/wards').then((r) => setWards(r.data)); }, []);
  useEffect(() => { load(); }, [q.status, q.category, q.wardId]);

  return (
    <View style={s.page}>
      <Input placeholder="Search title/description…" value={q.search} onChangeText={(v) => setQ((p) => ({ ...p, search: v }))} onSubmitEditing={load} returnKeyType="search" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filters}>
        {['', ...COMPLAINT_STATUSES].map((st) => (
          <Text key={st} style={[s.chip, q.status === st && s.chipActive]} onPress={() => setQ((p) => ({ ...p, status: st }))}>{st || 'ALL STATUS'}</Text>
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filters}>
        {['', ...COMPLAINT_CATEGORIES].map((c) => (
          <Text key={c} style={[s.chip, q.category === c && s.chipActive]} onPress={() => setQ((p) => ({ ...p, category: c }))}>{c ? CATEGORY_LABELS[c as ComplaintCategory] : 'ALL CATEGORIES'}</Text>
        ))}
      </ScrollView>
      <FlatList data={items} keyExtractor={(c) => c.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        renderItem={({ item }) => <ComplaintCard complaint={item} onPress={() => router.push(`/(admin)/complaint/${item.id}`)} />}
        ListEmptyComponent={<Text style={s.empty}>No complaints match.</Text>}
        contentContainerStyle={{ paddingVertical: 8 }} />
    </View>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.surface, padding: 12 },
  filters: { flexGrow: 0, marginBottom: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#fff', color: colors.textSecondary, marginHorizontal: 4, fontSize: 12, fontWeight: '600', overflow: 'hidden' },
  chipActive: { backgroundColor: colors.primary, color: '#fff' },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: 40 },
});
