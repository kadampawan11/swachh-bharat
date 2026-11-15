import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/colors';
import { useAuth } from '../../store/auth.store';

export default function Profile() {
  const { user, logout } = useAuth();
  return (
    <View style={s.page}>
      <View style={s.avatar}><Text style={s.avatarTxt}>{user?.name?.[0] ?? '?'}</Text></View>
      <Text style={s.name}>{user?.name}</Text>
      <Text style={s.meta}>{user?.email ?? user?.phone}</Text>
      <Text style={s.role}>Citizen</Text>
      <Button title="Logout" variant="danger" onPress={async () => { await logout(); router.replace('/(auth)/user-login'); }} />
    </View>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, padding: 24, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginVertical: 16 },
  avatarTxt: { color: '#fff', fontSize: 32, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  meta: { color: colors.textSecondary, marginTop: 4 },
  role: { color: colors.accent, fontWeight: '600', marginVertical: 8 },
});
