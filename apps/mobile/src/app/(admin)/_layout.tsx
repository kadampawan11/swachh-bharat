import { Redirect, Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useAuth } from '../../store/auth.store';
import { colors } from '../../constants/colors';

export default function AdminLayout() {
  const { user, hydrated } = useAuth();
  if (!hydrated) return null;
  if (!user) return <Redirect href="/(auth)/admin-login" />;
  if (user.role === 'USER') return <Redirect href="/(user)/home" />;
  const isSuper = user.role === 'SUPER_ADMIN';
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.primary, headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff' }}>
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Text style={{ color }}>▦</Text> }} />
      <Tabs.Screen name="map" options={{ title: 'Map', tabBarIcon: ({ color }) => <Text style={{ color }}>◎</Text> }} />
      <Tabs.Screen name="complaints" options={{ title: 'Complaints', tabBarIcon: ({ color }) => <Text style={{ color }}>☰</Text> }} />
      <Tabs.Screen name="wards" options={{ title: 'Wards', href: isSuper ? undefined : null, tabBarIcon: ({ color }) => <Text style={{ color }}>▤</Text> }} />
      <Tabs.Screen name="admins" options={{ title: 'Admins', href: isSuper ? undefined : null, tabBarIcon: ({ color }) => <Text style={{ color }}>♟</Text> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <Text style={{ color }}>☺</Text> }} />
      <Tabs.Screen name="complaint/[id]" options={{ href: null, title: 'Complaint' }} />
    </Tabs>
  );
}
