import React, { useState, useEffect } from 'react';
import { X, User, Building, Mail, Phone, MapPin, FileText, Tag, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface AddClientPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onClientAdded: () => void;
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
  customLeadSource: string;
}

const AddClientPanel: React.FC<AddClientPanelProps> = ({ isOpen, onClose, onClientAdded }) => {
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
    status: 'prospect',
    customLeadSource: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showCustomLeadInput, setShowCustomLeadInput] = useState(false);

  const { user, profile } = useAuth();

  // Reset form when panel opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
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
        status: 'prospect',
        customLeadSource: ''
      });
      setShowCustomLeadInput(false);
      setError('');
    }
  }, [isOpen]);

  // Auto-format phone number
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
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

  // Auto-fill state based on ZIP code (basic implementation)
  const getStateFromZip = (zipCode: string) => {
    // This is a simplified implementation - in a real app, you'd use a proper ZIP code API
    const zip = zipCode.slice(0, 5);
    const zipNum = parseInt(zip);
    
    if (zipNum >= 35000 && zipNum <= 36999) return 'AL';
    if (zipNum >= 99500 && zipNum <= 99999) return 'AK';
    if (zipNum >= 85000 && zipNum <= 86999) return 'AZ';
    if (zipNum >= 71600 && zipNum <= 72999) return 'AR';
    if (zipNum >= 90000 && zipNum <= 96699) return 'CA';
    if (zipNum >= 80000 && zipNum <= 81999) return 'CO';
    if (zipNum >= 6000 && zipNum <= 6999) return 'CT';
    if (zipNum >= 19700 && zipNum <= 19999) return 'DE';
    if (zipNum >= 32000 && zipNum <= 34999) return 'FL';
    if (zipNum >= 30000 && zipNum <= 31999) return 'GA';
    if (zipNum >= 96700 && zipNum <= 96999) return 'HI';
    if (zipNum >= 83200 && zipNum <= 83999) return 'ID';
    if (zipNum >= 60000 && zipNum <= 62999) return 'IL';
    if (zipNum >= 46000 && zipNum <= 47999) return 'IN';
    if (zipNum >= 50000 && zipNum <= 52999) return 'IA';
    if (zipNum >= 66000 && zipNum <= 67999) return 'KS';
    if (zipNum >= 40000 && zipNum <= 42999) return 'KY';
    if (zipNum >= 70000 && zipNum <= 71599) return 'LA';
    if (zipNum >= 3900 && zipNum <= 4999) return 'ME';
    if (zipNum >= 20600 && zipNum <= 21999) return 'MD';
    if (zipNum >= 1000 && zipNum <= 2799) return 'MA';
    if (zipNum >= 48000 && zipNum <= 49999) return 'MI';
    if (zipNum >= 55000 && zipNum <= 56999) return 'MN';
    if (zipNum >= 38600 && zipNum <= 39999) return 'MS';
    if (zipNum >= 63000 && zipNum <= 65999) return 'MO';
    if (zipNum >= 59000 && zipNum <= 59999) return 'MT';
    if (zipNum >= 68000 && zipNum <= 69999) return 'NE';
    if (zipNum >= 88900 && zipNum <= 89999) return 'NV';
    if (zipNum >= 3000 && zipNum <= 3899) return 'NH';
    if (zipNum >= 7000 && zipNum <= 8999) return 'NJ';
    if (zipNum >= 87000 && zipNum <= 88499) return 'NM';
    if (zipNum >= 10000 && zipNum <= 14999) return 'NY';
    if (zipNum >= 27000 && zipNum <= 28999) return 'NC';
    if (zipNum >= 58000 && zipNum <= 58999) return 'ND';
    if (zipNum >= 43000 && zipNum <= 45999) return 'OH';
    if (zipNum >= 73000 && zipNum <= 74999) return 'OK';
    if (zipNum >= 97000 && zipNum <= 97999) return 'OR';
    if (zipNum >= 15000 && zipNum <= 19699) return 'PA';
    if (zipNum >= 2800 && zipNum <= 2999) return 'RI';
    if (zipNum >= 29000 && zipNum <= 29999) return 'SC';
    if (zipNum >= 57000 && zipNum <= 57999) return 'SD';
    if (zipNum >= 37000 && zipNum <= 38599) return 'TN';
    if (zipNum >= 75000 && zipNum <= 79999) return 'TX';
    if (zipNum >= 84000 && zipNum <= 84999) return 'UT';
    if (zipNum >= 5000 && zipNum <= 5999) return 'VT';
    if (zipNum >= 22000 && zipNum <= 24699) return 'VA';
    if (zipNum >= 98000 && zipNum <= 99499) return 'WA';
    if (zipNum >= 24700 && zipNum <= 26999) return 'WV';
    if (zipNum >= 53000 && zipNum <= 54999) return 'WI';
    if (zipNum >= 82000 && zipNum <= 83199) return 'WY';
    
    return '';
  };

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    if (field === 'phoneNumber') {
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, [field]: formatted }));
    } else if (field === 'leadSource') {
      setFormData(prev => ({ ...prev, [field]: value }));
      // Show custom input if "custom" is selected
      if (value === 'custom') {
        setShowCustomLeadInput(true);
      } else {
        setShowCustomLeadInput(false);
        setFormData(prev => ({ ...prev, customLeadSource: '' }));
      }
    } else if (field === 'zipCode') {
      setFormData(prev => ({ ...prev, [field]: value }));
      // Auto-fill state if ZIP code is complete
      if (value.length >= 5) {
        const state = getStateFromZip(value);
        if (state) {
          setFormData(prev => ({ ...prev, state }));
        }
      }
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
      // Validate phone number format
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
    } else if (formData.zipCode.replace(/\D/g, '').length < 5) {
      errors.push('ZIP code must be at least 5 digits');
    }
    
    return errors;
  };

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleSave = async () => {
    if (!user || !profile?.business_id) {
      setError('Unable to save client. Please try again.');
      return;
    }

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const clientData = {
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
        lead_source: formData.leadSource === 'custom' 
          ? formData.customLeadSource.trim() || null 
          : formData.leadSource || null,
        status: formData.status,
        created_by: user.id,
        business_id: profile.business_id
      };

      console.log('🔵 Saving client data:', clientData);

      const { data, error: insertError } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();

      if (insertError) {
        console.error('🔴 Error saving client:', insertError);
        throw insertError;
      }

      console.log('🟢 Client saved successfully:', data);

      // Show success toast and close panel
      showSuccessToast('✅ Client added successfully');
      onClientAdded();
      onClose();

    } catch (error: any) {
      console.error('🔴 Error saving client:', error);
      if (error.code === '23505') {
        setError('A client with this information already exists.');
      } else {
        setError(error.message || 'Failed to save client. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-[70] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-in slide-in-from-top-2 duration-300">
          <span className="font-inter font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Slide-in Panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 lg:w-[480px] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="bg-forest p-2 rounded-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-dm-sans font-bold text-dark-slate">
                Add Client
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
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
                  {formData.zipCode.length >= 5 && formData.state && (
                    <p className="text-xs text-green-600 mt-1 font-inter">
                      ✓ State auto-filled based on ZIP code
                    </p>
                  )}
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
                    Initial Status
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
                  <p className="text-xs text-gray-500 mt-1 font-inter">
                    Most new clients start as prospects
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                    Lead Source
                  </label>
                  <select
                    value={formData.leadSource}
                    onChange={(e) => handleInputChange('leadSource', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter appearance-none bg-white"
                  >
                    <option value="">Select lead source...</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="google">Google</option>
                    <option value="flyer">Flyer</option>
                    <option value="referral">Referral</option>
                    <option value="other">Other</option>
                    <option value="custom">Create custom...</option>
                  </select>
                </div>

                {showCustomLeadInput && (
                  <div className="animate-in slide-in-from-top-2 duration-200">
                    <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                      Custom Lead Source
                    </label>
                    <input
                      type="text"
                      value={formData.customLeadSource}
                      onChange={(e) => handleInputChange('customLeadSource', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                      placeholder="Enter custom lead source..."
                      autoFocus
                    />
                  </div>
                )}
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

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
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
                    Save Client
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddClientPanel;