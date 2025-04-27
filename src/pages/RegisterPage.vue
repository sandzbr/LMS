<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const isPhoneSignup = ref(false);
const registerError = ref('');
const registerSuccess = ref('');

const registerSchema = yup.object({
  email: yup.string().when('isPhoneSignup', (isPhoneSignup, schema) =>
    isPhoneSignup ? schema : schema.required('Email is required').email('Invalid email format')
  ),
  phone: yup.string().when('isPhoneSignup', (isPhoneSignup, schema) =>
    isPhoneSignup ? schema.required('Phone number is required') : schema
  ),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string()
    .required('Confirm password is required')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

const { handleSubmit, errors, resetForm, setFieldValue, values } = useForm({
  validationSchema: registerSchema,
  initialValues: {
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    isPhoneSignup: false,
  }
});

const toggleSignupMethod = () => {
  isPhoneSignup.value = !isPhoneSignup.value;
  resetForm();
  setFieldValue('isPhoneSignup', isPhoneSignup.value);
};

const onSubmit = handleSubmit(async (formValues) => {
  registerError.value = '';
  registerSuccess.value = '';
  
  try {
    if (isPhoneSignup.value) {
      await authStore.registerWithPhone(formValues.phone, formValues.password);
      registerSuccess.value = 'Account created successfully! Please sign in.';
    } else {
      await authStore.register(formValues.email, formValues.password);
      registerSuccess.value = 'Account created successfully! Please sign in.';
    }
    
    // Redirect to login after short delay
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (error: any) {
    registerError.value = error.message || 'Registration failed. Please try again.';
  }
});
</script>

<template>
  <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
    <form @submit="onSubmit" class="space-y-6">
      <div class="text-center">
        <h2 class="text-xl font-bold text-gray-900">Create your account</h2>
      </div>

      <div v-if="registerError" class="bg-error-50 border border-error-400 text-error-700 px-4 py-3 rounded relative" role="alert">
        <span class="block sm:inline">{{ registerError }}</span>
      </div>

      <div v-if="registerSuccess" class="bg-success-50 border border-success-400 text-success-700 px-4 py-3 rounded relative" role="alert">
        <span class="block sm:inline">{{ registerSuccess }}</span>
      </div>

      <!-- Toggle Signup Method -->
      <div class="flex justify-end">
        <button 
          type="button" 
          @click="toggleSignupMethod"
          class="text-sm text-primary-600 hover:text-primary-500 focus:outline-none"
        >
          {{ isPhoneSignup ? 'Use Email Instead' : 'Use Phone Instead' }}
        </button>
      </div>

      <div v-if="!isPhoneSignup">
        <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
        <div class="mt-1">
          <input 
            id="email" 
            :value="values?.email"
            @input="(event) => setFieldValue('email', event.target.value)"
            type="email" 
            autocomplete="email" 
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
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        <p v-if="errors.phone" class="mt-2 text-sm text-error-600">{{ errors.phone }}</p>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <div class="mt-1">
          <input 
            id="password" 
            :value="values?.password"
            @input="(event) => setFieldValue('password', event.target.value)"
            type="password" 
            autocomplete="new-password" 
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        <p v-if="errors.password" class="mt-2 text-sm text-error-600">{{ errors.password }}</p>
      </div>

      <div>
        <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm password</label>
        <div class="mt-1">
          <input 
            id="confirmPassword" 
            :value="values?.confirmPassword"
            @input="(event) => setFieldValue('confirmPassword', event.target.value)"
            type="password" 
            autocomplete="new-password" 
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        <p v-if="errors.confirmPassword" class="mt-2 text-sm text-error-600">{{ errors.confirmPassword }}</p>
      </div>

      <div>
        <button 
          type="submit" 
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          :disabled="authStore.loading"
        >
          <span v-if="authStore.loading">Creating account...</span>
          <span v-else>Create account</span>
        </button>
      </div>

      <div class="text-sm text-center">
        <router-link to="/login" class="font-medium text-primary-600 hover:text-primary-500">
          Already have an account? Sign in
        </router-link>
      </div>
    </form>
  </div>
</template>