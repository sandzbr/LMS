<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useLeadsStore } from '../stores/leads';
import { useAuthStore } from '../stores/auth';

const leadsStore = useLeadsStore();
const authStore = useAuthStore();

const loadingStats = ref(true);

// Format user name if available
const userName = computed(() => {
  if (!authStore.user) return '';
  
  const email = authStore.user.email;
  if (email) {
    // If email exists, extract name part (before @)
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  }
  
  const phone = authStore.user.phone;
  if (phone) {
    // If phone exists, just return masked phone
    return `${phone.substring(0, 4)}***${phone.substring(phone.length - 4)}`;
  }
  
  return 'User';
});

onMounted(async () => {
  try {
    await leadsStore.fetchLeads();
  } catch (error) {
    console.error('Failed to fetch leads:', error);
  } finally {
    loadingStats.value = false;
  }
});
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Welcome, {{ userName }}!</h1>
    
    <div v-if="loadingStats" class="flex justify-center">
      <div class="animate-pulse flex space-x-4">
        <div class="h-12 w-12 bg-gray-300 rounded-full"></div>
        <div class="space-y-4">
          <div class="h-4 bg-gray-300 rounded w-36"></div>
          <div class="h-4 bg-gray-300 rounded w-80"></div>
        </div>
      </div>
    </div>
    
    <div v-else class="space-y-6">
      <!-- Lead Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <svg class="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Leads</dt>
                  <dd>
                    <div class="text-lg font-medium text-gray-900">{{ leadsStore.leadsCount }}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-4 sm:px-6">
            <div class="text-sm">
              <router-link to="/leads" class="font-medium text-primary-600 hover:text-primary-500">View all leads</router-link>
            </div>
          </div>
        </div>
        
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-secondary-100 rounded-md p-3">
                <svg class="h-6 w-6 text-secondary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Open Leads</dt>
                  <dd>
                    <div class="text-lg font-medium text-gray-900">{{ leadsStore.openLeadsCount }}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-4 sm:px-6">
            <div class="text-sm">
              <a href="#" class="font-medium text-secondary-600 hover:text-secondary-500">View all open leads</a>
            </div>
          </div>
        </div>
        
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-accent-100 rounded-md p-3">
                <svg class="h-6 w-6 text-accent-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">High Priority Leads</dt>
                  <dd>
                    <div class="text-lg font-medium text-gray-900">{{ leadsStore.highPriorityLeadsCount }}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-4 sm:px-6">
            <div class="text-sm">
              <a href="#" class="font-medium text-accent-600 hover:text-accent-500">View all high priority leads</a>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h2 class="text-lg font-medium text-gray-900">Quick Actions</h2>
          <div class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <router-link to="/leads/new" class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Lead
            </router-link>
            
            <router-link to="/upload" class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500">
              <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import CSV
            </router-link>
            
            <router-link to="/leads" class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent-500 hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500">
              <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Manage Leads
            </router-link>
          </div>
        </div>
      </div>
      
      <!-- Recent Leads -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <h2 class="text-lg font-medium text-gray-900">Recent Leads</h2>
        </div>
        <div class="border-t border-gray-200">
          <div v-if="leadsStore.leads.length === 0" class="py-10 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No leads yet</h3>
            <p class="mt-1 text-sm text-gray-500">Get started by creating a new lead or importing CSV.</p>
            <div class="mt-6">
              <router-link to="/leads/new" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                New Lead
              </router-link>
            </div>
          </div>
          
          <div v-else class="overflow-hidden overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" class="relative px-6 py-3">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="lead in leadsStore.leads.slice(0, 5)" :key="lead.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ lead.name }}</div>
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
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <router-link :to="`/leads/${lead.id}`" class="text-primary-600 hover:text-primary-900 mr-3">
                      View
                    </router-link>
                    <router-link :to="`/leads/${lead.id}/edit`" class="text-secondary-600 hover:text-secondary-900">
                      Edit
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
              <div class="text-sm">
                <router-link to="/leads" class="font-medium text-primary-600 hover:text-primary-500">
                  View all leads
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>