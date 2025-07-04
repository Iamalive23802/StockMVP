import { useEffect, useState } from 'react';
import Modal from './Modal';
import { useLeadStore, Lead } from '../../stores/leadStore';
import { useAuthStore } from '../../stores/authStore';

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
    notes: '',
    wonOn: ''
  });

  interface PaymentEntry {
    amount: string;
    date: string;
    utr: string;
    status: 'pending' | 'approved';
  }

  const [paymentHistory, setPaymentHistory] = useState<PaymentEntry[]>([]);

  useEffect(() => {
    if (lead) {
      const parseWon = () => {
        if (lead.wonOn) return lead.wonOn;
        if (!lead.notes) return '';
        const entries = lead.notes.split('|||').map(e => e.split('__'));
        for (let i = entries.length - 1; i >= 0; i--) {
          if (entries[i][1] === 'Won' && entries[i][2]) return entries[i][2].split('T')[0];
        }
        return '';
      };
      setFormData({
        gender: lead.gender || '',
        dob: lead.dob || '',
        panCardNumber: lead.panCardNumber || '',
        aadharCardNumber: lead.aadharCardNumber || '',
        notes: lead.notes || '',
        wonOn: parseWon()
      });

      const history =
        lead.paymentHistory
          ?.split('|||')
          .map((entry) => {
            const parts = entry.split('__');
            return {
              amount: parts[0] || '',
              date: parts[1] || new Date().toISOString(),
              utr: parts[2] || '',
              status: (parts[3] as 'pending' | 'approved') || 'approved',
            } as PaymentEntry;
          }) || [];

      setPaymentHistory(history.reverse()); // newest first
    }
  }, [lead]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateAge = (date: string) => {
    if (!date) return '';
    const dob = new Date(date);
    const diff = Date.now() - dob.getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000)).toString();
  };

  const handlePaymentChange = (index: number, value: string) => {
    const updated = [...paymentHistory];
    updated[index].amount = value;
    setPaymentHistory(updated);
  };

  const handleUtrChange = (index: number, value: string) => {
    const updated = [...paymentHistory];
    updated[index].utr = value;
    setPaymentHistory(updated);
  };

  const handleStatusChange = (index: number, value: 'pending' | 'approved') => {
    const updated = [...paymentHistory];
    updated[index].status = value;
    setPaymentHistory(updated);
  };

  const { role } = useAuthStore();

  const addPaymentRow = () => {
    const now = new Date().toISOString();
    const status: 'pending' | 'approved' =
      role === 'financial_manager' ? 'approved' : 'pending';
    setPaymentHistory([
      { amount: '', date: now, utr: '', status },
      ...paymentHistory,
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const reversed = [...paymentHistory].reverse();
    const historyStr = reversed
      .map((p) => `${p.amount}__${p.date}__${p.utr}__${p.status}`)
      .join('|||');

    await updateLead(lead.id, {
      ...lead,
      gender: formData.gender,
      dob: formData.dob,
      age: calculateAge(formData.dob),
      panCardNumber: formData.panCardNumber,
      aadharCardNumber: formData.aadharCardNumber,
      notes: formData.notes,
      wonOn: formData.wonOn,
      paymentHistory: historyStr
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Client Details - ${lead.fullName}`}>
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
          <label className="form-label">Notes</label>
          <textarea name="notes" className="form-input" rows={3} value={formData.notes} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Won On</label>
          <input type="date" name="wonOn" className="form-input" value={formData.wonOn} onChange={handleChange} />
        </div>
        <div className="form-group">
          <div className="flex justify-between items-center mb-2">
            <label className="form-label">Payment History</label>
            <button
              type="button"
              onClick={addPaymentRow}
              className="text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition"
            >
              + Add Payment
            </button>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-gray-600">
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">Amount</th>
                <th className="p-2">UTR</th>
                {role === 'financial_manager' && <th className="p-2">Status</th>}
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((entry, i) => (
                <tr key={i} className="border-b border-gray-700">
                  <td className="p-2 text-gray-400">{new Date(entry.date).toLocaleDateString()}</td>
                  <td className="p-2">
                    {entry.status === 'pending' && role === 'relationship_mgr' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span>Awaiting Approval</span>
                      </div>
                    ) : role === 'financial_manager' ? (
                      <input
                        type="text"
                        className="form-input"
                        value={entry.amount}
                        onChange={(e) => handlePaymentChange(i, e.target.value)}
                      />
                    ) : (
                      entry.amount
                    )}
                  </td>
                  <td className="p-2">
                    {role === 'financial_manager' ? (
                      <input
                        type="text"
                        className="form-input"
                        value={entry.utr}
                        onChange={(e) => handleUtrChange(i, e.target.value)}
                      />
                    ) : (
                      entry.utr || '—'
                    )}
                  </td>
                  {role === 'financial_manager' && (
                    <td className="p-2">
                      <select
                        className="form-input"
                        value={entry.status}
                        onChange={(e) =>
                          handleStatusChange(i, e.target.value as 'pending' | 'approved')
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
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
