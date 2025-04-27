<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const isPhoneLogin = ref(false);
const loginError = ref('');

const loginSchema = yup.object({
  email: yup.string().when('isPhoneLogin', {
    is: false,
    then: () => yup.string().required('Email is required').email('Invalid email format'),
    otherwise: () => yup.string().notRequired()
  }),
  phone: yup.string().when('isPhoneLogin', {
    is: true,
    then: () => yup
      .string()
      .required('Phone number is required')
      .matches(/^\+[1-9]\d{1,14}$/, 'Phone number must be in international format (e.g., +1234567890)'),
    otherwise: () => yup.string().notRequired()
  }),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

const { handleSubmit, values, errors, resetForm, setFieldValue } = useForm({
  validationSchema: loginSchema,
  initialValues: {
    email: '',
    phone: '',
    password: '',
    isPhoneLogin: false
  }
});

const toggleLoginMethod = () => {
  isPhoneLogin.value = !isPhoneLogin.value;
  resetForm();
  values.isPhoneLogin = isPhoneLogin.value;
};

const formatPhoneNumber = (phone: string) => {
  // Ensure phone number starts with + and remove any spaces or special characters
  let formatted = phone.trim().replace(/[^\d+]/g, '');
  if (!formatted.startsWith('+')) {
    formatted = '+' + formatted;
  }
  return formatted;
};

const onSubmit = handleSubmit(async (values) => {
  loginError.value = '';
  try {
    if (isPhoneLogin.value) {
      const formattedPhone = formatPhoneNumber(values.phone);
      await authStore.loginWithPhone(formattedPhone, values.password);
    } else {
      await authStore.login(values.email.trim(), values.password);
    }
    router.push('/dashboard');
  } catch (error: any) {
    if (error?.message?.includes('invalid_credentials')) {
      loginError.value = isPhoneLogin.value
        ? 'Invalid phone number or password. Please check your credentials and try again.'
        : 'Invalid email or password. Please check your credentials and try again.';
    } else {
      loginError.value = 'Login failed. Please try again later.';
    }
  }
});
</script>

<template>
  <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
    <form @submit="onSubmit" class="space-y-6">
      <div class="text-center">
        <h2 class="text-xl font-bold text-gray-900">Sign in to your account</h2>
      </div>

      <div v-if="loginError" class="bg-error-50 border border-error-400 text-error-700 px-4 py-3 rounded relative" role="alert">
        <span class="block sm:inline">{{ loginError }}</span>
      </div>

      <!-- Toggle Login Method -->
      <div class="flex justify-end">
        <button 
          type="button" 
          @click="toggleLoginMethod"
          class="text-sm text-primary-600 hover:text-primary-500 focus:outline-none"
        >
          {{ isPhoneLogin ? 'Use Email Instead' : 'Use Phone Instead' }}
        </button>
      </div>

      <div v-if="!isPhoneLogin">
        <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
        <div class="mt-1">
          <input 
            id="email" 
            :value="values?.email"
            @input="(event) => setFieldValue('email', event.target.value)"
            type="email" 
            autocomplete="email" 
            placeholder="Enter your email"
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        <p v-if="errors.email" class="mt-2 text-sm text-error-600">{{ errors.email }}</p>
      </div>

      <div v-else>
        <label for="phone" class="block text-sm font-medium text-gray-700">Phone number</label>
        <div class="mt-1">
          <input 
            id="phone" 
            :value="values?.phone"
            @input="(event) => setFieldValue('phone', event.target.value)"
            type="tel" 
            autocomplete="tel"
            placeholder="Enter phone number (e.g., +1234567890)"
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        <p v-if="errors.phone" class="mt-2 text-sm text-error-600">{{ errors.phone }}</p>
        <p class="mt-1 text-sm text-gray-500">Please enter your phone number in international format (e.g., +1234567890)</p>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <div class="mt-1">
          <input 
            id="password" 
            :value="values?.password"
            @input="(event) => setFieldValue('password', event.target.value)"
            type="password" 
            autocomplete="current-password" 
            placeholder="Enter your password"
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        <p v-if="errors.password" class="mt-2 text-sm text-error-600">{{ errors.password }}</p>
      </div>

      <div>
        <button 
          type="submit" 
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          :disabled="authStore.loading"
        >
          <span v-if="authStore.loading">Signing in...</span>
          <span v-else>Sign in</span>
        </button>
      </div>

      <div class="text-sm text-center">
        <router-link to="/register" class="font-medium text-primary-600 hover:text-primary-500">
          Don't have an account? Sign up
        </router-link>
      </div>
    </form>
  </div>
</template>