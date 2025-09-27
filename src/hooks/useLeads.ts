import { useState, useEffect } from 'react';
import { supabase, Lead } from '../lib/supabase';

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('dream_leads_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'dream_leads' 
      }, (payload) => {
        console.log('Real-time update:', payload);
        console.log('🔔 Real-time event:', payload.eventType);
        console.log('🔔 Real-time payload.new:', payload.new);
        if (payload.new && payload.new.connection_request_message !== undefined) {
          console.log('🔔 connection_request_message value:', payload.new.connection_request_message);
        }
        
        if (payload.eventType === 'INSERT') {
          setLeads(prev => [...prev, payload.new as Lead]);
        } else if (payload.eventType === 'UPDATE') {
          setLeads(prev => prev.map(lead => 
            lead.process_id === payload.new.process_id ? payload.new as Lead : lead
          ));
        } else if (payload.eventType === 'DELETE') {
          setLeads(prev => prev.filter(lead => lead.process_id !== payload.old.process_id));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('dream_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Supabase error:', fetchError);
        throw fetchError;
      }
      
      console.log('Fetched leads:', data);
      setLeads(data || []);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching leads');
    } finally {
      setLoading(false);
    }
  };

  const updateLead = async (process_id: string, updates: Partial<Lead>) => {
    try {
      setError(null);
      console.log('🔄 Updating lead:', process_id, 'with updates:', updates);
      
      const { error: updateError } = await supabase
        .from('dream_leads')
        .update(updates)
        .eq('process_id', process_id);

      if (updateError) {
        console.error('Update error:', updateError);
        console.log('❌ Supabase update failed:', updateError);
        throw updateError;
      } else {
        console.log('✅ Supabase update successful for lead:', process_id);
      }
    } catch (err) {
      console.error('Error updating lead:', err);
      setError(err instanceof Error ? err.message : 'Failed to update lead');
    }
  };

  const deleteLead = async (process_id: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('dream_leads')
        .delete()
        .eq('process_id', process_id);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw deleteError;
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete lead');
    }
  };

  return { leads, loading, error, updateLead, deleteLead, refetch: fetchLeads };
};