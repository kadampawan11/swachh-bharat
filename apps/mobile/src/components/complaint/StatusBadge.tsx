import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';

export function StatusBadge({ status }: { status: string }) {
  const color = (colors.status as any)[status] ?? '#9E9E9E';
  return (
    <View style={[s.badge, { backgroundColor: color + '22' }]}>
      <View style={[s.dot, { backgroundColor: color }]} />
      <Text style={[s.txt, { color }]}>{status.replace('_', ' ')}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  txt: { fontSize: 12, fontWeight: '600' },
});
