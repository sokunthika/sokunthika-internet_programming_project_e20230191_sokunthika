
<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useEventsStore } from '@/stores/events'

const store = useEventsStore()

const totalEvents = computed(() => store.myEvents.length)

const recentEvents = computed(() =>
  [...store.myEvents]
    .sort((a, b) =>
      new Date(b.updatedAt).getTime() -
      new Date(a.updatedAt).getTime()
    )
    .slice(0, 5)
)

const eventStatistics = computed(() =>
  store.myEvents.map(event => {
    const registrations = store.myRegistrationRecords
      .filter(r => r.eventId === event.id)

    return {
      id: event.id,
      title: event.title,
      count: registrations.length,
      reserved: registrations.reduce(
        (sum, r) => sum + (r.quantity ?? 1),
        0
      ),
      capacity: event.capacity
    }
  }).sort((a, b) => b.reserved - a.reserved)
)

const chartMaximum = computed(() =>
  Math.max(1, ...eventStatistics.value.map(s => s.reserved))
)

function barWidth(reserved: number) {
  return `${reserved / chartMaximum.value * 100}%`
}

function statusClass(status: string) {
  return `status-${status}`
}

const overviewCards = computed(() => [
  {
    title: 'Total Events',
    value: totalEvents.value,
    icon: 'fa-solid fa-calendar-days',
    description: 'Events you created'
  },
  {
    title: 'Total Registrations',
    value: store.totalRegisteredStudents,
    icon: 'fa-solid fa-users',
    description: `${store.totalReservedSeats} reserved seats`
  },
  {
    title: 'Upcoming Events',
    value: store.upcomingEventCount,
    icon: 'fa-solid fa-calendar-check',
    description: 'Published future events'
  },
  {
    title: 'Pending Approval',
    value: store.pendingEventCount,
    icon: 'fa-solid fa-hourglass-half',
    description: 'Waiting for administrator'
  }
])
</script>

<template>
  <div class="organizer-dashboard">
    <div class="dashboard-heading">
      <div>
        <h1>Organizer Dashboard</h1>
        <p>
          Welcome back, {{ store.currentUser?.name }}!
          Here's your event overview.
        </p>
      </div>

      <RouterLink
        to="/organizer/create"
        class="btn"
      >
        + Create Event
      </RouterLink>
    </div>

    <!-- Dashboard statistics -->
    <section class="organizer-stats">
      <div
        v-for="card in overviewCards"
        :key="card.title"
        class="organizer-stat-card"
      >
        <div class="stat-card-top">
          <span>{{ card.title }}</span>
          <i :class="card.icon" class="stat-icon" aria-hidden="true"></i>
        </div>

        <strong class="stat-value">
          {{ card.value }}
        </strong>

        <p>{{ card.description }}</p>
      </div>
    </section>

    <!-- Registration overview -->
    <section class="organizer-panel">
      <div class="panel-heading">
        <div>
          <h2>Registration Overview</h2>
          <p>Reserved seats by event</p>
        </div>

        <RouterLink to="/organizer/registrations">
          View Registrations
        </RouterLink>
      </div>

      <div
        v-if="eventStatistics.length"
        class="registration-chart"
      >
        <div
          v-for="item in eventStatistics.slice(0, 6)"
          :key="item.id"
          class="chart-item"
        >
          <div class="chart-label">
            <span>{{ item.title }}</span>
            <strong>
              {{ item.reserved }} / {{ item.capacity }}
            </strong>
          </div>

          <div class="chart-track">
            <div
              class="chart-fill"
              :style="{ width: barWidth(item.reserved) }"
            ></div>
          </div>
        </div>
      </div>

      <p v-else>No event registrations yet.</p>
    </section>

    <!-- Recent events -->
    <section class="organizer-panel">
      <div class="panel-heading">
        <div>
          <h2>Recent Events</h2>
          <p>Your recently created or updated events</p>
        </div>

        <RouterLink to="/organizer/events">
          View All
        </RouterLink>
      </div>

      <div class="table-scroll">
        <table class="dashboard-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Registered Seats</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="event in recentEvents"
              :key="event.id"
            >
              <td>
                <strong>{{ event.title }}</strong>
                <small>{{ event.category }}</small>
              </td>

              <td>
                {{ new Date(event.date).toLocaleDateString() }}
              </td>

              <td>
                {{ event.capacity - store.seatsLeft(event.id) }}
                / {{ event.capacity }}
              </td>

              <td>
                <span
                  class="event-status"
                  :class="statusClass(event.status)"
                >
                  {{ event.status }}
                </span>
              </td>

              <td>
                <RouterLink to="/organizer/events">
                  Manage
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="recentEvents.length === 0">
        You haven't created any events yet.
      </p>
    </section>
  </div>
</template>
