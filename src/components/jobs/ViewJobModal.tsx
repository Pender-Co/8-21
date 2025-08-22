import React, { useState } from 'react';
import { 
  X, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  Phone, 
  Mail,
  Package,
  Image,
  Video,
  File,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Job } from '../../hooks/useJobs';
import JobStatusBadge from './JobStatusBadge';

interface ViewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
}

const ViewJobModal: React.FC<ViewJobModalProps> = ({ isOpen, onClose, job }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageGallery, setShowImageGallery] = useState(false);

  if (!isOpen || !job) return null;

  const getClientName = () => {
    if (!job.clients) return 'Unknown Client';
    return job.clients.business_name || 
           `${job.clients.first_name} ${job.clients.last_name || ''}`.trim();
  };

  const getClientAddress = () => {
    if (!job.clients) return 'No address';
    return `${job.clients.street_address}, ${job.clients.city}, ${job.clients.state} ${job.clients.zip_code}`;
  };

  const getWorkerName = () => {
    if (!job.assigned_worker_profile) return 'Unassigned';
    return job.assigned_worker_profile.first_name && job.assigned_worker_profile.last_name
      ? `${job.assigned_worker_profile.first_name} ${job.assigned_worker_profile.last_name}`
      : job.assigned_worker_profile.email.split('@')[0];
  };

  const getCreatedByName = () => {
    if (!job.created_by_user) return 'Unknown';
    return job.created_by_user.first_name && job.created_by_user.last_name
      ? `${job.created_by_user.first_name} ${job.created_by_user.last_name}`
      : job.created_by_user.email.split('@')[0];
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString([], { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTotalServiceItems = () => {
    return job.job_service_items?.reduce((sum, item) => sum + item.total, 0) || job.estimated_cost;
  };

  // Mock attachments for demonstration - in real app, these would come from job.attachments
  // Get real attachments from job data
  const attachments = job.attachments || [];

  const imageAttachments = attachments.filter(att => att.type.startsWith('image/'));
  const videoAttachments = attachments.filter(att => att.type.startsWith('video/'));
  const documentAttachments = attachments.filter(att => !att.type.startsWith('image/') && !att.type.startsWith('video/'));

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageAttachments.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imageAttachments.length) % imageAttachments.length);
  };

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="bg-forest p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-dm-sans font-bold text-dark-slate">
                  {job.title}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <JobStatusBadge status={job.status} size="sm" />
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
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Job Information */}
                <div>
                  <h3 className="text-lg font-dm-sans font-semibold text-dark-slate mb-4 flex items-center">
                    <FileText className="h-5 w-5 text-forest mr-2" />
                    Job Information
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-inter font-semibold text-gray-700 mb-2">Description</h4>
                      <p className="text-dark-slate font-inter">
                        {job.description || 'No description provided'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-inter font-semibold text-gray-700 mb-2">Estimated Cost</h4>
                        <p className="text-lg font-dm-sans font-bold text-forest">
                          {formatCurrency(getTotalServiceItems())}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-inter font-semibold text-gray-700 mb-2">Duration</h4>
                        <p className="text-lg font-dm-sans font-bold text-dark-slate">
                          {job.estimated_duration}h
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-inter font-semibold text-gray-700 mb-2">Schedule</h4>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-dark-slate font-inter">{formatDate(job.scheduled_date)}</span>
                        </div>
                        {job.scheduled_time && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-dark-slate font-inter">{formatTime(job.scheduled_time)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-inter font-semibold text-gray-700 mb-2">Assignment</h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-forest rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-white">
                            {getWorkerName().split(' ').map(n => n[0]).join('') || 'U'}
                          </span>
                        </div>
                        <span className="text-dark-slate font-inter">{getWorkerName()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Items */}
                {job.job_service_items && job.job_service_items.length > 0 && (
                  <div>
                    <h3 className="text-lg font-dm-sans font-semibold text-dark-slate mb-4 flex items-center">
                      <Package className="h-5 w-5 text-forest mr-2" />
                      Service Items ({job.job_service_items.length})
                    </h3>
                    <div className="space-y-3">
                      {job.job_service_items.map((item) => (
                        <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-inter font-semibold text-dark-slate">{item.item_name}</h4>
                            <span className="font-dm-sans font-bold text-forest">{formatCurrency(item.total)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Qty: {item.quantity} × {formatCurrency(item.unit_price)}</span>
                            {item.unit_cost && (
                              <span>Cost: {formatCurrency(item.unit_cost)}</span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                          )}
                        </div>
                      ))}
                      <div className="bg-forest/10 border border-forest/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-dm-sans font-semibold text-dark-slate">Total:</span>
                          <span className="text-xl font-dm-sans font-bold text-forest">
                            {formatCurrency(getTotalServiceItems())}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Client Details */}
                <div>
                  <h3 className="text-lg font-dm-sans font-semibold text-dark-slate mb-4 flex items-center">
                    <User className="h-5 w-5 text-forest mr-2" />
                    Client Details
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-inter font-semibold text-gray-700 mb-2">Client Name</h4>
                      <p className="text-dark-slate font-inter font-semibold">{getClientName()}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-inter font-semibold text-gray-700 mb-2">Property Address</h4>
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <p className="text-dark-slate font-inter">{getClientAddress()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {job.clients?.email && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-gray-400" />
                            <div>
                              <h4 className="text-sm font-inter font-semibold text-gray-700">Email</h4>
                              <p className="text-dark-slate font-inter">{job.clients.email}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {job.clients?.phone_number && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <Phone className="h-5 w-5 text-gray-400" />
                            <div>
                              <h4 className="text-sm font-inter font-semibold text-gray-700">Phone</h4>
                              <p className="text-dark-slate font-inter">{job.clients.phone_number}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <h3 className="text-lg font-dm-sans font-semibold text-dark-slate mb-4 flex items-center">
                    <Image className="h-5 w-5 text-forest mr-2" />
                    Attachments ({attachments.length})
                  </h3>
                  
                  {/* Images */}
                  {imageAttachments.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-inter font-semibold text-gray-700 mb-3">Photos ({imageAttachments.length})</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {imageAttachments.map((image, index) => (
                          <button
                            key={image.id}
                            onClick={() => {
                              setCurrentImageIndex(index);
                              setShowImageGallery(true);
                            }}
                            className="relative aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                          >
                            <img
                              src={image.url}
                              alt={image.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                              <Eye className="h-6 w-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Videos and Documents */}
                  {(videoAttachments.length > 0 || documentAttachments.length > 0) && (
                    <div className="space-y-3">
                      {videoAttachments.length > 0 && (
                        <div>
                          <h4 className="text-sm font-inter font-semibold text-gray-700 mb-2">Videos ({videoAttachments.length})</h4>
                          <div className="space-y-3">
                            {videoAttachments.map((video) => (
                              <div key={video.id} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <p className="text-sm font-inter font-medium text-dark-slate">{video.name}</p>
                                    <p className="text-xs text-gray-500">{formatFileSize(video.size)}</p>
                                  </div>
                                  <button 
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = video.url;
                                      link.download = video.name;
                                      link.click();
                                    }}
                                    className="text-forest hover:text-forest/80 p-1"
                                    title="Download video"
                                  >
                                    <Download className="h-4 w-4" />
                                  </button>
                                </div>
                                <video
                                  src={video.url}
                                  controls
                                  preload="metadata"
                                  className="w-full max-h-64 rounded-lg bg-black"
                                  style={{ maxWidth: '100%' }}
                                >
                                  <p className="text-red-600 text-sm">
                                    Your browser doesn't support HTML video. 
                                    <a href={video.url} className="underline">Download the video</a> instead.
                                  </p>
                                </video>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {documentAttachments.length > 0 && (
                        <div>
                          <h4 className="text-sm font-inter font-semibold text-gray-700 mb-2">Documents ({documentAttachments.length})</h4>
                          {documentAttachments.map((doc) => {
                            const FileIcon = getFileIcon(doc.type);
                            return (
                              <div key={doc.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <FileIcon className="h-5 w-5 text-gray-400" />
                                  <div>
                                    <p className="text-sm font-inter font-medium text-dark-slate">{doc.name}</p>
                                    <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                                  </div>
                                </div>
                                <button className="text-forest hover:text-forest/80 p-1">
                                  <Download className="h-4 w-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {attachments.length === 0 && (
                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                      <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 font-inter text-sm">No attachments</p>
                    </div>
                  )}
                </div>

                {/* Job Metadata */}
                <div>
                  <h3 className="text-lg font-dm-sans font-semibold text-dark-slate mb-4">Job History</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-inter text-gray-600">Created by</span>
                        <span className="text-sm font-inter font-medium text-dark-slate">{getCreatedByName()}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-inter text-gray-600">Created on</span>
                        <span className="text-sm font-inter font-medium text-dark-slate">
                          {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-inter text-gray-600">Last updated</span>
                        <span className="text-sm font-inter font-medium text-dark-slate">
                          {new Date(job.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {job.completion_date && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-inter text-green-700">Completed on</span>
                          <span className="text-sm font-inter font-medium text-green-800">
                            {new Date(job.completion_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {job.notes && (
                  <div>
                    <h3 className="text-lg font-dm-sans font-semibold text-dark-slate mb-4">Internal Notes</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 font-inter">{job.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex justify-between">
              <div className="flex space-x-3">
                {job.clients?.email && (
                  <button
                    onClick={() => window.location.href = `mailto:${job.clients.email}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-inter font-semibold text-sm flex items-center"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Email Client
                  </button>
                )}
                {job.clients?.phone_number && (
                  <button
                    onClick={() => window.location.href = `tel:${job.clients.phone_number}`}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-inter font-semibold text-sm flex items-center"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Call Client
                  </button>
                )}
              </div>
              <button
                onClick={onClose}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-inter font-semibold text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {showImageGallery && imageAttachments.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-60 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            {/* Close Button */}
            <button
              onClick={() => setShowImageGallery(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 rounded-lg bg-black bg-opacity-50 z-10"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation Buttons */}
            {imageAttachments.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 p-2 rounded-lg bg-black bg-opacity-50"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 p-2 rounded-lg bg-black bg-opacity-50"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            {/* Image */}
            <div className="text-center">
              <img
                src={imageAttachments[currentImageIndex]?.url}
                alt={imageAttachments[currentImageIndex]?.name}
                className="max-w-full max-h-[80vh] object-contain mx-auto rounded-lg"
              />
              <div className="mt-4 text-white">
                <p className="font-inter font-medium">{imageAttachments[currentImageIndex]?.name}</p>
                <p className="text-sm text-gray-300">
                  {currentImageIndex + 1} of {imageAttachments.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewJobModal;