<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  await authStore.initializeAuth();
});
</script>

<template>
  <router-view />
</template>