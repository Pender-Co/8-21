import React from 'react';
import DashboardLayout from './DashboardLayout';
import JobsPage from './JobsPage';

const JobsDashboard = () => {
  return (
    <DashboardLayout userRole="admin">
      <JobsPage />
    </DashboardLayout>
  );
};

export default JobsDashboard;