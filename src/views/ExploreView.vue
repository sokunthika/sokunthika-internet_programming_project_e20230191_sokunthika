
<script setup lang="ts">
import { ref, computed } from 'vue'
import EventCard from '@/components/Eventcard.vue'
import { useEventsStore } from '@/stores/events'

const store = useEventsStore()

const search = ref('')
const category = ref('')
const department = ref('')
const selectedDate = ref('')

const categories = computed(() =>
  [...new Set(store.events.map(e => e.category))]
)

const departments = computed(() =>
  [...new Set(store.clubs.map(c => c.department))]
)

const filteredEvents = computed(() =>
  store.publishedEvents.filter(event => {
    const club = store.getClub(event.clubId)

    const text = [
      event.title,
      event.category,
      event.location,
      club?.name,
      club?.department
    ].join(' ').toLowerCase()

    const matchesSearch =
      text.includes(search.value.toLowerCase())

    const matchesCategory =
      !category.value || event.category === category.value

    const matchesDepartment =
      !department.value ||
      club?.department === department.value

    const matchesDate =
      !selectedDate.value ||
      event.date.startsWith(selectedDate.value)

    const isUpcoming =
      new Date(event.date).getTime() > Date.now()

    return (
      matchesSearch &&
      matchesCategory &&
      matchesDepartment &&
      matchesDate &&
      isUpcoming
    )
  }).sort((a, b) => a.date.localeCompare(b.date))
)
</script>

<template>
  <div>
    <h1>Explore University Events</h1>
    <p>Find events organized by departments and clubs.</p>

    <div class="filter-bar">
      <input
        v-model="search"
        placeholder="Search events or clubs..."
      />

      <select v-model="category">
        <option value="">All Categories</option>
        <option
          v-for="item in categories"
          :key="item"
          :value="item"
        >
          {{ item }}
        </option>
      </select>

      <select v-model="department">
        <option value="">All Departments</option>
        <option
          v-for="item in departments"
          :key="item"
          :value="item"
        >
          {{ item }}
        </option>
      </select>

      <input
        v-model="selectedDate"
        type="date"
        aria-label="Filter by date"
      />
    </div>

    <p>{{ filteredEvents.length }} event(s) found</p>

    <div class="event-grid">
      <EventCard
        v-for="event in filteredEvents"
        :key="event.id"
        :event="event"
      />
    </div>

    <p v-if="filteredEvents.length === 0">
      No events match your search.
    </p>
  </div>
</template>
