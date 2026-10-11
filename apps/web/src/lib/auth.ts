import { create } from 'zustand';
import { fetchApi, getAccessToken, setAccessToken } from './api';

export interface AuthUser {
  id: string;
  name: string;
  role: 'student' | 'parent' | 'teacher' | 'super_admin';
  email?: string;
  phone?: string;
  username?: string;
  approved?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  subscriptionStart?: string | Date;
  subscriptionEnd?: string | Date;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  loadUser: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })(),
  loading: false,

  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    set({ user });
  },

  loadUser: async () => {
    const token = getAccessToken();
    if (!token) {
      set({ user: null });
      return;
    }

    try {
      set({ loading: true });
      const res = await fetchApi('/auth/me');
      if (res && res.data) {
        localStorage.setItem('user', JSON.stringify(res.data));
        set({ user: res.data, loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },

  logout: () => {
    setAccessToken(null);
    localStorage.removeItem('user');
    set({ user: null });
  },
}));
