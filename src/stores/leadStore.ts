import { create } from 'zustand';
import { useAuthStore } from './authStore';

export interface Lead {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  notes?: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Won' | 'Lost';
  team_id: string;
  assigned_to?: string;
}

interface LeadState {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  fetchLeads: () => Promise<void>;
  addLead: (lead: Omit<Lead, 'id'>) => Promise<void>;
  updateLead: (id: string, updatedLead: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  uploadLeads: (file: File) => Promise<void>;
  getLeadCount: () => number;
  getConversionRate: () => number;
}

export const useLeadStore = create<LeadState>((set, get) => ({
  leads: [],
  loading: false,
  error: null,

  fetchLeads: async () => {
    set({ loading: true, error: null });

    try {
      const { role, userId } = useAuthStore.getState();

      const url =
        role === 'relationship_mgr' || role === 'admin'
          ? `http://localhost:5050/api/leads?role=${role}&user_id=${userId}`
          : 'http://localhost:5050/api/leads';

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch leads');

      const raw = await response.json();

      const data: Lead[] = raw.map((lead: any) => ({
        id: lead.id,
        fullName: lead.full_name ?? lead.fullName ?? '[No Name]',
        email: lead.email,
        phone: lead.phone_number ?? lead.phone,
        notes: lead.notes,
        status: lead.status,
        team_id: lead.team_id ?? '',
        assigned_to: lead.assigned_to ?? '',
      }));

      set({ leads: data, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  addLead: async (lead) => {
    const leadWithDefaults: Omit<Lead, 'id'> = {
      ...lead,
      status: lead.status || 'New',
    };

    try {
      const res = await fetch('http://localhost:5050/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadWithDefaults),
      });

      if (!res.ok) throw new Error('Failed to add lead');
      await get().fetchLeads();
    } catch (err) {
      console.error('❌ addLead failed:', err);
    }
  },

  updateLead: async (id, updatedLead) => {
    try {
      const res = await fetch(`http://localhost:5050/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLead),
      });

      if (!res.ok) throw new Error('Failed to update lead');
      await get().fetchLeads();
    } catch (err) {
      console.error('❌ updateLead failed:', err);
    }
  },

  deleteLead: async (id) => {
    try {
      const res = await fetch(`http://localhost:5050/api/leads/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete lead');
      await get().fetchLeads();
    } catch (err) {
      console.error('❌ deleteLead failed:', err);
    }
  },

  uploadLeads: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:5050/api/leads/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('CSV upload failed');
      await get().fetchLeads();
    } catch (err) {
      console.error('❌ uploadLeads failed:', err);
    }
  },

  getLeadCount: () => get().leads.length,

  getConversionRate: () => {
    const leads = get().leads;
    const won = leads.filter((l) => l.status === 'Won').length;
    return leads.length ? Math.round((won / leads.length) * 100) : 0;
  },
}));
