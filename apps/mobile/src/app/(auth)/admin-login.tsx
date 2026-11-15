import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { colors } from '../../constants/colors';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../store/auth.store';

export default function AdminLogin() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuth((s) => s.setAuth);

  const onLogin = async () => {
    setLoading(true);
    try {
      const res = await authService.adminLogin(identifier, password);
      await setAuth(res.user, res.tokens.accessToken, res.tokens.refreshToken);
      router.replace('/(admin)/dashboard');
    } catch (e: any) { Alert.alert('Login failed', e.response?.data?.message ?? ''); }
    finally { setLoading(false); }
  };

  return (
    <ScrollView contentContainerStyle={s.page}>
      <Text style={s.badge}>ADMIN PORTAL</Text>
      <Text style={s.brand}>स्वच्छ भारत Admin</Text>
      <Input label="Email" value={identifier} onChangeText={setIdentifier} keyboardType="email-address" autoCapitalize="none" />
      <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Login to Admin Panel" onPress={onLogin} loading={loading} />
      <Link href="/(auth)/user-login" style={s.link}>← Citizen login</Link>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  page: { flexGrow: 1, padding: 24, justifyContent: 'center', maxWidth: 440, width: '100%', alignSelf: 'center' },
  badge: { alignSelf: 'center', backgroundColor: colors.accent, color: '#fff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, fontWeight: '700', fontSize: 12, overflow: 'hidden', marginBottom: 8 },
  brand: { fontSize: 28, fontWeight: '700', color: colors.primaryDark, marginBottom: 16, textAlign: 'center' },
  link: { color: colors.primary, textAlign: 'center', marginTop: 12 },
});
