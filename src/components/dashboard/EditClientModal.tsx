import React, { useState, useEffect } from 'react';
import { X, User, Building, Mail, Phone, MapPin, FileText, Tag, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onClientUpdated: () => void;
}

interface ClientFormData {
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  notes: string;
  clientType: 'residential' | 'commercial' | 'municipal' | 'other';
  leadSource: string;
  status: 'active' | 'prospect' | 'inactive';
}

const EditClientModal: React.FC<EditClientModalProps> = ({ 
  isOpen, 
  onClose, 
  client, 
  onClientUpdated 
}) => {
  const [formData, setFormData] = useState<ClientFormData>({
    firstName: '',
    lastName: '',
    businessName: '',
    email: '',
    phoneNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
    clientType: 'residential',
    leadSource: '',
    status: 'active'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form data when modal opens or client changes
  useEffect(() => {
    if (isOpen && client) {
      setFormData({
        firstName: client.first_name,
        lastName: client.last_name || '',
        businessName: client.business_name || '',
        email: client.email || '',
        phoneNumber: client.phone_number,
        streetAddress: client.street_address,
        city: client.city,
        state: client.state,
        zipCode: client.zip_code,
        notes: client.notes || '',
        clientType: client.client_type,
        leadSource: client.lead_source || '',
        status: client.status
      });
      setError('');
    }
  }, [isOpen, client]);

  if (!isOpen || !client) return null;

  // Auto-format phone number
  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    
    if (digits.length >= 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    } else if (digits.length >= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length >= 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return digits;
    }
  };

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    if (field === 'phoneNumber') {
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, [field]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.firstName.trim()) {
      errors.push('First name is required');
    }
    
    if (!formData.phoneNumber.trim()) {
      errors.push('Phone number is required');
    } else {
      const digits = formData.phoneNumber.replace(/\D/g, '');
      if (digits.length !== 10) {
        errors.push('Phone number must be 10 digits');
      }
    }
    
    if (!formData.streetAddress.trim()) {
      errors.push('Street address is required');
    }
    
    if (!formData.city.trim()) {
      errors.push('City is required');
    }
    
    if (!formData.state.trim()) {
      errors.push('State is required');
    }
    
    if (!formData.zipCode.trim()) {
      errors.push('ZIP code is required');
    }
    
    return errors;
  };

  const handleSave = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updateData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim() || null,
        business_name: formData.businessName.trim() || null,
        email: formData.email.trim() || null,
        phone_number: formData.phoneNumber.trim(),
        street_address: formData.streetAddress.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zip_code: formData.zipCode.trim(),
        notes: formData.notes.trim() || null,
        client_type: formData.clientType,
        lead_source: formData.leadSource || null,
        status: formData.status,
        updated_at: new Date().toISOString()
      };

      console.log('🔵 Updating client:', client.id, updateData);

      const { error: updateError } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', client.id);

      if (updateError) {
        console.error('🔴 Error updating client:', updateError);
        throw updateError;
      }

      console.log('🟢 Client updated successfully');
      onClientUpdated();

    } catch (error: any) {
      console.error('🔴 Error updating client:', error);
      setError(error.message || 'Failed to update client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getClientTypeIcon = (type: string) => {
    return type === 'commercial' ? Building : User;
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
                Edit Client
              </h2>
              <p className="text-sm text-gray-600 font-inter">
                {client.name}
              </p>
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Client Info Section */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <User className="h-5 w-5 text-forest" />
                <h3 className="text-lg font-dm-sans font-semibold text-dark-slate">
                  Client Information
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                    Business Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                      placeholder="Smith Landscaping LLC"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                      placeholder="john.smith@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                      placeholder="(555) 123-4567"
                      maxLength={14}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Service Address Section */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="h-5 w-5 text-forest" />
                <h3 className="text-lg font-dm-sans font-semibold text-dark-slate">
                  Service Address
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={formData.streetAddress}
                    onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                    placeholder="123 Oak Street"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                      placeholder="Springfield"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                      placeholder="IL"
                      maxLength={2}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                    ZIP/Postal Code *
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                    placeholder="62701"
                    maxLength={10}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Additional Info Section */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-5 w-5 text-forest" />
                <h3 className="text-lg font-dm-sans font-semibold text-dark-slate">
                  Additional Information
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                    Client Type
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      value={formData.clientType}
                      onChange={(e) => handleInputChange('clientType', e.target.value as any)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter appearance-none bg-white"
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="municipal">Municipal</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                    Client Status
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value as any)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter appearance-none bg-white"
                    >
                      <option value="prospect">Prospect</option>
                      <option value="active">Active Client</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                    Lead Source
                  </label>
                  <input
                    type="text"
                    value={formData.leadSource}
                    onChange={(e) => handleInputChange('leadSource', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                    placeholder="Facebook, Google, Referral, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                    Internal Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter resize-none"
                    placeholder="Add any internal notes about this client..."
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-600 text-sm font-inter font-medium">
                    Please fix the following errors:
                  </p>
                  <p className="text-red-600 text-sm font-inter mt-1">
                    {error}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
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
              disabled={loading}
              className="flex-1 bg-forest text-white py-3 rounded-lg hover:bg-forest/90 transition-all duration-200 font-inter font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditClientModal;