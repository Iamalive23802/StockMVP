import { useState, useEffect } from 'react';
import Modal from './Modal';
import ConfirmModal from './ConfirmModal';
import { useLeadStore } from '../../stores/leadStore';
import { useTeamStore } from '../../stores/teamStore';
import { useUserStore } from '../../stores/userStore';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/toastStore';
import type { Lead } from '../../stores/leadStore';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

const LeadModal: React.FC<LeadModalProps> = ({ isOpen, onClose, lead }) => {
  const { addLead, updateLead, leads } = useLeadStore();
  const { fetchTeams } = useTeamStore();
  const { users, fetchUsers } = useUserStore();
  const { role, userId } = useAuthStore();
  const addToast = useToastStore((state) => state.addToast);

  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState<Omit<Lead, 'id'>>({
    fullName: '',
    phone: '',
    email: '',
    altNumber: '',
    notes: '',
    deematAccountName: '',
    profession: '',
    stateName: '',
    capital: '',
    segment: '',
    status: 'New',
    team_id: '',
  });

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (lead) {
      setFormData({
        fullName: lead.fullName || '',
        phone: lead.phone || '',
        email: lead.email || '',
        altNumber: lead.altNumber || '',
        notes: lead.notes || '',
        deematAccountName: lead.deematAccountName || '',
        profession: lead.profession || '',
        stateName: lead.stateName || '',
        capital: lead.capital || '',
        segment: lead.segment || '',
        status: lead.status || 'New',
        team_id: lead.team_id || '',
      });
    } else {
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        altNumber: '',
        notes: '',
        deematAccountName: '',
        profession: '',
        stateName: '',
        capital: '',
        segment: '',
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

  const submitLead = async () => {
    let finalData = {
      ...formData,
      status: formData.status as Lead['status'],
    };

    if (role === 'relationship_mgr') {
      const user = users.find(u => u.id === userId);
      if (user) {
        finalData = {
          ...finalData,
          team_id: user.team_id || '',
          assigned_to: userId,
        };
      }
    }

    if (lead) {
      await updateLead(lead.id, finalData);
    } else {
      await addLead(finalData);
    }

    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lead && formData.phone && leads.some(l => l.phone === formData.phone)) {
      addToast('A lead with this phone number already exists!', 'error');
      return;
    }

    if (lead?.status !== 'Won' && formData.status === 'Won') {
      setShowConfirm(true);
      return;
    }

    await submitLead();
  };

  return (
    <>
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
          <label className="form-label">Alternate Number</label>
          <input
            type="text"
            name="altNumber"
            className="form-input"
            value={formData.altNumber}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Deemat Account Name</label>
          <select
            name="deematAccountName"
            className="form-input"
            value={formData.deematAccountName}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="Zerodha">Zerodha</option>
            <option value="Upstox">Upstox</option>
            <option value="Angel One">Angel One</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Profession</label>
          <select
            name="profession"
            className="form-input"
            value={formData.profession}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="Student">Student</option>
            <option value="Private Sector">Private Sector</option>
            <option value="Business">Business</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">State</label>
          <select
            name="stateName"
            className="form-input"
            value={formData.stateName}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
            <option value="Assam">Assam</option>
            <option value="Bihar">Bihar</option>
            <option value="Chhattisgarh">Chhattisgarh</option>
            <option value="Goa">Goa</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Haryana">Haryana</option>
            <option value="Himachal Pradesh">Himachal Pradesh</option>
            <option value="Jharkhand">Jharkhand</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Kerala">Kerala</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Manipur">Manipur</option>
            <option value="Meghalaya">Meghalaya</option>
            <option value="Mizoram">Mizoram</option>
            <option value="Nagaland">Nagaland</option>
            <option value="Odisha">Odisha</option>
            <option value="Punjab">Punjab</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Sikkim">Sikkim</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Telangana">Telangana</option>
            <option value="Tripura">Tripura</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Uttarakhand">Uttarakhand</option>
            <option value="West Bengal">West Bengal</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Capital</label>
          <input
            type="text"
            name="capital"
            className="form-input"
            value={formData.capital}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Segment</label>
          <input
            type="text"
            name="segment"
            className="form-input"
            value={formData.segment}
            onChange={handleChange}
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
    {showConfirm && (
      <ConfirmModal
        isOpen={true}
        onClose={() => setShowConfirm(false)}
        onConfirm={submitLead}
        message="Marking this lead as Won will convert it to a client and cannot be undone. Continue?"
      />
    )}
    </>
  );
};

export default LeadModal;
