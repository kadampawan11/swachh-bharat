import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { colors } from '../../constants/colors';
import { MOCK_OTP_HINT } from '../../constants/config';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../store/auth.store';

export default function UserLogin() {
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuth((s) => s.setAuth);

  const onLogin = async () => {
    setLoading(true);
    try {
      const res = await authService.login(identifier, password);
      await setAuth(res.user, res.tokens.accessToken, res.tokens.refreshToken);
      router.replace('/(user)/home');
    } catch (e: any) { Alert.alert('Login failed', e.response?.data?.message ?? 'Check your credentials'); }
    finally { setLoading(false); }
  };
  const onSendOtp = async () => {
    try { await authService.otpSend(identifier); setOtpSent(true); }
    catch (e: any) { Alert.alert('Error', e.response?.data?.message ?? 'Could not send OTP'); }
  };
  const onVerifyOtp = async () => {
    setLoading(true);
    try {
      const res = await authService.otpVerify(identifier, otp, name || undefined);
      await setAuth(res.user, res.tokens.accessToken, res.tokens.refreshToken);
      router.replace('/(user)/home');
    } catch (e: any) { Alert.alert('Invalid OTP', e.response?.data?.message ?? ''); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.page}>
        <Text style={s.brand}>स्वच्छ भारत</Text>
        <Text style={s.tagline}>Report. Track. Clean Bangalore.</Text>
        <View style={s.toggle}>
          {(['email', 'phone'] as const).map((m) => (
            <Text key={m} style={[s.toggleItem, mode === m && s.toggleActive]} onPress={() => { setMode(m); setOtpSent(false); }}>
              {m === 'email' ? 'Email' : 'Phone OTP'}
            </Text>
          ))}
        </View>
        <Input label={mode === 'email' ? 'Email' : 'Phone'} value={identifier} onChangeText={setIdentifier}
          placeholder={mode === 'email' ? 'you@example.com' : '9876543210'}
          keyboardType={mode === 'email' ? 'email-address' : 'phone-pad'} autoCapitalize="none" />
        {mode === 'email' ? (
          <>
            <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••" />
            <Button title="Login" onPress={onLogin} loading={loading} />
            <Link href="/(auth)/forgot-password" style={s.link}>Forgot password?</Link>
          </>
        ) : otpSent ? (
          <>
            <Input label="Your name (first time)" value={name} onChangeText={setName} placeholder="Full name" />
            <Input label={`OTP (${MOCK_OTP_HINT})`} value={otp} onChangeText={setOtp} keyboardType="number-pad" placeholder="123456" />
            <Button title="Verify OTP" onPress={onVerifyOtp} loading={loading} />
          </>
        ) : (
          <Button title="Send OTP" onPress={onSendOtp} />
        )}
        <Link href="/(auth)/user-register" style={s.link}>New here? Create account</Link>
        <Link href="/(auth)/admin-login" style={s.adminLink}>Login as Admin →</Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const s = StyleSheet.create({
  page: { flexGrow: 1, padding: 24, justifyContent: 'center', maxWidth: 440, width: '100%', alignSelf: 'center' },
  brand: { fontSize: 34, fontWeight: '700', color: colors.primary, textAlign: 'center' },
  tagline: { textAlign: 'center', color: colors.textSecondary, marginBottom: 24, marginTop: 4 },
  toggle: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 10, padding: 4, marginBottom: 12 },
  toggleItem: { flex: 1, textAlign: 'center', paddingVertical: 10, borderRadius: 8, color: colors.textSecondary, fontWeight: '600' },
  toggleActive: { backgroundColor: '#fff', color: colors.primary },
  link: { color: colors.primary, textAlign: 'center', marginTop: 12 },
  adminLink: { color: colors.accent, textAlign: 'center', marginTop: 24, fontWeight: '600' },
});
