<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <router-link to="/dashboard" class="text-xl font-bold text-primary-600">
                LeadManager
              </router-link>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
              <router-link 
                to="/dashboard" 
                class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                :class="{ 'border-primary-500 text-gray-900': $route.path === '/dashboard' }"
              >
                Dashboard
              </router-link>
              <router-link 
                to="/leads" 
                class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                :class="{ 'border-primary-500 text-gray-900': $route.path.startsWith('/leads') }"
              >
                Leads
              </router-link>
              <router-link 
                to="/upload" 
                class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                :class="{ 'border-primary-500 text-gray-900': $route.path === '/upload' }"
              >
                Import CSV
              </router-link>
              <router-link 
                v-if="authStore.isAdmin"
                to="/admin" 
                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                :class="[
                  $route.path === '/admin'
                    ? 'border-primary-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                Admin
              </router-link>
            </div>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:items-center">
            <div class="ml-3 relative">
              <button 
                @click="handleLogout"
                class="flex items-center text-sm px-4 py-2 leading-none border rounded text-primary-600 border-primary-600 hover:border-transparent hover:text-white hover:bg-primary-600 mt-0"
              >
                Logout
              </button>
            </div>
          </div>
          <div class="-mr-2 flex items-center sm:hidden">
            <!-- Mobile menu button -->
            <button 
              @click="toggleMobileMenu"
              class="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-expanded="false"
            >
              <span class="sr-only">Open main menu</span>
              <svg 
                v-if="!mobileMenuOpen" 
                class="block h-6 w-6" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg 
                v-else 
                class="block h-6 w-6" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="sm:hidden">
        <div class="pt-2 pb-3 space-y-1">
          <router-link 
            to="/dashboard" 
            @click="closeMobileMenu"
            class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            :class="[
              $route.path === '/dashboard' 
                ? 'bg-primary-50 border-primary-500 text-primary-700'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            ]"
          >
            Dashboard
          </router-link>
          <router-link 
            to="/leads" 
            @click="closeMobileMenu"
            class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            :class="[
              $route.path.startsWith('/leads') 
                ? 'bg-primary-50 border-primary-500 text-primary-700'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            ]"
          >
            Leads
          </router-link>
          <router-link 
            to="/upload" 
            @click="closeMobileMenu"
            class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            :class="[
              $route.path === '/upload' 
                ? 'bg-primary-50 border-primary-500 text-primary-700'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            ]"
          >
            Import CSV
          </router-link>
          <router-link 
            v-if="authStore.isAdmin"
            to="/admin" 
            @click="closeMobileMenu"
            class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium" 
            :class="[
              $route.path === '/admin' 
                ? 'bg-primary-50 border-primary-500 text-primary-700'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            ]"
          >
            Admin
          </router-link>
          <button 
            @click="handleLogout"
            class="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view />
    </div>
  </div>
</template>