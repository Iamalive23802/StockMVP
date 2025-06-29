import { useEffect, useState } from 'react';
import Modal from './Modal';
import { useLeadStore, Lead } from '../../stores/leadStore';

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
}

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({ isOpen, onClose, lead }) => {
  const { updateLead } = useLeadStore();
  const [formData, setFormData] = useState({
    gender: '',
    dob: '',
    panCardNumber: '',
    aadharCardNumber: '',
    paymentHistory: ''
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        gender: lead.gender || '',
        dob: lead.dob || '',
        panCardNumber: lead.panCardNumber || '',
        aadharCardNumber: lead.aadharCardNumber || '',
        paymentHistory: lead.paymentHistory || ''
      });
    }
  }, [lead]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateAge = (date: string) => {
    if (!date) return '';
    const dob = new Date(date);
    const diff = Date.now() - dob.getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000)).toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateLead(lead.id, {
      ...lead,
      gender: formData.gender,
      dob: formData.dob,
      age: calculateAge(formData.dob),
      panCardNumber: formData.panCardNumber,
      aadharCardNumber: formData.aadharCardNumber,
      paymentHistory: formData.paymentHistory
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Client Details - ${lead.fullName}`}>\
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Gender</label>
          <select name="gender" className="form-input" value={formData.gender} onChange={handleChange}>
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Date of Birth</label>
          <input type="date" name="dob" className="form-input" value={formData.dob} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">PAN Card Number</label>
          <input type="text" name="panCardNumber" className="form-input" value={formData.panCardNumber} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Aadhar Card Number</label>
          <input type="text" name="aadharCardNumber" className="form-input" value={formData.aadharCardNumber} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Payment History</label>
          <textarea name="paymentHistory" className="form-input" rows={3} value={formData.paymentHistory} onChange={handleChange} />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Save</button>
        </div>
      </form>
    </Modal>
  );
};

export default ClientDetailsModal;
