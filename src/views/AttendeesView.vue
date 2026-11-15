<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useEventsStore } from '@/stores/events'

const route = useRoute()
const store = useEventsStore()

const eventId = Number(route.params.id)

const event = computed(() => store.getEvent(eventId))
const attendees = computed(() =>
  store.registrations
    .filter((r) => r.eventId === eventId && r.status === 'active')
    .map((r) => ({
      ...r,
      email: store.users.find((u) => u.id === r.userId)?.email ?? '',
    })),
)

const totalReserved = computed(() => attendees.value.reduce((total, r) => total + r.quantity, 0))
</script>

<template>
  <section class="panel">
    <h1>Event Attendees</h1>

    <!-- <div v-if="event">
      <h2>{{ event.title }}</h2>

      <p>Total registered: {{ attendees.length }}</p>
      <p>Maximum capacity: {{ event.capacity }}</p>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="user in attendees" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="attendees.length === 0">
        No students have registered yet.
      </p>
    </div> -->

    <p>Registration records: {{ attendees.length }}</p>
    <p>Total seats reserved: {{ totalReserved }}</p>
    <p v-if="event">Event capacity: {{ event.capacity }}</p>
    <p>Available seats: {{ store.seatsLeft(eventId) }}</p>

    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Seats</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="registration in attendees" :key="registration.id">
            <td>{{ registration.studentId }}</td>
            <td>{{ registration.fullName }}</td>
            <td>{{ registration.department }}</td>
            <td>{{ registration.phoneNumber }}</td>
            <td>{{ registration.email }}</td>
            <td>{{ registration.quantity }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="attendees.length === 0">No registrations yet.</p>

    <p v-else>Event not found.</p>
  </section>
</template>
