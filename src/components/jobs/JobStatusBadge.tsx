import React from 'react';
import { 
  Clock, 
  Play, 
  CheckCircle, 
  XCircle, 
  Pause, 
  AlertTriangle, 
  Archive 
} from 'lucide-react';
import { getJobStatus } from '../../constants/jobStatuses';

interface JobStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({ 
  status, 
  size = 'md', 
  showIcon = true,
  className = '' 
}) => {
  const statusConfig = getJobStatus(status);
  
  if (!statusConfig) {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-inter font-medium bg-gray-100 text-gray-800 ${className}`}>
        Unknown
      </span>
    );
  }

  const getIcon = () => {
    switch (statusConfig.icon) {
      case 'Clock':
        return Clock;
      case 'Play':
        return Play;
      case 'CheckCircle':
        return CheckCircle;
      case 'XCircle':
        return XCircle;
      case 'Pause':
        return Pause;
      case 'AlertTriangle':
        return AlertTriangle;
      case 'Archive':
        return Archive;
      default:
        return Clock;
    }
  };

  const Icon = getIcon();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  return (
    <span 
      className={`inline-flex items-center rounded-full font-inter font-medium ${statusConfig.bgColor} ${statusConfig.color} ${sizeClasses[size]} ${className}`}
      title={statusConfig.description}
    >
      {showIcon && <Icon className={`${iconSizes[size]} mr-1`} />}
      {statusConfig.label}
    </span>
  );
};

export default JobStatusBadge;