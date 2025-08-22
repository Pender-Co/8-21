import React from 'react';
import { Search, Filter, Calendar, User, MapPin } from 'lucide-react';
import { getAllJobStatuses, getStatusesByGroup } from '../../constants/jobStatuses';

interface JobFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedWorker: string;
  onWorkerChange: (value: string) => void;
  selectedDate: string;
  onDateChange: (value: string) => void;
  selectedPriority: string;
  onPriorityChange: (value: string) => void;
  workers: Array<{ id: string; name: string }>;
  className?: string;
}

const JobFilters: React.FC<JobFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedWorker,
  onWorkerChange,
  selectedDate,
  onDateChange,
  selectedPriority,
  onPriorityChange,
  workers,
  className = ''
}) => {
  const allStatuses = getAllJobStatuses();
  const activeStatuses = getStatusesByGroup('active');
  const completedStatuses = getStatusesByGroup('completed');
  const inactiveStatuses = getStatusesByGroup('inactive');

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs by title, client, or address..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent text-sm font-inter"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent text-sm font-inter appearance-none bg-white min-w-[160px]"
          >
            <option value="all">All Statuses</option>
            
            <optgroup label="Active">
              {activeStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </optgroup>
            
            <optgroup label="Completed">
              {completedStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </optgroup>
            
            <optgroup label="Inactive">
              {inactiveStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Worker Filter */}
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={selectedWorker}
            onChange={(e) => onWorkerChange(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent text-sm font-inter appearance-none bg-white min-w-[140px]"
          >
            <option value="all">All Workers</option>
            {workers.map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent text-sm font-inter"
          />
        </div>

        {/* Priority Filter */}
        <select
          value={selectedPriority}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent text-sm font-inter appearance-none bg-white min-w-[120px]"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        {/* Advanced Filters Button */}
        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-inter font-medium whitespace-nowrap">
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </button>
      </div>
    </div>
  );
};

export default JobFilters;