import React, { useState } from 'react';
import { MessageSquare, CreditCard as Edit3, Copy, Check, Send, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Lead } from '../lib/supabase';

interface LeadMessagesTabProps {
  lead: Lead;
  onUpdate: (process_id: string, updates: Partial<Lead>) => Promise<void>;
}

interface MessageTemplate {
  id: string;
  label: string;
  content: string;
}

interface MessageField {
  key: keyof Lead;
  statusKey: keyof Lead;
  label: string;
  description: string;
  status: string;
  content: string | null;
  templates?: MessageTemplate[];
}

const MESSAGE_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'text-gray-400' },
  { value: 'sent', label: 'Sent', color: 'text-green-400' },
  { value: 'scheduled', label: 'Scheduled', color: 'text-blue-400' },
  { value: 'failed', label: 'Failed', color: 'text-red-400' }
];

const dm2Templates: MessageTemplate[] = [
  {
    id: 'positive_confirmation',
    label: 'POSITIVE CONFIRMATION',
    content: `Hi [Name],

Thanks — glad the brief resonated. It sounds like the challenge we highlighted around [restate their actual challenge] is playing out at [Company] the way we see it elsewhere. We recently helped a client in [similar industry or function] reduce time-to-insight by 40% with a focused approach on [specific area they mentioned], which might be relevant here.

If that sounds useful, would you be open to a 20-30 minute call next week to validate priorities and see a short example of how we'd approach it? I can share a one-page plan and a quick case study on the call. Two times that work for me: [date/time 1] or [date/time 2]. Which works better for you?`
  },
  {
    id: 'partial_agreement',
    label: 'PARTIAL AGREEMENT',
    content: `Hi [Name],

Thanks for the clarification — that helps. I hear you on the parts that differ and appreciate the correction about [specific area they mentioned]. Based on your input, here's how I'd re-frame the problem: [restate their actual challenge] with a focus on [adjusted focus]. That changes the solution priorities to X (quick bullet): 1) [priority A], 2) [priority B], 3) [priority C].

If you're open, let's schedule a brief 25-minute call to walk through that reframed approach and surface any quick wins we could pilot. I can bring a short roadmap tailored to [Company] and an example from a client who faced something similar. Are you available [date/time options]?`
  },
  {
    id: 'negative_off_target',
    label: 'NEGATIVE OFF TARGET',
    content: `Hi [Name],

Thanks for the honest feedback — I appreciate you flagging that. Sounds like I missed the mark on the brief and I want to learn more rather than assume. Can you tell me what's keeping you up at night right now or what outcome you're actually prioritizing (e.g., cost, speed, compliance, headcount)?

No slide deck, no pitch — just a 15-minute call so I can understand your reality and decide if we should follow up with anything useful. What's a good time this week for a short chat?`
  }
];

const dm3Templates: MessageTemplate[] = [
  {
    id: 'video_followup',
    label: 'STEP6 VIDEO FOLLOWUP',
    content: `Hi [Name],

I sent over the AI Opportunity Brief for [Company] recently — I realize it was a bit detailed. I put together a short video that walks through the key points and how they relate to [restate their actual challenge]. You can watch it here: [Video Link].

Would you have a minute to let me know if this direction is worth exploring further for [Company]?`
  },
  {
    id: 'video_engaged',
    label: 'STEP7 VIDEO ENGAGED',
    content: `Hi [Name],

Thanks for taking a look at the video. I'd love your take on the analysis — does this align with [Company]'s current priorities, or should I focus on [specific solution] instead?`
  },
  {
    id: 'no_video_response',
    label: 'STEP7 NO VIDEO RESPONSE',
    content: `Hi [Name],

Just checking in — I haven't heard back after sending the video. Did the analysis miss the mark for [Company], or is the timing not right? Any quick feedback would be really helpful.`
  },
  {
    id: 'final_touch',
    label: 'STEP8 FINAL TOUCH',
    content: `Hi [Name],

Last check-in from me. I know timing isn't always right, but wanted to leave the door open in case anything changes with your priorities around [specific area]. Feel free to reach out if there's ever a good time to explore this further.

Best of luck with [specific project/challenge they mentioned]!`
  }
];

const LeadMessagesTab: React.FC<LeadMessagesTabProps> = ({ lead, onUpdate }) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Dynamic placeholder replacement function
  const replacePlaceholders = (content: string): string => {
    return content
      .replace(/\[Name\]/g, lead.lead_name || '[Name]')
      .replace(/\[Company\]/g, lead.lead_company_name || '[Company]')
      .replace(/\[restate their actual challenge\]/g, lead.potential_services || '[restate their actual challenge]')
      .replace(/\[similar industry or function\]/g, lead.industry || '[similar industry or function]')
      .replace(/\[specific area they mentioned\]/g, lead.potential_services || '[specific area they mentioned]')
      .replace(/\[adjusted focus\]/g, lead.potential_services || '[adjusted focus]')
      .replace(/\[specific solution\]/g, lead.potential_services || '[specific solution]')
      .replace(/\[specific area\]/g, lead.potential_services || '[specific area]')
      .replace(/\[specific project\/challenge they mentioned\]/g, lead.potential_services || '[specific project/challenge they mentioned]');
  };

  const messageFields: MessageField[] = [
    {
      key: 'connection_request_message',
      statusKey: 'connection_request_message', // No separate status for connection request
      label: 'Connection Request',
      description: 'Initial connection request message',
      status: lead.connection_request_message ? 'sent' : 'draft',
      content: lead.connection_request_message
    },
    {
      key: 'dm_1',
      statusKey: 'dm_1_status',
      label: 'DM1 - Initial Message',
      description: 'First direct message after connection',
      status: lead.dm_1_status || 'draft',
      content: lead.dm_1
    },
    {
      key: 'dm_2',
      statusKey: 'dm_2_status',
      label: 'DM2 - Follow-up',
      description: 'Follow-up message (3 days after DM1)',
      status: lead.dm_2_status || 'draft',
      content: lead.dm_2,
      templates: dm2Templates
    },
    {
      key: 'dm_3',
      statusKey: 'dm_3_status',
      label: 'DM3 - Final Follow-up',
      description: 'Final follow-up message (5 days after DM2)',
      status: lead.dm_3_status || 'draft',
      content: lead.dm_3,
      templates: dm3Templates
    }
  ];

  const handleEdit = (field: string, currentContent: string | null) => {
    setEditingField(field);
    setEditContent(currentContent || '');
    setSelectedTemplate('');
  };

  const handleTemplateSelect = (templateId: string, field: MessageField) => {
    const template = field.templates?.find(t => t.id === templateId);
    if (template) {
      const contentWithPlaceholders = replacePlaceholders(template.content);
      setEditContent(contentWithPlaceholders);
      setSelectedTemplate(templateId);
    }
  };

  const handleStatusChange = async (field: MessageField, newStatus: string) => {
    setIsUpdating(true);
    try {
      const updates: Partial<Lead> = { [field.statusKey]: newStatus };
      await onUpdate(lead.process_id, updates);
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSave = async (field: keyof Lead, statusKey: keyof Lead) => {
    if (!editContent.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    setIsUpdating(true);
    try {
      const updates: Partial<Lead> = { 
        [field]: editContent.trim(),
        [statusKey]: 'sent' // Auto-set to sent when saving content
      };

      await onUpdate(lead.process_id, updates);
      setEditingField(null);
      setSelectedTemplate('');
      toast.success('Message updated successfully');
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('Failed to update message');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditContent('');
    setSelectedTemplate('');
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Message copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  const getTemplateLabel = (content: string | null, templates?: MessageTemplate[]): string | null => {
    if (!content || !templates) return null;
    const template = templates.find(t => t.content.trim() === content.trim());
    return template?.label || null;
  };

  const getStatusColor = (status: string) => {
    const statusConfig = MESSAGE_STATUSES.find(s => s.value === status);
    return statusConfig?.color || 'text-gray-400';
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="h-5 w-5 text-accent-red" />
        <h3 className="text-lg font-semibold text-text">Messages</h3>
      </div>

      <div className="space-y-6">
        {messageFields.map((field) => {
          const templateLabel = getTemplateLabel(field.content, field.templates);
          
          return (
            <div key={field.key} className="space-y-4">
              {/* Message Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusDot(field.status)}`} />
                  <div>
                    <h4 className="text-text font-medium">{field.label}</h4>
                    <p className="text-muted text-sm">{field.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Template Dropdown for DM2 and DM3 */}
                  {field.templates && editingField === field.key && (
                    <div className="relative">
                      <select
                        value={selectedTemplate}
                        onChange={(e) => handleTemplateSelect(e.target.value, field)}
                        className="appearance-none bg-elevated border border-white/20 rounded-lg px-3 py-2 pr-8 text-text text-sm focus:outline-none focus:border-accent-red"
                      >
                        <option value="">Select Template</option>
                        {field.templates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
                    </div>
                  )}
                  
                  {/* Status Dropdown */}
                  <div className="relative">
                    <select
                      value={field.status}
                      onChange={(e) => handleStatusChange(field, e.target.value)}
                      disabled={isUpdating || field.key === 'connection_request_message'}
                      className="appearance-none bg-elevated border border-white/10 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:border-accent-red disabled:opacity-50"
                    >
                      {MESSAGE_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Template Label */}
              {templateLabel && editingField !== field.key && (
                <div className="ml-6">
                  <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-md border border-purple-500/30">
                    {templateLabel}
                  </span>
                </div>
              )}

              {/* Message Content */}
              <div className="ml-6">
                {editingField === field.key ? (
                  <div className="space-y-4">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="futuristic-input w-full px-4 py-3 rounded-xl text-text placeholder-muted focus:outline-none resize-none min-h-[200px]"
                      placeholder={`Enter your ${field.label.toLowerCase()}...`}
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSave(field.key, field.statusKey)}
                        disabled={isUpdating || !editContent.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-accent-red hover:bg-accent-red-hover text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="h-4 w-4" />
                        {isUpdating ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-elevated hover:bg-white/10 text-text rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {field.content ? (
                      <div className="bg-elevated rounded-xl p-4 border border-white/5 relative group">
                        <p className="text-text whitespace-pre-wrap leading-relaxed">
                          {replacePlaceholders(field.content)}
                        </p>
                        
                        {/* Action buttons - show on hover */}
                        <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => copyToClipboard(replacePlaceholders(field.content!))}
                            className="p-1.5 bg-elevated hover:bg-white/10 text-muted hover:text-text rounded-lg transition-colors"
                            title="Copy message"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(field.key, field.content)}
                            className="p-1.5 bg-elevated hover:bg-white/10 text-muted hover:text-text rounded-lg transition-colors"
                            title="Edit message"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-elevated rounded-xl p-8 border border-white/5 text-center">
                        <MessageSquare className="h-8 w-8 text-muted mx-auto mb-3" />
                        <p className="text-muted italic mb-4">No message content yet</p>
                        <button
                          onClick={() => handleEdit(field.key, field.content)}
                          className="flex items-center gap-2 px-4 py-2 bg-accent-red hover:bg-accent-red-hover text-white rounded-xl transition-colors mx-auto"
                        >
                          <Edit3 className="h-4 w-4" />
                          Add Message
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeadMessagesTab;