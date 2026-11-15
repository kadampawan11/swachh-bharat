import { Redirect, Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useAuth } from '../../store/auth.store';
import { colors } from '../../constants/colors';

export default function UserLayout() {
  const { user, hydrated } = useAuth();
  if (!hydrated) return null;
  if (!user) return <Redirect href="/(auth)/user-login" />;
  if (user.role !== 'USER') return <Redirect href="/(admin)/dashboard" />;
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.primary, headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff' }}>
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ color }) => <Text style={{ color }}>⌂</Text> }} />
      <Tabs.Screen name="submit" options={{ title: 'Report', tabBarIcon: ({ color }) => <Text style={{ color }}>＋</Text> }} />
      <Tabs.Screen name="my-complaints" options={{ title: 'My Complaints', tabBarIcon: ({ color }) => <Text style={{ color }}>☰</Text> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <Text style={{ color }}>☺</Text> }} />
      <Tabs.Screen name="complaint/[id]" options={{ href: null, title: 'Complaint' }} />
    </Tabs>
  );
}
