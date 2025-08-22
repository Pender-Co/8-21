import React from 'react';
import { X, User, Building, Mail, Phone, MapPin, Calendar, FileText, Tag, Star } from 'lucide-react';

interface Client {
  id: string;
  first_name: string;
  last_name: string | null;
  business_name: string | null;
  email: string;
  phone_number: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  client_type: 'residential' | 'commercial';
  notes: string | null;
  lead_source: string | null;
  created_by: string;
  business_id: string;
  created_at: string;
  updated_at: string;
  name: string;
  address: string;
  phone: string;
  status: 'active' | 'inactive' | 'prospect';
  total_jobs: number;
  total_spent: number;
  last_job_date: string | null;
  next_scheduled: string | null;
  rating: number;
  preferred_contact: 'phone' | 'email' | 'text';
  service_frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'seasonal' | 'one-time';
}

interface ViewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

const ViewClientModal: React.FC<ViewClientModalProps> = ({ isOpen, onClose, client }) => {
  if (!isOpen || !client) return null;

  const getClientTypeIcon = (type: string) => {
    return type === 'commercial' ? Building : User;
  };

  const getClientTypeColor = (type: string) => {
    return type === 'commercial' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'prospect':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const ClientTypeIcon = getClientTypeIcon(client.client_type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="bg-forest p-3 rounded-lg">
              <ClientTypeIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-dm-sans font-bold text-dark-slate">
                {client.name}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-inter font-medium ${getStatusColor(client.status)}`}>
                  {client.status}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-inter font-medium ${getClientTypeColor(client.client_type)}`}>
                  {client.client_type}
                </span>
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-dm-sans font-semibold text-dark-slate mb-4 flex items-center">
                <User className="h-5 w-5 text-forest mr-2" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-inter font-medium text-gray-600">Email</p>
                    <p className="text-sm text-dark-slate">{client.email || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-inter font-medium text-gray-600">Phone</p>
                    <p className="text-sm text-dark-slate">{client.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-dm-sans font-semibold text-dark-slate mb-4 flex items-center">
                <MapPin className="h-5 w-5 text-forest mr-2" />
                Service Address
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-dark-slate font-inter">
                  {client.street_address}<br />
                  {client.city}, {client.state} {client.zip_code}
                </p>
              </div>
            </div>

            {/* Service Information */}
            <div>
              <h3 className="text-lg font-dm-sans font-semibold text-dark-slate mb-4 flex items-center">
                <FileText className="h-5 w-5 text-forest mr-2" />
                Service Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-inter font-medium text-gray-600 mb-1">Client Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-inter font-medium ${getStatusColor(client.status)}`}>
                    {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-inter font-medium text-gray-600 mb-1">Service Frequency</p>
                  <p className="text-sm text-dark-slate capitalize">{client.service_frequency.replace('-', ' ')}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-inter font-medium text-gray-600 mb-1">Preferred Contact</p>
                  <p className="text-sm text-dark-slate capitalize">{client.preferred_contact}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-inter font-medium text-gray-600 mb-1">Total Jobs</p>
                  <p className="text-sm text-dark-slate">{client.total_jobs} completed</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-inter font-medium text-gray-600 mb-1">Total Spent</p>
                  <p className="text-sm text-dark-slate">${client.total_spent}</p>
                </div>
              </div>
            </div>

            {/* Rating */}
            {client.rating > 0 && (
              <div>
                <h3 className="text-lg font-dm-sans font-semibold text-dark-slate mb-4 flex items-center">
                  <Star className="h-5 w-5 text-forest mr-2" />
                  Client Rating
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  {renderStars(client.rating)}
                </div>
              </div>
            )}

            {/* Lead Source */}
            {client.lead_source && (
              <div>
                <h3 className="text-lg font-dm-sans font-semibold text-dark-slate mb-4 flex items-center">
                  <Tag className="h-5 w-5 text-forest mr-2" />
                  Lead Source
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-dark-slate font-inter capitalize">{client.lead_source}</p>
                </div>
              </div>
            )}

            {/* Notes */}
            {client.notes && (
              <div>
                <h3 className="text-lg font-dm-sans font-semibold text-dark-slate mb-4 flex items-center">
                  <FileText className="h-5 w-5 text-forest mr-2" />
                  Notes
                </h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 font-inter">{client.notes}</p>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div>
              <h3 className="text-lg font-dm-sans font-semibold text-dark-slate mb-4 flex items-center">
                <Calendar className="h-5 w-5 text-forest mr-2" />
                Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-inter text-gray-600">Client since</span>
                  <span className="text-sm font-inter font-medium text-dark-slate">
                    {formatDate(client.created_at)}
                  </span>
                </div>
                {client.last_job_date && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-inter text-gray-600">Last job</span>
                    <span className="text-sm font-inter font-medium text-dark-slate">
                      {formatDate(client.last_job_date)}
                    </span>
                  </div>
                )}
                {client.next_scheduled && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-inter text-gray-600">Next scheduled</span>
                    <span className="text-sm font-inter font-medium text-green-800">
                      {formatDate(client.next_scheduled)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between">
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  if (client.email) {
                    window.location.href = `mailto:${client.email}`;
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-inter font-semibold text-sm flex items-center"
              >
                <Mail className="mr-2 h-4 w-4" />
                Email
              </button>
              <button
                onClick={() => {
                  window.location.href = `tel:${client.phone}`;
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-inter font-semibold text-sm flex items-center"
              >
                <Phone className="mr-2 h-4 w-4" />
                Call
              </button>
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
  );
};

export default ViewClientModal;