import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, MapPin, Calendar, User, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTimeTracking } from '../../hooks/useTimeTracking';

const TimeClockPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<string>('Getting location...');
  const [jobSite, setJobSite] = useState<string>('');
  
  const { profile } = useAuth();
  const {
    currentEntry,
    todayEntries,
    isClocked,
    onBreak,
    loading,
    error,
    clockIn,
    clockOut,
    startBreak,
    endBreak
  } = useTimeTracking();

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd reverse geocode this to get an address
          setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        },
        () => {
          setLocation('Location unavailable');
        }
      );
    }
  }, []);

  const handleClockIn = async () => {
    await clockIn(location, jobSite || undefined);
  };

  const handleClockOut = async () => {
    await clockOut(location);
  };

  const handleBreak = async () => {
    if (onBreak) {
      await endBreak();
    } else {
      await startBreak();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTotalHoursToday = () => {
    return todayEntries
      .filter(entry => entry.status === 'completed')
      .reduce((total, entry) => {
        if (!entry.clock_out_time) return total;
        const hours = (new Date(entry.clock_out_time).getTime() - new Date(entry.clock_in_time).getTime()) / (1000 * 60 * 60);
        const breakHours = entry.total_break_minutes / 60;
        return total + Math.max(0, hours - breakHours);
      }, 0);
  };

  const displayName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : profile?.email?.split('@')[0] || 'Worker';

  return (
    <div className="min-h-screen bg-neutral-stone p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-dm-sans font-bold text-dark-slate mb-2">
            Time Clock
          </h1>
          <p className="text-gray-600 font-inter">
            Welcome back, {displayName}
          </p>
        </div>

        {/* Current Time Display */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="mb-6">
            <div className="text-5xl md:text-6xl font-dm-sans font-bold text-dark-slate mb-2">
              {formatTime(currentTime)}
            </div>
            <div className="text-lg text-gray-600 font-inter">
              {formatDate(currentTime)}
            </div>
          </div>

          {/* Clock Status */}
          <div className="mb-6">
            {isClocked ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 font-inter font-semibold">
                  {onBreak ? 'On Break' : 'Clocked In'}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600 font-inter font-semibold">Not Clocked In</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm font-inter">{error}</p>
            </div>
          )}
          
          {!isClocked && (
            <div className="mb-4">
              <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                Job Site (Optional)
              </label>
              <input
                type="text"
                value={jobSite}
                onChange={(e) => setJobSite(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                placeholder="Enter job site or client name"
              />
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isClocked ? (
              <button
                onClick={handleClockIn}
                disabled={loading}
                className="bg-forest text-white px-8 py-4 rounded-lg hover:bg-forest/90 transition-all duration-200 font-inter font-semibold text-lg flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Clocking In...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Clock In
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={handleClockOut}
                  disabled={loading}
                  className="bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-all duration-200 font-inter font-semibold text-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Clocking Out...
                    </>
                  ) : (
                    <>
                      <Pause className="mr-2 h-5 w-5" />
                      Clock Out
                    </>
                  )}
                </button>
                <button
                  onClick={handleBreak}
                  disabled={loading}
                  className={`px-8 py-4 rounded-lg transition-all duration-200 font-inter font-semibold text-lg flex items-center justify-center ${
                    onBreak
                      ? 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50'
                      : 'border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white'
                  } disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                      {onBreak ? 'Ending Break...' : 'Starting Break...'}
                    </>
                  ) : (
                    <>
                      <Clock className="mr-2 h-5 w-5" />
                      {onBreak ? 'End Break' : 'Take Break'}
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Current Session Info */}
        {currentEntry && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="text-lg font-dm-sans font-semibold text-dark-slate mb-4">
              Current Session
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-gray-600">Started:</span>
                <span className="ml-2 font-semibold">
                  {new Date(currentEntry.clock_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-gray-600">Location:</span>
                <span className="ml-2 font-semibold truncate">{currentEntry.location_clock_in || 'Not specified'}</span>
              </div>
              {currentEntry.job_site && (
                <div className="flex items-center">
                  <User className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-gray-600">Job Site:</span>
                  <span className="ml-2 font-semibold truncate">{currentEntry.job_site}</span>
                </div>
              )}
              {onBreak && currentEntry.break_start_time && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                  <span className="text-gray-600">Break started:</span>
                  <span className="ml-2 font-semibold">
                    {new Date(currentEntry.break_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Today's Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-inter font-medium text-gray-600">Hours Today</p>
                <p className="text-2xl font-dm-sans font-bold text-dark-slate mt-1">
                  {getTotalHoursToday()}h
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-inter font-medium text-gray-600">Sessions</p>
                <p className="text-2xl font-dm-sans font-bold text-dark-slate mt-1">
                  {todayEntries.length + (currentEntry ? 1 : 0)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <User className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-inter font-medium text-gray-600">Status</p>
                <p className="text-2xl font-dm-sans font-bold text-dark-slate mt-1">
                  {isClocked ? (onBreak ? 'Break' : 'Active') : 'Off'}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                isClocked ? (onBreak ? 'bg-yellow-100' : 'bg-green-100') : 'bg-gray-100'
              }`}>
                {isClocked ? (
                  onBreak ? (
                    <Pause className="h-6 w-6 text-yellow-600" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  )
                ) : (
                  <AlertCircle className="h-6 w-6 text-gray-600" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Today's Time Entries */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-dm-sans font-semibold text-dark-slate">
              Today's Time Entries
            </h3>
          </div>
          <div className="p-6">
            {todayEntries.length === 0 && !currentEntry ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-inter">No time entries for today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Current active entry */}
                {currentEntry && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Play className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-inter font-semibold text-dark-slate">
                            {currentEntry.job_site || 'Current Session'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Started at {new Date(currentEntry.clock_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-inter font-medium bg-blue-100 text-blue-800">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse"></div>
                          {onBreak ? 'On Break' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Completed entries */}
                {todayEntries.filter(entry => entry.status === 'completed').map((entry) => {
                  const totalHours = entry.clock_out_time 
                    ? Math.max(0, (new Date(entry.clock_out_time).getTime() - new Date(entry.clock_in_time).getTime()) / (1000 * 60 * 60) - (entry.total_break_minutes / 60))
                    : 0;
                  
                  return (
                  <div key={entry.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-inter font-semibold text-dark-slate">
                            {entry.job_site || 'Work Session'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(entry.clock_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {entry.clock_out_time ? new Date(entry.clock_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In Progress'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-inter font-semibold text-dark-slate">
                          {totalHours.toFixed(1)}h
                        </p>
                        <p className="text-xs text-gray-500">
                          {entry.total_break_minutes}min break
                        </p>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeClockPage;