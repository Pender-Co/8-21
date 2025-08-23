import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Search, 
  Plus, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Edit3,
  FileText,
  Calendar,
  Clock,
  AlertCircle,
  X,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AddClientPanel from './AddClientPanel';
import AddressSelector from './AddressSelector';
import SchedulingSection from './SchedulingSection';
import ServiceItemsSection from './ServiceItemsSection';
import InternalNotesSection from './InternalNotesSection';

interface Client {
  id: string;
  first_name: string;
  last_name: string | null;
  business_name: string | null;
  email: string | null;
  phone_number: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  client_type: 'residential' | 'commercial' | 'municipal' | 'other';
  status: 'active' | 'prospect' | 'inactive';
}

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

interface JobFormData {
  title: string;
  description: string;
  clientId: string;
  selectedAddress: Address | null;
  jobType: 'one-off' | 'recurring';
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  durationUnit: 'days' | 'weeks' | 'months' | 'years';
  repeatType: 'as-needed' | 'weekly' | 'monthly' | 'custom';
  weeklyDay: string;
  monthlyDate: number;
  scheduleNow: boolean;
  remindToInvoice: boolean;
  billingMethod: 'per-visit' | 'fixed-price';
  invoiceTiming: string;
  useChecklist: 'yes' | 'no';
  serviceItems: ServiceItem[];
  internalNotes: string;
  attachedFiles: UploadedFile[];
}

interface ServiceItem {
  id: string;
  itemName: string;
  quantity: number;
  unitCost: number | null;
  unitPrice: number;
  description: string;
  total: number;
  sortOrder: number;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  localUrl: string;
  supabaseUrl?: string;
  rawFile?: File;
  uploadedAt: Date;
}

const CreateJobPage = () => {
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    clientId: '',
    selectedAddress: null,
    jobType: 'one-off',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    duration: 1,
    durationUnit: 'weeks',
    repeatType: 'weekly',
    weeklyDay: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    monthlyDate: new Date().getDate(),
    scheduleNow: true,
    remindToInvoice: false,
    billingMethod: 'per-visit',
    invoiceTiming: '',
    useChecklist: 'no',
    serviceItems: [],
    internalNotes: '',
    attachedFiles: []
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [showAddClientPanel, setShowAddClientPanel] = useState(false);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientsLoading, setClientsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Track form changes to detect unsaved changes
  useEffect(() => {
    const hasChanges = 
      formData.title.trim() !== '' ||
      formData.description.trim() !== '' ||
      formData.clientId !== '' ||
      formData.serviceItems.length > 0 ||
      formData.internalNotes.trim() !== '' ||
      formData.attachedFiles.length > 0;
    
    setHasUnsavedChanges(hasChanges);
  }, [formData]);

  // Intercept navigation attempts
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        setShowUnsavedWarning(true);
        setPendingNavigation('back');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges]);

  // Override navigation links to show warning
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      if (!hasUnsavedChanges) return;

      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href && !link.href.includes(location.pathname)) {
        e.preventDefault();
        setShowUnsavedWarning(true);
        setPendingNavigation(link.href);
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, [hasUnsavedChanges, location.pathname]);

  // Fetch clients when component mounts
  useEffect(() => {
    if (profile?.business_id) {
      fetchClients();
    }
  }, [profile?.business_id]);

  // Filter clients based on search term
  useEffect(() => {
    if (clientSearchTerm.trim() === '') {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client => {
        const name = client.business_name || `${client.first_name} ${client.last_name || ''}`.trim();
        return name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
               client.email?.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
               client.phone_number.includes(clientSearchTerm);
      });
      setFilteredClients(filtered);
    }
  }, [clients, clientSearchTerm]);

  const fetchClients = async () => {
    if (!profile?.business_id) return;

    setClientsLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('business_id', profile.business_id)
        .in('status', ['active', 'prospect', 'inactive']) // Show all clients including inactive
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
      setFilteredClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setClientsLoading(false);
    }
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setFormData(prev => ({ 
      ...prev, 
      clientId: client.id,
      selectedAddress: null // Reset address when client changes
    }));
    setShowClientSelector(false);
    setClientSearchTerm('');
    
    // Auto-select primary address or create default address
    autoSelectPrimaryAddress(client);
  };

  const autoSelectPrimaryAddress = async (client: Client) => {
    if (!profile?.business_id) return;

    try {
      // Try to find existing addresses for this client
      const { data: addresses, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('client_id', client.id)
        .eq('business_id', profile.business_id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (addresses && addresses.length > 0) {
        // Use existing primary address or first address
        const primaryAddress = addresses.find(addr => addr.is_primary) || addresses[0];
        setFormData(prev => ({ ...prev, selectedAddress: primaryAddress }));
      } else {
        // Create primary address from client data
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

        const { data: newAddress, error: insertError } = await supabase
          .from('addresses')
          .insert(primaryAddress)
          .select()
          .single();

        if (insertError) throw insertError;
        setFormData(prev => ({ ...prev, selectedAddress: newAddress }));
      }
    } catch (error) {
      console.error('Error handling address selection:', error);
    }
  };

  const handleClientAdded = () => {
    // Refresh clients list and close the add client panel
    fetchClients();
    setShowAddClientPanel(false);
  };

  const handleAddressSelected = (address: Address) => {
    setFormData(prev => ({ ...prev, selectedAddress: address }));
  };

  const handleSchedulingChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceItemsChange = (items: ServiceItem[]) => {
    setFormData(prev => ({ ...prev, serviceItems: items }));
  };

  const handleInternalNotesChange = (notes: string) => {
    setFormData(prev => ({ ...prev, internalNotes: notes }));
  };

  const handleAttachedFilesChange = (files: UploadedFile[]) => {
    setFormData(prev => ({ ...prev, attachedFiles: files }));
  };

  const handleInputChange = (field: keyof JobFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.title.trim()) {
      errors.push('Job title is required');
    }
    
    if (!formData.clientId) {
      errors.push('Client selection is required');
    }
    
    if (!formData.description.trim()) {
      errors.push('Job instructions are required');
    }
    
    return errors;
  };

  const handleSave = async () => {
    if (!user || !profile?.business_id) {
      setError('Unable to create job. Please try again.');
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
      // Upload files to Supabase Storage first
      const finalAttachments = [];
      
      for (const file of formData.attachedFiles) {
        if (file.rawFile) {
          // This is a new file that needs to be uploaded
          try {
            // Generate unique file path
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            const filePath = `jobs/${fileName}`;

            console.log('🔵 Uploading file to Supabase Storage:', filePath);

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
              .from('job-attachments')
              .upload(filePath, file.rawFile);

            if (uploadError) {
              console.error('🔴 File upload error:', uploadError);
              throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('job-attachments')
              .getPublicUrl(filePath);

            console.log('🟢 File uploaded successfully:', publicUrl);

            // Add to final attachments
            finalAttachments.push({
              id: file.id,
              name: file.name,
              size: file.size,
              type: file.type,
              url: publicUrl,
              uploadedAt: file.uploadedAt.toISOString()
            });
          } catch (uploadError) {
            console.error('🔴 Error uploading file:', uploadError);
            setError(`Failed to upload ${file.name}. Please try again.`);
            setLoading(false);
            return;
          }
        } else if (file.supabaseUrl) {
          // This is an existing file that was already uploaded
          finalAttachments.push({
            id: file.id,
            name: file.name,
            size: file.size,
            type: file.type,
            url: file.supabaseUrl,
            uploadedAt: file.uploadedAt.toISOString()
          });
        }
      }

      // Calculate estimated cost from service items
      const estimatedCost = formData.serviceItems.reduce((sum, item) => sum + item.total, 0);
      
      // Build base job data
      let jobData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        client_id: formData.clientId,
        business_id: profile.business_id,
        created_by: user.id,
        status: 'scheduled',
        estimated_cost: estimatedCost,
        notes: formData.internalNotes.trim() || null,
        attachments: finalAttachments,
        priority: 'medium', // Default priority
        estimated_duration: 0 // Default duration
      };

      // Add scheduling data if job is scheduled now
      if (formData.scheduleNow && formData.startDate) {
        jobData.scheduled_date = formData.startDate;
        if (formData.startTime) {
          jobData.scheduled_time = formData.startTime;
        }
      }

      // Add recurring job data if applicable
      if (formData.jobType === 'recurring') {
        jobData.is_recurring = true;
        
        // Build recurrence pattern object
        const recurrencePattern = {
          repeatType: formData.repeatType,
          duration: formData.duration,
          durationUnit: formData.durationUnit
        };

        // Add specific pattern data based on repeat type
        if (formData.repeatType === 'weekly') {
          recurrencePattern.weeklyDay = formData.weeklyDay;
        } else if (formData.repeatType === 'monthly') {
          recurrencePattern.monthlyDate = formData.monthlyDate;
        }

        // Add time information if provided
        if (formData.startTime) {
          recurrencePattern.startTime = formData.startTime;
        }
        if (formData.endTime) {
          recurrencePattern.endTime = formData.endTime;
        }

        jobData.recurrence_pattern = recurrencePattern;
      } else {
        // For one-off jobs, ensure recurring fields are explicitly set to false/null
        jobData.is_recurring = false;
        jobData.recurrence_pattern = null;
      }

      console.log('🔵 Creating job with detailed data:');
      console.log('📋 Full jobData object:', JSON.stringify(jobData, null, 2));
      console.log('🔄 Is recurring:', jobData.is_recurring);
      console.log('📅 Recurrence pattern:', JSON.stringify(jobData.recurrence_pattern, null, 2));
      console.log('👤 User ID:', user.id);
      console.log('🏢 Business ID:', profile.business_id);

      const { data, error: insertError } = await supabase
        .from('jobs')
        .insert(jobData)
        .select()
        .single();

      if (insertError) {
        console.error('🔴 Detailed error creating job:');
        console.error('❌ Error object:', JSON.stringify(insertError, null, 2));
        console.error('💾 Data that failed:', JSON.stringify(jobData, null, 2));
        console.error('📝 Error message:', insertError.message);
        console.error('🔍 Error details:', insertError.details);
        console.error('💡 Error hint:', insertError.hint);
        console.error('🏷️ Error code:', insertError.code);
        throw insertError;
      }

      console.log('🟢 Job created successfully:', data);

      // Insert service items if any exist
      if (formData.serviceItems.length > 0) {
        const serviceItemsData = formData.serviceItems.map((item, index) => ({
          job_id: data.id,
          business_id: profile.business_id,
          item_name: item.itemName.trim(),
          quantity: item.quantity,
          unit_cost: item.unitCost,
          unit_price: item.unitPrice,
          description: item.description.trim() || null,
          sort_order: index
        }));

        console.log('🔵 Creating service items:', serviceItemsData);

        const { error: serviceItemsError } = await supabase
          .from('job_service_items')
          .insert(serviceItemsData);

        if (serviceItemsError) {
          console.error('🔴 Error creating service items:', serviceItemsError);
          throw serviceItemsError;
        }

        console.log('🟢 Service items created successfully');
      }

      // Clear unsaved changes flag
      setHasUnsavedChanges(false);
      
      // Navigate back to jobs page
      navigate('/jobs');

    } catch (error: any) {
      console.error('🔴 Error creating job:', error);
      setError(error.message || 'Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscardChanges = () => {
    setHasUnsavedChanges(false);
    setShowUnsavedWarning(false);
    
    if (pendingNavigation) {
      if (pendingNavigation === 'back') {
        navigate(-1);
      } else {
        window.location.href = pendingNavigation;
      }
      setPendingNavigation(null);
    }
  };

  const handleCancelNavigation = () => {
    setShowUnsavedWarning(false);
    setPendingNavigation(null);
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true);
      setPendingNavigation('back');
    } else {
      navigate('/jobs');
    }
  };

  const handleCancelClick = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true);
      setPendingNavigation('/jobs');
    } else {
      navigate('/jobs');
    }
  };

  const getClientDisplayName = (client: Client) => {
    return client.business_name || `${client.first_name} ${client.last_name || ''}`.trim();
  };

  const getAddressDisplay = (address: Address) => {
    return `${address.street_address}, ${address.city}, ${address.state} ${address.zip_code}`;
  };

  return (
    <>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackClick}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 flex-shrink-0"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-dm-sans font-bold text-dark-slate">
                Create New Job
              </h1>
              <p className="text-gray-600 font-inter mt-1">
                Set up a new service job for your client
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              onClick={handleCancelClick}
              className="border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-all duration-200 font-inter font-semibold text-sm sm:text-base sm:px-6 sm:py-3"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-forest text-white px-4 py-2.5 rounded-lg hover:bg-forest/90 transition-all duration-200 font-inter font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base sm:px-6 sm:py-3 shadow-sm hover:shadow-md"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Job
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* LEFT SIDE: Job Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Job Details */}
            <div>
            {/* Job Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
            <h2 className="text-lg font-dm-sans font-bold text-dark-slate mb-4 sm:mb-6 flex items-center">
              <FileText className="h-6 w-6 text-forest mr-2" />
              Job Details
            </h2>

            <div className="space-y-4 sm:space-y-5">
              {/* Client Name Selector */}
              <div>
                <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                  Client *
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowClientSelector(true)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter text-left bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {selectedClient ? (
                      <div className="flex items-center justify-between">
                        <span className="text-dark-slate">{getClientDisplayName(selectedClient)}</span>
                        <Edit3 className="h-4 w-4 text-gray-400 hover:text-forest transition-colors" />
                      </div>
                    ) : (
                      <span className="text-gray-500">Select a client...</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter transition-all duration-200 hover:border-gray-400"
                  placeholder="e.g., Weekly Lawn Maintenance, Spring Cleanup"
                  required
                />
              </div>

              {/* Job Instructions */}
              <div>
                <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                  Job Instructions *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter resize-none transition-all duration-200 hover:border-gray-400"
                  placeholder="Describe the work to be performed, special requirements, equipment needed, etc."
                  rows={4}
                  required
                />
              </div>

              {/* Optional Fields */}
            </div>
            </div>
            </div>

            {/* Client Property Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
            <h2 className="text-lg font-dm-sans font-bold text-dark-slate mb-4 sm:mb-6 flex items-center">
              <User className="h-6 w-6 text-forest mr-2" />
              Client Property Info
            </h2>

            {selectedClient ? (
              <div className="space-y-4 sm:space-y-5">
                {/* Client Name */}
                <div>
                  <h3 className="text-base font-dm-sans font-semibold text-dark-slate mb-2">
                    {getClientDisplayName(selectedClient)}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-inter font-medium ${
                    selectedClient.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedClient.status === 'prospect' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedClient.status.charAt(0).toUpperCase() + selectedClient.status.slice(1)}
                  </span>
                </div>

                {/* Property Address */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-inter font-semibold text-dark-slate">Property Address</h4>
                    <button 
                      onClick={() => setShowAddressSelector(true)}
                      className="text-forest hover:text-forest/80 text-sm font-inter font-medium transition-colors duration-200 hover:underline"
                    >
                      Change
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        {formData.selectedAddress ? (
                          <div>
                            <p className="text-dark-slate font-inter">
                              {getAddressDisplay(formData.selectedAddress)}
                            </p>
                            {formData.selectedAddress.label !== 'Primary Address' && (
                              <p className="text-xs text-gray-500 mt-1">
                                {formData.selectedAddress.label}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 font-inter">
                            Loading address...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div>
                  <h4 className="text-xs font-inter font-semibold text-dark-slate mb-3">Contact Details</h4>
                  <div className="space-y-2 sm:space-y-3">
                    {selectedClient.email && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-xs font-inter font-medium text-gray-600">Email</p>
                            <p className="text-dark-slate font-inter">{selectedClient.email}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-xs font-inter font-medium text-gray-600">Phone</p>
                          <p className="text-dark-slate font-inter">{selectedClient.phone_number}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Type */}
                <div>
                  <h4 className="text-xs font-inter font-semibold text-dark-slate mb-3">Client Type</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-inter font-medium ${
                      selectedClient.client_type === 'commercial' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedClient.client_type.charAt(0).toUpperCase() + selectedClient.client_type.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-inter">Select a client to view property information</p>
              </div>
            )}
          </div>
          </div>

          {/* Full Width Scheduling Section */}
          <SchedulingSection
            formData={formData}
            onChange={handleSchedulingChange}
          />
        </div>
          {/* Invoicing and Service Checklist Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Invoicing Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
              <h2 className="text-lg font-dm-sans font-bold text-dark-slate mb-4 sm:mb-6 flex items-center">
                <FileText className="h-6 w-6 text-forest mr-2" />
                Invoicing
              </h2>

              {formData.jobType === 'one-off' ? (
                /* One-off Job Invoicing */
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.remindToInvoice || false}
                      onChange={(e) => handleSchedulingChange('remindToInvoice', e.target.checked)}
                      className="mr-3 text-forest focus:ring-forest focus:ring-offset-2 border-gray-300 rounded transition-all duration-200"
                    />
                    <span className="font-inter text-dark-slate text-sm sm:text-base">
                      Remind me to invoice when the job is closed
                    </span>
                  </label>
                </div>
              ) : (
                /* Recurring Job Invoicing */
                <div className="space-y-4 sm:space-y-6">
                  {/* Billing Method */}
                  <div>
                    <label className="block text-sm font-inter font-medium text-dark-slate mb-3">
                      How would you like to bill for this job?
                    </label>
                    <div className="space-y-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="flex items-center cursor-pointer hover:bg-white rounded-lg p-2 transition-colors duration-200">
                        <input
                          type="radio"
                          name="billingMethod"
                          value="per-visit"
                          checked={formData.billingMethod === 'per-visit'}
                          onChange={(e) => handleSchedulingChange('billingMethod', e.target.value)}
                          className="mr-3 text-forest focus:ring-forest focus:ring-offset-2 border-gray-300 transition-all duration-200"
                        />
                        <span className="font-inter text-dark-slate text-sm sm:text-base">Per visit</span>
                      </label>
                      <label className="flex items-center cursor-pointer hover:bg-white rounded-lg p-2 transition-colors duration-200">
                        <input
                          type="radio"
                          name="billingMethod"
                          value="fixed-price"
                          checked={formData.billingMethod === 'fixed-price'}
                          onChange={(e) => handleSchedulingChange('billingMethod', e.target.value)}
                          className="mr-3 text-forest focus:ring-forest focus:ring-offset-2 border-gray-300 transition-all duration-200"
                        />
                        <span className="font-inter text-dark-slate text-sm sm:text-base">Fixed price</span>
                      </label>
                    </div>
                  </div>

                  {/* Invoice Timing */}
                  <div>
                    <label className="block text-sm font-inter font-medium text-dark-slate mb-3">
                      When would you like to send the invoice?
                    </label>
                    <select
                      value={formData.invoiceTiming || ''}
                      onChange={(e) => handleSchedulingChange('invoiceTiming', e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter text-sm transition-all duration-200 hover:border-gray-400 bg-white"
                    >
                      <option value="">Select timing...</option>
                      <option value="monthly-last-day">Monthly on the last day of the month</option>
                      <option value="after-each-visit">After each visit is completed</option>
                      <option value="as-needed">As needed – no reminders</option>
                      <option value="job-closed">Once the job is closed</option>
                      <option value="custom">Custom schedule</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Service Checklist Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
              <h2 className="text-lg font-dm-sans font-bold text-dark-slate mb-4 sm:mb-6 flex items-center">
                <CheckCircle className="h-6 w-6 text-forest mr-2" />
                Service Checklist
              </h2>

              <div className="space-y-4 sm:space-y-5">
                <p className="text-sm font-inter font-medium text-dark-slate">
                  Would you like to create a checklist for workers to complete before closing the job?
                </p>
                
                <div className="space-y-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <label className="flex items-center cursor-pointer hover:bg-white rounded-lg p-2 transition-colors duration-200">
                    <input
                      type="radio"
                      name="useChecklist"
                      value="yes"
                      checked={formData.useChecklist === 'yes'}
                      onChange={(e) => handleSchedulingChange('useChecklist', e.target.value)}
                      className="mr-3 text-forest focus:ring-forest focus:ring-offset-2 border-gray-300 transition-all duration-200"
                    />
                    <span className="font-inter text-dark-slate text-sm sm:text-base">Yes, create a checklist</span>
                  </label>
                  <label className="flex items-center cursor-pointer hover:bg-white rounded-lg p-2 transition-colors duration-200">
                    <input
                      type="radio"
                      name="useChecklist"
                      value="no"
                      checked={formData.useChecklist === 'no'}
                      onChange={(e) => handleSchedulingChange('useChecklist', e.target.value)}
                      className="mr-3 text-forest focus:ring-forest focus:ring-offset-2 border-gray-300 transition-all duration-200"
                    />
                    <span className="font-inter text-dark-slate text-sm sm:text-base">No checklist needed</span>
                  </label>
                </div>

                {formData.useChecklist === 'yes' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-blue-800 font-inter font-medium text-sm">
                          Checklist Builder Coming Soon
                        </p>
                        <p className="text-blue-700 text-sm mt-1">
                          Custom checklist creation will be available in a future update. For now, workers will use standard completion procedures.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Service Items Section */}
          <ServiceItemsSection
            serviceItems={formData.serviceItems}
            onChange={handleServiceItemsChange}
          />

          {/* Internal Notes Section */}
          <InternalNotesSection
            notes={formData.internalNotes}
            files={formData.attachedFiles}
            onNotesChange={handleInternalNotesChange}
            onFilesChange={handleAttachedFilesChange}
          />

        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3 shadow-sm">
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

      {/* Client Selector Modal */}
      {showClientSelector && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setShowClientSelector(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
                <h3 className="text-xl font-dm-sans font-bold text-dark-slate">
                  Select Client
                </h3>
                <button
                  onClick={() => setShowClientSelector(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search and Create New */}
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search clients by name, email, or phone..."
                      value={clientSearchTerm}
                      onChange={(e) => setClientSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent text-sm font-inter transition-all duration-200 hover:border-gray-400"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setShowClientSelector(false);
                      setShowAddClientPanel(true);
                    }}
                    className="bg-forest text-white px-4 py-3 rounded-lg hover:bg-forest/90 transition-all duration-200 font-inter font-semibold text-sm flex items-center justify-center shadow-sm hover:shadow-md flex-shrink-0"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Client
                  </button>
                </div>
              </div>

              {/* Client List */}
              <div className="p-4 sm:p-6 overflow-y-auto max-h-96">
                {clientsLoading ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest mx-auto mb-4"></div>
                    <p className="text-gray-600 font-inter">Loading clients...</p>
                  </div>
                ) : filteredClients.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-inter">
                      {clients.length === 0 ? 'No clients found' : 'No clients match your search'}
                    </p>
                    <button
                      onClick={() => {
                        setShowClientSelector(false);
                        setShowAddClientPanel(true);
                      }}
                      className="mt-4 bg-forest text-white px-6 py-3 rounded-lg hover:bg-forest/90 transition-all duration-200 font-inter font-semibold shadow-sm hover:shadow-md"
                    >
                      Create First Client
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredClients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => handleClientSelect(client)}
                        className="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-forest transition-all duration-200 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-sm font-inter font-semibold text-dark-slate">
                                {getClientDisplayName(client)}
                              </h4>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-inter font-medium ${
                                client.status === 'active' ? 'bg-green-100 text-green-800' :
                                client.status === 'prospect' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {client.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">{client.street_address}, {client.city}, {client.state} {client.zip_code}</p>
                            <p className="text-xs text-gray-500">{client.phone_number}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Client Panel */}
      <AddClientPanel
        isOpen={showAddClientPanel}
        onClose={() => setShowAddClientPanel(false)}
        onClientAdded={handleClientAdded}
      />

      {/* Address Selector Modal */}
      {showAddressSelector && selectedClient && (
        <AddressSelector
          isOpen={showAddressSelector}
          onClose={() => setShowAddressSelector(false)}
          client={selectedClient}
          onAddressSelected={handleAddressSelected}
        />
      )}

      {/* Unsaved Changes Warning Modal */}
      {showUnsavedWarning && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-dm-sans font-bold text-dark-slate">
                    Unsaved Changes
                  </h2>
                </div>
                <button
                  onClick={handleCancelNavigation}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-gray-600 font-inter mb-4">
                  You have unsaved changes to this job. If you leave now, your changes will be lost.
                </p>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-inter font-semibold text-orange-800 mb-1">
                        Changes will be lost
                      </h3>
                      <p className="text-orange-700 text-sm">
                        Any job details, client information, service items, and notes you've entered will not be saved.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelNavigation}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 font-inter font-semibold shadow-sm hover:shadow-md"
                >
                  Stay on Page
                </button>
                <button
                  onClick={handleDiscardChanges}
                  className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-all duration-200 font-inter font-semibold shadow-sm hover:shadow-md"
                >
                  Discard Changes
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default CreateJobPage;