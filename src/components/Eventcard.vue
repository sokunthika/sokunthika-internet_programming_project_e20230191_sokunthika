
<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useEventsStore } from '@/stores/events'
import type { ClubEvent } from '@/types'

const props = defineProps<{
  event: ClubEvent
}>()

const store = useEventsStore()

const remainingSeats = computed(() =>
  store.seatsLeft(props.event.id)
)

const seatStatus = computed(() => {
  const seats = remainingSeats.value

  if (seats === 0) {
    return {
      color: 'red',
      label: 'Event Full'
    }
  }

  if (seats <= 5) {
    return {
      color: 'red',
      label: `${seats} seats left.`
    }
  }

  if (seats <= 10) {
    return {
      color: 'yellow',
      label: 'Almost Full'
    }
  }

  return {
    color: 'green',
    label: 'Seats Available'
  }
})
</script>

<template>
  <article class="event-card">
    <img
      v-if="event.image || event.additionalImage"
      :src="event.image || event.additionalImage"
      :alt="event.title"
      class="event-image"
      loading="lazy"
    />
    <div class="card-body">
      <span class="tag">{{ event.category }}</span>

      <h3>{{ event.title }}</h3>

      <p>{{ event.description }}</p>

      <p>
        Date: {{ new Date(event.date).toLocaleString() }}
      </p>

      <p>Venue: {{ event.location }}</p>

      <p>
        Organizer: {{ store.getClub(event.clubId)?.name }}
      </p>

      <!-- Seat availability -->
      <div
        class="seat-status"
        :class="seatStatus.color"
      >
        <span class="seat-count">
          {{ remainingSeats }}
        </span>

        <div>
          <strong>{{ seatStatus.label }}</strong>

          <small>
            Capacity: {{ event.capacity }} seats
          </small>
        </div>
      </div>
    </div>

    <div class="card-actions">
      <RouterLink
        :to="`/events/${event.id}`"
        class="btn"
      >
        View Details
      </RouterLink>
    </div>
  </article>
</template>
