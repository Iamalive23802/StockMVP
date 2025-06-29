import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import { useLeadStore, Lead } from '../stores/leadStore';
import { useAuthStore } from '../stores/authStore';
import ClientDetailsModal from '../components/modals/ClientDetailsModal';

const ClientsPage = () => {
  const { leads, fetchLeads } = useLeadStore();
  const { role } = useAuthStore();
  const [editLead, setEditLead] = useState<Lead | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const wonLeads = leads.filter((lead) => lead.status === 'Won');

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
                <th className="p-3">Notes</th>
                <th className="p-3">Won On</th>
                <th className="p-3">Gender</th>
                <th className="p-3">DOB</th>
                <th className="p-3">PAN</th>
                <th className="p-3">Aadhar</th>
                <th className="p-3">Payment History</th>
                {role === 'relationship_mgr' && <th className="p-3">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {wonLeads.map((lead) => {
                const lastUpdate = lead.notes?.split('|||').pop()?.split('__');
                return (
                  <tr key={lead.id} className="hover:bg-gray-700">
                    <td className="p-3 font-medium text-blue-300">{lead.fullName}</td>
                    <td className="p-3">{lead.email}</td>
                    <td className="p-3">{lead.phone || '—'}</td>
                    <td className="p-3">{lastUpdate?.[0] || '—'}</td>
                    <td className="p-3 text-gray-400">
                      {lastUpdate?.[2] ? new Date(lastUpdate[2]).toLocaleString() : '—'}
                    </td>
                    <td className="p-3">{lead.gender || '—'}</td>
                    <td className="p-3">{lead.dob || '—'}</td>
                    <td className="p-3">{lead.panCardNumber || '—'}</td>
                    <td className="p-3">{lead.aadharCardNumber || '—'}</td>
                    <td className="p-3">{lead.paymentHistory || '—'}</td>
                    {role === 'relationship_mgr' && (
                      <td className="p-3">
                        <button
                          onClick={() => setEditLead(lead)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Edit Client Details"
                        >
                          <Pencil size={16} />
                        </button>
                      </td>
                    )}
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
