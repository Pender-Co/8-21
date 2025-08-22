import React from 'react';
import { getAllJobStatuses, getStatusesByGroup } from '../../constants/jobStatuses';

interface JobTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  jobCounts: Record<string, number>;
  className?: string;
}

const JobTabs: React.FC<JobTabsProps> = ({
  activeTab,
  onTabChange,
  jobCounts,
  className = ''
}) => {
  const allStatuses = getAllJobStatuses();
  const activeStatuses = getStatusesByGroup('active');
  const completedStatuses = getStatusesByGroup('completed');
  const inactiveStatuses = getStatusesByGroup('inactive');

  const tabs = [
    {
      id: 'all',
      label: 'All Jobs',
      count: Object.values(jobCounts).reduce((sum, count) => sum + count, 0)
    },
    {
      id: 'active',
      label: 'Active',
      count: activeStatuses.reduce((sum, status) => sum + (jobCounts[status.value] || 0), 0)
    },
    {
      id: 'scheduled',
      label: 'Scheduled',
      count: jobCounts.scheduled || 0
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      count: jobCounts.in_progress || 0
    },
    {
      id: 'completed',
      label: 'Completed',
      count: jobCounts.completed || 0
    },
    {
      id: 'on_hold',
      label: 'On Hold',
      count: jobCounts.on_hold || 0
    }
  ];

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-inter font-medium text-sm transition-colors whitespace-nowrap ${
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
    </div>
  );
};

export default JobTabs;