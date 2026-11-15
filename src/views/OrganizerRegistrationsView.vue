
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEventsStore } from '@/stores/events'

const store = useEventsStore()

const search = ref('')
const selectedEvent = ref('all')
const statusFilter = ref('active')

const rows = computed(() => {
  const myEventIds = new Set(store.myEvents.map(e => e.id))

  return store.registrations
    .filter(r => myEventIds.has(r.eventId))
    .map(r => ({
      ...r,
      eventTitle:
        store.getEvent(r.eventId)?.title ?? 'Unknown Event',
      email:
        store.users.find(u => u.id === r.userId)?.email ?? ''
    }))
})

const filteredRows = computed(() =>
  rows.value.filter(r => {
    const query = search.value.trim().toLowerCase()

    const matchesSearch =
      `${r.fullName} ${r.email} ${r.studentId}`
        .toLowerCase()
        .includes(query)

    const matchesEvent =
      selectedEvent.value === 'all' ||
      r.eventId === Number(selectedEvent.value)

    const matchesStatus =
      statusFilter.value === 'all' ||
      r.status === statusFilter.value

    return matchesSearch && matchesEvent && matchesStatus
  })
)

const activeCount = computed(() =>
  rows.value.filter(r => r.status === 'active').length
)

const reservedSeats = computed(() =>
  rows.value
    .filter(r => r.status === 'active')
    .reduce((sum, r) => sum + (r.quantity ?? 1), 0)
)

function exportCSV() {
  const columns = [
    'Event', 'Name', 'Email', 'Student ID',
    'Department', 'Phone', 'Quantity', 'Status'
  ]

  const data = filteredRows.value.map(r => [
    r.eventTitle,
    r.fullName,
    r.email,
    r.studentId,
    r.department,
    r.phoneNumber,
    r.quantity,
    r.status
  ])

  const escapeCSV = (value: unknown) => {
    let text = String(value ?? '')

    // Prevent spreadsheet formula execution.
    if (/^[\s]*[=+\-@]/.test(text)) {
      text = "'" + text
    }

    return '"' + text.replace(/"/g, '""') + '"'
  }

  const csv = [columns, ...data]
    .map(row => row.map(escapeCSV).join(','))
    .join('\r\n')

  const blob = new Blob(
    ['\uFEFF', csv],
    { type: 'text/csv;charset=utf-8;' }
  )

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'event-registrations.csv'
  link.click()

  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="organizer-registrations">
    <div class="dashboard-heading">
      <div>
        <h1>Registration Management</h1>
        <p>Students registered for your events</p>
      </div>

      <button class="btn" @click="exportCSV">
        Export CSV
      </button>
    </div>

    <section class="stats-grid">
      <div class="stat-card">
        <h3>{{ activeCount }}</h3>
        <p>Active Registrations</p>
      </div>

      <div class="stat-card">
        <h3>{{ reservedSeats }}</h3>
        <p>Reserved Seats</p>
      </div>

      <div class="stat-card">
        <h3>{{ store.myEvents.length }}</h3>
        <p>My Events</p>
      </div>
    </section>

    <section class="panel">
      <h2>Registered Students</h2>

      <div class="registration-filters">
        <input
          v-model="search"
          placeholder="Search name, email or student ID..."
        />

        <select v-model="selectedEvent">
          <option value="all">All My Events</option>
          <option
            v-for="event in store.myEvents"
            :key="event.id"
            :value="String(event.id)"
          >
            {{ event.title }}
          </option>
        </select>

        <select v-model="statusFilter">
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
          <option value="all">All Statuses</option>
        </select>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Student Name</th>
              <th>Email</th>
              <th>Student ID</th>
              <th>Department</th>
              <th>Phone</th>
              <th>Seats</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="student in filteredRows"
              :key="student.id"
            >
              <td>{{ student.eventTitle }}</td>
              <td>{{ student.fullName }}</td>
              <td>{{ student.email }}</td>
              <td>{{ student.studentId }}</td>
              <td>{{ student.department }}</td>
              <td>{{ student.phoneNumber }}</td>
              <td>{{ student.quantity }}</td>
              <td>
                <span
                  class="event-status"
                  :class="
                    student.status === 'active'
                      ? 'status-published'
                      : 'status-cancelled'
                  "
                >
                  {{
                    student.status === 'active'
                      ? 'Registered'
                      : 'Cancelled'
                  }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="filteredRows.length === 0" class="muted">
        No registrations found.
      </p>
    </section>
  </div>
</template>
