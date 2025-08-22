import React, { useState } from 'react';
import { 
  MapPin, 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  DollarSign,
  MoreHorizontal,
  Navigation,
  Edit3,
  Trash2,
  Eye,
  FileText
} from 'lucide-react';
import JobStatusDropdown from './JobStatusDropdown';
import { Job } from '../../hooks/useJobs';

interface JobCardProps {
  job: Job;
  onStatusChange: (jobId: string, newStatus: string) => Promise<void>;
  onEdit?: (job: Job) => void;
  onView?: (job: Job) => void;
  onDelete?: (job: Job) => void;
  className?: string;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  onStatusChange,
  onEdit,
  onView,
  onDelete,
  className = ''
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getClientName = () => {
    if (!job.clients) return 'Unknown Client';
    return job.clients.business_name || 
           `${job.clients.first_name} ${job.clients.last_name || ''}`.trim();
  };

  const getWorkerName = () => {
    if (!job.assigned_worker_profile) return null;
    return job.assigned_worker_profile.first_name && job.assigned_worker_profile.last_name
      ? `${job.assigned_worker_profile.first_name} ${job.assigned_worker_profile.last_name}`
      : job.assigned_worker_profile.email.split('@')[0];
  };

  const getClientAddress = () => {
    if (!job.clients) return 'No address';
    return `${job.clients.street_address}, ${job.clients.city}, ${job.clients.state}`;
  };

  const getDirectionsUrl = () => {
    if (!job.clients) return '#';
    
    const address = `${job.clients.street_address}, ${job.clients.city}, ${job.clients.state} ${job.clients.zip_code}`;
    const encodedAddress = encodeURIComponent(address);
    
    // Try to get user's current location for directions
    if (navigator.geolocation) {
      return `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    } else {
      // Fallback to just showing the location
      return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    }
  };
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const getTotalServiceItems = () => {
    return job.job_service_items?.reduce((sum, item) => sum + item.total, 0) || job.estimated_cost;
  };

  const handleStatusChange = async (newStatus: string) => {
    await onStatusChange(job.id, newStatus);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-dm-sans font-semibold text-dark-slate">
              {job.title}
            </h3>
            <JobStatusDropdown
              currentStatus={job.status}
              onStatusChange={handleStatusChange}
              size="sm"
            />
            {job.priority && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-inter font-medium ${
                job.priority === 'high' ? 'bg-red-100 text-red-800' :
                job.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {job.priority} priority
              </span>
            )}
          </div>
          {job.description && (
            <p className="text-gray-600 font-inter text-sm mb-3 line-clamp-2">
              {job.description}
            </p>
          )}
        </div>
        
        <div className="relative ml-4">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {dropdownOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-2">
                {onView && (
                  <button
                    onClick={() => {
                      onView(job);
                      setDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm font-inter text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-3" />
                    View Details
                  </button>
                )}
                
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit(job);
                      setDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm font-inter text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                  >
                    <Edit3 className="h-4 w-4 mr-3" />
                    Edit Job
                  </button>
                )}
                
                <button
                  onClick={() => {
                    window.open(getDirectionsUrl(), '_blank');
                    setDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm font-inter text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                >
                  <Navigation className="h-4 w-4 mr-3" />
                  Get Directions
                </button>
                
                <button
                  onClick={() => {
                    // TODO: Implement duplicate functionality
                    setDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm font-inter text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                >
                  <FileText className="h-4 w-4 mr-3" />
                  Duplicate Job
                </button>
                
                <hr className="my-1 border-gray-200" />
                
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete(job);
                      setDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm font-inter text-red-600 hover:bg-red-50 flex items-center transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-3" />
                    Delete Job
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Job Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <User className="h-4 w-4 mr-2 flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-medium text-dark-slate truncate">{getClientName()}</div>
            {job.clients?.phone_number && (
              <div className="text-xs truncate">{job.clients.phone_number}</div>
            )}
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">{getClientAddress()}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
          <div>
            <div className="font-medium text-dark-slate">
              {formatDate(job.scheduled_date)}
            </div>
            {job.scheduled_time && (
              <div className="text-xs">{formatTime(job.scheduled_time)}</div>
            )}
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
          <div>
            <div className="font-medium text-dark-slate">${getTotalServiceItems()}</div>
            {job.estimated_duration > 0 && (
              <div className="text-xs">{job.estimated_duration}h estimated</div>
            )}
          </div>
        </div>
      </div>

      {/* Service Items Summary */}
      {job.job_service_items && job.job_service_items.length > 0 && (
        <div className="mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-xs font-inter font-semibold text-gray-700 mb-2">
              Service Items ({job.job_service_items.length})
            </h4>
            <div className="space-y-1">
              {job.job_service_items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 truncate">
                    {item.quantity}x {item.item_name}
                  </span>
                  <span className="font-medium text-dark-slate ml-2">
                    ${item.total}
                  </span>
                </div>
              ))}
              {job.job_service_items.length > 3 && (
                <div className="text-xs text-gray-500 font-medium">
                  +{job.job_service_items.length - 3} more items
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          {getWorkerName() && (
            <div className="flex items-center">
              <div className="w-6 h-6 bg-forest rounded-full flex items-center justify-center mr-2">
                <span className="text-xs font-semibold text-white">
                  {getWorkerName()?.split(' ').map(n => n[0]).join('') || 'U'}
                </span>
              </div>
              <span className="text-xs">Assigned to {getWorkerName()}</span>
            </div>
          )}
          
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-xs">
              Created {new Date(job.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {job.status === 'scheduled' && (
            <button 
              onClick={() => handleStatusChange('in_progress')}
              className="bg-forest text-white px-3 py-1.5 rounded-lg hover:bg-forest/90 transition-colors font-inter font-semibold text-xs"
            >
              Start Job
            </button>
          )}
          
          {job.status === 'in_progress' && (
            <button 
              onClick={() => handleStatusChange('completed')}
              className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors font-inter font-semibold text-xs"
            >
              Complete
            </button>
          )}
          
          <button className="border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-inter font-semibold text-xs flex items-center">
            <Navigation className="h-3 w-3 mr-1" />
            <a href={getDirectionsUrl()} target="_blank" rel="noopener noreferrer" className="text-inherit no-underline">
              Directions
            </a>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;