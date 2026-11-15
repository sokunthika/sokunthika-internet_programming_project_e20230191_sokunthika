<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/events'

const route = useRoute()
const router = useRouter()
const store = useEventsStore()

const eventId = computed(() => Number(route.params.id))

const event = computed(() => store.getEvent(eventId.value))

const club = computed(() => (event.value ? store.getClub(event.value.clubId) : null))

const organizer = computed(() =>
  event.value ? store.users.find((u) => u.id === event.value?.organizerId) : null,
)

const seatsLeft = computed(() => (event.value ? store.seatsLeft(event.value.id) : 0))

const isRegistered = computed(() => (event.value ? store.isRegistered(event.value.id) : false))

const registrationOpen = computed(() => {
  if (!event.value) return false

  if (event.value.status !== 'published') return false

  if (new Date(event.value.date).getTime() <= Date.now()) {
    return false
  }

  if (
    event.value.registrationDeadline &&
    new Date(event.value.registrationDeadline).getTime() <= Date.now()
  ) {
    return false
  }

  return seatsLeft.value > 0
})

const registrationStatus = computed(() => {
  if (!event.value) return 'Unavailable'

  if (event.value.status === 'cancelled') return 'Event Cancelled'
  if (event.value.status !== 'published') return 'Registration Unavailable'

  if (new Date(event.value.date).getTime() <= Date.now()) {
    return 'Event Ended'
  }

  if (
    event.value.registrationDeadline &&
    new Date(event.value.registrationDeadline).getTime() <= Date.now()
  ) {
    return 'Registration Closed'
  }

  if (seatsLeft.value <= 0) return 'Event Full'

  return 'Registration Open'
})

const activitiesList = computed(() =>
  (event.value?.activities ?? '')
    .split('\n')
    .map((activity) => activity.trim())
    .filter(Boolean),
)

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function registerNow() {
  if (!event.value || !registrationOpen.value) return

  if (!store.isAuthenticated) {
    router.push('/login')
    return
  }

  if (store.currentRole !== 'student') return

  router.push(`/events/${event.value.id}/register`)
}
</script>

<template>
  <div class="event-details-page">
    <div v-if="!event" class="panel">
      <h2>Event Not Found</h2>
      <p>This event does not exist.</p>
      <RouterLink to="/events" class="btn"> Back to Events </RouterLink>
    </div>

    <template v-else>
      <RouterLink to="/events" class="back-to-events"> ← Back to Events </RouterLink>

      <article class="event-detail-container">
        <!-- EVENT COVER IMAGE -->
        <div v-if="event.image" class="event-detail-cover">
          <img :src="event.image" :alt="event.title" />
        </div>

        <!-- EVENT MAIN INFORMATION -->
        <div class="event-detail-content">
          <div class="event-detail-badges">
            <span
              class="detail-status"
              :class="{
                'status-open': registrationOpen,
                'status-closed': !registrationOpen,
              }"
            >
              {{ registrationStatus }}
            </span>

            <span class="detail-category">
              {{ event.category }}
            </span>
          </div>

          <h1 class="event-detail-title">
            {{ event.title }}
          </h1>

          <!-- EVENT DESCRIPTION -->
          <section class="event-detail-section">
            <h2>Event Description</h2>
            <p class="event-description">
              {{ event.description }}
            </p>
          </section>

          <!-- ADDITIONAL EVENT IMAGE -->
          <section v-if="event.additionalImage" class="event-detail-section">
            <h2>Event Gallery</h2>

            <div class="event-additional-image">
              <img
                :src="event.additionalImage"
                :alt="`${event.title} - Additional Image`"
                loading="lazy"
              />
            </div>
          </section>

          <!-- EVENT DETAILS -->
          <section class="event-detail-section">
            <h2>Event Details</h2>

            <div class="event-info-grid">
              <div class="event-info-item">
                <span class="info-icon"><i class="fa-regular fa-calendar"></i></span>
                <div>
                  <small>Date</small>
                  <strong>{{ formatDate(event.date) }}</strong>
                </div>
              </div>

              <div class="event-info-item">
                <span class="info-icon"><i class="fa-regular fa-clock"></i></span>
                <div>
                  <small>Time</small>
                  <strong>
                    {{ formatTime(event.date) }}
                    <template v-if="event.endTime"> – {{ formatTime(event.endTime) }} </template>
                  </strong>
                </div>
              </div>

              <div class="event-info-item">
                <span class="info-icon"><i class="fa-solid fa-map-location-dot"></i></span>
                <div>
                  <small>Location</small>
                  <strong>{{ event.location }}</strong>
                </div>
              </div>

              <div class="event-info-item">
                <span class="info-icon"><i class="fa-solid fa-people-line"></i></span>
                <div>
                  <small>Capacity</small>
                  <strong> {{ event.capacity }} participants </strong>
                  <small> {{ seatsLeft }} seats remaining </small>
                </div>
              </div>

              <div v-if="event.admission" class="event-info-item">
                <span class="info-icon"><i class="fa-solid fa-ticket"></i></span>
                <div>
                  <small>Admission</small>
                  <strong>{{ event.admission }}</strong>
                </div>
              </div>

              <div v-if="event.registrationDeadline" class="event-info-item">
                <span class="info-icon"><i class="fa-solid fa-hourglass-start"></i></span>
                <div>
                  <small>Registration Deadline</small>
                  <strong>
                    {{ formatDate(event.registrationDeadline) }}
                    at {{ formatTime(event.registrationDeadline) }}
                  </strong>
                </div>
              </div>

              <div v-if="event.meetingLink" class="event-info-item">
                <span class="info-icon"><i class="fa-solid fa-laptop"></i></span>
                <div>
                  <small>Online Meeting</small>
                  <a :href="event.meetingLink" target="_blank" rel="noopener noreferrer">
                    Open Meeting Link
                  </a>
                </div>
              </div>
            </div>
          </section>

          <!-- ACTIVITIES -->
          <section v-if="activitiesList.length" class="event-detail-section">
            <h2>Activities</h2>

            <ul class="event-activities">
              <li v-for="(activity, index) in activitiesList" :key="index">
                <span>✓</span>
                {{ activity }}
              </li>
            </ul>
          </section>

          <!-- AUDIENCE AND REQUIREMENTS -->
          <section v-if="event.targetAudience || event.requirements" class="event-detail-section">
            <h2>Who Can Join?</h2>

            <p v-if="event.targetAudience">
              <strong>Target Audience:</strong>
              {{ event.targetAudience }}
            </p>

            <p v-if="event.requirements">
              <strong>Registration Requirements:</strong>
              {{ event.requirements }}
            </p>
          </section>

          <!-- ORGANIZER INFORMATION -->
          <section class="event-detail-section">
            <h2>Organizer Information</h2>

            <p>
              <strong>Club:</strong>
              {{ club?.name ?? 'University Club' }}
            </p>

            <p v-if="organizer">
              <strong>Organizer:</strong>
              {{ organizer.name }}
            </p>

            <p v-if="event.contactEmail">
              <strong>Contact:</strong>
              <a :href="`mailto:${event.contactEmail}`">
                {{ event.contactEmail }}
              </a>
            </p>
          </section>

          <!-- REGISTRATION -->
          <section class="event-register-panel">
            <div>
              <h2>Ready to Participate?</h2>
              <p v-if="registrationOpen">Reserve your place before registration closes.</p>
              <p v-else>
                {{ registrationStatus }}
              </p>
            </div>

            <div v-if="isRegistered" class="already-registered">✓ You are already registered</div>

            <button
              v-else-if="
                registrationOpen && (!store.isAuthenticated || store.currentRole === 'student')
              "
              class="btn event-register-btn"
              @click="registerNow"
            >
              Register Now
            </button>

            <button v-else class="btn event-register-btn" disabled>Registration Unavailable</button>
          </section>
        </div>
      </article>
    </template>
  </div>
</template>
