import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  DollarSign,
  Calendar,
  Play,
  FileText,
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useJobs } from '../../hooks/useJobs';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import JobCard from '../jobs/JobCard';
import JobFilters from '../jobs/JobFilters';
import JobTabs from '../jobs/JobTabs';
import ViewJobModal from '../jobs/ViewJobModal';
import { getStatusesByGroup } from '../../constants/jobStatuses';

interface Worker {
  id: string;
  name: string;
}

const JobsPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { jobs, loading, error, refreshJobs, updateJobStatus, deleteJob } = useJobs();

  // Filter states
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedWorker, setSelectedWorker] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  // Workers for filter dropdown
  const [workers, setWorkers] = useState<Worker[]>([]);

  // Fetch workers for filter dropdown
  useEffect(() => {
    const fetchWorkers = async () => {
      if (!profile?.business_id) return;

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name, email')
          .eq('business_id', profile.business_id)
          .order('first_name', { ascending: true });

        if (error) throw error;

        const workerList = (data || []).map(worker => ({
          id: worker.id,
          name: worker.first_name && worker.last_name 
            ? `${worker.first_name} ${worker.last_name}`
            : worker.email.split('@')[0]
        }));

        setWorkers(workerList);
      } catch (error) {
        console.error('Error fetching workers:', error);
      }
    };

    fetchWorkers();
  }, [profile?.business_id]);

  // Calculate job counts by status
  const jobCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    jobs.forEach(job => {
      counts[job.status] = (counts[job.status] || 0) + 1;
    });
    
    return counts;
  }, [jobs]);

  // Filter jobs based on current filters
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Tab filter
      let matchesTab = true;
      if (activeTab !== 'all') {
        if (activeTab === 'active') {
          const activeStatuses = getStatusesByGroup('active').map(s => s.value);
          matchesTab = activeStatuses.includes(job.status);
        } else {
          matchesTab = job.status === activeTab;
        }
      }

      // Search filter
      const matchesSearch = !searchTerm || (
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.clients?.business_name || 
         `${job.clients?.first_name || ''} ${job.clients?.last_name || ''}`)
          .toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.clients?.street_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Status filter
      const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus;

      // Worker filter
      const matchesWorker = selectedWorker === 'all' || job.assigned_worker_id === selectedWorker;

      // Date filter
      const matchesDate = !selectedDate || job.scheduled_date === selectedDate;

      // Priority filter
      const matchesPriority = selectedPriority === 'all' || job.priority === selectedPriority;

      return matchesTab && matchesSearch && matchesStatus && matchesWorker && matchesDate && matchesPriority;
    });
  }, [jobs, activeTab, searchTerm, selectedStatus, selectedWorker, selectedDate, selectedPriority]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalRevenue = jobs
      .filter(j => j.status === 'completed')
      .reduce((sum, job) => {
        const serviceItemsTotal = job.job_service_items?.reduce((itemSum, item) => itemSum + item.total, 0) || 0;
        return sum + (serviceItemsTotal || job.estimated_cost);
      }, 0);

    const scheduledJobs = jobs.filter(j => j.status === 'scheduled').length;
    const inProgressJobs = jobs.filter(j => j.status === 'in_progress').length;
    const avgJobValue = jobs.length > 0 
      ? jobs.reduce((sum, job) => {
          const serviceItemsTotal = job.job_service_items?.reduce((itemSum, item) => itemSum + item.total, 0) || 0;
          return sum + (serviceItemsTotal || job.estimated_cost);
        }, 0) / jobs.length 
      : 0;

    return {
      totalRevenue: totalRevenue.toFixed(0),
      scheduledJobs,
      inProgressJobs,
      avgJobValue: avgJobValue.toFixed(0)
    };
  }, [jobs]);

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      await updateJobStatus(jobId, newStatus);
    } catch (error) {
      console.error('Error updating job status:', error);
      // You might want to show a toast notification here
    }
  };

  const handleDeleteJob = async (job: any) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${job.title}"?\n\nThis action cannot be undone and will permanently remove:\n• Job details and history\n• All service items\n• Any attached files\n• Related scheduling information`
    );
    
    if (!confirmed) {
      return;
    }

    try {
      await deleteJob(job.id);
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job. Please try again.');
    }
  };

  const handleViewJob = (job: any) => {
    setSelectedJob(job);
    setViewModalOpen(true);
  };

  const handleEditJob = (job: any) => {
    navigate(`/jobs/edit/${job.id}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-dm-sans font-bold text-dark-slate">
              Jobs Management
            </h1>
            <p className="text-gray-600 font-inter mt-1">
              Schedule, track, and manage all your service jobs
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto mb-4"></div>
          <p className="text-gray-600 font-inter">Loading jobs...</p>
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
              Jobs Management
            </h1>
            <p className="text-gray-600 font-inter mt-1">
              Schedule, track, and manage all your service jobs
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-red-600 font-inter mb-4">{error}</p>
          <button
            onClick={refreshJobs}
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
            Jobs Management
          </h1>
          <p className="text-gray-600 font-inter mt-1">
            Schedule, track, and manage all your service jobs
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => refreshJobs()}
            className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 font-inter font-semibold flex items-center justify-center"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 font-inter font-semibold flex items-center justify-center">
            <FileText className="mr-2 h-4 w-4" />
            Export
          </button>
          <button 
            onClick={() => navigate('/jobs/create')}
            className="bg-forest text-white px-6 py-3 rounded-lg hover:bg-forest/90 transition-all duration-200 font-inter font-semibold flex items-center justify-center group"
          >
            <Plus className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Create Job
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-dm-sans font-bold text-dark-slate mt-1">
                ${summaryStats.totalRevenue}
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
              <p className="text-sm font-inter font-medium text-gray-600">Scheduled Jobs</p>
              <p className="text-2xl font-dm-sans font-bold text-dark-slate mt-1">
                {summaryStats.scheduledJobs}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-dm-sans font-bold text-dark-slate mt-1">
                {summaryStats.inProgressJobs}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Play className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter font-medium text-gray-600">Avg Job Value</p>
              <p className="text-2xl font-dm-sans font-bold text-dark-slate mt-1">
                ${summaryStats.avgJobValue}
              </p>
            </div>
            <div className="bg-forest p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <JobFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedWorker={selectedWorker}
        onWorkerChange={setSelectedWorker}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        workers={workers}
      />

      {/* Tabs */}
      <JobTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        jobCounts={jobCounts}
      />

      {/* Jobs List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-inter">
                {jobs.length === 0 ? 'No jobs yet' : 'No jobs found'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {jobs.length === 0 
                  ? 'Create your first job to get started'
                  : 'Try adjusting your filters or create a new job'
                }
              </p>
              {jobs.length === 0 && (
                <button
                  onClick={() => navigate('/jobs/create')}
                  className="mt-4 bg-forest text-white px-6 py-3 rounded-lg hover:bg-forest/90 transition-colors font-inter font-semibold"
                >
                  Create First Job
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onStatusChange={handleStatusChange}
                  onView={handleViewJob}
                  onEdit={handleEditJob}
                  onDelete={handleDeleteJob}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* View Job Modal */}
      <ViewJobModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedJob(null);
        }}
        job={selectedJob}
      />
    </div>
  );
};

export default JobsPage;