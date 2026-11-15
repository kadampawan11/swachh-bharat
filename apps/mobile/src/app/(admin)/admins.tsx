import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { api } from '../../services/api';
import { colors } from '../../constants/colors';

export default function Admins() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [selected, setSelected] = useState<string[]>([]);
  const load = () => {
    api.get('/admins').then((r) => setAdmins(r.data));
    api.get('/wards').then((r) => setWards(r.data));
  };
  useEffect(() => { load(); }, []);
  const toggle = (id: string) => setSelected((p) => p.includes(id) ? p.filter((w) => w !== id) : [...p, id]);

  const create = async () => {
    try {
      await api.post('/admins', { ...form, wardIds: selected });
      setForm({ name: '', email: '', password: '' }); setSelected([]); load();
    } catch (e: any) { Alert.alert('Error', e.response?.data?.message ?? ''); }
  };
  const reassign = async (adminId: string, wardIds: string[]) => {
    await api.patch(`/admins/${adminId}/wards`, { wardIds }); load();
  };
  const toggleActive = async (a: any) => {
    await api.patch(`/admins/${a.id}/status`, { isActive: !a.isActive }); load();
  };

  return (
    <ScrollView style={s.page} contentContainerStyle={{ padding: 16 }}>
      <Text style={s.section}>Create ward admin</Text>
      <Input label="Name" value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} />
      <Input label="Email" value={form.email} onChangeText={(v) => setForm((f) => ({ ...f, email: v }))} autoCapitalize="none" />
      <Input label="Password" value={form.password} onChangeText={(v) => setForm((f) => ({ ...f, password: v }))} secureTextEntry />
      <Text style={s.label}>Assign wards</Text>
      <View style={s.chips}>
        {wards.map((w) => (
          <Text key={w.id} style={[s.chip, selected.includes(w.id) && s.chipActive]} onPress={() => toggle(w.id)}>{w.name}</Text>
        ))}
      </View>
      <Button title="Create Admin" onPress={create} disabled={!form.name || !form.email || form.password.length < 6} />

      <Text style={s.section}>Admins</Text>
      {admins.map((a) => (
        <View key={a.id} style={s.admin}>
          <View style={{ flex: 1 }}>
            <Text style={s.adminName}>{a.name} <Text style={s.role}>{a.role}</Text></Text>
            <Text style={s.meta}>{a.email}</Text>
            <Text style={s.meta}>Wards: {a.adminWards?.map((aw: any) => aw.ward.name).join(', ') || 'none'}</Text>
          </View>
          <Text style={[s.link, !a.isActive && { color: colors.status.PENDING }]} onPress={() => toggleActive(a)}>
            {a.isActive ? 'Deactivate' : 'Activate'}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.surface },
  section: { fontSize: 16, fontWeight: '700', marginTop: 12, marginBottom: 8, color: colors.textPrimary },
  label: { fontSize: 13, color: colors.textSecondary, marginTop: 6, marginBottom: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: '#fff', color: colors.textSecondary, fontSize: 12, overflow: 'hidden' },
  chipActive: { backgroundColor: colors.primary, color: '#fff' },
  admin: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginVertical: 5, alignItems: 'center' },
  adminName: { fontWeight: '700', fontSize: 15 },
  role: { fontSize: 11, color: colors.accent, fontWeight: '700' },
  meta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  link: { color: colors.primary, fontWeight: '600' },
});
