<script setup lang="ts">
import { useEventsStore } from '@/stores/events'
import type { Role } from '@/types'

const store = useEventsStore()

function updateRole(userId: number, event: Event) {
  const role = (event.target as HTMLSelectElement).value as Role
  store.changeRole(userId, role)
}
</script>

<template>
  <div>
    <h1>Administration</h1>
    <p>Manage users, roles, and university events.</p>

    <section class="stats-grid">
      <div class="stat-card">
        <h3>{{ store.users.length }}</h3>
        <p>Total Users</p>
      </div>

      <div class="stat-card">
        <h3>{{ store.clubs.length }}</h3>
        <p>Total Clubs</p>
      </div>

      <div class="stat-card">
        <h3>{{ store.events.length }}</h3>
        <p>Total Events</p>
      </div>
    </section>

    <section class="panel">
      <h2>User Management</h2>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="user in store.users" :key="user.id">
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>
                <select
                  :value="user.role"
                  :disabled="user.id === store.currentUser?.id"
                  @change="updateRole(user.id, $event)"
                >
                  <option value="student">Student</option>
                  <option value="organizer">Organizer</option>
                  <option value="admin">Administrator</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="panel">
      <h2>All University Events</h2>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Club</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="event in store.events" :key="event.id">
              <td>{{ event.title }}</td>
              <td>{{ store.getClub(event.clubId)?.name }}</td>
              <td>{{ event.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
