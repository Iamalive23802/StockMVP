import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useTeamStore } from '../../stores/teamStore';
import { useLocationStore } from '../../stores/locationStore';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: any | null;
}

const TeamModal: React.FC<TeamModalProps> = ({ isOpen, onClose, team }) => {
  const { addTeam, updateTeam } = useTeamStore();
  const { locations, fetchLocations } = useLocationStore();

  const [formData, setFormData] = useState({
    name: '',
    location_id: '',
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  // ✅ Prefill form if editing
  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || '',
        location_id: team.location_id || '',
      });
    } else {
      setFormData({
        name: '',
        location_id: '',
      });
    }
  }, [team]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.location_id) return;

    if (team) {
      await updateTeam(team.id, formData); // ✅ Edit mode
    } else {
      await addTeam(formData); // ✅ Add mode
    }

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={team ? 'Edit Team' : 'Add Team'}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Team Name</label>
          <input
            type="text"
            name="name"
            className="form-input"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Location</label>
          <select
            name="location_id"
            className="form-input"
            value={formData.location_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Location</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {team ? 'Update Team' : 'Add Team'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TeamModal;
