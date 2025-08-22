import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { getAllowedTransitions, getJobStatus } from '../../constants/jobStatuses';
import JobStatusBadge from './JobStatusBadge';

interface JobStatusDropdownProps {
  currentStatus: string;
  onStatusChange: (newStatus: string) => Promise<void>;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const JobStatusDropdown: React.FC<JobStatusDropdownProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false,
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentStatusConfig = getJobStatus(currentStatus);
  const allowedTransitions = getAllowedTransitions(currentStatus);

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

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus || loading) return;

    setLoading(true);
    try {
      await onStatusChange(newStatus);
      setIsOpen(false);
    } catch (error) {
      console.error('Error changing status:', error);
      // You might want to show a toast notification here
    } finally {
      setLoading(false);
    }
  };

  if (!currentStatusConfig) {
    return <JobStatusBadge status={currentStatus} size={size} />;
  }

  // If no transitions are allowed, just show the badge
  if (allowedTransitions.length === 0 || disabled) {
    return <JobStatusBadge status={currentStatus} size={size} />;
  }

  const buttonSizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading || disabled}
        className={`inline-flex items-center rounded-full font-inter font-medium transition-colors ${currentStatusConfig.bgColor} ${currentStatusConfig.color} hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ${buttonSizeClasses[size]}`}
      >
        <JobStatusBadge 
          status={currentStatus} 
          size={size} 
          className="bg-transparent border-0 p-0 m-0" 
        />
        {!loading && (
          <ChevronDown className={`ml-1 ${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`} />
        )}
        {loading && (
          <div className={`ml-1 animate-spin rounded-full border-b-2 border-current ${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`} />
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-2">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-xs font-inter font-medium text-gray-500 uppercase tracking-wider">
                Change Status
              </p>
            </div>
            
            {allowedTransitions.map((status) => (
              <button
                key={status.value}
                onClick={() => handleStatusChange(status.value)}
                disabled={loading}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <JobStatusBadge 
                    status={status.value} 
                    size="sm" 
                    className="flex-shrink-0" 
                  />
                  <div>
                    <p className="text-sm font-inter font-medium text-gray-900">
                      {status.label}
                    </p>
                    <p className="text-xs text-gray-500">
                      {status.description}
                    </p>
                  </div>
                </div>
                
                {currentStatus === status.value && (
                  <Check className="h-4 w-4 text-forest" />
                )}
              </button>
            ))}
            
            {allowedTransitions.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500 font-inter">
                No status changes available
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default JobStatusDropdown;