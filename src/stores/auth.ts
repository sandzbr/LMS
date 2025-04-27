import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import supabase from '../services/supabase';
import type { User } from '@supabase/supabase-js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const isAdmin = ref(false);
  const userId = computed(() => user.value?.id);

  const isAuthenticated = computed(() => !!user.value);

  async function checkAdminStatus() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-admin`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to check admin status');
      }

      const { isAdmin: adminStatus } = await response.json();
      isAdmin.value = adminStatus;
      return adminStatus;
    } catch (err) {
      console.error('Error checking admin status:', err);
      return false;
    }
  }

  async function initializeAuth() {
    loading.value = true;
    try {
      // Check for existing session
      const { data, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }
      
      if (data.session) {
        user.value = data.session.user;
        await checkAdminStatus();
      }
      
      // Listen for auth state changes
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        async (_event, session) => {
          user.value = session?.user || null;
          if (session?.user) {
            await checkAdminStatus();
          } else {
            isAdmin.value = false;
          }
        }
      );
      
      // Clean up subscription on unmount
      return () => subscription.unsubscribe();
    } catch (err: any) {
      error.value = err.message;
      console.error('Auth error:', err);
    } finally {
      loading.value = false;
    }
  }

  async function login(email: string, password: string) {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        throw signInError;
      }
      
      user.value = data.user;
      return data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function loginWithPhone(phone: string, password: string) {
    loading.value = true;
    error.value = null;
    
    try {
      // For phone auth, we need to use a different approach
      // This is a simplified version - in production, you'd handle OTP verification
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        phone,
        password,
      });
      
      if (signInError) {
        throw signInError;
      }
      
      user.value = data.user;
      return data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function register(email: string, password: string) {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (signUpError) {
        throw signUpError;
      }
      
      return data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function registerWithPhone(phone: string, password: string) {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        phone,
        password,
      });
      
      if (signUpError) {
        throw signUpError;
      }
      
      return data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    loading.value = true;
    error.value = null;
    
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        throw signOutError;
      }
      
      user.value = null;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function setAdminPrivileges() {
    if (!userId.value) {
      throw new Error('No user logged in');
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/set-admin`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId.value }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to set admin privileges');
    }

    // Refresh the session to get updated metadata
    await initializeAuth();
  }

  return {
    user,
    loading,
    error,
    isAdmin,
    userId,
    isAuthenticated,
    initializeAuth,
    login,
    loginWithPhone,
    register,
    registerWithPhone,
    logout,
    setAdminPrivileges,
  };
});