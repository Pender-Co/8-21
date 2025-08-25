import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  FileText,
  AlertCircle,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useJobs, Job } from '../../hooks/useJobs';
import { supabase } from '../../lib/supabase';
import SchedulingSection from '../dashboard/SchedulingSection';
import ServiceItemsSection from '../dashboard/ServiceItemsSection';
import InternalNotesSection from '../dashboard/InternalNotesSection';



// === Recurrence helpers (inline for now) ===
const weekdayToNum: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};

function ensureHHMMSS(t: string) {
  if (!t) return null;
  return t.length === 5 ? `${t}:00` : t; // "09:00" -> "09:00:00"
}

function addPeriod(start: string, kind: 'weeks'|'months'|'years', amount: number): string {
  const d = new Date(`${start}T00:00:00`);
  if (kind === 'weeks') d.setDate(d.getDate() + amount * 7);
  if (kind === 'months') d.setMonth(d.getMonth() + amount);
  if (kind === 'years') d.setFullYear(d.getFullYear() + amount);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/**
 * Map your formData into the JSON `recurrence_pattern` your SQL expects.
 * Supports your current fields: jobType, repeatType, duration(+Unit), weeklyDay, monthlyDate, startDate.
 */
function buildRecurrencePattern(formData: EditJobFormData) {
  if (formData.jobType !== 'recurring') return null;

  const start_date = formData.startDate;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start_date)) {
    throw new Error('Start date is required for recurring jobs.');
  }

  // Duration -> end_date
  let end_date: string | null = null;
  const { duration, durationUnit } = formData; // 1 + 'weeks' | 'months' | 'years'
  if (duration && durationUnit) {
    end_date = addPeriod(start_date, durationUnit === 'days' ? 'weeks' : (durationUnit as any), durationUnit === 'days' ? Math.ceil(duration/7) : duration);
  }

  const base: any = {
    interval: 1,
    start_date,
    end_date,
    tz: 'America/Denver', // or read from profile
  };

  // Map repeatType to freq + specifics
  if (formData.repeatType === 'weekly') {
    base.freq = 'weekly';
    // Your form has a single `weeklyDay` string like "Monday"
    const dayNum = weekdayToNum[formData.weeklyDay] ?? 1; // default Monday
    base.byweekday = [dayNum];
  } else if (formData.repeatType === 'monthly') {
    base.freq = 'monthly';
    base.bymonthday = formData.monthlyDate || 1;
  } else if (formData.repeatType === 'as-needed') {
    // No real recurrence rule → treat as one-off
    return null;
  } else {
    // 'custom' not yet modeled → you can extend later
    base.freq = 'weekly';
    base.byweekday = [weekdayToNum['Monday']];
  }

  return base;
}


interface ServiceItem {
  id: string;
  itemName: string;
  quantity: number;
  unitCost: number | null;
  unitPrice: number;
  description: string;
  total: number;
  sortOrder: number;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  localUrl: string;
  supabaseUrl?: string;
  rawFile?: File;
  uploadedAt: Date;
}

interface EditJobFormData {
  title: string;
  description: string;
  clientId: string;
  selectedAddress: any | null;
  jobType: 'one-off' | 'recurring';
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  durationUnit: 'days' | 'weeks' | 'months' | 'years';
  repeatType: 'as-needed' | 'weekly' | 'monthly' | 'custom';
  weeklyDay: string;
  monthlyDate: number;
  scheduleNow: boolean;
  remindToInvoice: boolean;
  billingMethod: 'per-visit' | 'fixed-price';
  invoiceTiming: string;
  useChecklist: 'yes' | 'no';
  serviceItems: ServiceItem[];
  internalNotes: string;
  attachedFiles: UploadedFile[];
  priority: 'low' | 'medium' | 'high';
  estimatedDuration: number;
}

const EditJobPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { jobs, updateJob } = useJobs();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const [formData, setFormData] = useState<EditJobFormData>({
    title: '',
    description: '',
    clientId: '',
    selectedAddress: null,
    jobType: 'one-off',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    duration: 1,
    durationUnit: 'weeks',
    repeatType: 'weekly',
    weeklyDay: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    monthlyDate: new Date().getDate(),
    scheduleNow: true,
    remindToInvoice: false,
    billingMethod: 'per-visit',
    invoiceTiming: '',
    useChecklist: 'no',
    serviceItems: [],
    internalNotes: '',
    attachedFiles: [],
    priority: 'medium',
    estimatedDuration: 0
  });

  // Load job data
  useEffect(() => {
    const loadJob = async () => {
      if (!jobId) {
        navigate('/jobs');
        return;
      }

      try {
        setLoading(true);
        
        // Find job in the jobs array first
        const existingJob = jobs.find(j => j.id === jobId);
        if (existingJob) {
          setJob(existingJob);
          populateFormData(existingJob);
          setLoading(false);
          return;
        }

        // If not found in array, fetch from database
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            clients (
              first_name,
              last_name,
              business_name,
              email,
              phone_number,
              street_address,
              city,
              state,
              zip_code
            ),
            job_service_items (
              id,
              item_name,
              quantity,
              unit_cost,
              unit_price,
              description,
              total,
              sort_order
            )
          `)
          .eq('id', jobId)
          .single();

        if (error) throw error;
        if (!data) {
          setError('Job not found');
          return;
        }

        setJob(data);
        populateFormData(data);
      } catch (err: any) {
        console.error('Error loading job:', err);
        setError(err.message || 'Failed to load job');
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [jobId, jobs, navigate]);

  const populateFormData = (jobData: Job) => {
    // Convert service items to form format
    const serviceItems: ServiceItem[] = (jobData.job_service_items || []).map(item => ({
      id: item.id,
      itemName: item.item_name,
      quantity: item.quantity,
      unitCost: item.unit_cost,
      unitPrice: item.unit_price,
      description: item.description || '',
      total: item.total,
      sortOrder: item.sort_order
    }));

    // Convert existing attachments to form format
    const attachedFiles: UploadedFile[] = (jobData.attachments || []).map(attachment => ({
      id: attachment.id || `existing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: attachment.name,
      size: attachment.size,
      type: attachment.type,
      localUrl: attachment.url, // Use existing URL for preview
      supabaseUrl: attachment.url, // Mark as already uploaded
      uploadedAt: new Date(attachment.uploadedAt || Date.now())
    }));

    setFormData({
      title: jobData.title,
      description: jobData.description || '',
      clientId: jobData.client_id,
      selectedAddress: null, // Will be loaded separately if needed
      jobType: jobData.is_recurring ? 'recurring' : 'one-off',
      startDate: jobData.scheduled_date || '',
      endDate: jobData.scheduled_date || '',
      startTime: jobData.scheduled_time || '',
      endTime: '',
      duration: 1,
      durationUnit: 'weeks',
      repeatType: 'weekly',
      weeklyDay: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      monthlyDate: new Date().getDate(),
      scheduleNow: true,
      remindToInvoice: false,
      billingMethod: 'per-visit',
      invoiceTiming: '',
      useChecklist: 'no',
      serviceItems,
      internalNotes: jobData.notes || '',
      attachedFiles,
      priority: jobData.priority,
      estimatedDuration: jobData.estimated_duration
    });
  };

  // Track form changes
  useEffect(() => {
    if (!job) return;
    
    const hasChanges = 
      formData.title !== job.title ||
      formData.description !== (job.description || '') ||
      formData.priority !== job.priority ||
      formData.estimatedDuration !== job.estimated_duration ||
      formData.internalNotes !== (job.notes || '') ||
      formData.serviceItems.length !== (job.job_service_items?.length || 0);
    
    setHasUnsavedChanges(hasChanges);
  }, [formData, job]);

  // Handle navigation warnings
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleInputChange = (field: keyof EditJobFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSchedulingChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceItemsChange = (items: ServiceItem[]) => {
    setFormData(prev => ({ ...prev, serviceItems: items }));
  };

  const handleInternalNotesChange = (notes: string) => {
    setFormData(prev => ({ ...prev, internalNotes: notes }));
  };

  const handleAttachedFilesChange = (files: UploadedFile[]) => {
    setFormData(prev => ({ ...prev, attachedFiles: files }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.title.trim()) {
      errors.push('Job title is required');
    }
    
    if (!formData.description.trim()) {
      errors.push('Job description is required');
    }
    
    return errors;
  };

  const handleSave = async () => {
    if (!job || !user || !profile?.business_id) {
      setError('Unable to save job. Please try again.');
      return;
    }

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Upload new files to Supabase Storage
      const finalAttachments = [];
      
      for (const file of formData.attachedFiles) {
        if (file.rawFile) {
          // This is a new file that needs to be uploaded
          try {
            // Generate unique file path
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            const filePath = `jobs/${fileName}`;

            console.log('🔵 Uploading file to Supabase Storage:', filePath);

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
              .from('job-attachments')
              .upload(filePath, file.rawFile);

            if (uploadError) {
              console.error('🔴 File upload error:', uploadError);
              throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('job-attachments')
              .getPublicUrl(filePath);

            console.log('🟢 File uploaded successfully:', publicUrl);

            // Add to final attachments
            finalAttachments.push({
              id: file.id,
              name: file.name,
              size: file.size,
              type: file.type,
              url: publicUrl,
              uploadedAt: file.uploadedAt.toISOString()
            });
          } catch (uploadError) {
            console.error('🔴 Error uploading file:', uploadError);
            setError(`Failed to upload ${file.name}. Please try again.`);
            setSaving(false);
            return;
          }
        } else if (file.supabaseUrl) {
          // This is an existing file that was already uploaded
          finalAttachments.push({
            id: file.id,
            name: file.name,
            size: file.size,
            type: file.type,
            url: file.supabaseUrl,
            uploadedAt: file.uploadedAt.toISOString()
          });
        }
      }

      // Calculate estimated cost from service items
      const estimatedCost = formData.serviceItems.reduce((sum, item) => sum + item.total, 0);
      
      const jobUpdates = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        estimated_duration: formData.estimatedDuration,
        estimated_cost: estimatedCost,
        notes: formData.internalNotes.trim() || null,
        scheduled_date: formData.startDate || null,
        scheduled_time: formData.startTime || null,
        attachments: finalAttachments
      };

      console.log('🔵 Updating job:', jobUpdates);

      // Update job
      await updateJob(job.id, jobUpdates);

      // Update service items if they changed
      if (formData.serviceItems.length > 0) {
        // Delete existing service items
        await supabase
          .from('job_service_items')
          .delete()
          .eq('job_id', job.id);

        // Insert new service items
        const serviceItemsData = formData.serviceItems.map((item, index) => ({
          job_id: job.id,
          business_id: profile.business_id,
          item_name: item.itemName.trim(),
          quantity: item.quantity,
          unit_cost: item.unitCost,
          unit_price: item.unitPrice,
          description: item.description.trim() || null,
          sort_order: index
        }));

        const { error: serviceItemsError } = await supabase
          .from('job_service_items')
          .insert(serviceItemsData);

        if (serviceItemsError) throw serviceItemsError;
      }

      console.log('🟢 Job updated successfully');
      
      // Clear unsaved changes flag
      setHasUnsavedChanges(false);
      
      // Navigate back to jobs page
      navigate('/jobs');

    } catch (error: any) {
      console.error('🔴 Error updating job:', error);
      setError(error.message || 'Failed to update job. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true);
      setPendingNavigation('back');
    } else {
      navigate('/jobs');
    }
  };

  const handleDiscardChanges = () => {
    setHasUnsavedChanges(false);
    setShowUnsavedWarning(false);
    
    if (pendingNavigation === 'back') {
      navigate('/jobs');
    }
    setPendingNavigation(null);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto mb-4"></div>
          <p className="text-gray-600 font-inter">Loading job...</p>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-red-600 font-inter mb-4">{error}</p>
          <button
            onClick={() => navigate('/jobs')}
            className="bg-forest text-white px-4 py-2 rounded-lg hover:bg-forest/90 transition-colors font-inter font-semibold"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-600 font-inter">Job not found</p>
          <button
            onClick={() => navigate('/jobs')}
            className="mt-4 bg-forest text-white px-4 py-2 rounded-lg hover:bg-forest/90 transition-colors font-inter font-semibold"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackClick}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-dm-sans font-bold text-dark-slate">
                Edit Job
              </h1>
              <p className="text-gray-600 font-inter mt-1">
                Update job details and settings
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBackClick}
              className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors font-inter font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-forest text-white px-6 py-3 rounded-lg hover:bg-forest/90 transition-all duration-200 font-inter font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Job Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Job Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-dm-sans font-bold text-dark-slate mb-6 flex items-center">
                <FileText className="h-6 w-6 text-forest mr-2" />
                Job Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                    placeholder="e.g., Weekly Lawn Maintenance"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                    Job Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter resize-none"
                    placeholder="Describe the work to be performed..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value as 'low' | 'medium' | 'high')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                      Estimated Duration (hours)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.estimatedDuration}
                      onChange={(e) => handleInputChange('estimatedDuration', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Client Info (Read-only) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-dm-sans font-bold text-dark-slate mb-6 flex items-center">
                <FileText className="h-6 w-6 text-forest mr-2" />
                Client Information
              </h2>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-inter font-semibold text-dark-slate mb-2">
                    {job.clients?.business_name || 
                     `${job.clients?.first_name || ''} ${job.clients?.last_name || ''}`.trim() ||
                     'Unknown Client'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {job.clients?.street_address}, {job.clients?.city}, {job.clients?.state} {job.clients?.zip_code}
                  </p>
                  {job.clients?.phone_number && (
                    <p className="text-sm text-gray-600 mt-1">{job.clients.phone_number}</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-inter">
                  To change the client or address, create a new job or contact support.
                </p>
              </div>
            </div>
          </div>

          {/* Scheduling Section */}
          <SchedulingSection
            formData={formData}
            onChange={handleSchedulingChange}
          />

          {/* Service Items Section */}
          <ServiceItemsSection
            serviceItems={formData.serviceItems}
            onChange={handleServiceItemsChange}
          />

          {/* Internal Notes Section */}
          <InternalNotesSection
            notes={formData.internalNotes}
            files={formData.attachedFiles}
            onNotesChange={handleInternalNotesChange}
            onFilesChange={handleAttachedFilesChange}
          />

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-600 text-sm font-inter font-medium">
                  Please fix the following errors:
                </p>
                <p className="text-red-600 text-sm font-inter mt-1">
                  {error}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unsaved Changes Warning Modal */}
      {showUnsavedWarning && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-dm-sans font-bold text-dark-slate">
                    Unsaved Changes
                  </h2>
                </div>
                <button
                  onClick={() => setShowUnsavedWarning(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 font-inter mb-4">
                  You have unsaved changes to this job. If you leave now, your changes will be lost.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowUnsavedWarning(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-inter font-semibold"
                >
                  Stay on Page
                </button>
                <button
                  onClick={handleDiscardChanges}
                  className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-all duration-200 font-inter font-semibold"
                >
                  Discard Changes
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default EditJobPage;