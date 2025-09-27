import React, { useState } from 'react';
import { MessageSquare, Edit3, Copy, Check, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Lead } from '../lib/supabase';

interface LeadMessagesTabProps {
  lead: Lead;
  onUpdate: (process_id: string, updates: Partial<Lead>) => Promise<void>;
}

interface MessageField {
  key: keyof Lead;
  label: string;
  description: string;
  isSent: boolean;
  content: string | null;
}

const LeadMessagesTab: React.FC<LeadMessagesTabProps> = ({ lead, onUpdate }) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

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
      content: lead.dm_1
    },
    {
      key: 'dm_2',
      label: 'DM2 - Follow-up',
      description: 'Second follow-up message',
      isSent: !!lead.dm_2,
      content: lead.dm_2
    },
    {
      key: 'dm_3',
      label: 'DM3 - Final Follow-up',
      description: 'Third and final follow-up message',
      isSent: !!lead.dm_3,
      content: lead.dm_3
    }
  ];

  const handleEdit = (field: string, currentContent: string | null) => {
    setEditingField(field);
    setEditContent(currentContent || '');
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
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Message copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="h-5 w-5 text-accent-red" />
        <h3 className="text-lg font-semibold text-text">Messages</h3>
      </div>

      <div className="space-y-6">
        {messageFields.map((field) => (
          <div key={field.key} className="glass-card rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  field.isSent ? 'bg-green-500' : 'bg-gray-500'
                }`} />
                <div>
                  <h4 className="text-text font-medium">{field.label}</h4>
                  <p className="text-muted text-sm">{field.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {field.isSent ? (
                  <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full border border-green-500/20">
                    <Send className="h-3 w-3 inline mr-1" />
                    Sent
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-500/10 text-gray-400 text-xs rounded-full border border-gray-500/20">
                    Not Sent
                  </span>
                )}
              </div>
            </div>

            {editingField === field.key ? (
              <div className="space-y-4">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="futuristic-input w-full px-4 py-3 rounded-xl text-text placeholder-muted focus:outline-none resize-none"
                  rows={6}
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
                  <div className="bg-elevated rounded-xl p-4 border border-white/5">
                    <p className="text-text whitespace-pre-wrap">{field.content}</p>
                  </div>
                ) : (
                  <div className="bg-elevated rounded-xl p-4 border border-white/5 text-center">
                    <p className="text-muted italic">No message content yet</p>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleEdit(field.key, field.content)}
                    className="flex items-center gap-2 px-3 py-2 bg-elevated hover:bg-white/10 text-text rounded-xl transition-colors text-sm"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </button>
                  {field.content && (
                    <button
                      onClick={() => copyToClipboard(field.content!)}
                      className="flex items-center gap-2 px-3 py-2 bg-elevated hover:bg-white/10 text-text rounded-xl transition-colors text-sm"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadMessagesTab;