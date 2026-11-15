import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { api } from '../../services/api';
import { colors } from '../../constants/colors';

export default function Wards() {
  const [wards, setWards] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [pins, setPins] = useState('');
  const load = () => api.get('/wards').then((r) => setWards(r.data));
  useEffect(() => { load(); }, []);

  const create = async () => {
    try {
      await api.post('/wards', { name, pincodes: pins.split(',').map((p) => p.trim()).filter(Boolean) });
      setName(''); setPins(''); load();
    } catch (e: any) { Alert.alert('Error', e.response?.data?.message ?? ''); }
  };
  const addPin = async (wardId: string) => {
    const pin = await new Promise<string | null>((res) => {
      if (typeof prompt === 'function') res(prompt('Pincode to add (6 digits):'));
      else res(null);
    });
    if (!pin) return;
    try { await api.post(`/wards/${wardId}/pincodes`, { pincodes: [pin] }); load(); }
    catch (e: any) { Alert.alert('Error', e.response?.data?.message ?? ''); }
  };

  return (
    <ScrollView style={s.page} contentContainerStyle={{ padding: 16 }}>
      <Text style={s.section}>Create ward</Text>
      <Input label="Ward name" value={name} onChangeText={setName} placeholder="e.g. Koramangala" />
      <Input label="Pincodes (comma separated)" value={pins} onChangeText={setPins} placeholder="560001, 560002" />
      <Button title="Create Ward" onPress={create} disabled={name.length < 2} />
      <Text style={s.section}>All wards</Text>
      {wards.map((w) => (
        <View key={w.id} style={s.ward}>
          <View style={{ flex: 1 }}>
            <Text style={s.wardName}>{w.name}</Text>
            <Text style={s.pins}>{w.pincodes.map((p: any) => p.pincode).join(', ')}</Text>
            <Text style={s.meta}>{w._count?.complaints ?? 0} complaints · {w._count?.admins ?? 0} admins</Text>
          </View>
          <Text style={s.link} onPress={() => addPin(w.id)}>+ Pincode</Text>
        </View>
      ))}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.surface },
  section: { fontSize: 16, fontWeight: '700', marginTop: 12, marginBottom: 8, color: colors.textPrimary },
  ward: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginVertical: 5, alignItems: 'center' },
  wardName: { fontWeight: '700', fontSize: 15, color: colors.textPrimary },
  pins: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  meta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  link: { color: colors.primary, fontWeight: '600' },
});
