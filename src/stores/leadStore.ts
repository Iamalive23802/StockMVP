import { create } from 'zustand';
import axios from 'axios';
import { useToastStore } from './toastStore';

export interface Lead {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  notes: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Won' | 'Lost';
  team_id: string;
  assigned_to?: string;
}

interface LeadStore {
  leads: Lead[];
  loading: boolean;
  fetchLeads: () => Promise<void>;
  addLead: (lead: Omit<Lead, 'id'>) => Promise<void>;
  updateLead: (id: string, lead: Omit<Lead, 'id'>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  uploadLeads: (file: File) => Promise<void>;
}

export const useLeadStore = create<LeadStore>((set) => ({
  leads: [],
  loading: false,

  fetchLeads: async () => {
    set({ loading: true });
    try {
      const { data } = await axios.get('/api/leads');
      const mapped = data.map((lead: any) => ({
        ...lead,
        fullName: lead.full_name, // ✅ map to camelCase
      }));
      set({ leads: mapped });
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      set({ loading: false });
    }
  },

  addLead: async (lead) => {
    const addToast = useToastStore.getState().addToast;
    try {
      await axios.post('/api/leads', lead);
      await useLeadStore.getState().fetchLeads();
      addToast('Lead added successfully', 'success');
    } catch (err) {
      console.error('Failed to add lead:', err);
      addToast('Failed to add lead', 'error');
    }
  },

  updateLead: async (id, lead) => {
    const addToast = useToastStore.getState().addToast;
    try {
      await axios.put(`/api/leads/${id}`, lead);
      await useLeadStore.getState().fetchLeads();
      addToast('Lead updated successfully', 'success');
    } catch (err) {
      console.error('Failed to update lead:', err);
      addToast('Failed to update lead', 'error');
    }
  },

  deleteLead: async (id) => {
    const addToast = useToastStore.getState().addToast;
    try {
      await axios.delete(`/api/leads/${id}`);
      await useLeadStore.getState().fetchLeads();
      addToast('Lead deleted successfully', 'success');
    } catch (err) {
      console.error('Failed to delete lead:', err);
      addToast('Failed to delete lead', 'error');
    }
  },

  uploadLeads: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const addToast = useToastStore.getState().addToast;
    try {
      await axios.post('/api/leads/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await useLeadStore.getState().fetchLeads();
      addToast('Leads uploaded successfully', 'success');
    } catch (err) {
      console.error('Failed to upload leads:', err);
      addToast('Failed to upload leads', 'error');
    }
  },
}));
