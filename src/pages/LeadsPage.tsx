import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, Upload, UserPlus2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useLeadStore } from '../stores/leadStore';
import { useTeamStore } from '../stores/teamStore';
import { useUserStore } from '../stores/userStore';
import LeadModal from '../components/modals/LeadModal';
import UploadLeadsModal from '../components/modals/UploadLeadsModal';
import AssignLeadModal from '../components/modals/AssignLeadModal';
import Modal from '../components/modals/Modal';
import LeadProgressModal from '../components/modals/LeadProgressModal';
import type { Lead } from '../stores/leadStore';

function LeadsPage() {
  const { role, userId } = useAuthStore();
  const { leads, fetchLeads, deleteLead, updateLead } = useLeadStore();
  const { teams, fetchTeams } = useTeamStore();
  const { users, fetchUsers } = useUserStore();

  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  const [infoLead, setInfoLead] = useState<Lead | null>(null);
  const [progressLead, setProgressLead] = useState<Lead | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (role && userId) {
      fetchLeads();
      fetchTeams();
      fetchUsers();
    }
  }, [role, userId]);

  const handleAssign = (leadId: string) => {
    setSelectedLeadId(leadId);
    setIsAssignOpen(true);
  };

  const handleAddLead = () => {
    setCurrentLead(null);
    setIsLeadModalOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setCurrentLead(lead);
    setIsLeadModalOpen(true);
  };

  const handleDeleteLead = (leadId: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      deleteLead(leadId);
    }
  };

  const getTeamName = (id?: string) => {
    return teams.find(t => t.id === id)?.name || '—';
  };

  const filteredLeads = leads.filter((lead) =>
    !statusFilter || lead.status === statusFilter
  );

  const availableUsers = users.filter(user => {
    if (role === 'super_admin') return user.role === 'admin';
    if (role === 'admin') return user.role === 'relationship_mgr' && user.location_id === users.find(u => u.id === userId)?.location_id;
    return false;
  });

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Leads</h1>
        {(role === 'super_admin' || role === 'relationship_mgr') && (
          <div className="flex space-x-3">
            <button className="btn btn-primary flex items-center" onClick={handleAddLead}>
              <Plus size={18} className="mr-1" />
              Add Lead
            </button>
            {role === 'super_admin' && (
              <button className="btn btn-primary flex items-center" onClick={() => setIsUploadModalOpen(true)}>
                <Upload size={18} className="mr-1" />
                Upload Leads
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end mb-6">
        <div className="flex items-center space-x-4 bg-gray-800 px-5 py-2 rounded-md shadow border border-gray-700 w-[320px]">
          <label className="text-sm font-medium text-gray-300 whitespace-nowrap">Filter by Status</label>
          <select
            className="form-input bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-md px-3 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Proposal">Proposal</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-fixed w-full text-sm text-left text-gray-300">
            <thead className="bg-gray-700 text-gray-400 uppercase text-xs">
              <tr>
                <th className="w-10 p-3">ℹ️</th>
                <th className="w-40 p-3">Full Name</th>
                <th className="w-32 p-3">Phone</th>
                <th className="w-48 p-3">Email</th>
                <th className="w-48 p-3">Note</th>
                <th className="w-28 p-3">Status</th>
                <th className="w-32 p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-700 transition">
                  <td className="p-3">
                    <button
                      onClick={() => setInfoLead(lead)}
                      className="text-blue-400 hover:text-blue-300"
                      title="View Info"
                    >
                      ℹ️
                    </button>
                  </td>
                  <td className="p-3 truncate">{lead.fullName}</td>
                  <td className="p-3 truncate">{lead.phone}</td>
                  <td className="p-3 truncate">{lead.email}</td>
                  <td className="p-3 truncate">
                    {(() => {
                      const lastEntry = lead.notes?.split('|||').slice(-1)[0];
                      if (!lastEntry) return '—';
                      const [note] = lastEntry.split('__');
                      return note?.trim() || '—';
                    })()}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      {role === 'relationship_mgr' ? (
                        <button
                          onClick={() => setProgressLead(lead)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Pencil size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEditLead(lead)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      {(role === 'super_admin' || role === 'admin') && (
                        <>
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            onClick={() => handleAssign(lead.id)}
                            className="text-green-400 hover:text-green-300"
                            title="Assign Lead"
                          >
                            <UserPlus2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {infoLead && (
        <Modal
          isOpen={true}
          onClose={() => setInfoLead(null)}
          title="Lead Information"
        >
          <div className="space-y-2 text-gray-200">
            <p><strong>Full Name:</strong> {infoLead.fullName}</p>
            <p><strong>Email:</strong> {infoLead.email}</p>
            <p><strong>Phone:</strong> {infoLead.phone || '—'}</p>
            <p><strong>Notes:</strong> {infoLead.notes || '—'}</p>
            <p><strong>Status:</strong> {infoLead.status}</p>
            <p><strong>Team:</strong> {getTeamName(infoLead.team_id)}</p>
          </div>
        </Modal>
      )}

      {isLeadModalOpen && (
        <LeadModal
          isOpen={isLeadModalOpen}
          onClose={() => setIsLeadModalOpen(false)}
          lead={currentLead}
        />
      )}

      {progressLead && role === 'relationship_mgr' && (
        <LeadProgressModal
          isOpen={true}
          onClose={() => setProgressLead(null)}
          lead={progressLead}
        />
      )}

      {isUploadModalOpen && (
        <UploadLeadsModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
        />
      )}

      {isAssignOpen && selectedLeadId && (
        <AssignLeadModal
          isOpen={isAssignOpen}
          onClose={() => {
            setIsAssignOpen(false);
            setSelectedLeadId(null);
          }}
          leadId={selectedLeadId}
          availableUsers={availableUsers}
          onAssigned={fetchLeads}
        />
      )}
    </div>
  );
}

export default LeadsPage;
