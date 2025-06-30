import { useEffect, useState, useRef } from 'react';
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
import ConfirmModal from '../components/modals/ConfirmModal';
import { useToastStore } from '../stores/toastStore';
import type { Lead } from '../stores/leadStore';

function LeadsPage() {
  const { role, userId } = useAuthStore();
  const { leads, fetchLeads, deleteLead } = useLeadStore();
  const { teams, fetchTeams } = useTeamStore();
  const { users, fetchUsers } = useUserStore();
  const addToast = useToastStore((state) => state.addToast);

  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  const [infoLead, setInfoLead] = useState<Lead | null>(null);
  const [progressLead, setProgressLead] = useState<Lead | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [statusColumnFilter, setStatusColumnFilter] = useState('');
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedRM, setSelectedRM] = useState<string>('');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragSelecting, setDragSelecting] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);

  const statusFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (role && userId) {
      fetchLeads();
      fetchTeams();
      fetchUsers();
    }
  }, [role, userId]);

  // Close status filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusFilterRef.current &&
        !statusFilterRef.current.contains(event.target as Node)
      ) {
        setShowStatusFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddLead = () => {
    setCurrentLead(null);
    setIsLeadModalOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setCurrentLead(lead);
    setIsLeadModalOpen(true);
  };

  const handleDeleteLead = (leadId: string) => {
    setLeadToDelete(leadId);
  };

  const confirmDelete = () => {
    if (leadToDelete) {
      deleteLead(leadToDelete);
      setLeadToDelete(null);
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedRM || selectedLeads.length === 0) {
      addToast('Please select at least one lead and an RM', 'error');
      return;
    }

    try {
      await Promise.all(
        selectedLeads.map((leadId) =>
          fetch(`/api/leads/${leadId}/assign`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assigned_to: selectedRM }),
          })
        )
      );

      addToast('Selected leads assigned successfully', 'success');
      setSelectedLeads([]);
      fetchLeads();
    } catch (err) {
      console.error('Failed to assign leads:', err);
      addToast('Failed to assign leads', 'error');
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLInputElement>, leadId: string) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragSelecting(!selectedLeads.includes(leadId));
    toggleLeadSelection(leadId, !selectedLeads.includes(leadId));
  };

  const handleMouseEnter = (leadId: string) => {
    if (!isDragging) return;
    toggleLeadSelection(leadId, dragSelecting);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleLeadSelection = (leadId: string, select: boolean) => {
    if (select) {
      setSelectedLeads((prev) => [...new Set([...prev, leadId])]);
    } else {
      setSelectedLeads((prev) => prev.filter((id) => id !== leadId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-500/20 text-blue-400';
      case 'Contacted':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Qualified':
        return 'bg-green-500/20 text-green-400';
      case 'Proposal':
        return 'bg-purple-500/20 text-purple-400';
      case 'Won':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'Lost':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const filteredLeads = leads.filter((lead) => {
  // Hide leads that have been converted to clients
  if (lead.status === 'Won') return false;
  if (role === 'relationship_mgr' && lead.assigned_to !== userId) return false;
  if (role === 'team_leader' && lead.team_id !== users.find(u => u.id === userId)?.team_id) return false;
  if (statusFilter === 'assigned' && !lead.assigned_to) return false;
  if (statusFilter === 'unassigned' && lead.assigned_to) return false;
  if (statusColumnFilter && lead.status !== statusColumnFilter) return false;
  return true;
});

  const availableUsers = users.filter(user => {
    if (role === 'super_admin') return user.role === 'admin';
    if (role === 'admin') return user.role === 'relationship_mgr';
    return false;
  });

  return (
    <div className="container mx-auto px-4" onMouseUp={handleMouseUp}>
      <div className="flex justify-between items-center mb-6">
  <h1 className="text-2xl font-bold">All Leads</h1>
  {(role === 'super_admin' || role === 'admin' || role === 'relationship_mgr') && (
    <div className="flex space-x-3">
      <button
        className="btn btn-primary flex items-center"
        onClick={handleAddLead}
      >
        <Plus size={18} className="mr-1" />
        Add Lead
      </button>
      {(role === 'super_admin' || role === 'admin') && (
        <button
          className="btn btn-primary flex items-center"
          onClick={() => setIsUploadModalOpen(true)}
        >
          <Upload size={18} className="mr-1" />
          Upload Leads
        </button>
      )}
    </div>
  )}
</div>

      {/* Filters */}
      {(role === 'super_admin' || role === 'admin') && (
      <div className="flex flex-nowrap justify-end mb-6 gap-3 items-end overflow-x-auto">
        <div className="flex flex-col text-xs">
          <label className="font-medium text-gray-300 mb-1">Assigned Status</label>
          <select
            className="form-input bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-md px-2 py-1 w-32"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </div>

        <div className="flex flex-col text-xs">
          <label className="font-medium text-gray-300 mb-1">Select Team</label>
          <select
            className="form-input bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-md px-2 py-1 w-32"
            value={selectedTeam}
            onChange={(e) => {
              setSelectedTeam(e.target.value);
              setSelectedRM('');
            }}
          >
            <option value="">Select</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col text-xs">
          <label className="font-medium text-gray-300 mb-1">Select RM</label>
          <select
            className="form-input bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-md px-2 py-1 w-40"
            value={selectedRM}
            onChange={(e) => setSelectedRM(e.target.value)}
            disabled={!selectedTeam}
          >
            <option value="">Select</option>
            {users
              .filter((user) => user.role === 'relationship_mgr' && user.team_id === selectedTeam)
              .map((rm) => (
                <option key={rm.id} value={rm.id}>
                  {rm.displayName}
                </option>
              ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            className="btn btn-primary flex items-center px-2 py-1 text-xs"
            onClick={handleBulkAssign}
            disabled={!selectedRM || selectedLeads.length === 0}
          >
            <UserPlus2 size={14} className="mr-1" />
            Assign Leads
          </button>
        </div>
      </div>
      )}

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-fixed w-full text-sm text-left text-gray-300">
            <thead className="bg-gray-700 text-gray-400 uppercase text-xs">
              <tr>
                <th className="w-10 p-3">
                  <input
                    type="checkbox"
                    className="rounded bg-gray-800 border-gray-600"
                    checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLeads(filteredLeads.map(l => l.id));
                      } else {
                        setSelectedLeads([]);
                      }
                    }}
                  />
                </th>
                <th className="w-40 p-3">Full Name</th>
                <th className="w-32 p-3">Phone</th>
                <th className="w-48 p-3">Email</th>
                <th className="w-28 p-3 relative">
                  <div ref={statusFilterRef} className="flex items-center gap-1 relative">
                    <span>Status</span>
                    <button
                      onClick={() => setShowStatusFilter(!showStatusFilter)}
                      className="text-gray-400 hover:text-white"
                      title="Filter Status"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    {showStatusFilter && (
                      <select
                        className="mt-1 form-input bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-md absolute right-0 z-10"
                        value={statusColumnFilter}
                        onChange={(e) => setStatusColumnFilter(e.target.value)}
                      >
                        <option value="">All</option>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Proposal">Proposal</option>
                        <option value="Won">Won</option>
                        <option value="Lost">Lost</option>
                      </select>
                    )}
                  </div>
                </th>
                <th className="w-32 p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-700 transition">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      className="rounded bg-gray-800 border-gray-600"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => {}}
                      onMouseDown={(e) => handleMouseDown(e, lead.id)}
                      onMouseEnter={() => handleMouseEnter(lead.id)}
                    />
                  </td>
                  <td className="p-3 truncate">{lead.fullName}</td>
                  <td className="p-3 truncate">{lead.phone}</td>
                  <td className="p-3 truncate">{lead.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => setInfoLead(lead)}
                      className="text-blue-400 hover:text-blue-300"
                      title="View Info"
                    >
                      ℹ️
                    </button>
                    {role === 'relationship_mgr' ? (
                      <button
                        onClick={() => lead.status !== 'Won' && setProgressLead(lead)}
                        className={`text-blue-400 hover:text-blue-300 ${lead.status === 'Won' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={lead.status === 'Won'}
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
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Modal with Notes */}
      {infoLead && (
        <Modal isOpen={true} onClose={() => setInfoLead(null)} title="Lead Information">
          <div className="space-y-2 text-gray-200">
            <p><strong>Full Name:</strong> {infoLead.fullName}</p>
            <p><strong>Email:</strong> {infoLead.email}</p>
            <p><strong>Phone:</strong> {infoLead.phone || '—'}</p>
            <p><strong>Alternate Number:</strong> {infoLead.altNumber || '—'}</p>
            <p><strong>Deemat Account:</strong> {infoLead.deematAccountName || '—'}</p>
            <p><strong>Profession:</strong> {infoLead.profession || '—'}</p>
            <p><strong>State:</strong> {infoLead.stateName || '—'}</p>
            <p><strong>Capital:</strong> {infoLead.capital || '—'}</p>
            <p><strong>Segment:</strong> {infoLead.segment || '—'}</p>
            <p><strong>Status:</strong> {infoLead.status}</p>
            <p><strong>Team:</strong> {teams.find(t => t.id === infoLead.team_id)?.name || '—'}</p>
            <p><strong>Notes:</strong> {infoLead.notes || '—'}</p>
            {infoLead.status === 'Won' && (
              <div className="pt-2 border-t border-gray-700 space-y-2">
                <p className="font-semibold">Client Details</p>
                <p><strong>Gender:</strong> {infoLead.gender || '—'}</p>
                <p><strong>Date of Birth:</strong> {infoLead.dob || '—'}</p>
                <p><strong>Age:</strong> {infoLead.age || '—'}</p>
                <p><strong>PAN Card No:</strong> {infoLead.panCardNumber || '—'}</p>
                <p><strong>Aadhar Card No:</strong> {infoLead.aadharCardNumber || '—'}</p>
                <p><strong>Payment History:</strong> {infoLead.paymentHistory || '—'}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {isLeadModalOpen && (
        <LeadModal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} lead={currentLead} />
      )}
      {progressLead && role === 'relationship_mgr' && (
        <LeadProgressModal isOpen={true} onClose={() => setProgressLead(null)} lead={progressLead} />
      )}
      {isUploadModalOpen && (
        <UploadLeadsModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
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
      {leadToDelete && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setLeadToDelete(null)}
          onConfirm={confirmDelete}
          message="Are you sure you want to delete this lead?"
        />
      )}
    </div>
  );
}

export default LeadsPage;
