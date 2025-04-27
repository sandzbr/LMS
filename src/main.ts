import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';
import './style.css';
import App from './App.vue';
import routes from './router';

// Initialize Pinia
const pinia = createPinia();

// Initialize Router
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Auth Guard
router.beforeEach((to, from, next) => {
  const authStore = pinia.state.value.auth;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
  
  if (requiresAuth && !authStore?.user) {
    next('/login');
  } else if (requiresAdmin && !authStore?.isAdmin) {
    next('/dashboard');
  } else if (to.path === '/login' && authStore?.user) {
    next('/dashboard');
  } else {
    next();
  }
});

// Create and mount the app
const app = createApp(App);
app.use(pinia);
app.use(router);
app.mount('#app');