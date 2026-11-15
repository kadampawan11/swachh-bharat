import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../store/auth.store';
import { colors } from '../constants/colors';

export default function Index() {
  const { user, hydrated } = useAuth();
  if (!hydrated) {
    return (
      <View style={s.splash}>
        <Text style={s.hindi}>स्वच्छ भारत</Text>
        <Text style={s.eng}>Swachh Bharat</Text>
        <ActivityIndicator color="#fff" style={{ marginTop: 24 }} />
      </View>
    );
  }
  if (!user) return <Redirect href="/(auth)/user-login" />;
  if (user.role === 'USER') return <Redirect href="/(user)/home" />;
  return <Redirect href="/(admin)/dashboard" />;
}
const s = StyleSheet.create({
  splash: { flex: 1, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  hindi: { fontSize: 40, fontWeight: '700', color: '#fff' },
  eng: { fontSize: 18, color: '#fff', opacity: 0.9, marginTop: 8 },
});
