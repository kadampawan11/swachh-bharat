import axios from 'axios';
import { API_URL } from '../constants/config';
import { useAuth } from '../store/auth.store';

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = useAuth.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && useAuth.getState().refreshToken) {
      try {
        const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: useAuth.getState().refreshToken });
        const { accessToken, refreshToken } = res.data.tokens;
        const user = useAuth.getState().user;
        if (user) await useAuth.getState().setAuth(user, accessToken, refreshToken);
        error.config.headers.Authorization = `Bearer ${accessToken}`;
        return axios(error.config);
      } catch { await useAuth.getState().logout(); }
    }
    throw error;
  },
);
