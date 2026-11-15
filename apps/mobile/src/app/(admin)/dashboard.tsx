import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../../services/api';
import { colors } from '../../constants/colors';

const CARDS: [string, string][] = [
  ['total', 'Total'], ['pending', 'Pending'], ['inProgress', 'In Progress'],
  ['resolved', 'Resolved'], ['rejected', 'Rejected'], ['avgResolutionHours', 'Avg Resolution (h)'],
];

export default function Dashboard() {
  const [d, setD] = useState<any>(null);
  const [byCat, setByCat] = useState<any[]>([]);
  const [byWard, setByWard] = useState<any[]>([]);
  useEffect(() => {
    api.get('/analytics/dashboard').then((r) => setD(r.data));
    api.get('/analytics/by-category').then((r) => setByCat(r.data));
    api.get('/analytics/by-ward').then((r) => setByWard(r.data));
  }, []);
  const maxCat = Math.max(1, ...byCat.map((c) => c.count));
  return (
    <ScrollView style={s.page} contentContainerStyle={{ padding: 16 }}>
      <View style={s.grid}>
        {CARDS.map(([key, label]) => (
          <View key={key} style={s.card}>
            <Text style={s.cardVal}>{d?.[key] ?? '—'}</Text>
            <Text style={s.cardLabel}>{label}</Text>
          </View>
        ))}
      </View>
      <Text style={s.section}>By category</Text>
      {byCat.map((c) => (
        <View key={c.category} style={s.barRow}>
          <Text style={s.barLabel}>{c.category}</Text>
          <View style={[s.bar, { width: `${(c.count / maxCat) * 100}%` }]} />
          <Text style={s.barVal}>{c.count}</Text>
        </View>
      ))}
      <Text style={s.section}>By ward</Text>
      {byWard.map((w) => (
        <View key={w.wardId ?? 'none'} style={s.wardRow}>
          <Text style={s.barLabel}>{w.ward}</Text>
          <Text style={s.barVal}>{w.count}</Text>
        </View>
      ))}
      <Text style={s.hint} onPress={() => { api.get('/analytics/export', { responseType: 'blob' }).then((r) => {
        const url = URL.createObjectURL(new Blob([r.data], { type: 'text/csv' }));
        const a = document.createElement('a'); a.href = url; a.download = 'complaints.csv'; a.click();
      }); }}>⬇ Export CSV</Text>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.surface },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, minWidth: '30%', flexGrow: 1, elevation: 2 },
  cardVal: { fontSize: 26, fontWeight: '700', color: colors.primary },
  cardLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  section: { fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 8, color: colors.textPrimary },
  barRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  barLabel: { width: 130, fontSize: 12, color: colors.textSecondary },
  bar: { height: 14, backgroundColor: colors.primaryLight, borderRadius: 4, marginHorizontal: 8, minWidth: 2 },
  barVal: { fontSize: 12, fontWeight: '700' },
  wardRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#eee' },
  hint: { color: colors.primary, marginTop: 20, fontWeight: '600' },
});
