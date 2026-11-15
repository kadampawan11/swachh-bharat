import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CATEGORY_LABELS, COMPLAINT_CATEGORIES } from '@swachh/shared';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { colors } from '../../constants/colors';
import { BANGALORE } from '../../constants/config';
import { complaintService, uploadService } from '../../services/complaint.service';

export default function Submit() {
  const [form, setForm] = useState({ title: '', description: '', category: 'GARBAGE', address: '', pincode: '' });
  const [images, setImages] = useState<{ uri: string }[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: BANGALORE.latitude, lng: BANGALORE.longitude });
  const [loading, setLoading] = useState(false);
  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') {
        navigator.geolocation?.getCurrentPosition((p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }), () => {});
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        }
      }
    })();
  }, []);

  const pickImages = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, quality: 0.8, selectionLimit: 5 });
    if (res.canceled) return;
    const picked: { uri: string }[] = [];
    for (const a of res.assets.slice(0, 5 - images.length)) {
      const compressed = await ImageManipulator.manipulateAsync(a.uri, [{ resize: { width: 1280 } }], { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG });
      picked.push({ uri: compressed.uri });
    }
    setImages((prev) => [...prev, ...picked].slice(0, 5));
  };
  const takePhoto = async () => {
    const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (res.canceled || !res.assets[0]) return;
    const compressed = await ImageManipulator.manipulateAsync(res.assets[0].uri, [{ resize: { width: 1280 } }], { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG });
    setImages((prev) => [...prev, { uri: compressed.uri }].slice(0, 5));
  };

  const submit = async () => {
    setLoading(true);
    try {
      let imageUrls: string[] = [];
      if (images.length) imageUrls = await uploadService.images(images.map((i, n) => ({ uri: i.uri, name: `c${n}.jpg`, type: 'image/jpeg' })));
      await complaintService.create({
        title: form.title, description: form.description, category: form.category,
        latitude: coords.lat, longitude: coords.lng,
        address: form.address || undefined, pincode: form.pincode || undefined, imageUrls,
      });
      Alert.alert('Submitted', 'Your complaint has been registered.');
      router.replace('/(user)/my-complaints');
    } catch (e: any) {
      Alert.alert('Failed', e.response?.data?.message ?? 'Could not submit complaint');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={s.page} contentContainerStyle={{ padding: 16, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
      <Text style={s.h}>Report an Issue</Text>
      <Input label="Title" value={form.title} onChangeText={set('title')} placeholder="e.g. Garbage pile near bus stop" />
      <Input label="Description" value={form.description} onChangeText={set('description')} multiline numberOfLines={4} placeholder="Describe the issue (min 10 chars)" />
      <Text style={s.label}>Category</Text>
      <View style={s.catGrid}>
        {COMPLAINT_CATEGORIES.map((c) => (
          <TouchableOpacity key={c} style={[s.cat, form.category === c && s.catActive]} onPress={() => set('category')(c)}>
            <Text style={[s.catTxt, form.category === c && s.catTxtActive]}>{CATEGORY_LABELS[c]}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Input label="Address" value={form.address} onChangeText={set('address')} placeholder="Street / landmark" />
      <Input label="Pincode" value={form.pincode} onChangeText={set('pincode')} keyboardType="number-pad" placeholder="560038" maxLength={6} />
      <Text style={s.label}>Location (GPS): {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</Text>
      <Text style={s.label}>Photos ({images.length}/5)</Text>
      <View style={s.imgRow}>
        {images.map((i, idx) => (
          <View key={idx}>
            <Image source={{ uri: i.uri }} style={s.thumb} />
            <Text style={s.remove} onPress={() => setImages((p) => p.filter((_, j) => j !== idx))}>✕</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}><Button title="Gallery" variant="outline" onPress={pickImages} /></View>
        <View style={{ flex: 1 }}><Button title="Camera" variant="outline" onPress={takePhoto} /></View>
      </View>
      <Button title="Submit Complaint" onPress={submit} loading={loading}
        disabled={form.title.length < 5 || form.description.length < 10} />
    </ScrollView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.surface },
  h: { fontSize: 22, fontWeight: '700', color: colors.primary, marginBottom: 12 },
  label: { fontSize: 13, color: colors.textSecondary, marginTop: 10, marginBottom: 4 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cat: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  catActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catTxt: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  catTxtActive: { color: '#fff' },
  imgRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  thumb: { width: 80, height: 80, borderRadius: 8 },
  remove: { position: 'absolute', top: -6, right: -6, backgroundColor: '#c00', color: '#fff', width: 20, height: 20, borderRadius: 10, textAlign: 'center', fontSize: 11, overflow: 'hidden' },
});
