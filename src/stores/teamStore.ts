import { create } from 'zustand';

export interface Team {
  id: string;
  name: string;
  location_id: string;
  location_name?: string; // optional, if joined in backend
}

interface TeamState {
  teams: Team[];
  fetchTeams: () => Promise<void>;
  addTeam: (team: Omit<Team, 'id'>) => Promise<void>;
  updateTeam: (id: string, updated: Omit<Team, 'id'>) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: [],

  fetchTeams: async () => {
    try {
      const res = await fetch('http://localhost:5050/api/teams');
      if (!res.ok) throw new Error('Failed to fetch teams');

      const data = await res.json();

      const teams: Team[] = data.map((t: any) => ({
        id: t.id,
        name: t.name,
        location_id: t.location_id,
        location_name: t.location_name ?? '', // optional
      }));

      set({ teams });
    } catch (err) {
      console.error('❌ Failed to fetch teams:', err);
    }
  },

  addTeam: async (teamData) => {
    try {
      await fetch('http://localhost:5050/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData),
      });
      await get().fetchTeams();
    } catch (err) {
      console.error('❌ Failed to add team:', err);
    }
  },

  updateTeam: async (id, updatedData) => {
    try {
      await fetch(`http://localhost:5050/api/teams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      await get().fetchTeams();
    } catch (err) {
      console.error('❌ Failed to update team:', err);
    }
  },

  deleteTeam: async (id) => {
    try {
      await fetch(`http://localhost:5050/api/teams/${id}`, {
        method: 'DELETE',
      });
      await get().fetchTeams();
    } catch (err) {
      console.error('❌ Failed to delete team:', err);
    }
  },
}));
