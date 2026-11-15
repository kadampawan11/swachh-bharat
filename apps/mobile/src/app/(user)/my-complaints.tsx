import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ComplaintCard } from '../../components/complaint/ComplaintCard';
import { colors } from '../../constants/colors';
import { complaintService } from '../../services/complaint.service';
import { COMPLAINT_STATUSES } from '@swachh/shared';

export default function MyComplaints() {
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const load = async () => {
    setRefreshing(true);
    try { const res = await complaintService.mine({ status: status || undefined }); setItems(res.items); }
    finally { setRefreshing(false); }
  };
  useEffect(() => { load(); }, [status]);

  return (
    <View style={s.page}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filters}>
        {['', ...COMPLAINT_STATUSES].map((st) => (
          <Text key={st} style={[s.chip, status === st && s.chipActive]} onPress={() => setStatus(st)}>
            {st || 'ALL'}
          </Text>
        ))}
      </ScrollView>
      <FlatList
        data={items} keyExtractor={(c) => c.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        renderItem={({ item }) => <ComplaintCard complaint={item} onPress={() => router.push(`/(user)/complaint/${item.id}`)} />}
        ListEmptyComponent={<Text style={s.empty}>No complaints{status ? ` with status ${status}` : ''}.</Text>}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.surface },
  filters: { flexGrow: 0, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.surface, color: colors.textSecondary, marginHorizontal: 4, fontSize: 12, fontWeight: '600', overflow: 'hidden' },
  chipActive: { backgroundColor: colors.primary, color: '#fff' },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: 40 },
});
