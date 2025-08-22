import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Landing page components
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import TrustBar from './components/TrustBar';
import BenefitsSection from './components/BenefitsSection';
import HowItWorksSection from './components/HowItWorksSection';
import TestimonialSection from './components/TestimonialSection';
import PricingSection from './components/PricingSection';
import FAQSection from './components/FAQSection';
import CTABanner from './components/CTABanner';
import Footer from './components/Footer';

// Lazy load components for better performance
const SignUpPage = React.lazy(() => import('./components/auth/SignUpPage'));
const SignInPage = React.lazy(() => import('./components/auth/SignInPage'));
const ForgotPasswordPage = React.lazy(() => import('./components/auth/ForgotPasswordPage'));
const AuthCallback = React.lazy(() => import('./components/auth/AuthCallback'));
const AcceptInvitePage = React.lazy(() => import('./components/auth/AcceptInvitePage'));
const OnboardingFlow = React.lazy(() => import('./components/onboarding/OnboardingFlow'));
const AdminDashboard = React.lazy(() => import('./components/dashboard/AdminDashboard'));
const ManagerDashboard = React.lazy(() => import('./components/dashboard/ManagerDashboard'));
const WorkerDashboard = React.lazy(() => import('./components/dashboard/WorkerDashboard'));
const WorkerPage = React.lazy(() => import('./components/dashboard/WorkerPage'));
const TimeClockDashboard = React.lazy(() => import('./components/dashboard/TimeClockDashboard'));
const TimeSheetDashboard = React.lazy(() => import('./components/dashboard/TimeSheetDashboard'));
const JobsDashboard = React.lazy(() => import('./components/dashboard/JobsDashboard'));
const CreateJobDashboard = React.lazy(() => import('./components/dashboard/CreateJobDashboard'));
const ClientsDashboard = React.lazy(() => import('./components/dashboard/ClientsDashboard'));
const InvoicesDashboard = React.lazy(() => import('./components/dashboard/InvoicesDashboard'));
const ScheduleDashboard = React.lazy(() => import('./components/dashboard/ScheduleDashboard'));

// Add Edit Job Dashboard
const EditJobDashboard = React.lazy(() => import('./components/dashboard/EditJobDashboard'));
// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-soft-sky to-white flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto mb-4"></div>
      <p className="text-gray-600 font-inter">Loading...</p>
    </div>
  </div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <TrustBar />
      <BenefitsSection />
      <HowItWorksSection />
      <TestimonialSection />
      <PricingSection />
      <FAQSection />
      <CTABanner />
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <React.Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Auth Routes */}
            <Route path="/auth/signup" element={<SignUpPage />} />
            <Route path="/auth/signin" element={<SignInPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/accept-invite" element={<AcceptInvitePage />} />
            
            {/* Onboarding */}
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute requireOnboarding={false}>
                  <OnboardingFlow />
                </ProtectedRoute>
              } 
            />
            
            {/* Dashboard */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Manager Dashboard */}
            <Route 
              path="/manager-dashboard" 
              element={
                <ProtectedRoute>
                  <ManagerDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Worker Dashboard */}
            <Route 
              path="/worker-dashboard" 
              element={
                <ProtectedRoute>
                  <WorkerDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Workers Page */}
            <Route 
              path="/workers" 
              element={
                <ProtectedRoute>
                  <WorkerPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Time Clock Page */}
            <Route 
              path="/time-clock" 
              element={
                <ProtectedRoute>
                  <TimeClockDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Time Sheet Page */}
            <Route 
              path="/time-sheet" 
              element={
                <ProtectedRoute>
                  <TimeSheetDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Schedule Page */}
            <Route 
              path="/schedule" 
              element={
                <ProtectedRoute>
                  <ScheduleDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Jobs Page */}
            <Route 
              path="/jobs" 
              element={
                <ProtectedRoute>
                  <JobsDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Create Job Page */}
            <Route 
              path="/jobs/create" 
              element={
                <ProtectedRoute>
                  <CreateJobDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Edit Job Page */}
            <Route 
              path="/jobs/edit/:jobId" 
              element={
                <ProtectedRoute>
                  <EditJobDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Clients Page */}
            <Route 
              path="/clients" 
              element={
                <ProtectedRoute>
                  <ClientsDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Invoices Page */}
            <Route 
              path="/invoices" 
              element={
                <ProtectedRoute>
                  <InvoicesDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Settings Page */}
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all - redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;