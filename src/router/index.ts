import { RouteRecordRaw } from 'vue-router';
import LoginPage from '../pages/LoginPage.vue';
import RegisterPage from '../pages/RegisterPage.vue';
import DashboardPage from '../pages/DashboardPage.vue';
import LeadFormPage from '../pages/LeadFormPage.vue';
import LeadListPage from '../pages/LeadListPage.vue';
import LeadDetailPage from '../pages/LeadDetailPage.vue';
import UploadCSVPage from '../pages/UploadCSVPage.vue';
import NotFoundPage from '../pages/NotFoundPage.vue';
import AdminDashboard from '../pages/AdminDashboard.vue';
import DefaultLayout from '../layouts/DefaultLayout.vue';
import AuthLayout from '../layouts/AuthLayout.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '/',
        redirect: '/dashboard',
      },
      {
        path: '/dashboard',
        component: DashboardPage,
        name: 'Dashboard',
        meta: { requiresAuth: true },
      },
      {
        path: '/leads',
        component: LeadListPage,
        name: 'Leads',
        meta: { requiresAuth: true },
      },
      {
        path: '/leads/new',
        component: LeadFormPage,
        name: 'NewLead',
        meta: { requiresAuth: true },
      },
      {
        path: '/leads/:id',
        component: LeadDetailPage,
        name: 'LeadDetail',
        meta: { requiresAuth: true },
      },
      {
        path: '/leads/:id/edit',
        component: LeadFormPage,
        name: 'EditLead',
        meta: { requiresAuth: true },
      },
      {
        path: '/upload',
        component: UploadCSVPage,
        name: 'UploadCSV',
        meta: { requiresAuth: true },
      },
      {
        path: '/admin',
        component: AdminDashboard,
        name: 'AdminDashboard',
        meta: { requiresAuth: true, requiresAdmin: true },
      },
    ],
  },
  {
    path: '/',
    component: AuthLayout,
    children: [
      {
        path: '/login',
        component: LoginPage,
        name: 'Login',
      },
      {
        path: '/register',
        component: RegisterPage,
        name: 'Register',
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    component: NotFoundPage,
    name: 'NotFound',
  },
];

export default routes;