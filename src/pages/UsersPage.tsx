import { useEffect, useState } from 'react';
import { useUserStore } from '../stores/userStore';
import { Pencil, Trash2, Plus } from 'lucide-react';
import UserModal from '../components/modals/UserModal';
import type { User } from '../stores/userStore';

function UsersPage() {
  const { users, fetchUsers, deleteUser } = useUserStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">👥 All Users</h1>
        <button
          className="btn btn-primary flex items-center"
          onClick={handleAddUser}
        >
          <Plus className="mr-2" size={18} />
          Add User
        </button>
      </div>

      <div className="overflow-hidden border border-gray-700 rounded-lg">
        <table className="min-w-full text-sm text-left text-gray-300">
          <thead className="bg-gray-700 uppercase text-xs text-gray-400">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 bg-gray-800">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="p-3">{user.displayName}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.phoneNumber}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.status === 'Active'
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-red-600/20 text-red-400'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => handleEditUser(user)} className="text-blue-400 hover:text-blue-300">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDeleteUser(user.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <UserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={editingUser}
        />
      )}
    </div>
  );
}

export default UsersPage;
