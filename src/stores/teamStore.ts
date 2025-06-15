import { create } from 'zustand';
import axios from 'axios';

export interface Team {
  id: string;
  name: string;
}

interface TeamStore {
  teams: Team[];
  loading: boolean;
  fetchTeams: () => Promise<void>;
  addTeam: (team: Omit<Team, 'id'>) => Promise<void>;
  updateTeam: (id: string, team: Omit<Team, 'id'>) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
}

export const useTeamStore = create<TeamStore>((set) => ({
  teams: [],
  loading: false,

  fetchTeams: async () => {
    set({ loading: true });
    try {
      const { data } = await axios.get('/api/teams');
      set({ teams: data });
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    } finally {
      set({ loading: false });
    }
  },

  addTeam: async (team) => {
    try {
      await axios.post('/api/teams', team);
      await useTeamStore.getState().fetchTeams();
    } catch (err) {
      console.error('Failed to add team:', err);
    }
  },

  updateTeam: async (id, team) => {
    try {
      await axios.put(`/api/teams/${id}`, team);
      await useTeamStore.getState().fetchTeams();
    } catch (err) {
      console.error('Failed to update team:', err);
    }
  },

  deleteTeam: async (id) => {
    try {
      await axios.delete(`/api/teams/${id}`);
      await useTeamStore.getState().fetchTeams();
    } catch (err) {
      console.error('Failed to delete team:', err);
    }
  },
}));
