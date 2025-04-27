import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import supabase from '../services/supabase';
import type { Lead, NewLead, UpdateLead } from '../types/supabase';
import { useAuthStore } from './auth';

export const useLeadsStore = defineStore('leads', () => {
  const leads = ref<Lead[]>([]);
  const currentLead = ref<Lead | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedLeads = ref<string[]>([]);
  const authStore = useAuthStore();

  const leadsCount = computed(() => leads.value.length);
  const openLeadsCount = computed(() => 
    leads.value.filter(lead => lead.status === 'Open').length
  );
  const closedLeadsCount = computed(() => 
    leads.value.filter(lead => lead.status === 'Close').length
  );
  const pendingLeadsCount = computed(() => 
    leads.value.filter(lead => lead.status === 'Pending').length
  );
  const highPriorityLeadsCount = computed(() => 
    leads.value.filter(lead => lead.priority === 'high').length
  );

  async function fetchLeads() {
    loading.value = true;
    error.value = null;
    
    try {
      if (!authStore.user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', authStore.user.id)
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        throw fetchError;
      }
      
      leads.value = data;
    } catch (err: any) {
      error.value = err.message;
      console.error('Error fetching leads:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchLeadById(id: string) {
    loading.value = true;
    error.value = null;
    currentLead.value = null;
    
    try {
      if (!authStore.user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .eq('user_id', authStore.user.id)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      currentLead.value = data;
      return data;
    } catch (err: any) {
      error.value = err.message;
      console.error('Error fetching lead:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function createLead(lead: Omit<NewLead, 'user_id'>) {
    loading.value = true;
    error.value = null;
    
    try {
      if (!authStore.user?.id) {
        throw new Error('User not authenticated');
      }

      const newLead: NewLead = {
        ...lead,
        user_id: authStore.user.id,
      };

      const { data, error: insertError } = await supabase
        .from('leads')
        .insert(newLead)
        .select()
        .single();
      
      if (insertError) {
        throw insertError;
      }
      
      leads.value = [data, ...leads.value];
      return data;
    } catch (err: any) {
      error.value = err.message;
      console.error('Error creating lead:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateLead(id: string, updates: UpdateLead) {
    loading.value = true;
    error.value = null;
    
    try {
      if (!authStore.user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error: updateError } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .eq('user_id', authStore.user.id)
        .select()
        .single();
      
      if (updateError) {
        throw updateError;
      }
      
      // Update local state
      const index = leads.value.findIndex(lead => lead.id === id);
      if (index !== -1) {
        leads.value[index] = data;
      }
      
      if (currentLead.value?.id === id) {
        currentLead.value = data;
      }
      
      return data;
    } catch (err: any) {
      error.value = err.message;
      console.error('Error updating lead:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteLead(id: string) {
    loading.value = true;
    error.value = null;
    
    try {
      if (!authStore.user?.id) {
        throw new Error('User not authenticated');
      }

      const { error: deleteError } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)
        .eq('user_id', authStore.user.id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      // Update local state
      leads.value = leads.value.filter(lead => lead.id !== id);
      
      if (currentLead.value?.id === id) {
        currentLead.value = null;
      }
      
      return true;
    } catch (err: any) {
      error.value = err.message;
      console.error('Error deleting lead:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function importLeadsFromCSV(csvData: any[]) {
    loading.value = true;
    error.value = null;
    
    try {
      if (!authStore.user?.id) {
        throw new Error('User not authenticated');
      }

      // Format the CSV data to match the Leads table structure
      const formattedLeads = csvData.map(row => ({
        name: row.name || '',
        email: row.email || '',
        phone: row.phone || '',
        address: row.address || '',
        is_active: row.is_active === 'true' || row.is_active === true || row.is_active === 'TRUE' || true,
        status: (row.status === 'Open' || row.status === 'Close' || row.status === 'Pending') 
          ? row.status 
          : 'Open',
        last_followup_remarks: row.last_followup_remarks || null,
        next_steps: row.next_steps || null,
        priority: (row.priority === 'high' || row.priority === 'normal' || row.priority === 'low') 
          ? row.priority 
          : 'normal',
        user_id: authStore.user.id,
      }));

      const { data, error: insertError } = await supabase
        .from('leads')
        .insert(formattedLeads)
        .select();
      
      if (insertError) {
        throw insertError;
      }
      
      // Update local state
      await fetchLeads();
      
      return data;
    } catch (err: any) {
      error.value = err.message;
      console.error('Error importing leads:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function bulkUpdateLeads(updates: Partial<UpdateLead>) {
    loading.value = true;
    error.value = null;
    
    try {
      if (!authStore.user?.id || selectedLeads.value.length === 0) {
        throw new Error('No leads selected or user not authenticated');
      }

      const { data, error: updateError } = await supabase
        .from('leads')
        .update(updates)
        .in('id', selectedLeads.value)
        .eq('user_id', authStore.user.id)
        .select();
      
      if (updateError) {
        throw updateError;
      }
      
      // Update local state
      data.forEach(updatedLead => {
        const index = leads.value.findIndex(lead => lead.id === updatedLead.id);
        if (index !== -1) {
          leads.value[index] = updatedLead;
        }
      });
      
      // Clear selection after update
      selectedLeads.value = [];
      
      return data;
    } catch (err: any) {
      error.value = err.message;
      console.error('Error updating leads:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    leads,
    currentLead,
    loading,
    error,
    selectedLeads,
    leadsCount,
    openLeadsCount,
    closedLeadsCount,
    pendingLeadsCount,
    highPriorityLeadsCount,
    fetchLeads,
    fetchLeadById,
    createLead,
    updateLead,
    deleteLead,
    importLeadsFromCSV,
    bulkUpdateLeads,
  };
});