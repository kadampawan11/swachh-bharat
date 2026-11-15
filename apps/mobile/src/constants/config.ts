import { Platform } from 'react-native';
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api');
export const API_BASE = API_URL.replace(/\/api$/, '');
export const MOCK_OTP_HINT = 'Dev OTP: 123456';
export const BANGALORE = { latitude: 12.9716, longitude: 77.5946, latitudeDelta: 0.4, longitudeDelta: 0.4 };
