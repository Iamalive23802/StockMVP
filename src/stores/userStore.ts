import { create } from 'zustand';
import axios from 'axios';

export interface User {
  id: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  password?: string;
  role: 'super_admin' | 'admin' | 'team_leader' | 'relationship_mgr';
  status: 'Active' | 'Inactive';
  team_id?: string;
}

interface UserStore {
  users: User[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, user: Omit<User, 'id'>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  loading: false,

  fetchUsers: async () => {
    set({ loading: true });
    try {
      const { data } = await axios.get('/api/users');
      const mapped = data.map((user: any) => ({
        ...user,
        displayName: user.display_name,
        phoneNumber: user.phone_number,
      }));
      set({ users: mapped });
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      set({ loading: false });
    }
  },

  addUser: async (user) => {
    try {
      await axios.post('/api/users', user);
      await useUserStore.getState().fetchUsers();
    } catch (err) {
      console.error('Failed to add user:', err);
    }
  },

  updateUser: async (id, user) => {
    try {
      await axios.put(`/api/users/${id}`, user);
      await useUserStore.getState().fetchUsers();
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  },

  deleteUser: async (id) => {
    try {
      await axios.delete(`/api/users/${id}`);
      await useUserStore.getState().fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  },
}));
