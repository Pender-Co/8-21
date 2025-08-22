import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProfileAvatar from '../ProfileAvatar';
import ProfilePictureModal from './ProfilePictureModal';
import ProfileSettingsModal from './ProfileSettingsModal';
import { 
  Menu, 
  X, 
  Home, 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  Bell,
  Search,
  ChevronDown,
  User,
  Leaf,
  LogOut,
  Building2,
  Clock
} from 'lucide-react';

import { useLocation } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole?: 'admin' | 'manager' | 'worker';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  userRole = 'admin' 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileSettingsOpen, setProfileSettingsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [businessData, setBusinessData] = useState<any>(null);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  // Fetch business data when profile is available
  React.useEffect(() => {
    const fetchBusinessData = async () => {
      if (profile?.business_id) {
        try {
          const { supabase } = await import('../../lib/supabase');
          const { data, error } = await supabase
            .from('businesses')
            .select('company_name, industry')
            .eq('id', profile.business_id)
            .single();

          if (!error && data) {
            setBusinessData(data);
          }
        } catch (error) {
          console.error('Error fetching business data:', error);
        }
      }
    };

    fetchBusinessData();
  }, [profile?.business_id]);

  // Get display name and role from profile
  const displayName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : profile?.email?.split('@')[0] || 'User';
  
  const displayRole = profile?.role || userRole;
  
  // Get user initials for avatar
  const getInitials = (name: string) => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigation will be handled by the auth context
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigationItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    ...(userRole === 'worker' ? [] : [
      { icon: Calendar, label: 'Schedule', href: '/schedule' },
      { icon: Users, label: 'Workers', href: '/workers' },
      { icon: User, label: 'Clients', href: '/clients' },
      { icon: FileText, label: 'Jobs', href: '/jobs' },
      { icon: FileText, label: 'Invoices', href: '/invoices' },
      { icon: Clock, label: 'Time Sheets', href: '/time-sheet' }
    ]),
    ...(userRole === 'admin' ? [{ icon: Settings, label: 'Settings', href: '/settings' }] : []),
    ...(userRole === 'worker' ? [
      { icon: Calendar, label: 'My Schedule', href: '/worker-dashboard' },
      { icon: User, label: 'My Profile', href: '/worker-profile' },
      { icon: Clock, label: 'Time Clock', href: '/time-clock' }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-neutral-stone flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <img 
              src="https://uquwbbuhabutqqblyybr.supabase.co/storage/v1/object/public/assets//TradoHQ.png" 
              alt="TradoHQ Logo" 
              className="h-8 w-auto"
            />
            <span className="text-xl font-dm-sans font-bold text-dark-slate">TradoHQ</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col h-full">
          <nav className="mt-6 px-3 flex-1">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`
                  flex items-center px-3 py-3 text-sm font-inter font-medium rounded-lg transition-colors
                  ${location.pathname === item.href
                    ? 'bg-forest/10 text-forest' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </a>
            ))}
          </div>
          </nav>

          {/* Business Info at Bottom */}
          {businessData && (
            <div className="px-3 pb-4 border-t border-gray-200 pt-4">
              <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
                <div className="bg-forest/10 p-2 rounded-lg flex-shrink-0">
                  <Building2 className="h-5 w-5 text-forest" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-inter font-semibold text-dark-slate truncate">
                    {businessData.company_name || 'Your Business'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {businessData.industry || 'Service Business'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {/* Top navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              {/* User info in navbar */}
              <div className="hidden lg:flex items-center space-x-3">
                <div className="relative">
                  <button
                    onClick={() => setProfileModalOpen(true)}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    {profile?.avatar_url ? (
                      <ProfileAvatar 
                        filePath={profile.avatar_url} 
                        alt={`${displayName}'s profile`}
                        className="w-8 h-8"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-forest rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">
                          {getInitials(displayName)}
                        </span>
                      </div>
                    )}
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-inter font-medium text-gray-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{displayRole}</p>
                </div>
              </div>
              
              <div className="hidden sm:block lg:hidden">
                <h1 className="text-xl font-dm-sans font-semibold text-dark-slate">
                  Dashboard
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent text-sm font-inter"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile dropdown for mobile */}
              <div className="flex items-center space-x-2 lg:hidden">
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                >
                  {profile?.avatar_url ? (
                    <ProfileAvatar 
                      filePath={profile.avatar_url} 
                      alt={`${displayName}'s profile`}
                      className="w-8 h-8"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-forest rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-white">
                        {getInitials(displayName)}
                      </span>
                    </div>
                  )}
                </button>
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {/* Mobile Dropdown Menu */}
                  {dropdownOpen && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-10"
                        onClick={() => setDropdownOpen(false)}
                      />
                      
                      {/* Dropdown Content */}
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                        <div className="py-2">
                          <button
                            onClick={() => {
                              setDropdownOpen(false);
                              setProfileSettingsOpen(true);
                            }}
                            className="w-full px-4 py-2 text-left text-sm font-inter text-gray-700 hover:bg-gray-50 flex items-center"
                          >
                            <User className="h-4 w-4 mr-3" />
                            Profile Settings
                          </button>
                          
                          <hr className="my-1 border-gray-200" />
                          
                          <button
                            onClick={() => {
                              setDropdownOpen(false);
                              handleSignOut();
                            }}
                            className="w-full px-4 py-2 text-left text-sm font-inter text-red-600 hover:bg-red-50 flex items-center"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Settings/Menu for desktop */}
              <div className="hidden lg:block">
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-10"
                        onClick={() => setDropdownOpen(false)}
                      />
                      
                      {/* Dropdown Content */}
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                        <div className="py-2">
                          <button
                            onClick={() => {
                              setDropdownOpen(false);
                              setProfileSettingsOpen(true);
                            }}
                            className="w-full px-4 py-2 text-left text-sm font-inter text-gray-700 hover:bg-gray-50 flex items-center"
                          >
                            <User className="h-4 w-4 mr-3" />
                            Profile Settings
                          </button>
                          
                          <hr className="my-1 border-gray-200" />
                          
                          <button
                            onClick={() => {
                              setDropdownOpen(false);
                              handleSignOut();
                            }}
                            className="w-full px-4 py-2 text-left text-sm font-inter text-red-600 hover:bg-red-50 flex items-center"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8 bg-neutral-stone">
          {children}
        </main>

        {/* Profile Picture Modal */}
        <ProfilePictureModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
        />

        {/* Profile Settings Modal */}
        <ProfileSettingsModal
          isOpen={profileSettingsOpen}
          onClose={() => setProfileSettingsOpen(false)}
        />
      </div>
    </div>
  );
};

export default DashboardLayout;