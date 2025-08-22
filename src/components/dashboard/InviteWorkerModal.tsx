import React, { useState } from 'react';
import { X, UserPlus, Mail, Phone, User, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface InviteWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSent: () => void;
}

const InviteWorkerModal: React.FC<InviteWorkerModalProps> = ({ 
  isOpen, 
  onClose, 
  onInviteSent 
}) => {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'manager' | 'worker'>('worker');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, profile } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile?.business_id) {
      setError('Unable to send invite. Please try again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Reset expiration date for the invite
      console.log('🔵 Profile data:', profile);
      
      // Get business details
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('company_name')
        .eq('id', profile.business_id)
        .single();

      if (businessError) throw businessError;
      console.log('🔵 Business data:', businessData);

      // Create invite record
      const invitePayload = {
        email: email.toLowerCase().trim(),
        phone_number: phoneNumber.trim() || null,
        name: name.trim() || null,
        role,
        business_id: profile.business_id,
        company_name: businessData.company_name || 'Your Company',
        invited_by: user.id,
        status: 'pending',
        trial_start_date: profile.trial_start_date,
        trial_end_date: profile.trial_end_date
      };
      
      console.log('🔵 Invite payload:', invitePayload);
      console.log('🔵 Payload details:', {
        email: typeof invitePayload.email,
        role: typeof invitePayload.role,
        business_id: typeof invitePayload.business_id,
        company_name: typeof invitePayload.company_name,
        invited_by: typeof invitePayload.invited_by,
        trial_start_date: invitePayload.trial_start_date,
        trial_end_date: invitePayload.trial_end_date
      });
      
      const { data: inviteData, error: inviteError } = await supabase
        .from('user_invites')
        .insert(invitePayload)
        .select()
        .single();

      if (inviteError) {
        console.error('🔴 Invite creation error:', inviteError);
        console.error('🔴 Error details:', {
          message: inviteError.message,
          details: inviteError.details,
          hint: inviteError.hint,
          code: inviteError.code
        });
        if (inviteError.code === '23505') {
          setError('This email has already been invited to your business.');
        } else if (inviteError.code === '23502') {
          setError('Missing required information. Please check all fields.');
        } else if (inviteError.message?.includes('violates check constraint')) {
          setError('Invalid role selected. Please choose Manager or Worker.');
        } else {
          setError(`Database error: ${inviteError.message}`);
        }
        return;
      }

      console.log('🟢 Invite created successfully:', inviteData);
      console.log('🔵 Generated token:', inviteData.token);

      // Send invite email via Supabase Edge Function
      try {
        console.log('🔵 Sending email via Edge Function...');
        const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-invite', {
          body: {
            email: email.toLowerCase().trim(),
            name: name.trim() || email.split('@')[0],
            role,
            companyName: businessData.company_name || 'Your Company',
            token: inviteData.token
          }
        });

        if (emailError) {
          console.error('🔴 Email sending error:', emailError);
          setError('Invite created but failed to send email. You can resend it from the Workers page.');
        } else {
          console.log('🟢 Email sent successfully:', emailResult);
        }
      } catch (emailError) {
        console.error('🔴 Edge Function error:', emailError);
        setError('Invite created but failed to send email. You can resend it from the Workers page.');
      }

      // Reset form and close modal
      setEmail('');
      setPhoneNumber('');
      setName('');
      setRole('worker');
      onInviteSent();
    } catch (error) {
      console.error('🔴 Error sending invite:', error);
      setError('Failed to send invite. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-forest p-2 rounded-lg">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-dm-sans font-bold text-dark-slate">
              Invite to Crew
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-inter font-medium text-dark-slate mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                placeholder="worker@email.com"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-sm font-inter font-medium text-dark-slate mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-inter font-medium text-dark-slate mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                placeholder="John Smith"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-inter font-medium text-dark-slate mb-2">
              Role *
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'manager' | 'worker')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter appearance-none bg-white"
                required
              >
                <option value="worker">Worker</option>
                <option value="manager">Manager</option>
              </select>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm font-inter">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-inter font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="flex-1 bg-forest text-white py-3 rounded-lg hover:bg-forest/90 transition-all duration-200 font-inter font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Send Invite
                </>
              )}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <p className="text-xs text-gray-500 text-center mt-4 font-inter">
          The invite will expire in 7 days. You can resend or revoke invites from the Workers page.
        </p>
      </div>
    </div>
  );
};

export default InviteWorkerModal;