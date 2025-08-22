import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  DollarSign, 
  Calendar, 
  Users, 
  Crown,
  Clock,
  MapPin,
  Phone,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Coffee,
  MessageSquare,
  CreditCard,
  UserPlus,
  TrendingUp,
  TrendingDown,
  MoreHorizontal
} from 'lucide-react';

const ManagerDashboardContent = () => {
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

  // Memoize static data to prevent unnecessary re-renders
  const summaryCards = useMemo(() => [
    {
      title: 'Revenue This Month',
      value: '$24,580',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Jobs Today',
      value: '8',
      change: '+2 from yesterday',
      trend: 'up',
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      title: 'Workers Online',
      value: '6/8',
      change: '2 on break',
      trend: 'neutral',
      icon: Users,
      color: 'bg-forest'
    },
    {
      title: 'Trial Status',
      value: '12 days left',
      change: 'Upgrade anytime',
      trend: 'neutral',
      icon: Crown,
      color: 'bg-accent-lime'
    }
  ], []);

  const todaysJobs = useMemo(() => [
    {
      id: 1,
      time: '8:00 AM',
      client: 'Smith Residence',
      address: '123 Oak Street',
      worker: 'Mike Johnson',
      service: 'Lawn Mowing',
      status: 'in-progress',
      duration: '2h'
    },
    {
      id: 2,
      time: '10:30 AM',
      client: 'Green Valley HOA',
      address: '456 Pine Avenue',
      worker: 'Sarah Davis',
      service: 'Landscaping',
      status: 'scheduled',
      duration: '4h'
    },
    {
      id: 3,
      time: '1:00 PM',
      client: 'Johnson Property',
      address: '789 Maple Drive',
      worker: 'Tom Wilson',
      service: 'Tree Trimming',
      status: 'completed',
      duration: '3h'
    },
    {
      id: 4,
      time: '3:30 PM',
      client: 'City Park Maintenance',
      address: '321 Park Boulevard',
      worker: 'Lisa Chen',
      service: 'Irrigation Repair',
      status: 'scheduled',
      duration: '2h'
    }
  ], []);

  const jobPipeline = useMemo(() => ({
    upcoming: [
      { id: 1, client: 'Anderson Home', service: 'Lawn Care', date: 'Tomorrow' },
      { id: 2, client: 'Riverside Complex', service: 'Landscaping', date: 'Dec 28' },
      { id: 3, client: 'Miller Residence', service: 'Snow Removal', date: 'Dec 29' }
    ],
    inProgress: [
      { id: 4, client: 'Smith Residence', service: 'Lawn Mowing', worker: 'Mike Johnson' },
      { id: 5, client: 'Downtown Office', service: 'Maintenance', worker: 'Sarah Davis' }
    ],
    completed: [
      { id: 6, client: 'Johnson Property', service: 'Tree Trimming', completedAt: '2:45 PM' },
      { id: 7, client: 'Park District', service: 'Cleanup', completedAt: '11:30 AM' },
      { id: 8, client: 'Wilson Home', service: 'Hedge Trimming', completedAt: '9:15 AM' }
    ]
  }), []);

  const crewActivity = useMemo(() => [
    {
      id: 1,
      name: 'Mike Johnson',
      status: 'on-job',
      location: 'Smith Residence',
      lastUpdate: '5 min ago',
      avatar: 'MJ'
    },
    {
      id: 2,
      name: 'Sarah Davis',
      status: 'on-job',
      location: 'Green Valley HOA',
      lastUpdate: '12 min ago',
      avatar: 'SD'
    },
    {
      id: 3,
      name: 'Tom Wilson',
      status: 'available',
      location: 'Base',
      lastUpdate: '3 min ago',
      avatar: 'TW'
    },
    {
      id: 4,
      name: 'Lisa Chen',
      status: 'break',
      location: 'Downtown',
      lastUpdate: '8 min ago',
      avatar: 'LC'
    },
    {
      id: 5,
      name: 'David Brown',
      status: 'available',
      location: 'Base',
      lastUpdate: '1 min ago',
      avatar: 'DB'
    },
    {
      id: 6,
      name: 'Emma Garcia',
      status: 'on-job',
      location: 'City Park',
      lastUpdate: '15 min ago',
      avatar: 'EG'
    }
  ], []);

  const recentActivity = useMemo(() => [
    {
      id: 1,
      type: 'message',
      title: 'New message from Smith Residence',
      description: 'Question about next week\'s service',
      time: '5 min ago',
      icon: MessageSquare
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment received',
      description: '$450 from Green Valley HOA',
      time: '23 min ago',
      icon: CreditCard
    },
    {
      id: 3,
      type: 'signup',
      title: 'New client signed up',
      description: 'Anderson Home - Monthly lawn care',
      time: '1 hour ago',
      icon: UserPlus
    },
    {
      id: 4,
      type: 'job',
      title: 'Job completed',
      description: 'Tree trimming at Johnson Property',
      time: '2 hours ago',
      icon: CheckCircle
    }
  ], []);

  const notifications = useMemo(() => [
    {
      id: 1,
      type: 'reminder',
      title: 'Equipment maintenance due',
      description: 'Mower #3 needs service this week',
      priority: 'medium'
    },
    {
      id: 2,
      type: 'alert',
      title: 'Weather alert',
      description: 'Rain expected tomorrow - 3 jobs affected',
      priority: 'high'
    },
    {
      id: 3,
      type: 'renewal',
      title: 'Trial ending soon',
      description: '12 days left in your free trial',
      priority: 'medium'
    },
    {
      id: 4,
      type: 'update',
      title: 'New feature available',
      description: 'GPS tracking now includes route optimization',
      priority: 'low'
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

  const getCrewStatusColor = useMemo(() => (status: string) => {
    switch (status) {
      case 'on-job':
        return 'bg-green-100 text-green-800';
      case 'available':
        return 'bg-blue-100 text-blue-800';
      case 'break':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getCrewStatusIcon = useMemo(() => (status: string) => {
    switch (status) {
      case 'on-job':
        return Play;
      case 'available':
        return CheckCircle;
      case 'break':
        return Coffee;
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
          You have 8 jobs scheduled today and 6 workers online. Everything looks great!
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {summaryCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
            <div className="flex items-start justify-between mb-3">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center space-x-1">
                  {card.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                  {card.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                  <span className={`text-sm font-inter ${
                    card.trend === 'up' ? 'text-green-600' : 
                    card.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {card.change}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xs lg:text-sm font-inter font-medium text-gray-600 mb-1">
                {card.title}
              </h3>
              <p className="text-xl lg:text-2xl font-dm-sans font-bold text-dark-slate">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Larger Content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Today's Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 lg:p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-base lg:text-lg font-dm-sans font-semibold text-dark-slate">
                  Today's Schedule
                </h2>
                <button className="text-forest hover:text-forest/80 font-inter text-sm font-medium">
                  View All
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-inter font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-inter font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="hidden md:table-cell px-3 lg:px-6 py-3 text-left text-xs font-inter font-medium text-gray-500 uppercase tracking-wider">
                      Worker
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-inter font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="hidden lg:table-cell px-3 lg:px-6 py-3 text-left text-xs font-inter font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {todaysJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-xs lg:text-sm font-inter font-medium text-dark-slate">
                              {job.time}
                            </div>
                            <div className="text-xs text-gray-500 hidden lg:block">{job.duration}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4">
                        <div>
                          <div className="text-xs lg:text-sm font-inter font-medium text-dark-slate">
                            {job.client}
                          </div>
                          <div className="text-xs lg:text-sm text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate">{job.address}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1 md:hidden">{job.service}</div>
                          <div className="text-xs text-gray-400 mt-1 md:hidden">{job.worker}</div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-3 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-forest rounded-full flex items-center justify-center mr-3">
                            <span className="text-xs font-semibold text-white">
                              {job.worker.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="text-xs lg:text-sm font-inter font-medium text-dark-slate">
                            {job.worker}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-inter font-medium ${getStatusColor(job.status)}`}>
                          {job.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Job Pipeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
            <h2 className="text-base lg:text-lg font-dm-sans font-semibold text-dark-slate mb-4 lg:mb-6">
              Job Pipeline
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {/* Upcoming */}
              <div>
                <h3 className="text-xs lg:text-sm font-inter font-semibold text-gray-600 mb-3 lg:mb-4 flex items-center">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                  Upcoming ({jobPipeline.upcoming.length})
                </h3>
                <div className="space-y-2 lg:space-y-3">
                  {jobPipeline.upcoming.map((job) => (
                    <div key={job.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 lg:p-3">
                      <div className="text-xs lg:text-sm font-inter font-medium text-dark-slate">
                        {job.client}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{job.service}</div>
                      <div className="text-xs text-yellow-700 mt-2 font-medium">{job.date}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* In Progress */}
              <div>
                <h3 className="text-xs lg:text-sm font-inter font-semibold text-gray-600 mb-3 lg:mb-4 flex items-center">
                  <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                  In Progress ({jobPipeline.inProgress.length})
                </h3>
                <div className="space-y-2 lg:space-y-3">
                  {jobPipeline.inProgress.map((job) => (
                    <div key={job.id} className="bg-blue-50 border border-blue-200 rounded-lg p-2 lg:p-3">
                      <div className="text-xs lg:text-sm font-inter font-medium text-dark-slate">
                        {job.client}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{job.service}</div>
                      <div className="text-xs text-blue-700 mt-2 font-medium">{job.worker}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completed */}
              <div>
                <h3 className="text-xs lg:text-sm font-inter font-semibold text-gray-600 mb-3 lg:mb-4 flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                  Completed ({jobPipeline.completed.length})
                </h3>
                <div className="space-y-2 lg:space-y-3">
                  {jobPipeline.completed.map((job) => (
                    <div key={job.id} className="bg-green-50 border border-green-200 rounded-lg p-2 lg:p-3">
                      <div className="text-xs lg:text-sm font-inter font-medium text-dark-slate">
                        {job.client}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{job.service}</div>
                      <div className="text-xs text-green-700 mt-2 font-medium">{job.completedAt}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar Content */}
        <div className="space-y-6">
          {/* Crew Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base lg:text-lg font-dm-sans font-semibold text-dark-slate">
                Crew Activity
              </h2>
              <span className="text-xs lg:text-sm text-gray-500 font-inter">Live</span>
            </div>
            <div className="space-y-3 lg:space-y-4">
              {crewActivity.map((worker) => {
                const StatusIcon = getCrewStatusIcon(worker.status);
                return (
                  <div key={worker.id} className="flex items-start space-x-3">
                    <div className="w-8 lg:w-10 h-8 lg:h-10 bg-forest rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-white">
                        {worker.avatar}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-xs lg:text-sm font-inter font-medium text-dark-slate truncate">
                          {worker.name}
                        </p>
                        <span className={`inline-flex items-center px-1.5 lg:px-2 py-0.5 rounded-full text-xs font-inter font-medium ${getCrewStatusColor(worker.status)} flex-shrink-0`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          <span className="hidden lg:inline">{worker.status.replace('-', ' ')}</span>
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate">{worker.location}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 hidden lg:block">{worker.lastUpdate}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Client Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
            <h2 className="text-base lg:text-lg font-dm-sans font-semibold text-dark-slate mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3 lg:space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-2 lg:space-x-3">
                  <div className="bg-gray-100 p-1.5 lg:p-2 rounded-lg flex-shrink-0">
                    <activity.icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs lg:text-sm font-inter font-medium text-dark-slate">
                      {activity.title}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base lg:text-lg font-dm-sans font-semibold text-dark-slate">
                Notifications
              </h2>
              <button className="text-forest hover:text-forest/80 font-inter text-xs lg:text-sm font-medium">
                Mark all read
              </button>
            </div>
            <div className="space-y-2 lg:space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className={`border-l-4 p-2 lg:p-3 rounded-r-lg ${getPriorityColor(notification.priority)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs lg:text-sm font-inter font-medium text-dark-slate">
                        {notification.title}
                      </p>
                      <p className="text-xs lg:text-sm text-gray-600 mt-1">
                        {notification.description}
                      </p>
                    </div>
                    {notification.priority === 'high' && (
                      <AlertCircle className="h-3 lg:h-4 w-3 lg:w-4 text-red-500 ml-2 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboardContent;