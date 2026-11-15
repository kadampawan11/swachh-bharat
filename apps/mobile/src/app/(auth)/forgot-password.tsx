import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { colors } from '../../constants/colors';
import { authService } from '../../services/auth.service';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [stage, setStage] = useState<'email' | 'reset'>('email');

  const send = async () => {
    try {
      const res = await authService.forgotPassword(email);
      if (res.devResetToken) setToken(res.devResetToken);
      setStage('reset');
    } catch (e: any) { Alert.alert('Error', e.response?.data?.message ?? ''); }
  };
  const reset = async () => {
    try {
      await authService.resetPassword(token, password);
      Alert.alert('Done', 'Password updated. Please login.');
      router.replace('/(auth)/user-login');
    } catch (e: any) { Alert.alert('Error', e.response?.data?.message ?? ''); }
  };

  return (
    <ScrollView contentContainerStyle={s.page}>
      <Text style={s.brand}>Reset Password</Text>
      {stage === 'email' ? (
        <>
          <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Button title="Send reset link" onPress={send} />
        </>
      ) : (
        <>
          <Input label="Reset token (dev: auto-filled)" value={token} onChangeText={setToken} autoCapitalize="none" />
          <Input label="New password" value={password} onChangeText={setPassword} secureTextEntry />
          <Button title="Reset password" onPress={reset} />
        </>
      )}
      <Link href="/(auth)/user-login" style={s.link}>← Back to login</Link>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  page: { flexGrow: 1, padding: 24, justifyContent: 'center', maxWidth: 440, width: '100%', alignSelf: 'center' },
  brand: { fontSize: 26, fontWeight: '700', color: colors.primary, marginBottom: 16, textAlign: 'center' },
  link: { color: colors.primary, textAlign: 'center', marginTop: 12 },
});
