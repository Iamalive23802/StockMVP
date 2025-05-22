import { create } from 'zustand';

export interface User {
  id: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: 'super_admin' | 'admin' | 'team_leader' | 'relationship_mgr';
  status: 'Active' | 'Inactive';
  team_id?: string;
  location_id?: string;
  created_at?: string;
}

interface UserStoreState {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const useUserStore = create<UserStoreState>((set, get) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('http://localhost:5050/api/users');
      const data = await res.json();

      const users: User[] = data.map((u: any) => ({
        id: u.id,
        displayName: u.display_name ?? '[No Name]',
        phoneNumber: u.phone_number ?? '[No Phone]',
        email: u.email,
        password: u.password,
        role: u.role,
        status: u.status,
        location_id: u.location_id,
        team_id: u.team_id,
        created_at: u.created_at ?? '',
      }));

      set({ users, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  addUser: async (userData) => {
    try {
      await fetch('http://localhost:5050/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      await get().fetchUsers();
    } catch {
      set({ error: 'Failed to add user' });
    }
  },

  updateUser: async (id, userData) => {
    try {
      await fetch(`http://localhost:5050/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      await get().fetchUsers();
    } catch {
      set({ error: 'Failed to update user' });
    }
  },

  deleteUser: async (id) => {
    try {
      await fetch(`http://localhost:5050/api/users/${id}`, {
        method: 'DELETE',
      });
      await get().fetchUsers();
    } catch {
      set({ error: 'Failed to delete user' });
    }
  },
}));
