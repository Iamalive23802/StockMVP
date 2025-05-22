import { useState } from 'react';
import Modal from './Modal';
import { useLeadStore } from '../../stores/leadStore';
import { Upload } from 'lucide-react';

interface UploadLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadLeadsModal: React.FC<UploadLeadsModalProps> = ({ isOpen, onClose }) => {
  const { uploadLeads } = useLeadStore();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile: File | undefined) => {
    setError('');

    if (!selectedFile) return;

    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError('Please upload a valid .csv file');
      return;
    }

    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const selectedFile = e.dataTransfer.files?.[0];
    validateAndSetFile(selectedFile);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (file) {
      uploadLeads(file); // Zustand store handles CSV parsing and API
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Leads">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Upload CSV File</label>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-400">Drag and drop your CSV file here, or</p>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".csv"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file-upload"
              className="mt-2 inline-block px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 cursor-pointer"
            >
              Browse Files
            </label>
          </div>

          {file && (
            <div className="mt-3 flex items-center p-2 bg-gray-700 rounded">
              <span className="flex-1 truncate">{file.name}</span>
              <button
                type="button"
                className="text-gray-400 hover:text-white"
                onClick={() => setFile(null)}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-400">
          <p>Your CSV file should have the following columns:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>Full Name</li>
            <li>Email</li>
            <li>Phone (optional)</li>
            <li>Notes (optional)</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!file}>
            Upload Leads
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadLeadsModal;
