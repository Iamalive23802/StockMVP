import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useLeadStore } from '../../stores/leadStore';
import { useTeamStore } from '../../stores/teamStore';
import type { Lead } from '../../stores/leadStore';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

const LeadModal: React.FC<LeadModalProps> = ({ isOpen, onClose, lead }) => {
  const { addLead, updateLead } = useLeadStore();
  const { teams, fetchTeams } = useTeamStore();

  const [formData, setFormData] = useState<Omit<Lead, 'id'>>({
    fullName: '',
    phone: '',
    email: '',
    notes: '',
    status: 'New',
    team_id: '',
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (lead) {
      setFormData({
        fullName: lead.fullName || '',
        phone: lead.phone || '',
        email: lead.email || '',
        notes: lead.notes || '',
        status: lead.status || 'New',
        team_id: lead.team_id || '',
      });
    } else {
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        notes: '',
        status: 'New',
        team_id: '',
      });
    }
  }, [lead]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalData = {
      ...formData,
      status: formData.status as Lead['status'],
    };

    if (lead) {
      await updateLead(lead.id, finalData);
    } else {
      await addLead(finalData);
    }

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={lead ? 'Edit Lead' : 'Add Lead'}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            name="fullName"
            className="form-input"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input
            type="text"
            name="phone"
            className="form-input"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            name="email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            name="notes"
            className="form-input"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            name="status"
            className="form-input"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Proposal">Proposal</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Assign to Team</label>
          <select
            name="team_id"
            className="form-input"
            value={formData.team_id}
            onChange={handleChange}
            required
          >
            <option value="">Select a Team</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {lead ? 'Update Lead' : 'Add Lead'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default LeadModal;
