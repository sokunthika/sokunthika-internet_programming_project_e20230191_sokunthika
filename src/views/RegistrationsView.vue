<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useEventsStore } from '@/stores/events'

const store = useEventsStore()
const message = ref('')

const myEvents = computed(() =>
  store.registrations
    .filter((r) => r.userId === store.currentUser?.id && r.status === 'active')
    .map((registration) => ({
      registration,
      event: store.getEvent(registration.eventId),
    }))
    .filter((item) => item.event !== undefined),
)

function cancelRegistration(eventId: number) {
  if (!window.confirm('Cancel this registration?')) {
    return
  }

  const success = store.cancelRegistration(eventId)

  message.value = success
    ? 'Registration cancelled successfully.'
    : 'Unable to cancel registration.'
}
</script>

<template>
  <div>
    <h1>My Registrations</h1>
    <p>Manage the university events you have registered for.</p>

    <p v-if="message" role="status">
      {{ message }}
    </p>

    <div v-if="myEvents.length === 0" class="panel">
      <p>You haven't registered for any events yet.</p>

      <RouterLink to="/events" class="btn"> Browse Events </RouterLink>
    </div>

    <div v-for="item in myEvents" :key="item.registration.id" class="panel registration-card">
      <h3>{{ item.event!.title }}</h3>

      <p>
        <i class="fa-solid fa-calendar-days" aria-hidden="true"></i>
        {{ new Date(item.event!.date).toLocaleString() }}
      </p>

      <p>
        <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
        {{ item.event!.location }}
      </p>

      <p>
        <strong>Student:</strong>
        {{ item.registration.fullName }}
      </p>

      <p>
        <strong>Student ID:</strong>
        {{ item.registration.studentId }}
      </p>

      <p>
        <strong>Seats Reserved:</strong>
        {{ item.registration.quantity }}
      </p>

      <span class="tag">Registered</span>

      <div class="registration-actions">
        <RouterLink :to="`/events/${item.event!.id}`" class="btn"> View Details </RouterLink>

        <button
          class="btn btn-danger"
          :disabled="new Date(item.event!.date).getTime() <= Date.now()"
          @click="cancelRegistration(item.event!.id)"
        >
          Cancel Registration
        </button>
      </div>
    </div>
  </div>
</template>
