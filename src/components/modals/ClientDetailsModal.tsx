import { useEffect, useState } from 'react';
import Modal from './Modal';
import { useLeadStore, Lead } from '../../stores/leadStore';
import { useAuthStore } from '../../stores/authStore';
import {
  PaymentEntry,
  parsePaymentHistory,
  serializePaymentHistory,
} from '../../utils/payment';

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
}

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({ isOpen, onClose, lead }) => {
  const { updateLead } = useLeadStore();
  const { role } = useAuthStore();
  const [formData, setFormData] = useState({
    gender: '',
    dob: '',
    panCardNumber: '',
    aadharCardNumber: '',
    notes: '',
    wonOn: ''
  });

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

      const history = parsePaymentHistory(lead.paymentHistory);
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

  const handlePaymentChange = (
    index: number,
    field: keyof PaymentEntry,
    value: string | boolean,
  ) => {
    const updated = [...paymentHistory];
    (updated[index] as any)[field] = value;
    setPaymentHistory(updated);
  };

  const addPaymentRow = () => {
    const now = new Date().toISOString();
    setPaymentHistory([
      {
        amount: '',
        date: now,
        utr: '',
        approved: true, // mark as approved until saved
        isNew: true,
      },
      ...paymentHistory,
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Entries added locally should only trigger approval after saving.
    // Remove empty new rows and mark new entries as not approved before sending.
    const cleaned = paymentHistory
      .filter((entry) => !(entry.isNew && entry.amount.trim() === ''))
      .map((entry) => {
        if (entry.isNew) {
          return { ...entry, approved: false };
        }
        return entry;
      });

    const reversed = [...cleaned].reverse();
    const historyStr = serializePaymentHistory(reversed);

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
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((entry, i) => (
                <tr key={i} className="border-b border-gray-700">
                  <td className="p-2 text-gray-400">{new Date(entry.date).toLocaleDateString()}</td>
                  <td className="p-2">
                    <input
                      type="text"
                      className="form-input"
                      value={entry.amount}
                      onChange={(e) => handlePaymentChange(i, 'amount', e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    {role === 'financial_manager' ? (
                      entry.approved ? (
                        entry.utr || '—'
                      ) : (
                        <input
                          type="text"
                          className="form-input"
                          value={entry.utr}
                          onChange={(e) => handlePaymentChange(i, 'utr', e.target.value)}
                          onBlur={() => handlePaymentChange(i, 'approved', true)}
                        />
                      )
                    ) : entry.approved ? (
                      entry.utr || '—'
                    ) : (
                      <div className="flex items-center gap-2 text-yellow-400">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        Awaiting Approval
                      </div>
                    )}
                  </td>
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
