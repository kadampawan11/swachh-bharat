import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '../../constants/colors';

export function Input({ label, ...props }: TextInputProps & { label?: string }) {
  return (
    <View style={s.wrap}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <TextInput style={s.input} placeholderTextColor={colors.textSecondary} {...props} />
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { marginVertical: 6 },
  label: { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: colors.surface, color: colors.textPrimary },
});
