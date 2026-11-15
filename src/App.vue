
<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppNavbar from '@/components/AppNavBar.vue'

const route = useRoute()

const isOrganizerPage = computed(() =>
  route.path === '/organizer' ||
  route.path.startsWith('/organizer/')
)
</script>

<template>
  <div class="app">
    <AppNavbar v-if="!isOrganizerPage" />

    <RouterView v-if="isOrganizerPage" />

    <template v-else>
      <main class="main-content">
        <RouterView />
      </main>

      <footer class="footer">
        Club Event Management System
      </footer>
    </template>
  </div>
</template>
