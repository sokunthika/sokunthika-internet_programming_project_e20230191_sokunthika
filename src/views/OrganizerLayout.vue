
<script setup lang="ts">
import { RouterView } from 'vue-router'
import OrganizerSidebar from '@/components/OrganizerSideBar.vue'
import { useEventsStore } from '@/stores/events'

const store = useEventsStore()
</script>

<template>
  <div class="organizer-layout">
    <OrganizerSidebar />

    <div class="organizer-workspace">
      <header class="organizer-topbar">
        <div>
          <strong>Event Organizer Portal</strong>
          <p>Manage your university events</p>
        </div>

        <div class="organizer-account">
          <span class="organizer-avatar">
            {{ store.currentUser?.name?.charAt(0) }}
          </span>

          <div>
            <strong>{{ store.currentUser?.name }}</strong>
            <small>{{ store.currentUser?.email }}</small>
          </div>
        </div>
      </header>

      <main class="organizer-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>
