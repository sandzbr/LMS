<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useLeadsStore } from '../stores/leads';

const router = useRouter();
const leadsStore = useLeadsStore();

// Filters and sorting
const searchQuery = ref('');
const statusFilter = ref('all');
const priorityFilter = ref('all');
const sortBy = ref('created_at');
const sortDirection = ref('desc');

// Bulk actions
const showBulkActions = computed(() => leadsStore.selectedLeads.length > 0);
const selectedCount = computed(() => leadsStore.selectedLeads.length);

// Select all checkbox
const selectAll = ref(false);
const handleSelectAll = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked;
  selectAll.value = checked;
  if (checked) {
    leadsStore.selectedLeads = filteredLeads.value.map(lead => lead.id);
  } else {
    leadsStore.selectedLeads = [];
  }
};

// Handle individual lead selection
const toggleLeadSelection = (leadId: string) => {
  const index = leadsStore.selectedLeads.indexOf(leadId);
  if (index === -1) {
    leadsStore.selectedLeads.push(leadId);
  } else {
    leadsStore.selectedLeads.splice(index, 1);
  }
  // Update selectAll state
  selectAll.value = leadsStore.selectedLeads.length === filteredLeads.value.length;
};

// Filtered and sorted leads
const filteredLeads = computed(() => {
  let result = [...leadsStore.leads];
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(lead => 
      lead.name.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query) ||
      lead.phone.toLowerCase().includes(query)
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
    const aValue = a[sortBy.value as keyof typeof a];
    const bValue = b[sortBy.value as keyof typeof b];
    
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
    // Toggle sort direction if already sorting by this column
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    // Set new sort column and default to descending
    sortBy.value = column;
    sortDirection.value = 'desc';
  }
};

// Bulk update actions
const bulkUpdateStatus = async (status: 'Open' | 'Close' | 'Pending') => {
  try {
    await leadsStore.bulkUpdateLeads({ status });
    selectAll.value = false;
  } catch (error) {
    console.error('Failed to update leads:', error);
  }
};

const bulkUpdatePriority = async (priority: 'high' | 'normal' | 'low') => {
  try {
    await leadsStore.bulkUpdateLeads({ priority });
    selectAll.value = false;
  } catch (error) {
    console.error('Failed to update leads:', error);
  }
};

const bulkUpdateTargetType = async (targetType: 'Target' | 'Non-Target') => {
  try {
    await leadsStore.bulkUpdateLeads({ target_type: targetType });
    selectAll.value = false;
  } catch (error) {
    console.error('Failed to update leads:', error);
  }
};

// Delete lead
const confirmDeleteId = ref<string | null>(null);

const showDeleteConfirm = (leadId: string) => {
  confirmDeleteId.value = leadId;
};

const cancelDelete = () => {
  confirmDeleteId.value = null;
};

const confirmDelete = async () => {
  if (confirmDeleteId.value) {
    try {
      await leadsStore.deleteLead(confirmDeleteId.value);
      confirmDeleteId.value = null;
    } catch (error) {
      console.error('Failed to delete lead:', error);
    }
  }
};

// Fetch leads on mount
onMounted(async () => {
  try {
    await leadsStore.fetchLeads();
  } catch (error) {
    console.error('Failed to fetch leads:', error);
  }
});
</script>

<template>
  <div>
    <div class="md:flex md:items-center md:justify-between mb-6">
      <div class="flex-1 min-w-0">
        <h1 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Leads
        </h1>
      </div>
      <div class="mt-4 flex md:mt-0 md:ml-4">
        <router-link 
          to="/leads/new" 
          class="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Lead
        </router-link>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div v-if="showBulkActions" class="bg-white shadow rounded-lg mb-6">
      <div class="px-4 py-5 sm:p-6">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            {{ selectedCount }} lead{{ selectedCount !== 1 ? 's' : '' }} selected
          </div>
          <div class="flex space-x-3">
            <select 
              @change="(e) => bulkUpdateStatus(e.target.value as 'Open' | 'Close' | 'Pending')"
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="" disabled selected>Update Status</option>
              <option value="Open">Open</option>
              <option value="Close">Close</option>
              <option value="Pending">Pending</option>
            </select>
            
            <select 
              @change="(e) => bulkUpdatePriority(e.target.value as 'high' | 'normal' | 'low')"
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="" disabled selected>Update Priority</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
            
            <select 
              @change="(e) => bulkUpdateTargetType(e.target.value as 'Target' | 'Non-Target')"
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="" disabled selected>Update Target Type</option>
              <option value="Target">Target</option>
              <option value="Non-Target">Non-Target</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and search -->
    <div class="bg-white shadow rounded-lg mb-6">
      <div class="px-4 py-5 sm:p-6">
        <div class="grid grid-cols-1 gap-y-4 sm:grid-cols-6 sm:gap-x-4">
          <div class="sm:col-span-2">
            <label for="search" class="block text-sm font-medium text-gray-700">Search</label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <input 
                id="search" 
                v-model="searchQuery" 
                type="text" 
                placeholder="Search by name, email or phone"
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
            <div class="mt-1">
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
          </div>

          <div class="sm:col-span-2">
            <label for="priority-filter" class="block text-sm font-medium text-gray-700">Priority</label>
            <div class="mt-1">
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
    </div>

    <!-- Leads list -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div v-if="leadsStore.loading" class="flex justify-center items-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
      
      <div v-else-if="filteredLeads.length === 0" class="py-16 flex flex-col items-center">
        <svg class="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ leadsStore.leads.length > 0 ? 'Try adjusting your search or filters.' : 'Get started by creating a new lead.' }}
        </p>
        <div class="mt-6">
          <router-link 
            to="/leads/new" 
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Lead
          </router-link>
        </div>
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
              <th 
                scope="col" 
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                @click="sortByColumn('name')"
              >
                Name
                <span v-if="sortBy === 'name'" class="ml-1">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th 
                scope="col" 
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                @click="sortByColumn('email')"
              >
                Contact
                <span v-if="sortBy === 'email'" class="ml-1">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
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
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="lead in filteredLeads" :key="lead.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <input 
                  type="checkbox" 
                  :checked="leadsStore.selectedLeads.includes(lead.id)"
                  @change="() => toggleLeadSelection(lead.id)"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </td>
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
                {{ new Date(lead.created_at).toLocaleDateString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  @click="router.push(`/leads/${lead.id}`)" 
                  class="text-primary-600 hover:text-primary-900 bg-primary-50 hover:bg-primary-100 px-3 py-1 rounded-md mr-2"
                >
                  View
                </button>
                <button 
                  @click="router.push(`/leads/${lead.id}/edit`)" 
                  class="text-secondary-600 hover:text-secondary-900 bg-secondary-50 hover:bg-secondary-100 px-3 py-1 rounded-md mr-2"
                >
                  Edit
                </button>
                <button 
                  @click="showDeleteConfirm(lead.id)" 
                  class="text-error-600 hover:text-error-900"
                >
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div v-if="confirmDeleteId" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-error-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-error-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Delete Lead</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Are you sure you want to delete this lead? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              @click="confirmDelete" 
              type="button" 
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-error-600 text-base font-medium text-white hover:bg-error-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Delete
            </button>
            <button 
              @click="cancelDelete" 
              type="button" 
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>