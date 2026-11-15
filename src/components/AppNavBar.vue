
<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/events'

const router = useRouter()
const store = useEventsStore()

function handleLogout() {
  store.logout()
  router.push('/login')
}
</script>

<template>
  <header class="navbar">
    <RouterLink
      :to="store.isAuthenticated ? store.homeRoute : '/login'"
      class="brand"
    >
      GatherLY
    </RouterLink>

    <nav>
      <RouterLink to="/events">
        Explore Events
      </RouterLink>

      <template v-if="store.isAuthenticated">
        <RouterLink
          :to="store.homeRoute"
        >
          Dashboard
        </RouterLink>

        <RouterLink
          v-if="store.currentRole === 'student'"
          to="/registrations"
        >
          My Registrations
        </RouterLink>

        <RouterLink
          v-if="store.currentRole === 'organizer'"
          to="/organizer"
        >
          Manage Events
        </RouterLink>

        <RouterLink
          v-if="store.currentRole === 'admin'"
          to="/admin"
        >
          Administration
        </RouterLink>
      </template>
    </nav>

    <div class="account">
      <template v-if="store.isAuthenticated">
        <div class="user-info">
          <strong>{{ store.currentUser?.name }}</strong>
          <small>{{ store.currentRole }}</small>
        </div>

        <button
          class="btn btn-secondary"
          @click="handleLogout"
        >
          Logout
        </button>
      </template>

      <template v-else>
        <RouterLink to="/login" class="btn">
          Login
        </RouterLink>

        <RouterLink to="/register" class="btn btn-secondary">
          Sign Up
        </RouterLink>
      </template>
    </div>
  </header>
</template>
