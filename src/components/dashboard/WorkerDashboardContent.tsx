import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, 
  Clock,
  MapPin,
  CheckCircle,
  Play,
  Pause,
  Coffee,
  User,
  Phone,
  Mail,
  Navigation,
  AlertCircle
} from 'lucide-react';

const WorkerDashboardContent = () => {
  const { profile } = useAuth();

  // Dynamic greeting system
  const greetings = useMemo(() => [
    'Hello',
    'Hi', 
    'Hey',
    'Welcome',
    'Greetings',
    'Hey there',
    'Hi there',
    'Howdy',
    'Nice to see you'
  ], []);

  // Get current greeting based on time and date to ensure it changes
  const getCurrentGreeting = useMemo(() => {
    const now = new Date();
    // Use minutes to make it change more frequently for demonstration
    const minuteOfDay = now.getHours() * 60 + now.getMinutes();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    // Combine day and minute for more variation
    const greetingIndex = (dayOfYear + minuteOfDay) % greetings.length;
    return greetings[greetingIndex];
  }, [greetings]);

  // Get user's first name or fallback
  const firstName = profile?.first_name || 'there';

  // Memoize static data for worker view
  const todaysJobs = useMemo(() => [
    {
      id: 1,
      time: '8:00 AM',
      client: 'Smith Residence',
      address: '123 Oak Street',
      service: 'Lawn Mowing',
      status: 'in-progress',
      duration: '2h',
      notes: 'Regular weekly service',
      clientPhone: '(555) 123-4567'
    },
    {
      id: 2,
      time: '10:30 AM',
      client: 'Green Valley HOA',
      address: '456 Pine Avenue',
      service: 'Landscaping',
      status: 'scheduled',
      duration: '4h',
      notes: 'Seasonal flower planting',
      clientPhone: '(555) 234-5678'
    },
    {
      id: 3,
      time: '3:30 PM',
      client: 'City Park Maintenance',
      address: '321 Park Boulevard',
      service: 'Irrigation Repair',
      status: 'scheduled',
      duration: '2h',
      notes: 'Fix broken sprinkler heads',
      clientPhone: '(555) 345-6789'
    }
  ], []);

  const completedJobs = useMemo(() => [
    {
      id: 4,
      client: 'Johnson Property',
      service: 'Tree Trimming',
      completedAt: '2:45 PM',
      duration: '3h'
    },
    {
      id: 5,
      client: 'Wilson Home',
      service: 'Hedge Trimming',
      completedAt: '11:30 AM',
      duration: '1.5h'
    }
  ], []);

  const notifications = useMemo(() => [
    {
      id: 1,
      type: 'schedule',
      title: 'Schedule updated',
      description: 'Your 3:30 PM job has been moved to 4:00 PM',
      priority: 'medium',
      time: '10 min ago'
    },
    {
      id: 2,
      type: 'weather',
      title: 'Weather alert',
      description: 'Rain expected this afternoon - check with supervisor',
      priority: 'high',
      time: '25 min ago'
    },
    {
      id: 3,
      type: 'message',
      title: 'Message from supervisor',
      description: 'Great work on the Johnson property yesterday!',
      priority: 'low',
      time: '1 hour ago'
    }
  ], []);

  // Memoize utility functions
  const getStatusColor = useMemo(() => (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getStatusIcon = useMemo(() => (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'in-progress':
        return Play;
      case 'scheduled':
        return Clock;
      default:
        return Pause;
    }
  }, []);

  const getPriorityColor = useMemo(() => (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-forest to-forest/90 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-dm-sans font-bold mb-2">
          {getCurrentGreeting}, {firstName}! 👋
        </h1>
        <p className="text-white/90 font-inter">
          You have 3 jobs scheduled today. Ready to get started?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter font-medium text-gray-600">Today's Jobs</p>
              <p className="text-2xl font-dm-sans font-bold text-dark-slate mt-1">{todaysJobs.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-dm-sans font-bold text-dark-slate mt-1">{completedJobs.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter font-medium text-gray-600">Hours Today</p>
              <p className="text-2xl font-dm-sans font-bold text-dark-slate mt-1">8h</p>
            </div>
            <div className="bg-forest p-3 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Today's Schedule */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-dm-sans font-semibold text-dark-slate">
                Today's Schedule
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {todaysJobs.map((job) => {
                const StatusIcon = getStatusIcon(job.status);
                return (
                  <div key={job.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-forest p-2 rounded-lg">
                          <StatusIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-dm-sans font-semibold text-dark-slate">
                            {job.client}
                          </h3>
                          <p className="text-sm text-gray-600 font-inter">{job.service}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-inter font-medium ${getStatusColor(job.status)}`}>
                        {job.status.replace('-', ' ')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{job.time} ({job.duration})</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{job.clientPhone}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2 mb-3">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-600">{job.address}</span>
                    </div>
                    
                    {job.notes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800 font-inter">
                          <strong>Notes:</strong> {job.notes}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex space-x-3 mt-4">
                      {job.status === 'scheduled' && (
                        <button className="bg-forest text-white px-4 py-2 rounded-lg hover:bg-forest/90 transition-colors font-inter font-semibold text-sm">
                          Start Job
                        </button>
                      )}
                      {job.status === 'in-progress' && (
                        <>
                          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-inter font-semibold text-sm">
                            Complete Job
                          </button>
                          <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-inter font-semibold text-sm">
                            Take Break
                          </button>
                        </>
                      )}
                      <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-inter font-semibold text-sm flex items-center">
                        <Navigation className="h-4 w-4 mr-2" />
                        Directions
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar Content */}
        <div className="space-y-6">
          {/* Completed Jobs Today */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-dm-sans font-semibold text-dark-slate mb-4">
              Completed Today
            </h2>
            <div className="space-y-3">
              {completedJobs.map((job) => (
                <div key={job.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-inter font-medium text-dark-slate text-sm">
                        {job.client}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{job.service}</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-green-700">
                    <span>Completed at {job.completedAt}</span>
                    <span>{job.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-dm-sans font-semibold text-dark-slate">
                Notifications
              </h2>
              <span className="text-sm text-gray-500 font-inter">{notifications.length} new</span>
            </div>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className={`border-l-4 p-3 rounded-r-lg ${getPriorityColor(notification.priority)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-inter font-medium text-dark-slate">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                    </div>
                    {notification.priority === 'high' && (
                      <AlertCircle className="h-4 w-4 text-red-500 ml-2 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-dm-sans font-semibold text-dark-slate mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full bg-forest text-white py-3 rounded-lg hover:bg-forest/90 transition-colors font-inter font-semibold flex items-center justify-center">
                <Coffee className="mr-2 h-4 w-4" />
                Take Break
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-inter font-semibold flex items-center justify-center">
                <Mail className="mr-2 h-4 w-4" />
                Message Supervisor
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-inter font-semibold flex items-center justify-center">
                <User className="mr-2 h-4 w-4" />
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboardContent;