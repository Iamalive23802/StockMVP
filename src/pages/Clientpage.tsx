import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { useLeadStore, Lead } from '../stores/leadStore';
import { useAuthStore } from '../stores/authStore';
import ClientDetailsModal from '../components/modals/ClientDetailsModal';

const ClientsPage = () => {
  const { leads, fetchLeads } = useLeadStore();
  const { role, userId } = useAuthStore();
  const [editLead, setEditLead] = useState<Lead | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const wonLeads = leads.filter((lead) => {
    if (lead.status !== 'Won') return false;
    if (role === 'relationship_mgr') {
      return lead.assigned_to === userId;
    }
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-white mb-6">🎉 Clients (Won Leads)</h1>

      {wonLeads.length === 0 ? (
        <p className="text-gray-400">No leads have been marked as "Won" yet.</p>
      ) : (
        <div className="overflow-x-auto bg-gray-800 rounded-lg border border-gray-700">
          <table className="min-w-full text-sm text-left text-gray-300">
            <thead className="bg-gray-700 text-xs uppercase text-gray-400">
              <tr>
                <th className="p-3">Full Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Payment History</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {wonLeads.map((lead) => {
                const payments = lead.paymentHistory
                  ? lead.paymentHistory.split('|||').reduce((sum, ph) => {
                      const [amount] = ph.split('__');
                      return sum + Number(amount || 0);
                    }, 0)
                  : 0;
                return (
                  <tr key={lead.id} className="hover:bg-gray-700">
                    <td className="p-3 font-medium text-blue-300">{lead.fullName}</td>
                    <td className="p-3">{lead.email}</td>
                    <td className="p-3">{lead.phone || '—'}</td>
                    <td className="p-3">{payments}</td>
                    <td className="p-3">
                      <button
                        onClick={() => setEditLead(lead)}
                        className="text-blue-400 hover:text-blue-300"
                        title="View/Edit Client Details"
                      >
                        <Info size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {editLead && (
        <ClientDetailsModal
          isOpen={true}
          onClose={() => setEditLead(null)}
          lead={editLead}
        />
      )}
    </div>
  );
};

export default ClientsPage;
