<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import supabase from '../services/supabase';

const router = useRouter();
const loading = ref(false);
const error = ref<string | null>(null);
const leads = ref<any[]>([]);
const selectedLeads = ref<string[]>([]);

// Filters and sorting
const searchQuery = ref('');
const spSearchQuery = ref('');
const statusFilter = ref('all');
const priorityFilter = ref('all');
const sortBy = ref('created_at');
const sortDirection = ref('desc');

// Select all checkbox
const selectAll = ref(false);
const handleSelectAll = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked;
  selectAll.value = checked;
  selectedLeads.value = checked ? filteredLeads.value.map(lead => lead.id) : [];
};

// Handle individual lead selection
const toggleLeadSelection = (leadId: string) => {
  const index = selectedLeads.value.indexOf(leadId);
  if (index === -1) {
    selectedLeads.value.push(leadId);
  } else {
    selectedLeads.value.splice(index, 1);
  }
  // Update selectAll state
  selectAll.value = selectedLeads.value.length === filteredLeads.value.length;
};

// Fetch all leads with user details
const fetchAllLeads = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const { data, error: fetchError } = await supabase
      .from('admin_leads_view')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (fetchError) throw fetchError;
    leads.value = data || [];
  } catch (err: any) {
    error.value = err.message;
    console.error('Error fetching leads:', err);
  } finally {
    loading.value = false;
  }
};

// Filtered and sorted leads
const filteredLeads = computed(() => {
  let result = [...leads.value];

  // Apply lead search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(lead => 
      lead.name.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query) ||
      lead.phone.toLowerCase().includes(query)
    );
  }

  // Apply sales partner search filter
  if (spSearchQuery.value) {
    const query = spSearchQuery.value.toLowerCase();
    result = result.filter(lead => 
      lead.sales_partner_name.toLowerCase().includes(query) ||
      lead.sp_email?.toLowerCase().includes(query) ||
      lead.sp_phone?.toLowerCase().includes(query)
    );
  }
  
  // Apply status filter
  if (statusFilter.value !== 'all') {
    result = result.filter(lead => lead.status === statusFilter.value);
  }
  
  // Apply priority filter
  if (priorityFilter.value !== 'all') {
    result = result.filter(lead => lead.priority === priorityFilter.value);
  }
  
  // Apply sorting
  result.sort((a, b) => {
    const aValue = a[sortBy.value];
    const bValue = b[sortBy.value];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection.value === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (aValue === null) return sortDirection.value === 'asc' ? -1 : 1;
    if (bValue === null) return sortDirection.value === 'asc' ? 1 : -1;
    
    if (sortDirection.value === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
  
  return result;
});

// Sort by column
const sortByColumn = (column: string) => {
  if (sortBy.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = column;
    sortDirection.value = 'desc';
  }
};

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

onMounted(fetchAllLeads);
</script>

<template>
  <div>
    <div class="md:flex md:items-center md:justify-between mb-6">
      <div class="flex-1 min-w-0">
        <h1 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Admin Dashboard
        </h1>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="mb-4 bg-error-50 border border-error-400 text-error-700 px-4 py-3 rounded relative" role="alert">
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <!-- Filters -->
    <div class="bg-white shadow rounded-lg mb-6">
      <div class="px-4 py-5 sm:p-6">
        <div class="grid grid-cols-1 gap-y-4 sm:grid-cols-6 sm:gap-x-4">
          <div class="sm:col-span-2">
            <label for="search" class="block text-sm font-medium text-gray-700">Search Leads</label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <input 
                id="search" 
                v-model="searchQuery" 
                type="text" 
                placeholder="Search by lead name, email or phone"
                class="focus:ring-primary-500 focus:border-primary-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="sm:col-span-2">
            <label for="sp-search" class="block text-sm font-medium text-gray-700">Search Sales Partners</label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <input 
                id="sp-search" 
                v-model="spSearchQuery" 
                placeholder="Search by SP name, email or phone"
                class="focus:ring-primary-500 focus:border-primary-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="sm:col-span-2">
            <label for="status-filter" class="block text-sm font-medium text-gray-700">Status</label>
            <select 
              id="status-filter" 
              v-model="statusFilter" 
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Close">Close</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div class="sm:col-span-2">
            <label for="priority-filter" class="block text-sm font-medium text-gray-700">Priority</label>
            <select 
              id="priority-filter" 
              v-model="priorityFilter" 
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Leads table -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div v-if="loading" class="flex justify-center items-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
      
      <div v-else-if="filteredLeads.length === 0" class="py-16 flex flex-col items-center">
        <svg class="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
        <p class="mt-1 text-sm text-gray-500">
          Try adjusting your search or filters
        </p>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input 
                  type="checkbox" 
                  :checked="selectAll"
                  @change="handleSelectAll"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </th>
              <!-- Sales Partner Columns -->
              <th 
                scope="col" 
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                @click="sortByColumn('sales_partner_name')"
              >
                Sales Partner
                <span v-if="sortBy === 'sales_partner_name'" class="ml-1">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th 
                scope="col" 
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                @click="sortByColumn('sp_phone')"
              >
                SP Phone
                <span v-if="sortBy === 'sp_phone'" class="ml-1">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th 
                scope="col" 
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                @click="sortByColumn('sp_email')"
              >
                SP Email
                <span v-if="sortBy === 'sp_email'" class="ml-1">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              
              <!-- Lead Details Columns -->
              <th 
                scope="col" 
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                @click="sortByColumn('name')"
              >
                Lead Name
                <span v-if="sortBy === 'name'" class="ml-1">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th 
                scope="col" 
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Contact
              </th>
              <th 
                scope="col" 
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                @click="sortByColumn('status')"
              >
                Status
                <span v-if="sortBy === 'status'" class="ml-1">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th 
                scope="col" 
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                @click="sortByColumn('priority')"
              >
                Priority
                <span v-if="sortBy === 'priority'" class="ml-1">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th 
                scope="col" 
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                @click="sortByColumn('target_type')"
              >
                Target Type
                <span v-if="sortBy === 'target_type'" class="ml-1">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th 
                scope="col" 
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Last Followup
              </th>
              <th 
                scope="col" 
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Next Steps
              </th>
              <th 
                scope="col" 
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                @click="sortByColumn('created_at')"
              >
                Created
                <span v-if="sortBy === 'created_at'" class="ml-1">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="lead in filteredLeads" :key="lead.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <input 
                  type="checkbox" 
                  :checked="selectedLeads.includes(lead.id)"
                  @change="() => toggleLeadSelection(lead.id)"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </td>
              <!-- Sales Partner Info -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ lead.sales_partner_name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ lead.sp_phone || 'N/A' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ lead.sp_email || 'N/A' }}</div>
              </td>
              
              <!-- Lead Details -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span class="text-primary-800 font-medium">{{ lead.name.charAt(0) }}</span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ lead.name }}</div>
                    <div v-if="!lead.is_active" class="text-xs text-error-600">Inactive</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ lead.email }}</div>
                <div class="text-sm text-gray-500">{{ lead.phone }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                      :class="{
                        'bg-green-100 text-green-800': lead.status === 'Open',
                        'bg-red-100 text-red-800': lead.status === 'Close',
                        'bg-yellow-100 text-yellow-800': lead.status === 'Pending'
                      }">
                  {{ lead.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                      :class="{
                        'bg-red-100 text-red-800': lead.priority === 'high',
                        'bg-blue-100 text-blue-800': lead.priority === 'normal',
                        'bg-gray-100 text-gray-800': lead.priority === 'low'
                      }">
                  {{ lead.priority }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                      :class="{
                        'bg-purple-100 text-purple-800': lead.target_type === 'Target',
                        'bg-gray-100 text-gray-800': lead.target_type === 'Non-Target'
                      }">
                  {{ lead.target_type }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 max-w-xs truncate">
                  {{ lead.last_followup_remarks || 'No remarks' }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 max-w-xs truncate">
                  {{ lead.next_steps || 'No next steps' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(lead.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>