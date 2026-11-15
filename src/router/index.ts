import { createRouter, createWebHistory } from 'vue-router'
import { useEventsStore } from '@/stores/events'
import type { Role } from '@/types'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/dashboard',
      name: 'student-dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: {
        requiresAuth: true,
        roles: ['student'],
      },
    },
    {
      path: '/events',
      name: 'explore-events',
      component: () => import('@/views/ExploreView.vue'),
    },
    {
      path: '/events/:id',
      name: 'event-details',
      component: () => import('@/views/EventDetailsView.vue'),
    },
    {
      path: '/registrations',
      name: 'registrations',
      component: () => import('@/views/RegistrationsView.vue'),
      meta: {
        requiresAuth: true,
        roles: ['student'],
      },
    },

    {
      path: '/events/:id/register',
      name: 'event-registration',
      component: () => import('@/views/EventRegistrationsView.vue'),
      meta: {
        requiresAuth: true,
        roles: ['student'],
      },
    },

    {
      path: '/organizer',
      name: 'organizer',
      component: () => import('@/views/OrganizerLayout.vue'),
      meta: {
        requiresAuth: true,
        roles: ['organizer'],
      },
      children: [
        {
          path: '',
          name: 'organizer-dashboard',
          component: () => import('@/views/OrganizerDashboardView.vue'),
        },
        {
          path: 'events',
          name: 'organizer-events',
          component: () => import('@/views/ManageEventsView.vue'),
        },
        {
          path: 'create',
          name: 'organizer-create',
          component: () => import('@/views/ManageEventsView.vue'),
        },
        {
          path: 'registrations',
          name: 'organizer-registrations',
          component: () => import('@/views/OrganizerRegistrationsView.vue'),
        },
        {
          path: 'settings',
          name: 'organizer-settings',
          component: () => import('@/views/OrganizerSettingsView.vue'),
        },
      ],
    },

    {
      path: '/manage',
      redirect: '/organizer',
    },
    {
      path: '/manage/:id/attendees',
      name: 'attendees',
      component: () => import('@/views/AttendeesView.vue'),
      meta: {
        requiresAuth: true,
        roles: ['organizer', 'admin'],
      },
    },
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: () => import('@/views/AdminView.vue'),
      meta: {
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// Frontend route guard
router.beforeEach((to) => {
  const store = useEventsStore()

  // Signed-in users cannot return to login/signup pages.
  if (to.meta.guestOnly && store.isAuthenticated) {
    return store.homeRoute
  }

  // Protected pages require a login.
  if (to.meta.requiresAuth && !store.isAuthenticated) {
    return '/login'
  }

  // Protect role-specific pages.
  const allowedRoles = to.meta.roles as Role[] | undefined

  if (allowedRoles && !allowedRoles.includes(store.currentRole as Role)) {
    return store.homeRoute
  }

  return true
})

export default router
