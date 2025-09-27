import React from 'react';
import { Clock, User, Send, MessageSquare, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Lead } from '../lib/supabase';

interface LeadTimelineTabProps {
  lead: Lead;
}

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'created' | 'connection' | 'message' | 'meeting' | 'status';
  icon: React.ReactNode;
  status: 'completed' | 'pending' | 'reminder';
}

const LeadTimelineTab: React.FC<LeadTimelineTabProps> = ({ lead }) => {
  const generateTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    // Lead Created
    if (lead.created_at) {
      events.push({
        id: 'created',
        title: 'Lead Created',
        description: 'Lead was added to the system',
        date: new Date(lead.created_at),
        type: 'created',
        icon: <User className="h-4 w-4" />,
        status: 'completed'
      });
    }

    // Connection Request Sent
    if (lead.connection_request_message) {
      events.push({
        id: 'connection_request',
        title: 'Connection Request Sent',
        description: 'Initial connection request sent on LinkedIn',
        date: new Date(lead.updated_at || lead.created_at || Date.now()),
        type: 'connection',
        icon: <Send className="h-4 w-4" />,
        status: 'completed'
      });
    }

    // Connection Accepted
    if (lead.connection_accepted_status) {
      events.push({
        id: 'connection_accepted',
        title: 'Connection Accepted',
        description: 'LinkedIn connection was accepted',
        date: new Date(lead.updated_at || lead.created_at || Date.now()),
        type: 'connection',
        icon: <CheckCircle className="h-4 w-4" />,
        status: 'completed'
      });
    }

    // DM1 Sent
    if (lead.dm_1_status === 'sent') {
      events.push({
        id: 'dm1_sent',
        title: 'DM1 Sent',
        description: 'First direct message sent',
        date: new Date(lead.dm1_timestamp || lead.updated_at || lead.created_at || Date.now()),
        type: 'message',
        icon: <MessageSquare className="h-4 w-4" />,
        status: 'completed'
      });

      // Add reminder for follow-up if no DM2 sent yet
      if (lead.dm_2_status !== 'sent') {
        const followUpDate = new Date(lead.dm1_timestamp || lead.updated_at || lead.created_at || Date.now());
        followUpDate.setDate(followUpDate.getDate() + 3); // 3 days after DM1
        
        events.push({
          id: 'dm2_reminder',
          title: 'Follow-up Ready',
          description: 'Reminder: Follow up ready',
          date: followUpDate,
          type: 'message',
          icon: <AlertCircle className="h-4 w-4" />,
          status: 'reminder'
        });
      }
    }

    // DM2 Sent
    if (lead.dm_2_status === 'sent') {
      events.push({
        id: 'dm2_sent',
        title: 'DM2 Sent',
        description: 'Second follow-up message sent',
        date: new Date(lead.updated_at || lead.created_at || Date.now()),
        type: 'message',
        icon: <MessageSquare className="h-4 w-4" />,
        status: 'completed'
      });
    }

    // DM3 Sent
    if (lead.dm_3_status === 'sent') {
      events.push({
        id: 'dm3_sent',
        title: 'DM3 Sent',
        description: 'Final follow-up message sent',
        date: new Date(lead.updated_at || lead.created_at || Date.now()),
        type: 'message',
        icon: <MessageSquare className="h-4 w-4" />,
        status: 'completed'
      });
    }

    // Meeting Booked
    if (lead.booked_meeting) {
      events.push({
        id: 'meeting_booked',
        title: 'Meeting Booked',
        description: 'Successfully booked a meeting',
        date: new Date(lead.booked_at || lead.updated_at || lead.created_at || Date.now()),
        type: 'meeting',
        icon: <Calendar className="h-4 w-4" />,
        status: 'completed'
      });
    }

    // Sort events chronologically (newest first)
    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'reminder':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return null; // No badge for completed items
      case 'reminder':
        return (
          <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded-full border border-yellow-500/20">
            Reminder: Follow up ready
          </span>
        );
      default:
        return null;
    }
  };

  const events = generateTimelineEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="h-5 w-5 text-accent-red" />
        <h3 className="text-lg font-semibold text-text">Timeline</h3>
      </div>

      {events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={event.id} className="relative">
              {/* Timeline line */}
              {index < events.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-white/10"></div>
              )}
              
              <div className="flex items-start gap-4 p-4 glass-card rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(event.status)} flex-shrink-0`}>
                  <div className="text-white">
                    {event.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-text font-medium">{event.title}</h4>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(event.status)}
                      <span className="text-muted text-sm whitespace-nowrap">
                        {formatDate(event.date)}
                      </span>
                    </div>
                  </div>
                  <p className="text-muted text-sm">{event.description}</p>
                  
                  {/* Additional info for specific events */}
                  {event.id === 'dm1_sent' && !lead.dm_2 && (
                    <div className="mt-2 text-xs text-yellow-400">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Follow-up due in 3 days
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Clock className="h-16 w-16 text-muted mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text mb-2">No Timeline Events</h3>
          <p className="text-muted">Timeline events will appear as you interact with this lead</p>
        </div>
      )}
    </div>
  );
};

export default LeadTimelineTab;