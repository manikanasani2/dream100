import React, { useState, useEffect } from 'react';
import { MessageSquare, CreditCard as Edit3, Copy, Check, Send, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Lead, StructuredMessageContent } from '../lib/supabase';

interface LeadMessagesTabProps {
  lead: Lead;
  onUpdate: (process_id: string, updates: Partial<Lead>) => Promise<void>;
}

interface MessageTemplate {
  id: string;
  label: string;
  content: StructuredMessageContent;
}

interface MessageField {
  key: keyof Lead;
  label: string;
  description: string;
  isSent: boolean;
  content: string | null;
  templates?: MessageTemplate[];
}

const dm1Templates: MessageTemplate[] = [
  {
    id: 'ai_opportunity_brief',
    label: 'AI OPPORTUNITY BRIEF',
    content: {
      step2_thank_you_ai_offer: `Hi [Name] — thanks for connecting. I took a look at [Company] and see several concrete AI automation opportunities: automating customer onboarding and support with an AI assistant, speeding up proposal/quote generation, and removing repetitive data-entry/workflow tasks across teams. I can prepare a very brief, tailored AI Opportunity Brief (2-3 pages) showing quick wins, estimated impact, and next-step pilots specific to [Company]. Would you like me to send that over?`,
      step3_delivery: `Great — I've put the brief together. You can view it here: [Brief URL]. Quick question: which section feels most relevant to you right now — onboarding automation, proposal generation, or workflow automation — or is there another area you'd prefer I focus on?`,
      step4_follow_up: `Hi [Name] — following up on the AI Opportunity Brief I shared for [Company]. I wanted to check one specific thing from the brief: on the onboarding automation idea — do you currently measure time spent on manual onboarding steps, and would cutting that by ~30% be a meaningful outcome for your team? If so, I can run a short ROI estimate for that use case and outline a quick pilot.`
    }
  }
];

const dm2Templates: MessageTemplate[] = [
  {
    id: 'positive_confirmation',
    label: 'POSITIVE CONFIRMATION',
    content: {
      positive_confirmation: `Hi [Name],

Thanks — glad the brief resonated. Your confirmation that [restate their actual challenge] matches what we see at [Company] with several customers in your sector. For example, we helped a peer reduce [specific pain metric] by [result] using a focused approach on [specific area they mentioned]. If you're open to it, I'd love to walk through a short, tailored roadmap in a 20-minute call: 1) validate goals, 2) outline 1-2 quick wins, 3) agree next steps. What does your calendar look like next week (Tue/Thu morning or another time that suits you)?`,
      partial_agreement: `Hi [Name],

Thanks for the clarification — that helps. I hear you on the parts that differ and appreciate the correction about [specific area they mentioned]. Based on your input, here's how I'd re-frame the problem: [restate their actual challenge] with a focus on [adjusted focus]. That changes the solution priorities to: 1) [priority A], 2) [priority B], 3) [priority C].

If you're open, let's schedule a brief 25-minute call to walk through that reframed approach and surface any quick wins we could pilot. I can bring a short roadmap tailored to [Company] and an example from a client who faced something similar. Are you available [date/time options]?`,
      negative_off_target: `Hi [Name],

Thanks for the honest feedback — I appreciate you flagging that. Sounds like I missed the mark on the brief and I want to learn more rather than assume. Can you tell me what's keeping you up at night right now or what outcome you're actually prioritizing (e.g., cost, speed, compliance, headcount)?

No slide deck, no pitch — just a 15-minute call so I can understand your reality and decide if we should follow up with anything useful. What's a good time this week for a short chat?`,
      technical_question: `Hi [Name],

Thanks for the technical question about [specific technical aspect]. You're right to dig into that — it's a critical piece. Here's how we typically handle [technical challenge]: [brief technical explanation]. 

I'd love to walk through the technical architecture with you and your team in more detail. Would a 30-minute technical deep-dive call work? I can bring our technical lead and we can cover [specific technical areas]. What's your availability this week?`
    }
  }
];

const dm3Templates: MessageTemplate[] = [
  {
    id: 'video_followup',
    label: 'STEP6 VIDEO FOLLOWUP',
    content: {
      step6_video_followup: `Hi [Name],

I sent over the AI Opportunity Brief for [Company] recently — I realize it was a bit detailed. I put together a short video that walks through the key points and how they relate to [restate their actual challenge]. You can watch it here: [Video Link].

Would you have a minute to let me know if this direction is worth exploring further for [Company]?`,
      step7_video_engaged: `Hi [Name],

Thanks for taking a look at the video. I'd love your take on the analysis — does this align with [Company]'s current priorities, or should I focus on [specific solution] instead?`,
      step7_no_video_response: `Hi [Name],

Just checking in — I haven't heard back after sending the video. Did the analysis miss the mark for [Company], or is the timing not right? Any quick feedback would be really helpful.`,
      step8_final_touch: `Hi [Name],

Last check-in from me. I know timing isn't always right, but wanted to leave the door open in case anything changes with your priorities around [specific area]. Feel free to reach out if there's ever a good time to explore this further.

Best of luck with [specific project/challenge they mentioned]!`
    }
  }
];

const LeadMessagesTab: React.FC<LeadMessagesTabProps> = ({ lead, onUpdate }) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Parsed message content state
  const [parsedDm1Content, setParsedDm1Content] = useState<StructuredMessageContent>({});
  const [parsedDm2Content, setParsedDm2Content] = useState<StructuredMessageContent>({});
  const [parsedDm3Content, setParsedDm3Content] = useState<StructuredMessageContent>({});

  // Parse JSON content when lead data changes
  useEffect(() => {
    const parseMessageContent = (content: string | null): StructuredMessageContent => {
      if (!content) return {};
      
      try {
        const parsed = JSON.parse(content);
        return typeof parsed === 'object' && parsed !== null ? parsed : { default: content };
      } catch {
        return { default: content };
      }
    };

    setParsedDm1Content(parseMessageContent(lead.dm_1));
    setParsedDm2Content(parseMessageContent(lead.dm_2));
    setParsedDm3Content(parseMessageContent(lead.dm_3));
  }, [lead.dm_1, lead.dm_2, lead.dm_3]);

  const messageFields: MessageField[] = [
    {
      key: 'connection_request_message',
      label: 'Connection Request',
      description: 'Initial connection request message',
      isSent: !!lead.connection_request_message,
      content: lead.connection_request_message
    },
    {
      key: 'dm_1',
      label: 'DM1 - Initial Message',
      description: 'First direct message after connection',
      isSent: !!lead.dm_1sent,
      content: lead.dm_1,
      templates: dm1Templates
    },
    {
      key: 'dm_2',
      label: 'DM2 - Follow-up',
      description: 'Follow-up message (3 days after DM1)',
      isSent: !!lead.dm_2,
      content: lead.dm_2,
      templates: dm2Templates
    },
    {
      key: 'dm_3',
      label: 'DM3 - Final Follow-up',
      description: 'Final follow-up message (5 days after DM2)',
      isSent: !!lead.dm_3,
      content: lead.dm_3,
      templates: dm3Templates
    }
  ];

  const replacePlaceholders = (content: string): string => {
    return content
      .replace(/\[Name\]/g, lead.lead_name)
      .replace(/\[Company\]/g, lead.lead_company_name || 'your company')
      .replace(/\[restate their actual challenge\]/g, lead.potential_services || 'their specific challenges')
      .replace(/\[similar industry or function\]/g, lead.industry || 'your industry')
      .replace(/\[specific area they mentioned\]/g, lead.potential_services || 'the areas discussed')
      .replace(/\[Brief URL\]/g, 'https://drive.google.com/file/d/example/preview')
      .replace(/\[Video Link\]/g, 'https://loom.com/share/example')
      .replace(/\[date\/time options\]/g, 'Tuesday 2pm or Wednesday 10am')
      .replace(/\[date\/time 1\]/g, 'Tuesday 2pm')
      .replace(/\[date\/time 2\]/g, 'Wednesday 10am')
      .replace(/\[specific technical aspect\]/g, 'the technical implementation')
      .replace(/\[technical challenge\]/g, 'this technical challenge')
      .replace(/\[brief technical explanation\]/g, 'our proven technical approach')
      .replace(/\[specific technical areas\]/g, 'architecture, integration, and security')
      .replace(/\[specific solution\]/g, 'the proposed solution')
      .replace(/\[specific area\]/g, 'this area')
      .replace(/\[specific project\/challenge they mentioned\]/g, 'your current projects')
      .replace(/\[specific pain metric\]/g, 'processing time')
      .replace(/\[result\]/g, '40%')
      .replace(/\[priority A\]/g, 'immediate automation wins')
      .replace(/\[priority B\]/g, 'process optimization')
      .replace(/\[priority C\]/g, 'scalable implementation')
      .replace(/\[adjusted focus\]/g, 'the adjusted priorities');
  };

  const handleEdit = (field: string, currentContent: string | null) => {
    setEditingField(field);
    setEditContent(currentContent || '');
    setSelectedTemplate('');
  };

  const handleTemplateSelect = (templateId: string, field: MessageField) => {
    const template = field.templates?.find(t => t.id === templateId);
    if (template) {
      // For structured content, we need to update the entire parsed content
      if (field.key === 'dm_1') {
        setParsedDm1Content(template.content);
      } else if (field.key === 'dm_2') {
        setParsedDm2Content(template.content);
      } else if (field.key === 'dm_3') {
        setParsedDm3Content(template.content);
      }
      setSelectedTemplate(templateId);
      setEditingField(null);
    }
  };

  const handleSave = async (field: keyof Lead) => {
    if (!editContent.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    setIsUpdating(true);
    try {
      const updates: Partial<Lead> = { [field]: editContent.trim() };
      
      // If it's DM1, also set dm_1sent to true
      if (field === 'dm_1') {
        updates.dm_1sent = true;
      }

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

  const handleSubMessageSave = async (dmKey: keyof Lead, subKey: string) => {
    if (!editContent.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    setIsUpdating(true);
    try {
      let updatedContent: StructuredMessageContent;
      
      if (dmKey === 'dm_1') {
        updatedContent = { ...parsedDm1Content, [subKey]: editContent.trim() };
        setParsedDm1Content(updatedContent);
      } else if (dmKey === 'dm_2') {
        updatedContent = { ...parsedDm2Content, [subKey]: editContent.trim() };
        setParsedDm2Content(updatedContent);
      } else if (dmKey === 'dm_3') {
        updatedContent = { ...parsedDm3Content, [subKey]: editContent.trim() };
        setParsedDm3Content(updatedContent);
      } else {
        return;
      }

      const updates: Partial<Lead> = { [dmKey]: JSON.stringify(updatedContent) };
      
      // If it's DM1, also set dm_1sent to true
      if (dmKey === 'dm_1') {
        updates.dm_1sent = true;
      }

      await onUpdate(lead.process_id, updates);
      setEditingField(null);
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
      const personalizedContent = replacePlaceholders(content);
      await navigator.clipboard.writeText(personalizedContent);
      toast.success('Message copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  const getStatusColor = (isSent: boolean) => {
    return isSent ? 'text-green-400' : 'text-gray-400';
  };

  const getStatusDot = (isSent: boolean) => {
    return isSent ? 'bg-green-500' : 'bg-gray-500';
  };

  const formatSubMessageTitle = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/Step(\d+)/g, 'Step $1:')
      .replace(/Dm(\d+)/g, 'DM$1');
  };

  const renderStructuredMessages = (
    content: StructuredMessageContent,
    dmKey: keyof Lead,
    field: MessageField
  ) => {
    const entries = Object.entries(content);
    
    if (entries.length === 0) {
      return (
        <div className="bg-elevated rounded-xl p-8 border border-white/5 text-center">
          <MessageSquare className="h-8 w-8 text-muted mx-auto mb-3" />
          <p className="text-muted italic mb-4">No message content yet</p>
          <button
            onClick={() => handleEdit(`${dmKey}.default`, '')}
            className="flex items-center gap-2 px-4 py-2 bg-accent-red hover:bg-accent-red-hover text-white rounded-xl transition-colors mx-auto"
          >
            <Edit3 className="h-4 w-4" />
            Add Message
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {entries.map(([subKey, subContent]) => (
          <div key={subKey} className="space-y-3">
            {/* Sub-message heading */}
            <div className="flex items-center gap-3">
              <h4 className="text-accent-red font-semibold text-sm uppercase tracking-wide">
                {formatSubMessageTitle(subKey)}
              </h4>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            {/* Sub-message content */}
            {editingField === `${dmKey}.${subKey}` ? (
              <div className="space-y-4">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="futuristic-input w-full px-4 py-3 rounded-xl text-text placeholder-muted focus:outline-none resize-none min-h-[200px]"
                  placeholder={`Enter your ${formatSubMessageTitle(subKey).toLowerCase()}...`}
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSubMessageSave(dmKey, subKey)}
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
              <div className="bg-elevated rounded-xl p-4 border border-white/5 relative group">
                <p className="text-text whitespace-pre-wrap leading-relaxed">
                  {replacePlaceholders(subContent)}
                </p>
                
                {/* Action buttons - show on hover */}
                <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => copyToClipboard(subContent)}
                    className="p-1.5 bg-elevated hover:bg-white/10 text-muted hover:text-text rounded-lg transition-colors"
                    title="Copy message"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(`${dmKey}.${subKey}`, subContent)}
                    className="p-1.5 bg-elevated hover:bg-white/10 text-muted hover:text-text rounded-lg transition-colors"
                    title="Edit message"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="h-5 w-5 text-accent-red" />
        <h3 className="text-lg font-semibold text-text">Messages</h3>
      </div>

      <div className="space-y-8">
        {messageFields.map((field) => {
          const isStructured = field.key === 'dm_1' || field.key === 'dm_2' || field.key === 'dm_3';
          
          return (
            <div key={field.key} className="space-y-4">
              {/* Message Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusDot(field.isSent)}`} />
                  <div>
                    <h4 className="text-text font-medium">{field.label}</h4>
                    <p className="text-muted text-sm">{field.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Template Dropdown for structured messages */}
                  {field.templates && !editingField?.startsWith(field.key) && (
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
                    <div className="flex items-center gap-2 bg-elevated border border-white/10 rounded-lg px-3 py-2">
                      <span className={`text-sm font-medium ${getStatusColor(field.isSent)}`}>
                        {field.isSent ? 'Sent' : 'Not Sent'}
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="ml-6">
                {isStructured ? (
                  // Render structured messages for DM1, DM2, DM3
                  <>
                    {field.key === 'dm_1' && renderStructuredMessages(parsedDm1Content, 'dm_1', field)}
                    {field.key === 'dm_2' && renderStructuredMessages(parsedDm2Content, 'dm_2', field)}
                    {field.key === 'dm_3' && renderStructuredMessages(parsedDm3Content, 'dm_3', field)}
                  </>
                ) : (
                  // Render simple message for connection request
                  <>
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
                            onClick={() => handleSave(field.key)}
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
                                onClick={() => copyToClipboard(field.content!)}
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
                  </>
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