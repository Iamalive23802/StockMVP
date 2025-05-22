import { useEffect } from 'react';
import { useLeadStore } from '../stores/leadStore';

const ClientsPage = () => {
  const { leads, fetchLeads } = useLeadStore();

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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
