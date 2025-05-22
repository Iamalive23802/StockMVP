import { create } from 'zustand';

export interface Location {
  id: string;
  name: string;
  admin_id?: string;
  admin_name?: string;
  admin_email?: string;
}

interface LocationState {
  locations: Location[];
  loading: boolean;
  error: string | null;
  fetchLocations: () => Promise<void>;
  getLocationCount: () => number;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  locations: [],
  loading: false,
  error: null,

  fetchLocations: async () => {
    set({ loading: true, error: null });

    try {
      const response = await fetch('http://localhost:5050/api/locations');
      if (!response.ok) throw new Error('Failed to fetch locations');

      const data: Location[] = await response.json();
      set({ locations: data, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  getLocationCount: () => get().locations.length,
}));
