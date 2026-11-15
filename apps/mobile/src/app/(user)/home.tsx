import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ComplaintCard } from '../../components/complaint/ComplaintCard';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/colors';
import { complaintService } from '../../services/complaint.service';
import { useAuth } from '../../store/auth.store';

export default function Home() {
  const user = useAuth((s) => s.user);
  const [items, setItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const load = async () => {
    setRefreshing(true);
    try { const res = await complaintService.mine({ pageSize: 5 }); setItems(res.items); }
    catch {} finally { setRefreshing(false); }
  };
  useEffect(() => { load(); }, []);

  return (
    <ScrollView style={s.page} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}>
      <View style={s.hero}>
        <Text style={s.hi}>Namaste, {user?.name?.split(' ')[0]} 👋</Text>
        <Text style={s.sub}>Spot a sanitation issue? Report it in under a minute.</Text>
        <Button title="Report an Issue" onPress={() => router.push('/(user)/submit')} />
      </View>
      <Text style={s.section}>Recent complaints</Text>
      {items.map((c) => <ComplaintCard key={c.id} complaint={c} onPress={() => router.push(`/(user)/complaint/${c.id}`)} />)}
      {!items.length && <Text style={s.empty}>No complaints yet. Report your first issue!</Text>}
      <Link href="/(user)/my-complaints" style={s.link}>View all →</Link>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, padding: 16 },
  hero: { backgroundColor: colors.primary, borderRadius: 16, padding: 20, marginBottom: 16 },
  hi: { color: '#fff', fontSize: 22, fontWeight: '700' },
  sub: { color: '#fff', opacity: 0.9, marginVertical: 8 },
  section: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginVertical: 8 },
  empty: { color: colors.textSecondary, textAlign: 'center', marginVertical: 24 },
  link: { color: colors.primary, textAlign: 'center', marginVertical: 12 },
});
