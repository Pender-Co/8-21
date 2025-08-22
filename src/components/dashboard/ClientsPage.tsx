import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AddClientPanel from './AddClientPanel';
import ViewClientModal from './ViewClientModal';
import EditClientModal from './EditClientModal';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  MoreHorizontal,
  CheckCircle,
  Clock,
  DollarSign,
  Star,
  Building,
  Home,
  Edit3,
  Eye,
  Trash2,
  MessageSquare,
  FileText,
  TrendingUp,
  Users,
  CreditCard
} from 'lucide-react';

interface ClientData {
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
  status: 'active' | 'prospect' | 'inactive';
  created_by: string;
  business_id: string;
  created_at: string;
  updated_at: string;
}

interface Client extends ClientData {
  name: string;
  address: string;
  phone: string;
  total_jobs: number;
  total_spent: number;
  last_job_date: string | null;
  next_scheduled: string | null;
  rating: number;
  preferred_contact: 'phone' | 'email' | 'text';
  service_frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'seasonal' | 'one-time';
}

const ClientsPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddClientPanel, setShowAddClientPanel] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { profile } = useAuth();

  // Fetch clients from Supabase
  const fetchClients = async () => {
    if (!profile?.business_id) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔵 Fetching clients for business_id:', profile.business_id);
      
      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .eq('business_id', profile.business_id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('🔴 Error fetching clients:', fetchError);
        throw fetchError;
      }

      console.log('🟢 Fetched clients:', data?.length || 0);
      
      // Transform the data to match the expected Client interface
      const transformedClients: Client[] = (data || []).map((clientData: ClientData) => ({
        ...clientData,
        name: clientData.business_name || 
              (clientData.first_name + (clientData.last_name ? ` ${clientData.last_name}` : '')),
        address: `${clientData.street_address}, ${clientData.city}`,
        phone: clientData.phone_number,
        // Mock data for fields not yet implemented
        total_jobs: 0,
        total_spent: 0,
        last_job_date: null,
        next_scheduled: null,
        rating: 0,
        preferred_contact: 'phone' as const,
        service_frequency: 'monthly' as const
      }));

      setClients(transformedClients);
    } catch (error: any) {
      console.error('🔴 Error fetching clients:', error);
      setError(error.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  // Fetch clients when component mounts or business_id changes
  React.useEffect(() => {
    if (profile?.business_id) {
      fetchClients();
    }
  }, [profile?.business_id]);

  const clientTypes = ['All Types', 'Residential', 'Commercial'];
  const statusOptions = ['All Status', 'Active', 'Inactive', 'Prospect'];

  const tabs = useMemo(() => [
    { id: 'all', label: 'All Clients', count: clients.length },
    { id: 'active', label: 'Active', count: clients.filter(c => c.status === 'active').length },
    { id: 'prospect', label: 'Prospects', count: clients.filter(c => c.status === 'prospect').length },
    { id: 'inactive', label: 'Inactive', count: clients.filter(c => c.status === 'inactive').length }
  ], [clients]);

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesTab = activeTab === 'all' || client.status === activeTab;
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           client.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.phone.includes(searchTerm);
      const matchesType = selectedType === 'all' || client.client_type === selectedType.toLowerCase();
      const matchesStatus = selectedStatus === 'all' || client.status === selectedStatus.toLowerCase();
      
      return matchesTab && matchesSearch && matchesType && matchesStatus;
    });
  }, [clients, activeTab, searchTerm, selectedType, selectedStatus]);

  const summaryStats = useMemo(() => {
    const activeClients = clients.filter(c => c.status === 'active').length;
    const prospectClients = clients.filter(c => c.status === 'prospect').length;
    const totalRevenue = clients.reduce((sum, client) => sum + client.total_spent, 0);
    const avgClientValue = clients.length > 0 ? totalRevenue / clients.length : 0;

    return {
      activeClients,
      prospectClients,
      totalRevenue: totalRevenue.toFixed(0),
      avgClientValue: avgClientValue.toFixed(0)
    };
  }, [clients]);

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

  const getClientTypeIcon = (type: string) => {
    return type === 'commercial' ? Building : Home;
  };

  const getClientTypeColor = (type: string) => {
    return type === 'commercial' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800';
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setShowViewModal(true);
    setDropdownOpen(null);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setShowEditModal(true);
    setDropdownOpen(null);
  };

  const handleDeleteClient = async (client: Client) => {
    if (!confirm(`Are you sure you want to delete ${client.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id);

      if (error) throw error;

      // Refresh the client list
      fetchClients();
      setDropdownOpen(null);
    } catch (error: any) {
      console.error('Error deleting client:', error);
      alert('Failed to delete client. Please try again.');
    }
  };

  const handleContactClient = (client: Client) => {
    // Open default email client
    if (client.email) {
      window.location.href = `mailto:${client.email}?subject=Regarding your service with our company`;
    } else {
      // Fallback to phone if no email
      window.location.href = `tel:${client.phone}`;
    }
    setDropdownOpen(null);
  };

  const handleStatusChange = async (client: Client, newStatus: 'active' | 'prospect' | 'inactive') => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ status: newStatus })
        .eq('id', client.id);

      if (error) throw error;

      // Refresh the client list
      fetchClients();
      setDropdownOpen(null);
    } catch (error: any) {
      console.error('Error updating client status:', error);
      alert('Failed to update client status. Please try again.');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'weekly':
        return 'bg-green-100 text-green-800';
      case 'bi-weekly':
        return 'bg-blue-100 text-blue-800';
      case 'monthly':
        return 'bg-yellow-100 text-yellow-800';
      case 'seasonal':
        return 'bg-orange-100 text-orange-800';
      case 'one-time':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-dm-sans font-bold text-dark-slate">
            Client Management
          </h1>
          <p className="text-gray-600 font-inter mt-1">
            Manage your client relationships and service history
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 font-inter font-semibold flex items-center justify-center">
            <FileText className="mr-2 h-4 w-4" />
            Export
          </button>
          <button 
            onClick={() => setShowAddClientPanel(true)}
            className="bg-forest text-white px-6 py-3 rounded-lg hover:bg-forest/90 transition-all duration-200 font-inter font-semibold flex items-center justify-center group"
          >
            <Plus className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Add Client
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter font-medium text-gray-600">Active Clients</p>
              <p className="text-2xl font-dm-sans font-bold text-dark-slate mt-1">
                {summaryStats.activeClients}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-dm-sans font-bold text-dark-slate mt-1">
                ${summaryStats.totalRevenue}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter font-medium text-gray-600">Prospect Clients</p>
              <p className="text-2xl font-dm-sans font-bold text-dark-slate mt-1">
                {summaryStats.prospectClients}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter font-medium text-gray-600">Avg Client Value</p>
              <p className="text-2xl font-dm-sans font-bold text-dark-slate mt-1">
                ${summaryStats.avgClientValue}
              </p>
            </div>
            <div className="bg-forest p-3 rounded-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients by name, email, phone, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent text-sm font-inter"
            />
          </div>

          {/* Client Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent text-sm font-inter"
          >
            {clientTypes.map((type) => (
              <option key={type} value={type === 'All Types' ? 'all' : type.toLowerCase()}>
                {type}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent text-sm font-inter"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status === 'All Status' ? 'all' : status.toLowerCase()}>
                {status}
              </option>
            ))}
          </select>

          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-inter font-medium">
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-inter font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-forest text-forest'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Clients List */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest mx-auto mb-4"></div>
              <p className="text-gray-600 font-inter">Loading clients...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <User className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-red-600 font-inter mb-4">{error}</p>
              <button
                onClick={fetchClients}
                className="bg-forest text-white px-4 py-2 rounded-lg hover:bg-forest/90 transition-colors font-inter font-semibold"
              >
                Try Again
              </button>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-inter">
                {clients.length === 0 ? 'No clients yet' : 'No clients found'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {clients.length === 0 
                  ? 'Add your first client to get started'
                  : 'Try adjusting your filters or add a new client'
                }
              </p>
              {clients.length === 0 && (
                <button
                  onClick={() => setShowAddClientPanel(true)}
                  className="mt-4 bg-forest text-white px-6 py-3 rounded-lg hover:bg-forest/90 transition-colors font-inter font-semibold"
                >
                  Add First Client
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClients.map((client) => {
                const ClientTypeIcon = getClientTypeIcon(client.client_type);
                return (
                  <div key={client.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="bg-forest p-3 rounded-lg">
                          <ClientTypeIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-dm-sans font-semibold text-dark-slate">
                              {client.name}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-inter font-medium ${getStatusColor(client.status)}`}>
                              {client.status}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-inter font-medium ${getClientTypeColor(client.client_type)}`}>
                              {client.client_type}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-inter font-medium ${getFrequencyColor(client.service_frequency)}`}>
                              {client.service_frequency.replace('-', ' ')}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2" />
                              <span className="truncate">{client.email || 'No email'}</span>
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2" />
                              <span>{client.phone}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span className="truncate">{client.address}, {client.city}</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-2" />
                              <span>${client.total_spent} ({client.total_jobs} jobs completed)</span>
                            </div>
                          </div>

                          {client.rating > 0 ? (
                            <div className="mb-3">
                              {renderStars(client.rating)}
                            </div>
                          ) : (
                            <div className="mb-3">
                              <span className="text-sm text-gray-500 font-inter">No rating yet</span>
                            </div>
                          )}

                          {client.notes && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                              <p className="text-sm text-blue-800 font-inter">
                                <strong>Notes:</strong> {client.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewClient(client)}
                          title="View client details"
                          className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditClient(client)}
                          title="Edit client"
                          className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <div className="relative">
                          <button 
                            onClick={() => setDropdownOpen(dropdownOpen === client.id ? null : client.id)}
                            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                            title="More options"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {/* Dropdown Menu */}
                          {dropdownOpen === client.id && (
                            <>
                              {/* Backdrop */}
                              <div 
                                className="fixed inset-0 z-10"
                                onClick={() => setDropdownOpen(null)}
                              />
                              
                              {/* Dropdown Content */}
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-2">
                                <button
                                  onClick={() => handleContactClient(client)}
                                  className="w-full px-4 py-2 text-left text-sm font-inter text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                                >
                                  <MessageSquare className="h-4 w-4 mr-3" />
                                  Contact Client
                                </button>
                                
                                <button
                                  onClick={() => {
                                    // TODO: Implement convert to client functionality
                                    console.log('Convert to client:', client.name);
                                    setDropdownOpen(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm font-inter text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                                >
                                  <CheckCircle className="h-4 w-4 mr-3" />
                                  {client.status === 'prospect' ? 'Convert to Active' : 
                                   client.status === 'inactive' ? 'Reactivate Client' : 'Mark as Inactive'}
                                </button>
                                
                                <button
                                  onClick={() => {
                                    // TODO: Implement schedule job functionality  
                                    console.log('Schedule job for:', client.name);
                                    setDropdownOpen(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm font-inter text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                                >
                                  <Calendar className="h-4 w-4 mr-3" />
                                  Schedule Job
                                </button>
                                
                                <button
                                  onClick={() => {
                                    // TODO: Implement create invoice functionality
                                    console.log('Create invoice for:', client.name);
                                    setDropdownOpen(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm font-inter text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                                >
                                  <FileText className="h-4 w-4 mr-3" />
                                  Create Invoice
                                </button>
                                
                                <hr className="my-1 border-gray-200" />
                                
                                <button
                                  onClick={() => handleDeleteClient(client)}
                                  className="w-full px-4 py-2 text-left text-sm font-inter text-red-600 hover:bg-red-50 flex items-center transition-colors"
                                >
                                  <Trash2 className="h-4 w-4 mr-3" />
                                  Delete Client
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Last job: {client.last_job_date ? formatDate(client.last_job_date) : 'No jobs yet'}</span>
                        </div>
                        {client.next_scheduled && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Next: {formatDate(client.next_scheduled)}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span>Contact: {client.preferred_contact}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {client.status === 'prospect' && (
                          <button className="bg-forest text-white px-4 py-2 rounded-lg hover:bg-forest/90 transition-colors font-inter font-semibold text-sm">
                            Convert to Client
                          </button>
                        )}
                        {client.status === 'inactive' && (
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-inter font-semibold text-sm">
                            Reactivate Client
                          </button>
                        )}
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-inter font-semibold text-sm">
                          Schedule Job
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-inter font-semibold text-sm flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contact
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Client Panel */}
      <AddClientPanel
        isOpen={showAddClientPanel}
        onClose={() => setShowAddClientPanel(false)}
        onClientAdded={() => {
          // Refresh the client list when a new client is added
          fetchClients();
        }}
      />

      {/* View Client Modal */}
      {showViewModal && selectedClient && (
        <ViewClientModal
          client={selectedClient}
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedClient(null);
          }}
        />
      )}

      {/* Edit Client Modal */}
      {showEditModal && selectedClient && (
        <EditClientModal
          client={selectedClient}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedClient(null);
          }}
          onClientUpdated={() => {
            fetchClients();
            setShowEditModal(false);
            setSelectedClient(null);
          }}
        />
      )}
    </div>
  );
};

export default ClientsPage;