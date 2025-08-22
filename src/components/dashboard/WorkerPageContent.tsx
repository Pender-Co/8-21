import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import InviteWorkerModal from './InviteWorkerModal';
import ProfileAvatar from '../ProfileAvatar';
import WorkerDropdownMenu from './WorkerDropdownMenu';
import { 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Archive,
  User,
  Star,
  Send
} from 'lucide-react';

const WorkerPageContent = () => {
  const [activeTab, setActiveTab] = useState('crew');
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [invites, setInvites] = useState([]);
  const [crewMembers, setCrewMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inactiveWorkers, setInactiveWorkers] = useState([]);

  const { user, profile } = useAuth();

  // Fetch data when component mounts or tab changes
  React.useEffect(() => {
    if (profile?.business_id) {
      // Always fetch data for all tabs when profile is available
      fetchCrewMembers();
      fetchInactiveWorkers();
      fetchInvites();
    }
  }, [profile?.business_id]);

  // Also fetch data when tab changes (for refresh functionality)
  React.useEffect(() => {
    if (profile?.business_id) {
      if (activeTab === 'crew') {
        fetchCrewMembers();
      }
      if (activeTab === 'inactive') {
        fetchInactiveWorkers();
      }
      if (activeTab === 'pending') {
        fetchInvites();
      }
    }
  }, [activeTab]);

  // Add a manual refresh function
  const handleRefresh = () => {
    console.log('🔵 Manual refresh triggered');
    if (profile?.business_id) {
      console.log('🔵 Refreshing data for business_id:', profile.business_id);
      fetchCrewMembers();
      fetchInactiveWorkers();
      fetchInvites();
    } else {
      console.log('🔴 Cannot refresh - no business_id in profile');
    }
  };

  const fetchCrewMembers = async () => {
    console.log('🔵 fetchCrewMembers called with business_id:', profile?.business_id);
    if (!profile?.business_id) return;
    
    setLoading(true);
    try {
      console.log('🔵 Querying user_profiles for business_id:', profile.business_id);
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          phone_number,
          role,
          business_id,
          status,
          last_activity,
          created_at,
          updated_at
        `)
        .eq('business_id', profile.business_id)
        .neq('status', 'inactive')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('🔵 Query result - found users:', data?.length || 0);
      console.log('🔵 Users data:', data);
      setCrewMembers(data || []);
    } catch (error) {
      console.error('🔴 Error fetching crew members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInactiveWorkers = async () => {
    console.log('🔵 fetchInactiveWorkers called with business_id:', profile?.business_id);
    if (!profile?.business_id) return;
    
    setLoading(true);
    try {
      console.log('🔵 Querying inactive user_profiles for business_id:', profile.business_id);
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          phone_number,
          role,
          business_id,
          status,
          last_activity,
          created_at,
          updated_at
        `)
        .eq('business_id', profile.business_id)
        .eq('status', 'inactive')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      console.log('🔵 Query result - found inactive users:', data?.length || 0);
      console.log('🔵 Inactive users data:', data);
      setInactiveWorkers(data || []);
    } catch (error) {
      console.error('🔴 Error fetching inactive workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvites = async () => {
    if (!profile?.business_id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_invites')
        .select(`
          id,
          email,
          phone_number,
          name,
          role,
          company_name,
          status,
          token,
          expires_at,
          accepted_at,
          created_at,
          updated_at
        `)
        .eq('business_id', profile.business_id)
        .in('status', ['pending', 'accepted'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter for pending invites that haven't expired
      const pendingInvites = (data || []).filter(invite => 
        invite.status === 'pending' && new Date(invite.expires_at) > new Date()
      );
      
      setInvites(pendingInvites);
    } catch (error) {
      console.error('🔴 Error fetching invites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteSent = () => {
    // Refresh both crew and invites when a new invite is sent
    fetchCrewMembers();
    fetchInactiveWorkers();
    fetchInvites();
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('user_invites')
        .update({ status: 'revoked' })
        .eq('id', inviteId);

      if (error) throw error;
      fetchInvites();
    } catch (error) {
      console.error('Error revoking invite:', error);
    }
  };

  const handleResendInvite = async (invite: any) => {
    try {
      // Generate new token and reset expiration
      const { data: updatedInvite, error: updateError } = await supabase
        .from('user_invites')
        .update({ 
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', invite.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Resend email via Supabase Edge Function
      const { error: emailError } = await supabase.functions.invoke('send-invite', {
        body: {
          email: invite.email,
          name: invite.name || invite.email.split('@')[0],
          role: invite.role,
          companyName: invite.company_name,
          token: updatedInvite.token
        }
      });

      if (emailError) {
        console.error('Email sending error:', emailError);
        // Still refresh the list even if email fails
      }

      fetchInvites();
    } catch (error) {
      console.error('Error resending invite:', error);
    }
  };

  const archivedWorkers = useMemo(() => [
    {
      id: 8,
      name: 'Robert Taylor',
      email: 'robert.taylor@email.com',
      phone: '(555) 890-1234',
      role: 'Former Lead Tech',
      joinDate: '2022-06-15',
      leftDate: '2023-11-30',
      reason: 'Relocated',
      completedJobs: 245,
      rating: 4.5,
      avatar: 'RT'
    },
    {
      id: 9,
      name: 'Jennifer White',
      email: 'jennifer.white@email.com',
      phone: '(555) 901-2345',
      role: 'Former Landscaper',
      joinDate: '2022-03-20',
      leftDate: '2023-09-15',
      reason: 'Career Change',
      completedJobs: 178,
      rating: 4.3,
      avatar: 'JW'
    }
  ], []);

  // Memoize utility functions
  const getStatusColor = useMemo(() => (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'on_break':
        return 'bg-yellow-100 text-yellow-800';
      case 'off':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getStatusIcon = useMemo(() => (status: string) => {
    switch (status) {
      case 'active':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'on_break':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      case 'off':
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
    }
  }, []);

  const tabs = useMemo(() => [
    { id: 'crew', label: 'Crew', count: crewMembers.length },
    { id: 'inactive', label: 'Inactive Workers', count: inactiveWorkers.length },
    { id: 'pending', label: 'Pending Invites', count: invites.length }
  ], [crewMembers.length, inactiveWorkers.length, invites.length, archivedWorkers.length]);

  // Memoize search handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Memoize tab change handler
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  // Helper function to get user initials
  const getInitials = (firstName: string | null, lastName: string | null, email: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  // Helper function to get display name
  const getDisplayName = (firstName: string | null, lastName: string | null, email: string) => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return email.split('@')[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-dm-sans font-bold text-dark-slate">
            Team Management
          </h1>
          <p className="text-gray-600 font-inter mt-1">
            Manage your crew members, invites, and worker records
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 font-inter font-semibold flex items-center justify-center"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={() => setInviteModalOpen(true)}
            className="bg-forest text-white px-6 py-3 rounded-lg hover:bg-forest/90 transition-all duration-200 font-inter font-semibold flex items-center justify-center group"
          >
            <UserPlus className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Add to Crew
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter font-medium text-gray-600">Crew Members</p>
              <p className="text-2xl font-dm-sans font-bold text-dark-slate mt-1">{crewMembers.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <User className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter font-medium text-gray-600">Pending Invites</p>
              <p className="text-2xl font-dm-sans font-bold text-dark-slate mt-1">{invites.length}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Send className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter font-medium text-gray-600">Inactive Workers</p>
              <p className="text-2xl font-dm-sans font-bold text-dark-slate mt-1">{inactiveWorkers.length}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search workers by name, email, or role..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent text-sm font-inter"
            />
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-inter font-medium">
            <Filter className="mr-2 h-4 w-4" />
            Filter
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
                onClick={() => handleTabChange(tab.id)}
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

        {/* Tab Content */}
        <div className="p-6">
          {/* Crew Tab */}
          {activeTab === 'crew' && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest mx-auto mb-4"></div>
                  <p className="text-gray-600 font-inter">Loading crew members...</p>
                </div>
              ) : crewMembers.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-inter">No crew members yet</p>
                  <button
                    onClick={() => setInviteModalOpen(true)}
                    className="mt-4 bg-forest text-white px-4 py-2 rounded-lg hover:bg-forest/90 transition-colors font-inter font-semibold"
                  >
                    Invite First Member
                  </button>
                </div>
              ) : (
                crewMembers.map((member) => (
                <div key={member.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {member.avatar_url ? (
                        <ProfileAvatar 
                          filePath={member.avatar_url} 
                          alt={`${getDisplayName(member.first_name, member.last_name, member.email)}'s profile`}
                          className="w-12 h-12 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-forest rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold">
                            {getInitials(member.first_name, member.last_name, member.email)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-dm-sans font-semibold text-dark-slate">
                            {getDisplayName(member.first_name, member.last_name, member.email)}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-inter font-medium ${getStatusColor(member.status || 'off')}`}>
                            {getStatusIcon(member.status || 'off')}
                            <span className="ml-1 capitalize">
                              {member.status === 'on_break' ? 'On Break' : 
                               member.status === 'active' ? 'Active' : 'Off'}
                            </span>
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-inter font-medium ${
                            member.role === 'admin' ? 'bg-red-100 text-red-800' : 
                            member.role === 'manager' ? 'bg-purple-100 text-purple-800' : 
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {member.role === 'admin' ? 'Admin' : 
                             member.role === 'manager' ? 'Manager' : 'Worker'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            <span className="truncate">{member.email}</span>
                          </div>
                          {member.phone_number && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2" />
                              <span>{member.phone_number}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Joined {new Date(member.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        {/* Display full name and role prominently */}
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 font-medium">Full Name:</span>
                              <span className="ml-2 text-dark-slate">
                                {member.first_name && member.last_name 
                                  ? `${member.first_name} ${member.last_name}`
                                  : 'Not provided'
                                }
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 font-medium">Role:</span>
                              <span className="ml-2 text-dark-slate capitalize">{member.role}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 font-medium">Last Activity:</span>
                              <span className="ml-2 text-dark-slate">
                                {member.last_activity ? new Date(member.last_activity).toLocaleString() : 'Never'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Last updated */}
                        <div className="mt-2">
                          <div className="text-right text-sm">
                            <span className="text-gray-500">
                              Last updated: {new Date(member.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <WorkerDropdownMenu 
                      worker={member}
                      onWorkerUpdated={() => {
                        fetchCrewMembers();
                        fetchInactiveWorkers();
                      }}
                    />
                  </div>
                </div>
                ))
              )}
            </div>
          )}

          {/* Inactive Workers Tab */}
          {activeTab === 'inactive' && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest mx-auto mb-4"></div>
                  <p className="text-gray-600 font-inter">Loading inactive workers...</p>
                </div>
              ) : inactiveWorkers.length === 0 ? (
                <div className="text-center py-8">
                  <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-inter">No inactive workers</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Workers who are deactivated will appear here
                  </p>
                </div>
              ) : (
                inactiveWorkers.map((worker) => (
                <div key={worker.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {worker.avatar_url ? (
                        <ProfileAvatar 
                          filePath={worker.avatar_url} 
                          alt={`${getDisplayName(worker.first_name, worker.last_name, worker.email)}'s profile`}
                          className="w-12 h-12 flex-shrink-0 opacity-50"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-red-600 font-semibold">
                            {getInitials(worker.first_name, worker.last_name, worker.email)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-dm-sans font-semibold text-dark-slate">
                            {getDisplayName(worker.first_name, worker.last_name, worker.email)}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-inter font-medium bg-red-100 text-red-800`}>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-inter font-medium ${
                            worker.role === 'admin' ? 'bg-red-100 text-red-800' : 
                            worker.role === 'manager' ? 'bg-purple-100 text-purple-800' : 
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {worker.role === 'admin' ? 'Admin' : 
                             worker.role === 'manager' ? 'Manager' : 'Worker'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            <span className="truncate">{worker.email}</span>
                          </div>
                          {worker.phone_number && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2" />
                              <span>{worker.phone_number}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Joined {new Date(worker.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>Last active: {worker.last_activity ? new Date(worker.last_activity).toLocaleDateString() : 'Never'}</span>
                          </div>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            <span>Deactivated: {new Date(worker.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Display full name and role prominently */}
                        <div className="mt-3 pt-3 border-t border-red-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 font-medium">Full Name:</span>
                              <span className="ml-2 text-dark-slate">
                                {worker.first_name && worker.last_name 
                                  ? `${worker.first_name} ${worker.last_name}`
                                  : 'Not provided'
                                }
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 font-medium">Role:</span>
                              <span className="ml-2 text-dark-slate capitalize">{worker.role}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={async () => {
                          try {
                            const { error } = await supabase
                              .from('user_profiles')
                              .update({ 
                                status: 'off',
                                last_activity: new Date().toISOString()
                              })
                              .eq('id', worker.id);

                            if (error) throw error;

                            // Refresh both lists
                            fetchCrewMembers();
                            fetchInactiveWorkers();
                          } catch (error) {
                            console.error('Error reactivating worker:', error);
                          }
                        }}
                        className="bg-forest text-white px-3 py-1 rounded text-sm hover:bg-forest/90 transition-colors"
                      >
                        Reactivate
                      </button>
                      <WorkerDropdownMenu 
                        worker={worker}
                        onWorkerUpdated={() => {
                          fetchCrewMembers();
                          fetchInactiveWorkers();
                        }}
                      />
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>
          )}

          {/* Pending Invites Tab */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest mx-auto mb-4"></div>
                  <p className="text-gray-600 font-inter">Loading invites...</p>
                </div>
              ) : invites.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-inter">No pending invites</p>
                  <button
                    onClick={() => setInviteModalOpen(true)}
                    className="mt-4 bg-forest text-white px-4 py-2 rounded-lg hover:bg-forest/90 transition-colors font-inter font-semibold"
                  >
                    Send First Invite
                  </button>
                </div>
              ) : (
                invites.map((invite) => (
                <div key={invite.id} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-dm-sans font-semibold text-dark-slate">
                            {invite.name || invite.email.split('@')[0]}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-inter font-medium ${getStatusColor(invite.status)}`}>
                            {getStatusIcon(invite.status)}
                            <span className="ml-1">Pending</span>
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            <span className="truncate">{invite.email}</span>
                          </div>
                          {invite.phone_number && (
                            <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                              <span>{invite.phone_number}</span>
                          </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Invited {new Date(invite.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600">
                          <strong>Role:</strong> {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)} • 
                          <strong> Expires:</strong> {new Date(invite.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleResendInvite(invite)}
                        className="bg-forest text-white px-3 py-1 rounded text-sm hover:bg-forest/90 transition-colors"
                      >
                        Resend
                      </button>
                      <button
                        onClick={() => handleRevokeInvite(invite.id)}
                        className="text-red-600 hover:text-red-800 px-3 py-1 rounded text-sm border border-red-300 hover:bg-red-50 transition-colors"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>
          )}

          {/* Archived Workers Tab */}
          {activeTab === 'archived' && (
            <div className="space-y-4">
              {archivedWorkers.map((worker) => (
                <div key={worker.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-600 font-semibold">{worker.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-dm-sans font-semibold text-dark-slate">
                            {worker.name}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-inter font-medium bg-gray-100 text-gray-600">
                            <Archive className="h-3 w-3 mr-1" />
                            Archived
                          </span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">{worker.rating}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            <span className="truncate">{worker.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            <span>{worker.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            <span>{worker.completedJobs} jobs completed</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Left {new Date(worker.leftDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600">
                          <strong>Former Role:</strong> {worker.role} • 
                          <strong> Joined:</strong> {new Date(worker.joinDate).toLocaleDateString()} • 
                          <strong> Reason:</strong> {worker.reason}
                        </p>
                      </div>
                    </div>
                    <WorkerDropdownMenu 
                      worker={{
                        ...worker,
                        id: worker.id.toString(),
                        email: worker.email,
                        first_name: worker.name.split(' ')[0],
                        last_name: worker.name.split(' ').slice(1).join(' ') || null,
                        phone_number: worker.phone,
                        role: 'worker' as const,
                        business_id: 'mock-business-id',
                        status: 'inactive' as const,
                        last_activity: worker.lastActive,
                        created_at: worker.joinDate,
                        updated_at: worker.joinDate
                      }}
                      onWorkerUpdated={handleRefresh}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invite Worker Modal */}
      <InviteWorkerModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInviteSent={handleInviteSent}
      />
    </div>
  );
};

export default WorkerPageContent;