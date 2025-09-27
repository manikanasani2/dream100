import React, { useState, useEffect } from 'react';
import { X, User, Building, Mail, Phone, Globe, Linkedin, MessageSquare, Calendar, Trash2, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ToggleSwitch from './ToggleSwitch';
import LeadMessagesTab from './LeadMessagesTab';
import LeadTimelineTab from './LeadTimelineTab';
import { Lead } from '../lib/supabase';

interface LeadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onUpdate: (process_id: string, updates: Partial<Lead>) => Promise<void>;
  onDelete: (process_id: string) => Promise<void>;
}

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  isOpen,
  onClose,
  lead,
  onUpdate,
  onDelete
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'messages' | 'timeline'>('details');

  // Handle toggle changes with proper state management
  const handleToggleChange = async (field: keyof Lead, newValue: boolean, defaultMessage?: string) => {
    if (!lead) return;

    setIsUpdating(true);
    try {
      let updateValue: any = newValue;
      
      // Special handling for connection_request_message
      if (field === 'connection_request_message') {
        updateValue = newValue ? (defaultMessage || 'Connection request sent') : null;
      }
      
      await onUpdate(lead.process_id, { [field]: updateValue });
      
      // Show success toast
      const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      toast.success(`${fieldName} updated successfully`);
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast.error(`Failed to update ${field.replace(/_/g, ' ')}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!lead) return;
    
    if (!confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(lead.process_id);
      toast.success('Lead deleted successfully');
      onClose();
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !lead) return null;

  // Calculate current stage for display
  const getCurrentStage = () => {
    if (lead.booked_meeting) return 'Meeting Booked';
    if (lead.dm_3) return 'DM3 Sent';
    if (lead.dm_2) return 'DM2 Sent';
    if (lead.dm_1sent) return 'DM1 Sent';
    if (lead.connection_accepted_status) return 'Connected';
    if (lead.connection_request_message) return 'Connection Request Sent';
    return 'New Lead';
  };

  const getNextAction = () => {
    if (lead.booked_meeting) return 'Follow up after meeting';
    if (lead.dm_3) return 'Wait for response or book meeting';
    if (lead.dm_2) return 'Send DM3 follow-up';
    if (lead.dm_1sent) return 'Send DM2 follow-up';
    if (lead.connection_accepted_status) return 'Send first DM';
    if (lead.connection_request_message) return 'Wait for connection acceptance';
    return 'Send connection request';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-panels border border-white/10 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent-red rounded-xl flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text">{lead.lead_name}</h2>
              <p className="text-muted text-sm">{lead.lead_company_name || 'Unknown Company'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors"
          >
            <X className="h-5 w-5 text-muted" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-elevated rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'details'
                ? 'bg-accent-red text-white shadow-lg shadow-accent-red/25'
                : 'text-muted hover:text-text hover:bg-white/5'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'messages'
                ? 'bg-accent-red text-white shadow-lg shadow-accent-red/25'
                : 'text-muted hover:text-text hover:bg-white/5'
            }`}
          >
            Messages
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'timeline'
                ? 'bg-accent-red text-white shadow-lg shadow-accent-red/25'
                : 'text-muted hover:text-text hover:bg-white/5'
            }`}
          >
            Timeline
          </button>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[400px]">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="h-5 w-5 text-accent-red" />
                  <h3 className="text-lg font-semibold text-text">Contact Information</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted">Industry:</label>
                    <p className="text-text font-medium">{lead.industry || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted">Job Title:</label>
                    <p className="text-text font-medium">{lead.job_title || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted">Email:</label>
                    <p className="text-text font-medium">{lead.lead_email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted">Phone:</label>
                    <p className="text-text font-medium">{lead.lead_phone_number || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Building className="h-5 w-5 text-accent-red" />
                  <h3 className="text-lg font-semibold text-text">Company Information</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted">Company:</label>
                    <p className="text-text font-medium">{lead.lead_company_name || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted">Services:</label>
                    <p className="text-text font-medium">{lead.potential_services || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="h-5 w-5 text-accent-red" />
                  <h3 className="text-lg font-semibold text-text">Quick Links</h3>
                </div>
                <div className="space-y-3">
                  {lead.lead_linkedin_url && (
                    <a
                      href={lead.lead_linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn Profile
                    </a>
                  )}
                  {lead.lead_company_linkedin_url && (
                    <a
                      href={lead.lead_company_linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                      Company LinkedIn
                    </a>
                  )}
                  {lead.company_website && (
                    <a
                      href={lead.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      Company Website
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Campaign Progress */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="h-5 w-5 text-accent-red" />
                  <h3 className="text-lg font-semibold text-text">Campaign Progress</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted">Current Stage:</label>
                    <p className="text-accent-red font-semibold">{getCurrentStage()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted">Next Action:</label>
                    <p className="text-text">{getNextAction()}</p>
                  </div>
                </div>
              </div>

              {/* Connection Status */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <User className="h-5 w-5 text-accent-red" />
                  <h3 className="text-lg font-semibold text-text">Connection Status</h3>
                </div>
                <div className="space-y-4">
                  <ToggleSwitch
                    checked={!!lead.connection_request_message}
                    onChange={(checked) => handleToggleChange('connection_request_message', checked)}
                    label="Connection Request Sent"
                    disabled={isUpdating}
                  />
                  <ToggleSwitch
                    checked={!!lead.connection_accepted_status}
                    onChange={(checked) => handleToggleChange('connection_accepted_status', checked)}
                    label="Connection Accepted"
                    disabled={isUpdating}
                  />
                </div>
              </div>

              {/* DM Status */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="h-5 w-5 text-accent-red" />
                  <h3 className="text-lg font-semibold text-text">DM Status</h3>
                </div>
                <div className="space-y-4">
                  <ToggleSwitch
                    checked={!!lead.dm_1sent}
                    onChange={(checked) => handleToggleChange('dm_1sent', checked)}
                    label="DM1 Sent"
                    disabled={isUpdating || !lead.connection_accepted_status}
                  />
                  <ToggleSwitch
                    checked={!!lead.dm_2}
                    onChange={(checked) => handleToggleChange('dm_2', checked)}
                    label="DM2 Sent"
                    disabled={isUpdating || !lead.dm_1sent}
                  />
                  <ToggleSwitch
                    checked={!!lead.dm_3}
                    onChange={(checked) => handleToggleChange('dm_3', checked)}
                    label="DM3 Sent"
                    disabled={isUpdating || !lead.dm_2}
                  />
                </div>
              </div>

              {/* Meeting Status */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="h-5 w-5 text-accent-red" />
                  <h3 className="text-lg font-semibold text-text">Meeting Status</h3>
                </div>
                <div className="space-y-4">
                  <ToggleSwitch
                    checked={!!lead.booked_meeting}
                    onChange={(checked) => handleToggleChange('booked_meeting', checked)}
                    label="Meeting Booked"
                    disabled={isUpdating}
                  />
                </div>
              </div>
            </div>
          </div>
          )}

          {activeTab === 'messages' && (
            <LeadMessagesTab lead={lead} onUpdate={onUpdate} />
          )}

          {activeTab === 'timeline' && (
            <LeadTimelineTab lead={lead} />
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 mt-8 border-t border-white/10">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'Deleting...' : 'Delete Lead'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-elevated hover:bg-white/10 text-text rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;