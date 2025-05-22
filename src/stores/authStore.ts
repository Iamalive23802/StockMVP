import { create } from 'zustand';
import axios from 'axios';

type Role = 'super_admin' | 'admin' | 'team_leader' | 'relationship_mgr' | '';

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  role: Role;
  userId: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: sessionStorage.getItem('isAuthenticated') === 'true',
  role: (sessionStorage.getItem('role')?.toLowerCase() as Role) || '',
  userId: sessionStorage.getItem('userId') || '',
  loading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });

    try {
      const response = await axios.post('/api/login', {
        email,
        password,
      });

      const user = response.data.user;
      const normalizedRole = user.role.toLowerCase();

      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('role', normalizedRole);
      sessionStorage.setItem('userId', user.id);

      set({
        isAuthenticated: true,
        role: normalizedRole,
        userId: user.id,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      set({
        isAuthenticated: false,
        role: '',
        userId: '',
        loading: false,
        error: err.response?.data?.message || 'Invalid email or password',
      });
      throw new Error('Login failed');
    }
  },

  logout: () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('userId');

    set({
      isAuthenticated: false,
      role: '',
      userId: '',
      loading: false,
      error: null,
    });
  },

  checkAuth: () => {
    const isAuth = sessionStorage.getItem('isAuthenticated') === 'true';
    const role = (sessionStorage.getItem('role')?.toLowerCase() as Role) || '';
    const userId = sessionStorage.getItem('userId') || '';

    set({ isAuthenticated: isAuth, role, userId });
  },
}));
