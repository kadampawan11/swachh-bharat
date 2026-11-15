import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { colors } from '../../constants/colors';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../store/auth.store';

export default function UserRegister() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const setAuth = useAuth((s) => s.setAuth);
  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onRegister = async () => {
    if (!form.email && !form.phone) { Alert.alert('Email or phone required'); return; }
    setLoading(true);
    try {
      const res = await authService.register({
        name: form.name, password: form.password,
        email: form.email || undefined, phone: form.phone || undefined,
      });
      await setAuth(res.user, res.tokens.accessToken, res.tokens.refreshToken);
      router.replace('/(user)/home');
    } catch (e: any) { Alert.alert('Registration failed', e.response?.data?.message ?? ''); }
    finally { setLoading(false); }
  };

  return (
    <ScrollView contentContainerStyle={s.page}>
      <Text style={s.brand}>Create Account</Text>
      <Input label="Full name" value={form.name} onChangeText={set('name')} placeholder="Your name" />
      <Input label="Email (or phone below)" value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" />
      <Input label="Phone (optional)" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" placeholder="9876543210" />
      <Input label="Password" value={form.password} onChangeText={set('password')} secureTextEntry />
      <Button title="Register" onPress={onRegister} loading={loading} />
      <Link href="/(auth)/user-login" style={s.link}>Already registered? Login</Link>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  page: { flexGrow: 1, padding: 24, justifyContent: 'center', maxWidth: 440, width: '100%', alignSelf: 'center' },
  brand: { fontSize: 28, fontWeight: '700', color: colors.primary, marginBottom: 16, textAlign: 'center' },
  link: { color: colors.primary, textAlign: 'center', marginTop: 12 },
});
