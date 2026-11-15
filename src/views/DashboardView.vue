
<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import EventCard from '@/components/Eventcard.vue'
import { useEventsStore } from '@/stores/events'

const store = useEventsStore()

const upcomingEvents = computed(() =>
  store.publishedEvents
    .filter(e => new Date(e.date).getTime() > Date.now())
    .sort((a, b) =>
      new Date(a.date).getTime() -
      new Date(b.date).getTime()
    )
)

// const myRegistrations = computed(() =>
//   store.registrations.filter(r =>
//     r.userId === store.currentUser.id &&
//     r.status === 'active'
//   ).length
// )
</script>

<template>
  <div>
    <section class="hero">
      <h1>Welcome to Campus Events !</h1>
      <p>
        Discover and participate in university
        club and department activities.
      </p>

      <RouterLink to="/events" class="btn btn-light">
        Explore Events
      </RouterLink>
    </section>

    <!-- <section class="stats-grid">
      <div class="stat-card">
        <h3>{{ upcomingEvents.length }}</h3>
        <p>Upcoming Events</p>
      </div>

      <div class="stat-card">
        <h3>{{ store.clubs.length }}</h3>
        <p>University Clubs</p>
      </div>

      <div class="stat-card">
        <h3>{{ myRegistrations }}</h3>
        <p>My Registrations</p>
      </div>
    </section> -->

    <section>
      <div class="section-heading">
        <h2>Upcoming Events</h2>
        <RouterLink to="/events">View All</RouterLink>
      </div>

      <div class="event-grid">
        <EventCard
          v-for="event in upcomingEvents.slice(0, 3)"
          :key="event.id"
          :event="event"
        />
      </div>

      <p v-if="upcomingEvents.length === 0">
        No upcoming events available.
      </p>
    </section>
  </div>
</template>
