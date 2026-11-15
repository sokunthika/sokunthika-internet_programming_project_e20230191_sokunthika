
<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/events'

const store = useEventsStore()
const router = useRouter()

const menu = [
  { label: 'Dashboard', path: '/organizer', icon: 'fa-solid fa-chart-line' },
  { label: 'My Events', path: '/organizer/events', icon: 'fa-solid fa-calendar-days' },
  { label: 'Create Event', path: '/organizer/create', icon: 'fa-solid fa-plus' },
  { label: 'Registrations', path: '/organizer/registrations', icon: 'fa-solid fa-users' },
  { label: 'Profile & Settings', path: '/organizer/settings', icon: 'fa-solid fa-gear' },
]

function logout() {
  store.logout()
  router.push('/login')
}
</script>

<template>
  <aside class="organizer-sidebar">
    <div class="sidebar-brand">
      <h2>GatherLY</h2>
      <p>Organizer Portal</p>
    </div>

    <nav class="sidebar-menu" aria-label="Organizer navigation">
      <RouterLink
        v-for="item in menu"
        :key="item.path"
        :to="item.path"
        class="sidebar-link"
        exact-active-class="active"
      >
        <i :class="item.icon" aria-hidden="true"></i>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar-bottom">
      <p>{{ store.currentUser?.name }}</p>
      <small>Organizer Account</small>

      <button class="sidebar-logout" @click="logout">
        <i class="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i>
        <span>Logout</span>
      </button>
    </div>
  </aside>
</template>
