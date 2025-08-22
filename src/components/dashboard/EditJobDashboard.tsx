import React from 'react';
import DashboardLayout from './DashboardLayout';
import EditJobPage from '../jobs/EditJobPage';

const EditJobDashboard = () => {
  return (
    <DashboardLayout userRole="admin">
      <EditJobPage />
    </DashboardLayout>
  );
};

export default EditJobDashboard;