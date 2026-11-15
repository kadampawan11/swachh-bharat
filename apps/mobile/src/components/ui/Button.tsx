import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../../constants/colors';

export function Button({ title, onPress, variant = 'primary', loading, disabled }: {
  title: string; onPress: () => void; variant?: 'primary' | 'outline' | 'danger'; loading?: boolean; disabled?: boolean;
}) {
  const bg = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.status.PENDING : 'transparent';
  const fg = variant === 'outline' ? colors.primary : '#fff';
  return (
    <Pressable style={[s.btn, { backgroundColor: bg, borderColor: colors.primary, opacity: disabled ? 0.5 : 1 }]}
      onPress={onPress} disabled={disabled || loading}>
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[s.txt, { color: fg }]}>{title}</Text>}
    </Pressable>
  );
}
const s = StyleSheet.create({
  btn: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: 'transparent', marginVertical: 6 },
  txt: { fontSize: 16, fontWeight: '600' },
});
