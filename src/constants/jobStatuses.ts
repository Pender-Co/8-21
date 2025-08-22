// Centralized job status management for scalability
export interface JobStatus {
  value: string;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
  allowedTransitions: string[];
}

export const JOB_STATUSES: Record<string, JobStatus> = {
  scheduled: {
    value: 'scheduled',
    label: 'Scheduled',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    icon: 'Clock',
    description: 'Job is scheduled and ready to begin',
    allowedTransitions: ['in_progress', 'cancelled', 'on_hold']
  },
  in_progress: {
    value: 'in_progress',
    label: 'In Progress',
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    icon: 'Play',
    description: 'Job is currently being worked on',
    allowedTransitions: ['completed', 'on_hold', 'requires_approval']
  },
  completed: {
    value: 'completed',
    label: 'Completed',
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    icon: 'CheckCircle',
    description: 'Job has been successfully completed',
    allowedTransitions: ['archived']
  },
  cancelled: {
    value: 'cancelled',
    label: 'Cancelled',
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    icon: 'XCircle',
    description: 'Job has been cancelled',
    allowedTransitions: ['scheduled', 'archived']
  },
  on_hold: {
    value: 'on_hold',
    label: 'On Hold',
    color: 'text-orange-800',
    bgColor: 'bg-orange-100',
    icon: 'Pause',
    description: 'Job is temporarily paused',
    allowedTransitions: ['scheduled', 'in_progress', 'cancelled']
  },
  requires_approval: {
    value: 'requires_approval',
    label: 'Requires Approval',
    color: 'text-purple-800',
    bgColor: 'bg-purple-100',
    icon: 'AlertTriangle',
    description: 'Job needs approval before completion',
    allowedTransitions: ['completed', 'in_progress', 'on_hold']
  },
  pending_approval: {
    value: 'pending_approval',
    label: 'Pending Approval',
    color: 'text-indigo-800',
    bgColor: 'bg-indigo-100',
    icon: 'Clock',
    description: 'Waiting for client or manager approval',
    allowedTransitions: ['scheduled', 'cancelled']
  },
  archived: {
    value: 'archived',
    label: 'Archived',
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    icon: 'Archive',
    description: 'Job has been archived',
    allowedTransitions: []
  }
};

// Get all available statuses as array
export const getAllJobStatuses = (): JobStatus[] => {
  return Object.values(JOB_STATUSES);
};

// Get active statuses (excluding archived)
export const getActiveJobStatuses = (): JobStatus[] => {
  return Object.values(JOB_STATUSES).filter(status => status.value !== 'archived');
};

// Get status by value
export const getJobStatus = (value: string): JobStatus | undefined => {
  return JOB_STATUSES[value];
};

// Check if status transition is allowed
export const isStatusTransitionAllowed = (fromStatus: string, toStatus: string): boolean => {
  const status = getJobStatus(fromStatus);
  return status ? status.allowedTransitions.includes(toStatus) : false;
};

// Get allowed transitions for a status
export const getAllowedTransitions = (currentStatus: string): JobStatus[] => {
  const status = getJobStatus(currentStatus);
  if (!status) return [];
  
  return status.allowedTransitions
    .map(statusValue => getJobStatus(statusValue))
    .filter((status): status is JobStatus => status !== undefined);
};

// Status groups for filtering
export const STATUS_GROUPS = {
  active: ['scheduled', 'in_progress', 'on_hold', 'requires_approval', 'pending_approval'],
  completed: ['completed'],
  inactive: ['cancelled', 'archived']
};

// Get statuses by group
export const getStatusesByGroup = (group: keyof typeof STATUS_GROUPS): JobStatus[] => {
  return STATUS_GROUPS[group]
    .map(statusValue => getJobStatus(statusValue))
    .filter((status): status is JobStatus => status !== undefined);
};