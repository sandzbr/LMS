<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useLeadsStore } from '../stores/leads';
import type { Lead } from '../types/supabase';

const route = useRoute();
const router = useRouter();
const leadsStore = useLeadsStore();

const isEditMode = computed(() => route.params.id !== undefined);
const pageTitle = computed(() => isEditMode.value ? 'Edit Lead' : 'Add New Lead');
const submitButtonText = computed(() => isEditMode.value ? 'Update Lead' : 'Create Lead');

const formError = ref('');
const formSuccess = ref('');

// Form validation schema
const leadSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().required('Email is required').email('Invalid email format'),
  phone: yup.string().required('Phone number is required'),
  address: yup.string().required('Address is required'),
  is_active: yup.boolean().required(),
  status: yup.string().required('Status is required').oneOf(['Open', 'Close', 'Pending']),
  last_followup_remarks: yup.string().nullable(),
  next_steps: yup.string().nullable(),
  priority: yup.string().required('Priority is required').oneOf(['high', 'normal', 'low']),
  target_type: yup.string().required('Target type is required').oneOf(['Target', 'Non-Target']),
});

// Initialize form
const { handleSubmit, values, errors, setFieldValue, resetForm } = useForm({
  validationSchema: leadSchema,
  initialValues: {
    name: '',
    email: '',
    phone: '',
    address: '',
    is_active: true,
    status: 'Open',
    last_followup_remarks: '',
    next_steps: '',
    priority: 'normal',
    target_type: 'Non-Target',
  }
});

// Fetch lead data in edit mode
onMounted(async () => {
  if (isEditMode.value && route.params.id) {
    try {
      const leadId = route.params.id as string;
      const lead = await leadsStore.fetchLeadById(leadId);
      
      if (lead) {
        // Populate form with lead data
        Object.keys(lead).forEach(key => {
          if (key in values) {
            setFieldValue(key, lead[key as keyof Lead]);
          }
        });
      }
    } catch (error) {
      formError.value = 'Failed to load lead data';
      console.error('Error loading lead:', error);
    }
  }
});

// Handle form submission
const onSubmit = handleSubmit(async (formValues) => {
  formError.value = '';
  formSuccess.value = '';
  
  try {
    if (isEditMode.value && route.params.id) {
      // Update existing lead
      await leadsStore.updateLead(route.params.id as string, formValues);
      formSuccess.value = 'Lead updated successfully';
    } else {
      // Create new lead
      await leadsStore.createLead(formValues);
      resetForm();
      formSuccess.value = 'Lead created successfully';
    }
    
    // Redirect after short delay
    setTimeout(() => {
      router.push('/leads');
    }, 1500);
  } catch (error: any) {
    formError.value = error.message || 'Failed to save lead';
  }
});

// Cancel form
const handleCancel = () => {
  router.go(-1);
};
</script>

<template>
  <div>
    <div class="md:flex md:items-center md:justify-between mb-6">
      <div class="flex-1 min-w-0">
        <h1 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          {{ pageTitle }}
        </h1>
      </div>
      <div class="mt-4 flex md:mt-0 md:ml-4">
        <button 
          type="button" 
          @click="handleCancel"
          class="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancel
        </button>
      </div>
    </div>

    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div v-if="formError" class="mb-4 bg-error-50 border border-error-400 text-error-700 px-4 py-3 rounded relative" role="alert">
          <span class="block sm:inline">{{ formError }}</span>
        </div>

        <div v-if="formSuccess" class="mb-4 bg-success-50 border border-success-400 text-success-700 px-4 py-3 rounded relative" role="alert">
          <span class="block sm:inline">{{ formSuccess }}</span>
        </div>

        <form @submit="onSubmit" class="space-y-6">
          <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <!-- Basic Information Section -->
            <div class="sm:col-span-6">
              <h2 class="text-lg font-medium text-gray-900">Basic Information</h2>
            </div>

            <!-- Name -->
            <div class="sm:col-span-3">
              <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
              <div class="mt-1">
                <input 
                  id="name" 
                  :value="values?.name"
                  @input="(event) => setFieldValue('name', event.target.value)"
                  type="text" 
                  class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p v-if="errors.name" class="mt-2 text-sm text-error-600">{{ errors.name }}</p>
            </div>

            <!-- Email -->
            <div class="sm:col-span-3">
              <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
              <div class="mt-1">
                <input 
                  id="email" 
                  :value="values?.email"
                  @input="(event) => setFieldValue('email', event.target.value)"
                  type="email" 
                  class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p v-if="errors.email" class="mt-2 text-sm text-error-600">{{ errors.email }}</p>
            </div>

            <!-- Phone -->
            <div class="sm:col-span-3">
              <label for="phone" class="block text-sm font-medium text-gray-700">Phone</label>
              <div class="mt-1">
                <input 
                  id="phone" 
                  :value="values?.phone"
                  @input="(event) => setFieldValue('phone', event.target.value)"
                  type="tel" 
                  class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p v-if="errors.phone" class="mt-2 text-sm text-error-600">{{ errors.phone }}</p>
            </div>

            <!-- Active Status -->
            <div class="sm:col-span-3">
              <div class="flex items-center h-full pt-5">
                <input 
                  id="is_active" 
                  :checked="values?.is_active"
                  @change="(event) => setFieldValue('is_active', event.target.checked)"
                  type="checkbox" 
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label for="is_active" class="ml-2 block text-sm font-medium text-gray-700">
                  Active Lead
                </label>
              </div>
            </div>

            <!-- Address -->
            <div class="sm:col-span-6">
              <label for="address" class="block text-sm font-medium text-gray-700">Address</label>
              <div class="mt-1">
                <textarea 
                  id="address" 
                  :value="values?.address"
                  @input="(event) => setFieldValue('address', event.target.value)"
                  rows="3" 
                  class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                ></textarea>
              </div>
              <p v-if="errors.address" class="mt-2 text-sm text-error-600">{{ errors.address }}</p>
            </div>

            <!-- Status Details Section -->
            <div class="sm:col-span-6 pt-5">
              <h2 class="text-lg font-medium text-gray-900">Status Details</h2>
            </div>

            <!-- Status -->
            <div class="sm:col-span-2">
              <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
              <div class="mt-1">
                <select 
                  id="status" 
                  :value="values?.status"
                  @change="(event) => setFieldValue('status', event.target.value)"
                  class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="Open">Open</option>
                  <option value="Close">Close</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <p v-if="errors.status" class="mt-2 text-sm text-error-600">{{ errors.status }}</p>
            </div>

            <!-- Priority -->
            <div class="sm:col-span-2">
              <label for="priority" class="block text-sm font-medium text-gray-700">Priority</label>
              <div class="mt-1">
                <select 
                  id="priority" 
                  :value="values?.priority"
                  @change="(event) => setFieldValue('priority', event.target.value)"
                  class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <p v-if="errors.priority" class="mt-2 text-sm text-error-600">{{ errors.priority }}</p>
            </div>

            <!-- Target Type -->
            <div class="sm:col-span-2">
              <label for="target_type" class="block text-sm font-medium text-gray-700">Target Type</label>
              <div class="mt-1">
                <select 
                  id="target_type" 
                  :value="values?.target_type"
                  @change="(event) => setFieldValue('target_type', event.target.value)"
                  class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="Target">Target</option>
                  <option value="Non-Target">Non-Target</option>
                </select>
              </div>
              <p v-if="errors.target_type" class="mt-2 text-sm text-error-600">{{ errors.target_type }}</p>
            </div>

            <!-- Last Followup Remarks -->
            <div class="sm:col-span-6">
              <label for="last_followup_remarks" class="block text-sm font-medium text-gray-700">Last Followup Remarks</label>
              <div class="mt-1">
                <textarea 
                  id="last_followup_remarks" 
                  :value="values?.last_followup_remarks"
                  @input="(event) => setFieldValue('last_followup_remarks', event.target.value)"
                  rows="3" 
                  class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                ></textarea>
              </div>
              <p v-if="errors.last_followup_remarks" class="mt-2 text-sm text-error-600">{{ errors.last_followup_remarks }}</p>
            </div>

            <!-- Next Steps -->
            <div class="sm:col-span-6">
              <label for="next_steps" class="block text-sm font-medium text-gray-700">Next Steps</label>
              <div class="mt-1">
                <textarea 
                  id="next_steps" 
                  :value="values?.next_steps"
                  @input="(event) => setFieldValue('next_steps', event.target.value)"
                  rows="3" 
                  class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                ></textarea>
              </div>
              <p v-if="errors.next_steps" class="mt-2 text-sm text-error-600">{{ errors.next_steps }}</p>
            </div>
          </div>

          <div class="pt-5">
            <div class="flex justify-end">
              <button 
                type="button" 
                @click="handleCancel"
                class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                :disabled="leadsStore.loading"
              >
                <span v-if="leadsStore.loading">Saving...</span>
                <span v-else>{{ submitButtonText }}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>