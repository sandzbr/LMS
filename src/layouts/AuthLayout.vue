<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-extrabold text-primary-600">LeadManager</h1>
        <p class="mt-2 text-sm text-gray-600">
          Streamline your lead management process
        </p>
      </div>
      
      <router-view />
    </div>
  </div>
</template>