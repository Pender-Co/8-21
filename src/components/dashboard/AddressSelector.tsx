import React, { useState, useEffect } from 'react';
import { X, Search, Plus, MapPin, Home, Building, Edit3, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Address {
  id: string;
  client_id: string;
  business_id: string;
  label: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

interface Client {
  id: string;
  first_name: string;
  last_name: string | null;
  business_name: string | null;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
}

interface AddressSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onAddressSelected: (address: Address) => void;
}

interface AddressFormData {
  label: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  isPrimary: boolean;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({ 
  isOpen, 
  onClose, 
  client, 
  onAddressSelected 
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [filteredAddresses, setFilteredAddresses] = useState<Address[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<AddressFormData>({
    label: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    isPrimary: false
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { user, profile } = useAuth();

  // Fetch addresses when modal opens
  useEffect(() => {
    if (isOpen && client) {
      fetchAddresses();
    }
  }, [isOpen, client]);

  // Filter addresses based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAddresses(addresses);
    } else {
      const filtered = addresses.filter(address => 
        address.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        address.street_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        address.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        address.zip_code.includes(searchTerm)
      );
      setFilteredAddresses(filtered);
    }
  }, [addresses, searchTerm]);

  const fetchAddresses = async () => {
    if (!client || !profile?.business_id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('client_id', client.id)
        .eq('business_id', profile.business_id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // If no addresses exist, create the primary address from client data
      if (!data || data.length === 0) {
        await createPrimaryAddress();
      } else {
        setAddresses(data);
        setFilteredAddresses(data);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPrimaryAddress = async () => {
    if (!client || !profile?.business_id || !user) return;

    try {
      const primaryAddress = {
        client_id: client.id,
        business_id: profile.business_id,
        label: 'Primary Address',
        street_address: client.street_address,
        city: client.city,
        state: client.state,
        zip_code: client.zip_code,
        is_primary: true
      };

      const { data, error } = await supabase
        .from('addresses')
        .insert(primaryAddress)
        .select()
        .single();

      if (error) throw error;

      setAddresses([data]);
      setFilteredAddresses([data]);
    } catch (error) {
      console.error('Error creating primary address:', error);
    }
  };

  const handleAddAddress = async () => {
    if (!client || !profile?.business_id || !user) return;

    const validationErrors = [];
    if (!formData.label.trim()) validationErrors.push('Label is required');
    if (!formData.streetAddress.trim()) validationErrors.push('Street address is required');
    if (!formData.city.trim()) validationErrors.push('City is required');
    if (!formData.state.trim()) validationErrors.push('State is required');
    if (!formData.zipCode.trim()) validationErrors.push('ZIP code is required');

    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setSaving(true);
    setError('');

    try {
      // If this is being set as primary, update existing primary addresses
      if (formData.isPrimary) {
        await supabase
          .from('addresses')
          .update({ is_primary: false })
          .eq('client_id', client.id)
          .eq('business_id', profile.business_id);
      }

      const newAddress = {
        client_id: client.id,
        business_id: profile.business_id,
        label: formData.label.trim(),
        street_address: formData.streetAddress.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zip_code: formData.zipCode.trim(),
        is_primary: formData.isPrimary
      };

      const { data, error } = await supabase
        .from('addresses')
        .insert(newAddress)
        .select()
        .single();

      if (error) throw error;

      // Refresh addresses list
      await fetchAddresses();
      
      // Reset form
      setFormData({
        label: '',
        streetAddress: '',
        city: '',
        state: '',
        zipCode: '',
        isPrimary: false
      });
      setShowAddForm(false);
    } catch (error: any) {
      console.error('Error adding address:', error);
      setError(error.message || 'Failed to add address');
    } finally {
      setSaving(false);
    }
  };

  const handleAddressSelect = (address: Address) => {
    onAddressSelected(address);
    onClose();
  };

  const getClientDisplayName = () => {
    return client.business_name || `${client.first_name} ${client.last_name || ''}`.trim();
  };

  const getAddressDisplay = (address: Address) => {
    return `${address.street_address}, ${address.city}, ${address.state} ${address.zip_code}`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-xl font-dm-sans font-bold text-dark-slate">
                Select Address
              </h3>
              <p className="text-sm text-gray-600 font-inter mt-1">
                Choose an address for {getClientDisplayName()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Search and Add New */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search addresses by label, street, city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent text-sm font-inter"
                />
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-forest text-white px-4 py-2 rounded-lg hover:bg-forest/90 transition-colors font-inter font-semibold text-sm flex items-center justify-center"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Address
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-96">
            {showAddForm ? (
              /* Add Address Form */
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-dm-sans font-semibold text-dark-slate">
                    Add New Address
                  </h4>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setError('');
                      setFormData({
                        label: '',
                        streetAddress: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        isPrimary: false
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                      Address Label *
                    </label>
                    <input
                      type="text"
                      value={formData.label}
                      onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter text-sm"
                      placeholder="e.g., Main Property, Back Yard, Front Office"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={formData.streetAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, streetAddress: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter text-sm"
                      placeholder="123 Oak Street"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter text-sm"
                        placeholder="Springfield"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter text-sm"
                        placeholder="IL"
                        maxLength={2}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter text-sm"
                      placeholder="62701"
                      maxLength={10}
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPrimary"
                      checked={formData.isPrimary}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPrimary: e.target.checked }))}
                      className="mr-2 text-forest focus:ring-forest border-gray-300 rounded"
                    />
                    <label htmlFor="isPrimary" className="text-sm font-inter text-dark-slate">
                      Set as primary address
                    </label>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-red-600 text-sm font-inter">{error}</p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setError('');
                      }}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-inter font-semibold text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddAddress}
                      disabled={saving}
                      className="flex-1 bg-forest text-white py-2 rounded-lg hover:bg-forest/90 transition-colors font-inter font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Add Address
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Address List */
              <div className="p-4">
                {loading ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest mx-auto mb-4"></div>
                    <p className="text-gray-600 font-inter">Loading addresses...</p>
                  </div>
                ) : filteredAddresses.length === 0 ? (
                  <div className="text-center py-6">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-inter">
                      {addresses.length === 0 ? 'No addresses found' : 'No addresses match your search'}
                    </p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="mt-4 bg-forest text-white px-4 py-2 rounded-lg hover:bg-forest/90 transition-colors font-inter font-semibold"
                    >
                      Add First Address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAddresses.map((address) => (
                      <button
                        key={address.id}
                        onClick={() => handleAddressSelect(address)}
                        className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-forest transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="flex items-center">
                                {address.is_primary ? (
                                  <Home className="h-4 w-4 text-forest mr-1" />
                                ) : (
                                  <Building className="h-4 w-4 text-gray-400 mr-1" />
                                )}
                                <h4 className="text-sm font-inter font-semibold text-dark-slate">
                                  {address.label}
                                </h4>
                              </div>
                              {address.is_primary && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-inter font-medium bg-forest text-white">
                                  Primary
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{getAddressDisplay(address)}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AddressSelector;