<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLeadsStore } from '../stores/leads';

const route = useRoute();
const router = useRouter();
const leadsStore = useLeadsStore();
const showConfirmDelete = ref(false);
const leadNotFound = ref(false);

onMounted(async () => {
  if (route.params.id) {
    try {
      const lead = await leadsStore.fetchLeadById(route.params.id as string);
      if (!lead) {
        leadNotFound.value = true;
      }
    } catch (error) {
      console.error('Error fetching lead:', error);
      leadNotFound.value = true;
    }
  }
});

const editLead = () => {
  router.push(`/leads/${route.params.id}/edit`);
};

const openDeleteConfirm = () => {
  showConfirmDelete.value = true;
};

const cancelDelete = () => {
  showConfirmDelete.value = false;
};

const confirmDelete = async () => {
  if (route.params.id) {
    try {
      await leadsStore.deleteLead(route.params.id as string);
      router.push('/leads');
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  }
};

const goBack = () => {
  router.go(-1);
};

// Format date to local string
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};
</script>

<template>
  <div>
    <div class="md:flex md:items-center md:justify-between mb-6">
      <div class="flex-1 min-w-0">
        <h1 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Lead Details
        </h1>
      </div>
      <div class="mt-4 flex md:mt-0 md:ml-4">
        <button 
          @click="goBack" 
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Back
        </button>
        <button 
          v-if="leadsStore.currentLead"
          @click="editLead" 
          class="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Edit Lead
        </button>
        <button 
          v-if="leadsStore.currentLead"
          @click="openDeleteConfirm" 
          class="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-error-600 hover:bg-error-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500"
        >
          Delete
        </button>
      </div>
    </div>

    <div v-if="leadsStore.loading" class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="flex justify-center items-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    </div>

    <div v-else-if="leadNotFound" class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="py-16 flex flex-col items-center">
        <svg class="h-12 w-12 text-error-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Lead not found</h3>
        <p class="mt-1 text-sm text-gray-500">The lead you're looking for doesn't exist or you don't have access to it.</p>
        <div class="mt-6">
          <router-link 
            to="/leads"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Go back to leads
          </router-link>
        </div>
      </div>
    </div>

    <div v-else-if="leadsStore.currentLead" class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="px-4 py-5 sm:px-6">
        <div class="flex items-center">
          <div class="flex-shrink-0 h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center text-lg font-medium text-primary-800">
            {{ leadsStore.currentLead.name.charAt(0) }}
          </div>
          <div class="ml-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              {{ leadsStore.currentLead.name }}
            </h3>
            <div class="flex items-center mt-1">
              <span v-if="leadsStore.currentLead.is_active" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                Active
              </span>
              <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error-100 text-error-800">
                Inactive
              </span>
              
              <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-800': leadsStore.currentLead.status === 'Open',
                      'bg-red-100 text-red-800': leadsStore.currentLead.status === 'Close',
                      'bg-yellow-100 text-yellow-800': leadsStore.currentLead.status === 'Pending'
                    }">
                {{ leadsStore.currentLead.status }}
              </span>
              
              <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-red-100 text-red-800': leadsStore.currentLead.priority === 'high',
                      'bg-blue-100 text-blue-800': leadsStore.currentLead.priority === 'normal',
                      'bg-gray-100 text-gray-800': leadsStore.currentLead.priority === 'low'
                    }">
                {{ leadsStore.currentLead.priority }} priority
              </span>
              <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-purple-100 text-purple-800': leadsStore.currentLead.target_type === 'Target',
                      'bg-gray-100 text-gray-800': leadsStore.currentLead.target_type === 'Non-Target'
                    }">
                {{ leadsStore.currentLead.target_type }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="border-t border-gray-200">
        <dl>
          <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Email</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <a :href="`mailto:${leadsStore.currentLead.email}`" class="text-primary-600 hover:text-primary-900">
                {{ leadsStore.currentLead.email }}
              </a>
            </dd>
          </div>
          
          <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Phone</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <a :href="`tel:${leadsStore.currentLead.phone}`" class="text-primary-600 hover:text-primary-900">
                {{ leadsStore.currentLead.phone }}
              </a>
            </dd>
          </div>
          
          <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Address</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {{ leadsStore.currentLead.address }}
            </dd>
          </div>
          
          <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Created at</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {{ formatDate(leadsStore.currentLead.created_at) }}
            </dd>
          </div>
          
          <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Last Followup Remarks</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <div v-if="leadsStore.currentLead.last_followup_remarks" class="bg-white p-3 border border-gray-200 rounded-md">
                {{ leadsStore.currentLead.last_followup_remarks }}
              </div>
              <div v-else class="text-gray-500 italic">No remarks yet</div>
            </dd>
          </div>
          
          <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Next Steps</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <div v-if="leadsStore.currentLead.next_steps" class="bg-white p-3 border border-gray-200 rounded-md">
                {{ leadsStore.currentLead.next_steps }}
              </div>
              <div v-else class="text-gray-500 italic">No next steps defined</div>
            </dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div v-if="showConfirmDelete" class="fixed z-10 inset-0 overflow-y-auto">
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