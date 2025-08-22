import React, { useState, useRef, useEffect } from 'react';
import { 
  MoreHorizontal, 
  User, 
  Edit3, 
  Pause, 
  Power, 
  PowerOff, 
  Trash2,
  AlertTriangle,
  X,
  Check
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Worker {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  role: 'admin' | 'manager' | 'worker';
  business_id: string | null;
  status: 'active' | 'on_break' | 'off' | 'inactive';
  last_activity: string;
  created_at: string;
  updated_at: string;
}

interface WorkerDropdownMenuProps {
  worker: Worker;
  onWorkerUpdated: () => void;
}

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: Worker;
  onRoleUpdated: () => void;
}

interface DeactivateModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: Worker;
  onWorkerDeactivated: () => void;
}

interface RemoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: Worker;
  onWorkerRemoved: () => void;
}

const EditRoleModal: React.FC<EditRoleModalProps> = ({ isOpen, onClose, worker, onRoleUpdated }) => {
  const [selectedRole, setSelectedRole] = useState<'manager' | 'worker'>(
    worker.role === 'admin' ? 'manager' : worker.role as 'manager' | 'worker'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔵 Updating worker role:', { workerId: worker.id, newRole: selectedRole });
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: selectedRole })
        .eq('id', worker.id);

      if (error) {
        console.error('🔴 Role update error:', error);
        throw error;
      }

      console.log('🟢 Worker role updated successfully');

      onRoleUpdated();
      onClose();
    } catch (error: any) {
      console.error('🔴 Role update failed:', error);
      setError(error.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (worker: Worker) => {
    if (worker.first_name && worker.last_name) {
      return `${worker.first_name} ${worker.last_name}`;
    }
    return worker.email.split('@')[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Edit3 className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-dm-sans font-bold text-dark-slate">
              Edit Role
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 font-inter mb-4">
            Change the role for <strong>{getDisplayName(worker)}</strong>
          </p>
          
          <div className="space-y-3">
            <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="role"
                value="manager"
                checked={selectedRole === 'manager'}
                onChange={(e) => setSelectedRole(e.target.value as 'manager')}
                className="mr-3 text-forest focus:ring-forest"
              />
              <div>
                <div className="font-inter font-semibold text-dark-slate">Manager</div>
                <div className="text-sm text-gray-600">Can manage workers and view reports</div>
              </div>
            </label>
            
            <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="role"
                value="worker"
                checked={selectedRole === 'worker'}
                onChange={(e) => setSelectedRole(e.target.value as 'worker')}
                className="mr-3 text-forest focus:ring-forest"
              />
              <div>
                <div className="font-inter font-semibold text-dark-slate">Worker</div>
                <div className="text-sm text-gray-600">Can clock in/out and view assigned jobs</div>
              </div>
            </label>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm font-inter">{error}</p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-inter font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || selectedRole === worker.role}
            className="flex-1 bg-forest text-white py-3 rounded-lg hover:bg-forest/90 transition-all duration-200 font-inter font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const DeactivateModal: React.FC<DeactivateModalProps> = ({ isOpen, onClose, worker, onWorkerDeactivated }) => {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDeactivate = async () => {
    if (!confirmed) return;

    setLoading(true);
    setError('');

    try {
      console.log('🔵 Attempting to deactivate worker:', worker.id);
      const { error } = await supabase
        .from('user_profiles')
        .update({ status: 'inactive' })
        .eq('id', worker.id);

      if (error) {
        console.error('🔴 Supabase update error:', error);
        console.error('🔴 Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('🟢 Worker deactivated successfully');

      onWorkerDeactivated();
      onClose();
      setConfirmed(false);
    } catch (error: any) {
      console.error('🔴 Deactivation failed:', error);
      setError(error.message || 'Failed to deactivate worker');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (worker: Worker) => {
    if (worker.first_name && worker.last_name) {
      return `${worker.first_name} ${worker.last_name}`;
    }
    return worker.email.split('@')[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <PowerOff className="h-6 w-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-dm-sans font-bold text-dark-slate">
              Deactivate Worker
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-inter font-semibold text-orange-800 mb-1">
                  Deactivate {getDisplayName(worker)}?
                </h3>
                <p className="text-orange-700 text-sm">
                  This worker will be moved to the inactive list and won't be able to clock in or access jobs. 
                  They can be reactivated later.
                </p>
              </div>
            </div>
          </div>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 text-forest focus:ring-forest border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 font-inter">
              I understand that this worker will be deactivated and moved to the inactive list.
            </span>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm font-inter">{error}</p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-inter font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleDeactivate}
            disabled={loading || !confirmed}
            className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-all duration-200 font-inter font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deactivating...
              </>
            ) : (
              <>
                <PowerOff className="mr-2 h-4 w-4" />
                Deactivate Worker
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const RemoveModal: React.FC<RemoveModalProps> = ({ isOpen, onClose, worker, onWorkerRemoved }) => {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleRemove = async () => {
    if (confirmText !== 'REMOVE') return;

    setLoading(true);
    setError('');

    try {
      // In a real implementation, you might want to soft delete or archive
      // For now, we'll just update the status to indicate removal
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          status: 'removed',
          updated_at: new Date().toISOString()
        })
        .eq('id', worker.id);

      if (error) throw error;

      onWorkerRemoved();
      onClose();
      setConfirmText('');
    } catch (error: any) {
      setError(error.message || 'Failed to remove worker');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (worker: Worker) => {
    if (worker.first_name && worker.last_name) {
      return `${worker.first_name} ${worker.last_name}`;
    }
    return worker.email.split('@')[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-dm-sans font-bold text-dark-slate">
              Remove Permanently
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-inter font-semibold text-red-800 mb-1">
                  Permanently Remove {getDisplayName(worker)}?
                </h3>
                <p className="text-red-700 text-sm">
                  This action cannot be undone. The worker will be permanently removed from your system 
                  and will lose access to all data and job history.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
              Type "REMOVE" to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-inter"
              placeholder="REMOVE"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm font-inter">{error}</p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-inter font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleRemove}
            disabled={loading || confirmText !== 'REMOVE'}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-all duration-200 font-inter font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Removing...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Permanently
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const WorkerDropdownMenu: React.FC<WorkerDropdownMenuProps> = ({ worker, onWorkerUpdated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editRoleModalOpen, setEditRoleModalOpen] = useState(false);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(true);
    try {
      console.log('🔵 Updating worker status:', { workerId: worker.id, newStatus });
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          status: newStatus,
          last_activity: new Date().toISOString()
        })
        .eq('id', worker.id);

      if (error) {
        console.error('🔴 Status update error:', error);
        throw error;
      }

      console.log('🟢 Worker status updated successfully');

      onWorkerUpdated();
      setIsOpen(false);
    } catch (error) {
      console.error('🔴 Status update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMenuItems = () => {
    const items = [];

    // Always show View Full Profile
    items.push({
      icon: User,
      label: 'View Full Profile',
      onClick: () => {
        // TODO: Implement profile view modal
        console.log('View profile for:', worker.id);
        setIsOpen(false);
      },
      color: 'text-gray-700 hover:bg-gray-50'
    });

    // Always show Edit Role (except for admins editing themselves)
    items.push({
      icon: Edit3,
      label: 'Edit Role',
      onClick: () => {
        setEditRoleModalOpen(true);
        setIsOpen(false);
      },
      color: 'text-gray-700 hover:bg-gray-50'
    });

    // Status-specific actions
    if (worker.status !== 'inactive') {
      // Force Break option (only for active workers)
      if (worker.status === 'active') {
        items.push({
          icon: Pause,
          label: 'Force Break',
          onClick: () => handleStatusUpdate('on_break'),
          color: 'text-yellow-700 hover:bg-yellow-50'
        });
      }

      // Deactivate option (for all non-inactive workers)
      items.push({
        icon: PowerOff,
        label: 'Deactivate',
        onClick: () => {
          setDeactivateModalOpen(true);
          setIsOpen(false);
        },
        color: 'text-orange-700 hover:bg-orange-50'
      });
    } else if (worker.status === 'inactive') {
      // Reactivate option
      items.push({
        icon: Power,
        label: 'Reactivate',
        onClick: () => handleStatusUpdate('off'),
        color: 'text-green-700 hover:bg-green-50'
      });

      // Remove permanently option
      items.push({
        icon: Trash2,
        label: 'Remove Permanently',
        onClick: () => {
          setRemoveModalOpen(true);
          setIsOpen(false);
        },
        color: 'text-red-700 hover:bg-red-50'
      });
    }

    return items;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-2">
            {getMenuItems().map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                disabled={loading}
                className={`w-full px-4 py-2 text-left text-sm font-inter flex items-center transition-colors disabled:opacity-50 ${item.color}`}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      <EditRoleModal
        isOpen={editRoleModalOpen}
        onClose={() => setEditRoleModalOpen(false)}
        worker={worker}
        onRoleUpdated={onWorkerUpdated}
      />

      <DeactivateModal
        isOpen={deactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
        worker={worker}
        onWorkerDeactivated={onWorkerUpdated}
      />

      <RemoveModal
        isOpen={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        worker={worker}
        onWorkerRemoved={onWorkerUpdated}
      />
    </div>
  );
};

export default WorkerDropdownMenu;