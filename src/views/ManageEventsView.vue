<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/events'
import type { ClubEvent } from '@/types'

const store = useEventsStore()
const route = useRoute()
const router = useRouter()
const isCreatePage = computed(() => route.path === '/organizer/create')

const editingId = ref<number | null>(null)
const message = ref('')
const search = ref('')
const statusFilter = ref('all')

type EventForm = Omit<ClubEvent, 'id'>

const emptyForm = (): EventForm => ({
  clubId: 1,
  organizerId: store.currentUser?.id ?? 0,
  title: '',
  description: '',
  category: 'Workshop',
  location: '',
  date: '',
  capacity: 20,
  status: 'draft',
  image: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  registrationDeadline: '',
  contactEmail: '',
  requirements: '',
  meetingLink: '',
  endTime: '',
  admission: '',
  activities: '',
  targetAudience: '',
  additionalImage: '',
})

const form = reactive<EventForm>(emptyForm())

const filteredEvents = computed(() =>
  store.myEvents.filter((event) => {
    const matchesSearch = `${event.title} ${event.category}`
      .toLowerCase()
      .includes(search.value.toLowerCase())
    const matchesStatus = statusFilter.value === 'all' || event.status === statusFilter.value

    return matchesSearch && matchesStatus
  }),
)

function resetForm() {
  Object.assign(form, emptyForm())
  editingId.value = null
}

function editEvent(event: ClubEvent) {
  editingId.value = event.id
  Object.assign(form, {
    clubId: event.clubId,
    organizerId: event.organizerId,
    title: event.title,
    description: event.description,
    category: event.category,
    location: event.location,
    date: event.date,
    capacity: event.capacity,
    status: event.status,
    image: event.image ?? '',
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    registrationDeadline: event.registrationDeadline ?? '',
    contactEmail: event.contactEmail ?? '',
    requirements: event.requirements ?? '',
    meetingLink: event.meetingLink ?? '',
    endTime: event.endTime ?? '',
    admission: event.admission ?? '',
    activities: event.activities ?? '',
    targetAudience: event.targetAudience ?? '',
    additionalImage: event.additionalImage ?? '',
  })
}

function openEditPage(event: ClubEvent) {
  router.push({
    path: '/organizer/create',
    query: { edit: String(event.id) },
  })
}

function saveEvent() {
  if (
    !form.title.trim() ||
    !form.description.trim() ||
    !form.location.trim() ||
    !form.date ||
    form.capacity < 1
  ) {
    message.value = 'Please complete all fields correctly.'
    return
  }

  if (new Date(form.date).getTime() <= Date.now()) {
    message.value = 'Event date must be in the future.'
    return
  }

  if (
    form.registrationDeadline &&
    new Date(form.registrationDeadline).getTime() > new Date(form.date).getTime()
  ) {
    message.value = 'The registration deadline cannot be after the event date.'
    return
  }

  if (
    form.endTime &&
    new Date(form.endTime).getTime() <=
      new Date(form.date).getTime()
  ) {
    message.value = 'Event end time must be after start time.'
    return
  }

  const data = { ...form }

  if (editingId.value !== null) {
    const count = store.getAttendees(editingId.value).length

    if (data.capacity < count) {
      message.value = 'Capacity cannot be below existing attendees.'
      return
    }

    store.updateEvent(editingId.value, data)
    message.value = 'Event updated.'
  } else {
    store.createEvent(data)
    message.value = 'Event created.'
  }

  resetForm()
}

function loadEventFromQuery() {
  const queryId = Number(route.query.edit)

  if (!route.query.edit) {
    resetForm()
    return
  }

  const event = store.myEvents.find((item) => item.id === queryId)

  if (!event || event.status === 'pending') {
    resetForm()
    return
  }

  editEvent(event)
}

watch(() => route.query.edit, loadEventFromQuery, { immediate: true })
</script>

<template>
  <div>
    <template v-if="isCreatePage">
      <h1>{{ editingId !== null ? 'Edit Event' : 'Create Event' }}</h1>
      <p>Enter your event information and save your event.</p>

      <section class="panel organizer-create-panel">
        <form class="form-grid" @submit.prevent="saveEvent">
          <label>
            Event Title
            <input v-model="form.title" required />
          </label>

          <label>
            Category
            <select v-model="form.category">
              <option>Workshop</option>
              <option>Seminar</option>
              <option>Competition</option>
              <option>Exhibition</option>
              <option>Sports</option>
              <option>Other</option>
            </select>
          </label>

          <label>
            Department
            <select v-model.number="form.clubId">
              <option v-for="club in store.clubs" :key="club.id" :value="club.id">
                {{ club.name }}
              </option>
            </select>
          </label>

          <label>
            Event Date and Time
            <input v-model="form.date" type="datetime-local" required />
          </label>

          <label>
            Location
            <input v-model="form.location" required />
          </label>

          <label>
            Participant Capacity
            <input v-model.number="form.capacity" type="number" min="1" required />
          </label>

          <label class="full-width">
            Event Image URL
            <input
              v-model="form.image"
              type="url"
              placeholder="https://example.com/event-image.jpg"
            />
          </label>

          <label class="full-width">
            Description
            <textarea v-model="form.description" rows="4" required></textarea>
          </label>

          <label>
            Registration Deadline
            <input v-model="form.registrationDeadline" type="datetime-local" />
          </label>

          <label>
            Contact Email
            <input
              v-model="form.contactEmail"
              type="email"
              placeholder="organizer@university.edu"
            />
          </label>

          <label>
            Online Meeting Link (Optional)
            <input
              v-model="form.meetingLink"
              type="url"
              placeholder="https://meet.example.com/..."
            />
          </label>

          <label class="full-width">
            Registration Requirements
            <textarea
              v-model="form.requirements"
              rows="3"
              placeholder="Requirements for participants..."
            ></textarea>
          </label>

          <!-- Additional image for Event Details -->
          <label class="full-width">
            Additional Event Image URL
            <input
              v-model="form.additionalImage"
              type="url"
              placeholder="https://example.com/event-gallery.jpg"
            />
          </label>

          <!-- NEW: Event End Date and Time -->
          <label>
            Event End Date & Time
            <input v-model="form.endTime" type="datetime-local" />
          </label>

          <!-- NEW: Admission -->
          <label>
            Admission
            <select v-model="form.admission">
              <option value="">Not specified</option>
              <option value="Free Admission">Free Admission</option>
              <option value="Paid Admission">Paid Admission</option>
            </select>
          </label>

          <!-- NEW: Activities -->
          <label class="full-width">
            Activities
            <textarea
              v-model="form.activities"
              rows="5"
              placeholder="Enter one activity per line"
            ></textarea>
          </label>

          <!-- NEW: Target Audience -->
          <label class="full-width">
            Target Audience
            <input
              v-model="form.targetAudience"
              placeholder="e.g. University students from all majors"
            />
          </label>

          <div class="full-width">
            <button type="submit" class="btn">
              {{ editingId !== null ? 'Save Changes' : 'Create Event' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="resetForm">Clear</button>
          </div>
        </form>

        <p v-if="message" role="status">{{ message }}</p>
      </section>
    </template>

    <template v-else>
      <h1>My Events</h1>
      <p>View and manage only the events you created.</p>

      <section class="panel">
        <div class="organizer-filters">
          <input v-model="search" placeholder="Search by event title or category..." />

          <select v-model="statusFilter">
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending Approval</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div v-if="filteredEvents.length" class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Status</th>
                <th>Seats</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="event in filteredEvents" :key="event.id">
                <td>{{ event.title }}</td>
                <td>{{ event.status }}</td>
                <td>{{ event.capacity - store.seatsLeft(event.id) }} / {{ event.capacity }}</td>
                <td class="actions">
                  <button :disabled="event.status === 'pending'" @click="openEditPage(event)">
                    Edit
                  </button>
                  <button
                    v-if="event.status === 'draft' || event.status === 'rejected'"
                    @click="message = store.submitForApproval(event.id)"
                  >
                    Submit for Approval
                  </button>
                  <button v-if="event.status !== 'cancelled'" @click="store.cancelEvent(event.id)">
                    Cancel Event
                  </button>
                  <RouterLink :to="`/manage/${event.id}/attendees`">Attendees</RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-else>You haven't created any events yet.</p>
        <p v-if="message" role="status">{{ message }}</p>
      </section>
    </template>
  </div>
</template>
