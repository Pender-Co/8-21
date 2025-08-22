import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter, 
  Search, 
  Clock, 
  MapPin, 
  User, 
  Phone,
  MoreHorizontal,
  CheckCircle,
  Play,
  AlertCircle,
  Eye,
  Edit3,
  Navigation,
  Users,
  DollarSign,
  FileText
} from 'lucide-react';

interface ScheduleJob {
  id: string;
  title: string;
  client_name: string;
  client_phone: string;
  address: string;
  service_type: string;
  start_time: string;
  end_time: string;
  date: string;
  estimated_cost: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assigned_worker_id: string | null;
  assigned_worker_name: string | null;
  notes: string | null;
  duration: number; // in hours
}

const SchedulePage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorker, setSelectedWorker] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Mock data - replace with actual API calls
  const jobs: ScheduleJob[] = useMemo(() => [
    {
      id: '1',
      title: 'Weekly Lawn Maintenance',
      client_name: 'Smith Residence',
      client_phone: '(555) 123-4567',
      address: '123 Oak Street, Springfield, IL',
      service_type: 'Lawn Care',
      start_time: '09:00',
      end_time: '11:00',
      date: '2025-01-28',
      estimated_cost: 150,
      status: 'scheduled',
      priority: 'medium',
      assigned_worker_id: 'worker1',
      assigned_worker_name: 'Mike Johnson',
      notes: 'Regular weekly service',
      duration: 2
    },
    {
      id: '2',
      title: 'Spring Landscaping Project',
      client_name: 'Green Valley HOA',
      client_phone: '(555) 234-5678',
      address: '456 Pine Avenue, Springfield, IL',
      service_type: 'Landscaping',
      start_time: '08:00',
      end_time: '14:00',
      date: '2025-01-29',
      estimated_cost: 850,
      status: 'in_progress',
      priority: 'high',
      assigned_worker_id: 'worker2',
      assigned_worker_name: 'Sarah Davis',
      notes: 'Large commercial project',
      duration: 6
    },
    {
      id: '3',
      title: 'Tree Trimming Service',
      client_name: 'Johnson Property',
      client_phone: '(555) 345-6789',
      address: '789 Maple Drive, Springfield, IL',
      service_type: 'Tree Services',
      start_time: '10:00',
      end_time: '14:00',
      date: '2025-01-30',
      estimated_cost: 450,
      status: 'scheduled',
      priority: 'low',
      assigned_worker_id: 'worker3',
      assigned_worker_name: 'Tom Wilson',
      notes: 'Check for power lines',
      duration: 4
    },
    {
      id: '4',
      title: 'Snow Removal - Parking Lot',
      client_name: 'Downtown Office Complex',
      client_phone: '(555) 456-7890',
      address: '321 Business Blvd, Springfield, IL',
      service_type: 'Snow Removal',
      start_time: '06:00',
      end_time: '14:00',
      date: '2025-01-27',
      estimated_cost: 1200,
      status: 'completed',
      priority: 'high',
      assigned_worker_id: 'worker1',
      assigned_worker_name: 'Mike Johnson',
      notes: 'Emergency service completed',
      duration: 8
    },
    {
      id: '5',
      title: 'Irrigation System Check',
      client_name: 'City Park District',
      client_phone: '(555) 567-8901',
      address: '654 Park Avenue, Springfield, IL',
      service_type: 'Irrigation',
      start_time: '13:00',
      end_time: '16:00',
      date: '2025-02-03',
      estimated_cost: 300,
      status: 'scheduled',
      priority: 'medium',
      assigned_worker_id: 'worker2',
      assigned_worker_name: 'Sarah Davis',
      notes: 'Seasonal maintenance',
      duration: 3
    },
    {
      id: '6',
      title: 'Hedge Trimming',
      client_name: 'Miller Family',
      client_phone: '(555) 678-9012',
      address: '987 Elm Street, Springfield, IL',
      service_type: 'Landscaping',
      start_time: '14:00',
      end_time: '16:00',
      date: '2025-02-05',
      estimated_cost: 200,
      status: 'scheduled',
      priority: 'low',
      assigned_worker_id: 'worker3',
      assigned_worker_name: 'Tom Wilson',
      notes: 'Annual hedge maintenance',
      duration: 2
    }
  ], []);

  const workers = useMemo(() => [
    { id: 'worker1', name: 'Mike Johnson' },
    { id: 'worker2', name: 'Sarah Davis' },
    { id: 'worker3', name: 'Tom Wilson' },
    { id: 'worker4', name: 'Lisa Chen' }
  ], []);

  const serviceTypes = ['All Services', 'Lawn Care', 'Landscaping', 'Tree Services', 'Snow Removal', 'Irrigation', 'Hardscaping'];

  // Get calendar month data
  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the Sunday before the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // End on the Saturday after the last day
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days = [];
    const currentDay = new Date(startDate);
    
    while (currentDay <= endDate) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  // Get jobs for a specific date
  const getJobsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return jobs.filter(job => {
      const matchesDate = job.date === dateString;
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesWorker = selectedWorker === 'all' || job.assigned_worker_id === selectedWorker;
      const matchesService = selectedService === 'all' || job.service_type === selectedService;
      
      return matchesDate && matchesSearch && matchesWorker && matchesService;
    });
  };

  // Calculate summary stats for current month
  const summaryStats = useMemo(() => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const monthJobs = jobs.filter(job => {
      const jobDate = new Date(job.date);
      return jobDate >= monthStart && jobDate <= monthEnd;
    });
    
    const totalJobs = monthJobs.length;
    const scheduledJobs = monthJobs.filter(job => job.status === 'scheduled').length;
    const completedJobs = monthJobs.filter(job => job.status === 'completed').length;
    const totalRevenue = monthJobs.filter(job => job.status === 'completed').reduce((sum, job) => sum + job.estimated_cost, 0);

    return {
      totalJobs,
      scheduledJobs,
      completedJobs,
      totalRevenue: totalRevenue.toFixed(0)
    };
  }, [jobs, currentDate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'in_progress':
        return Play;
      case 'scheduled':
        return Clock;
      case 'cancelled':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const calendarDays = getCalendarDays(currentDate);
  const monthName = currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-dm-sans font-bold text-dark-slate">
            Schedule Calendar
          </h1>
          <p className="text-gray-600 font-inter mt-1">
            Plan, organize, and track your team's daily operations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 font-inter font-semibold flex items-center justify-center">
            <FileText className="mr-2 h-4 w-4" />
            Export
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-forest text-white px-6 py-3 rounded-lg hover:bg-forest/90 transition-all duration-200 font-inter font-semibold flex items-center justify-center group"
          >
            <Plus className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Schedule Job
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Month Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div 
              className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg min-w-[200px] justify-center cursor-pointer hover:bg-gray-100 transition-colors relative"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              <Calendar className="h-4 w-4 text-gray-600" />
              <span className="font-inter font-medium text-dark-slate">
                {monthName}
              </span>
              
              {/* Date Picker Dropdown */}
              {showDatePicker && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setShowDatePicker(false)}
                  />
                  
                  {/* Date Picker */}
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-4 min-w-[280px]">
                    <div className="space-y-4">
                      {/* Month/Year Selectors */}
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={currentDate.getMonth()}
                          onChange={(e) => {
                            const newDate = new Date(currentDate);
                            newDate.setMonth(parseInt(e.target.value));
                            setCurrentDate(newDate);
                            setShowDatePicker(false);
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent text-sm font-inter"
                        >
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={i}>
                              {new Date(2025, i, 1).toLocaleDateString([], { month: 'long' })}
                            </option>
                          ))}
                        </select>
                        
                        <select
                          value={currentDate.getFullYear()}
                          onChange={(e) => {
                            const newDate = new Date(currentDate);
                            newDate.setFullYear(parseInt(e.target.value));
                            setCurrentDate(newDate);
                            setShowDatePicker(false);
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent text-sm font-inter"
                        >
                          {Array.from({ length: 10 }, (_, i) => {
                            const year = new Date().getFullYear() - 2 + i;
                            return (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      
                      {/* Quick Navigation */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setCurrentDate(new Date());
                            setShowDatePicker(false);
                          }}
                          className="flex-1 bg-forest text-white px-3 py-2 rounded-lg hover:bg-forest/90 transition-colors font-inter font-semibold text-sm"
                        >
                          Today
                        </button>
                        <button
                          onClick={() => setShowDatePicker(false)}
                          className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors font-inter font-semibold text-sm"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => navigateMonth('next')}
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
              placeholder="Search jobs, clients, or locations..."
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
                {worker.name}
              </option>
            ))}
          </select>

          {/* Service Filter */}
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent text-sm font-inter"
          >
            {serviceTypes.map((service) => (
              <option key={service} value={service === 'All Services' ? 'all' : service}>
                {service}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
            <div key={day} className="p-4 text-center">
              <div className="text-sm font-inter font-semibold text-gray-700">
                {day}
              </div>
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date, index) => {
            const dayJobs = getJobsForDate(date);
            const isCurrentMonthDay = isCurrentMonth(date);
            const isTodayDate = isToday(date);
            
            return (
              <div 
                key={index} 
                className={`min-h-[120px] border-r border-b border-gray-200 p-2 ${
                  !isCurrentMonthDay ? 'bg-gray-50' : 'bg-white'
                } ${isTodayDate ? 'bg-forest/5 ring-2 ring-forest/20' : ''} hover:bg-gray-50 transition-colors cursor-pointer`}
                onClick={() => setSelectedDate(date)}
              >
                <div className={`text-sm font-inter font-medium mb-2 ${
                  !isCurrentMonthDay ? 'text-gray-400' : 
                  isTodayDate ? 'text-forest font-bold bg-forest/10 rounded-full w-6 h-6 flex items-center justify-center' : 'text-dark-slate'
                }`}>
                  {date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayJobs.slice(0, 3).map((job) => {
                    const StatusIcon = getStatusIcon(job.status);
                    return (
                      <div
                        key={job.id}
                        className={`p-1 rounded text-xs border-l-2 ${getPriorityColor(job.priority)} bg-gray-50 hover:bg-gray-100 transition-colors`}
                        title={`${job.client_name} - ${job.service_type}`}
                      >
                        <div className="flex items-center space-x-1 mb-1">
                          <StatusIcon className="h-3 w-3 text-gray-600" />
                          <span className="font-medium text-dark-slate truncate">
                            {formatTime(job.start_time)}
                          </span>
                        </div>
                        <div className="text-gray-600 truncate">
                          {job.client_name}
                        </div>
                        <div className="text-gray-500 truncate">
                          {job.service_type}
                        </div>
                      </div>
                    );
                  })}
                  
                  {dayJobs.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{dayJobs.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
    </div>
  );
};

export default SchedulePage;