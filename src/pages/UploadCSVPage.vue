<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Papa from 'papaparse';
import { useLeadsStore } from '../stores/leads';

const router = useRouter();
const leadsStore = useLeadsStore();

const file = ref<File | null>(null);
const isUploading = ref(false);
const uploadError = ref('');
const uploadSuccess = ref(false);
const parsedData = ref<any[]>([]);
const requiredFields = ['name', 'email', 'phone', 'address'];
const missingRequiredFields = ref<string[]>([]);
const hasHeaders = ref(true);

// Template data for CSV download
const templateData = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    address: '123 Main St, City, Country',
    is_active: 'true',
    status: 'Open',
    last_followup_remarks: 'Initial contact made',
    next_steps: 'Schedule follow-up call',
    priority: 'high',
    target_type: 'Target'
  }
];

// Download CSV template
const downloadTemplate = () => {
  const csv = Papa.unparse(templateData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'leads_template.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Handle file selection
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    file.value = target.files[0];
    uploadError.value = '';
    uploadSuccess.value = false;
    parsedData.value = [];
    missingRequiredFields.value = [];
  }
};

// Parse CSV
const parseCSV = () => {
  if (!file.value) {
    uploadError.value = 'Please select a file to upload';
    return;
  }

  if (file.value.type !== 'text/csv' && !file.value.name.endsWith('.csv')) {
    uploadError.value = 'Please upload a valid CSV file';
    return;
  }

  isUploading.value = true;
  uploadError.value = '';
  uploadSuccess.value = false;
  
  Papa.parse(file.value, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      if (results.errors.length > 0) {
        uploadError.value = `Error parsing CSV: ${results.errors[0].message}`;
        isUploading.value = false;
        return;
      }
      
      // Validate data
      const data = results.data as any[];
      if (data.length === 0) {
        uploadError.value = 'The CSV file is empty';
        isUploading.value = false;
        return;
      }
      
      // Check if required fields are present
      const headers = Object.keys(data[0]);
      const missing = requiredFields.filter(field => !headers.includes(field));
      
      if (missing.length > 0) {
        missingRequiredFields.value = missing;
        uploadError.value = `Missing required fields: ${missing.join(', ')}`;
        isUploading.value = false;
        return;
      }
      
      parsedData.value = data;
      isUploading.value = false;
    },
    error: (error) => {
      uploadError.value = `Error reading file: ${error.message}`;
      isUploading.value = false;
    },
    transformHeader: (header) => header.trim().toLowerCase()
  });
};

// Import the parsed data
const importLeads = async () => {
  if (parsedData.value.length === 0) {
    uploadError.value = 'No data to import';
    return;
  }
  
  isUploading.value = true;
  uploadError.value = '';
  
  try {
    await leadsStore.importLeadsFromCSV(parsedData.value);
    uploadSuccess.value = true;
    file.value = null;
    parsedData.value = [];
    
    // Redirect after success
    setTimeout(() => {
      router.push('/leads');
    }, 2000);
  } catch (error: any) {
    uploadError.value = error.message || 'Failed to import leads';
  } finally {
    isUploading.value = false;
  }
};

// Toggle hasHeaders
const toggleHasHeaders = () => {
  hasHeaders.value = !hasHeaders.value;
  // If file is already selected, re-parse with new setting
  if (file.value) {
    parseCSV();
  }
};

// Cancel upload
const cancelUpload = () => {
  file.value = null;
  parsedData.value = [];
  uploadError.value = '';
  uploadSuccess.value = false;
  missingRequiredFields.value = [];
};
</script>

<template>
  <div>
    <div class="md:flex md:items-center md:justify-between mb-6">
      <div class="flex-1 min-w-0">
        <h1 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Import Leads from CSV
        </h1>
      </div>
      <div class="mt-4 flex md:mt-0 md:ml-4">
        <router-link 
          to="/leads" 
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Back to Leads
        </router-link>
      </div>
    </div>

    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div v-if="uploadError" class="mb-4 bg-error-50 border border-error-400 text-error-700 px-4 py-3 rounded relative" role="alert">
          <span class="block sm:inline">{{ uploadError }}</span>
        </div>

        <div v-if="uploadSuccess" class="mb-4 bg-success-50 border border-success-400 text-success-700 px-4 py-3 rounded relative" role="alert">
          <span class="block sm:inline">Leads imported successfully! Redirecting to leads list...</span>
        </div>

        <div v-if="!parsedData.length">
          <div class="space-y-6">
            <div>
              <h2 class="text-lg font-medium text-gray-900">Upload CSV File</h2>
              <p class="mt-1 text-sm text-gray-500">
                Upload a CSV file with lead data. Download the template below to ensure correct formatting.
              </p>
            </div>

            <!-- Download Template Button -->
            <div>
              <button
                @click="downloadTemplate"
                class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Download CSV Template
              </button>
            </div>

          <div class="max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div class="space-y-1 text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div class="flex text-sm text-gray-600">
                <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                  <span>Upload a file</span>
                  <input 
                    id="file-upload" 
                    name="file-upload" 
                    type="file" 
                    accept=".csv" 
                    class="sr-only" 
                    @change="handleFileChange"
                  />
                </label>
                <p class="pl-1">or drag and drop</p>
              </div>
              <p class="text-xs text-gray-500">
                CSV file up to 10MB
              </p>
            </div>
          </div>

            <div v-if="file" class="bg-gray-50 p-4 rounded-md">
              <div class="flex items-center">
                <svg class="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd" />
                </svg>
                <span class="ml-2 flex-1 w-0 truncate">{{ file.name }}</span>
                <div class="ml-4 flex-shrink-0">
                  <button 
                    @click="cancelUpload"
                    class="font-medium text-error-600 hover:text-error-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button 
                @click="parseCSV"
                :disabled="!file || isUploading"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                :class="{ 'opacity-50 cursor-not-allowed': !file || isUploading }"
              >
                <span v-if="isUploading">Processing...</span>
                <span v-else>Parse CSV</span>
              </button>
            </div>

            <!-- CSV Format Instructions -->
            <div class="mt-6">
              <h3 class="text-sm font-medium text-gray-900">CSV Format Instructions</h3>
              <div class="mt-2 bg-gray-50 p-4 rounded-md">
                <p class="text-xs text-gray-600 mb-2">Your CSV should include the following columns:</p>
                <ul class="list-disc text-xs text-gray-600 pl-5 space-y-1">
                  <li><strong>name</strong> - Full name of the lead (Required)</li>
                  <li><strong>email</strong> - Email address (Required)</li>
                  <li><strong>phone</strong> - Phone number (Required)</li>
                  <li><strong>address</strong> - Address (Required)</li>
                  <li><strong>is_active</strong> - (Optional) "true" or "false"</li>
                  <li><strong>status</strong> - (Optional) "Open", "Close", or "Pending"</li>
                  <li><strong>last_followup_remarks</strong> - (Optional) Notes from the last follow-up</li>
                  <li><strong>next_steps</strong> - (Optional) Planned next steps</li>
                  <li><strong>priority</strong> - (Optional) "high", "normal", or "low"</li>
                  <li><strong>target_type</strong> - (Optional) "Target" or "Non-Target"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Preview and import parsed data -->
        <div v-else>
          <div class="mb-6">
            <h2 class="text-lg font-medium text-gray-900">Preview Import Data</h2>
            <p class="mt-1 text-sm text-gray-500">
              Verify the data below before importing. {{ parsedData.length }} lead{{ parsedData.length !== 1 ? 's' : '' }} will be imported.
            </p>
          </div>

          <div class="overflow-x-auto border border-gray-200 rounded-md mb-6">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th v-if="hasHeaders" v-for="(_, key) in parsedData[0]" :key="key" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ key }}
                  </th>
                  <th v-else v-for="(_, index) in parsedData[0]" :key="index" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Column {{ index + 1 }}
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(row, rowIndex) in parsedData.slice(0, 5)" :key="rowIndex">
                  <td v-for="(value, key) in row" :key="key" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ value }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="parsedData.length > 5" class="px-6 py-3 bg-gray-50 text-sm text-gray-500">
              Showing 5 of {{ parsedData.length }} rows
            </div>
          </div>

          <div class="flex justify-between">
            <button 
              @click="cancelUpload"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button 
              @click="importLeads"
              :disabled="isUploading"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              :class="{ 'opacity-50 cursor-not-allowed': isUploading }"
            >
              <span v-if="isUploading">Importing...</span>
              <span v-else>Import {{ parsedData.length }} Lead{{ parsedData.length !== 1 ? 's' : '' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>