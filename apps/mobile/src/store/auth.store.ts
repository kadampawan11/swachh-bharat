import { create } from 'zustand';
import { Platform } from 'react-native';

const storage = {
  async get(key: string) {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    const SecureStore = await import('expo-secure-store');
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string) {
    if (Platform.OS === 'web') { localStorage.setItem(key, value); return; }
    const SecureStore = await import('expo-secure-store');
    await SecureStore.setItemAsync(key, value);
  },
  async del(key: string) {
    if (Platform.OS === 'web') { localStorage.removeItem(key); return; }
    const SecureStore = await import('expo-secure-store');
    await SecureStore.deleteItemAsync(key);
  },
};

export interface AuthUser { id: string; name: string; email: string | null; phone: string | null; role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'; avatarUrl: string | null; }

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrated: boolean;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null, accessToken: null, refreshToken: null, hydrated: false,
  setAuth: async (user, accessToken, refreshToken) => {
    await storage.set('accessToken', accessToken);
    await storage.set('refreshToken', refreshToken);
    set({ user, accessToken, refreshToken });
  },
  logout: async () => {
    await storage.del('accessToken'); await storage.del('refreshToken');
    set({ user: null, accessToken: null, refreshToken: null });
  },
  hydrate: async () => {
    try {
      const [accessToken, refreshToken] = await Promise.all([storage.get('accessToken'), storage.get('refreshToken')]);
      if (accessToken && refreshToken) {
        const { api } = await import('../services/api');
        const res = await api.get('/auth/me', { headers: { Authorization: `Bearer ${accessToken}` } });
        set({ user: res.data, accessToken, refreshToken, hydrated: true });
      } else set({ hydrated: true });
    } catch { set({ user: null, accessToken: null, refreshToken: null, hydrated: true }); }
  },
}));
