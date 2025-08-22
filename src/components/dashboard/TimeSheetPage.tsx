import React, { useState, useMemo, useEffect } from 'react';
import EditTimeModal from './EditTimeModal';
import { 
  Calendar, 
  Clock, 
  Download, 
  Filter, 
  Search, 
  User, 
  MapPin,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  FileText,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface TimeEntry {
  id: string;
  user_id: string;
  business_id: string;
  clock_in_time: string;
  clock_out_time: string | null;
  break_start_time: string | null;
  break_end_time: string | null;
  total_break_minutes: number;
  location_clock_in: string | null;
  location_clock_out: string | null;
  job_site: string | null;
  notes: string | null;
  status: 'active' | 'on_break' | 'completed';
  created_at: string;
  updated_at: string;
  // Joined data from user_profiles
  user_profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

interface Worker {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
}

const TimeSheetPage = () => {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [selectedWorker, setSelectedWorker] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTimeEntry, setSelectedTimeEntry] = useState<TimeEntry | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const { profile } = useAuth();

  // Fetch workers for the filter dropdown
  const fetchWorkers = async () => {
    if (!profile?.business_id) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email')
        .eq('business_id', profile.business_id)
        .order('first_name', { ascending: true });

      if (error) throw error;
      setWorkers(data || []);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  // Fetch time entries for the selected week
  const fetchTimeEntries = async () => {
    if (!profile?.business_id) return;

    setLoading(true);
    setError(null);

    try {
      // Calculate week start and end dates
      const weekStart = new Date(selectedWeek);
      weekStart.setDate(selectedWeek.getDate() - selectedWeek.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      console.log('🔵 Fetching time entries for week:', {
        start: weekStart.toISOString(),
        end: weekEnd.toISOString(),
        business_id: profile.business_id
      });

      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          user_profiles(
            first_name,
            last_name,
            email
          )
        `)
        .eq('business_id', profile.business_id)
        .gte('clock_in_time', weekStart.toISOString())
        .lt('clock_in_time', weekEnd.toISOString())
        .order('clock_in_time', { ascending: false });

      if (error) throw error;

      console.log('🟢 Fetched time entries:', data?.length || 0);
      setTimeEntries(data || []);
    } catch (error) {
      console.error('🔴 Error fetching time entries:', error);
      setError('Failed to load time entries');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or dependencies change
  useEffect(() => {
    if (profile?.business_id) {
      fetchWorkers();
      fetchTimeEntries();
    }
  }, [profile?.business_id, selectedWeek]);

  // Helper function to get worker display name
  const getWorkerName = (entry: TimeEntry) => {
    if (!entry.user_profiles) return 'Unknown Worker';
    
    if (entry.user_profiles.first_name && entry.user_profiles.last_name) {
      return `${entry.user_profiles.first_name} ${entry.user_profiles.last_name}`;
    }
    return entry.user_profiles.email.split('@')[0];
  };

  // Filter entries based on selected filters
  const filteredEntries = useMemo(() => {
    return timeEntries.filter(entry => {
      const matchesWorker = selectedWorker === 'all' || entry.user_id === selectedWorker;
      const workerName = getWorkerName(entry);
      const matchesSearch = workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.job_site?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.location_clock_in?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
      
      return matchesWorker && matchesSearch && matchesStatus;
    });
  }, [timeEntries, selectedWorker, searchTerm, filterStatus, getWorkerName]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const completedEntries = filteredEntries.filter(entry => entry.status === 'completed' && entry.clock_out_time);
    
    const totalHours = completedEntries.reduce((sum, entry) => {
      if (!entry.clock_out_time) return sum;
      const hours = (new Date(entry.clock_out_time).getTime() - new Date(entry.clock_in_time).getTime()) / (1000 * 60 * 60);
      const breakHours = entry.total_break_minutes / 60;
      return sum + Math.max(0, hours - breakHours);
    }, 0);
    
    // Mock hourly rate for calculation - in a real app, this would come from worker profiles
    const mockHourlyRate = 25;
    const totalPay = totalHours * mockHourlyRate;
    
    const uniqueWorkers = new Set(filteredEntries.map(entry => entry.user_id)).size;
    
    return {
      totalHours: totalHours.toFixed(1),
      totalPay: totalPay.toFixed(2),
      uniqueWorkers,
      averageHours: filteredEntries.length > 0 ? (totalHours / uniqueWorkers || 0).toFixed(1) : '0'
    };
  }, [filteredEntries]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'on_break':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const calculateHours = (entry: TimeEntry) => {
    if (!entry.clock_out_time) return 0;
    const hours = (new Date(entry.clock_out_time).getTime() - new Date(entry.clock_in_time).getTime()) / (1000 * 60 * 60);
    const breakHours = entry.total_break_minutes / 60;
    return Math.max(0, hours - breakHours);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedWeek(newDate);
  };

  const getWeekRange = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return `${start.toLocaleDateString([], { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const getWorkerInitials = (entry: TimeEntry) => {
    if (!entry.user_profiles) return 'UW';
    
    if (entry.user_profiles.first_name && entry.user_profiles.last_name) {
      return `${entry.user_profiles.first_name[0]}${entry.user_profiles.last_name[0]}`.toUpperCase();
    }
    return entry.user_profiles.email.slice(0, 2).toUpperCase();
  };

  const exportTimeSheet = () => {
    // Create CSV content
    const headers = ['Date', 'Worker', 'Clock In', 'Clock Out', 'Hours', 'Break (min)', 'Job Site', 'Location', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredEntries.map(entry => [
        formatDate(entry.clock_in_time),
        getWorkerName(entry),
        formatTime(entry.clock_in_time),
        entry.clock_out_time ? formatTime(entry.clock_out_time) : 'N/A',
        entry.status === 'completed' ? calculateHours(entry).toFixed(1) : 'N/A',
        entry.total_break_minutes,
        entry.job_site || 'N/A',
        entry.location_clock_in || 'N/A',
        entry.status
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheet-${getWeekRange(selectedWeek).replace(/\s/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleEditTime = (entry: TimeEntry) => {
    setSelectedTimeEntry(entry);
    setEditModalOpen(true);
    setDropdownOpen(null);
  };

  const handleTimeUpdated = () => {
    fetchTimeEntries();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-dm-sans font-bold text-dark-slate">
              Time Sheets
            </h1>
            <p className="text-gray-600 font-inter mt-1">
              Review and manage worker time entries and payroll
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto mb-4"></div>
          <p className="text-gray-600 font-inter">Loading time entries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-dm-sans font-bold text-dark-slate">
              Time Sheets
            </h1>
            <p className="text-gray-600 font-inter mt-1">
              Review and manage worker time entries and payroll
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Clock className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-red-600 font-inter mb-4">{error}</p>
          <button
            onClick={fetchTimeEntries}
            className="bg-forest text-white px-4 py-2 rounded-lg hover:bg-forest/90 transition-colors font-inter font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-dm-sans font-bold text-dark-slate">
            Time Sheets
          </h1>
          <p className="text-gray-600 font-inter mt-1">
            Review and manage worker time entries and payroll
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={exportTimeSheet}
            className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 font-inter font-semibold flex items-center justify-center"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </button>
          <button className="bg-forest text-white px-6 py-3 rounded-lg hover:bg-forest/90 transition-all duration-200 font-inter font-semibold flex items-center justify-center">
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter font-medium text-gray-600">Total Hours</p>
              <p className="text-2xl font-dm-sans font-bold text-dark-slate mt-1">
                {summaryStats.totalHours}h
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter font-medium text-gray-600">Est. Total Pay</p>
              <p className="text-2xl font-dm-sans font-bold text-dark-slate mt-1">
                ${summaryStats.totalPay}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter font-medium text-gray-600">Active Workers</p>
              <p className="text-2xl font-dm-sans font-bold text-dark-slate mt-1">
                {summaryStats.uniqueWorkers}
              </p>
            </div>
            <div className="bg-forest p-3 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter font-medium text-gray-600">Avg Hours</p>
              <p className="text-2xl font-dm-sans font-bold text-dark-slate mt-1">
                {summaryStats.averageHours}h
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Week Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
              <Calendar className="h-4 w-4 text-gray-600" />
              <span className="font-inter font-medium text-dark-slate">
                {getWeekRange(selectedWeek)}
              </span>
            </div>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by worker, job site, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent text-sm font-inter"
            />
          </div>

          {/* Worker Filter */}
          <select
            value={selectedWorker}
            onChange={(e) => setSelectedWorker(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent text-sm font-inter"
          >
            <option value="all">All Workers</option>
            {workers.map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.first_name && worker.last_name 
                  ? `${worker.first_name} ${worker.last_name}`
                  : worker.email.split('@')[0]
                }
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent text-sm font-inter"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="active">Active</option>
            <option value="on_break">On Break</option>
          </select>
        </div>
      </div>

      {/* Time Entries Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-dm-sans font-semibold text-dark-slate">
            Time Entries ({filteredEntries.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto pb-20">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-inter font-medium text-gray-500 uppercase tracking-wider min-w-[160px]">
                  Worker
                </th>
                <th className="px-6 py-3 text-left text-xs font-inter font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-inter font-medium text-gray-500 uppercase tracking-wider min-w-[160px]">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-inter font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                  Break Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-inter font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                  Break Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-inter font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-inter font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-inter font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-forest rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-sm font-semibold text-white">
                          {getWorkerInitials(entry)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-inter font-medium text-dark-slate whitespace-nowrap">
                          {getWorkerName(entry)}
                        </div>
                        <div className="text-sm text-gray-500 whitespace-nowrap">
                          {entry.user_profiles?.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-inter font-medium text-dark-slate">
                      {formatDate(entry.clock_in_time)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-dark-slate">
                      <div>{formatTime(entry.clock_in_time)} - {entry.clock_out_time ? formatTime(entry.clock_out_time) : 'Active'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-dark-slate">
                      {entry.break_start_time ? (
                        entry.break_end_time ? 
                          `${formatTime(entry.break_start_time)} - ${formatTime(entry.break_end_time)}` :
                          entry.status === 'on_break' ? 
                            `${formatTime(entry.break_start_time)} - In Progress` :
                            formatTime(entry.break_start_time)
                      ) : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-inter font-semibold text-dark-slate">
                      {entry.total_break_minutes > 0 ? `${entry.total_break_minutes}min` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-inter font-semibold text-dark-slate">
                      {entry.status === 'completed' ? `${calculateHours(entry).toFixed(1)}h` : 'Active'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-inter font-medium ${getStatusColor(entry.status)}`}>
                      {entry.status === 'on_break' ? 'On Break' : 
                       entry.status === 'active' ? 'Active' : 'Completed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative">
                      <button 
                        onClick={() => setDropdownOpen(dropdownOpen === entry.id ? null : entry.id)}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                      <MoreHorizontal className="h-4 w-4" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {dropdownOpen === entry.id && (
                        <>
                          {/* Backdrop */}
                          <div 
                            className="fixed inset-0 z-10"
                            onClick={() => setDropdownOpen(null)}
                          />
                          
                          {/* Dropdown Content */}
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-2">
                            <button
                              onClick={() => handleEditTime(entry)}
                              className="w-full px-4 py-2 text-left text-sm font-inter text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                            >
                              <Clock className="h-4 w-4 mr-3" />
                              Edit Time
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-inter">No time entries found</p>
            <p className="text-sm text-gray-500 mt-1">
              {timeEntries.length === 0 
                ? 'No time entries for this week'
                : 'Try adjusting your filters or search terms'
              }
            </p>
          </div>
        )}
      </div>

      {/* Edit Time Modal */}
      <EditTimeModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedTimeEntry(null);
        }}
        timeEntry={selectedTimeEntry}
        onTimeUpdated={handleTimeUpdated}
      />
    </div>
  );
};

export default TimeSheetPage;