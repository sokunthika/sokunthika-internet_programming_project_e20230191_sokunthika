
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/events'

const route = useRoute()
const router = useRouter()
const store = useEventsStore()

const eventId = Number(route.params.id)
const event = computed(() => store.getEvent(eventId))

const availableSeats = computed(() =>
  store.seatsLeft(eventId)
)

const form = reactive({
  fullName: store.currentUser?.name ?? '',
  studentId: '',
  department: '',
  phoneNumber: '',
  quantity: 1
})

const error = ref('')

const canRegister = computed(() =>
  !!event.value &&
  event.value.status === 'published' &&
  new Date(event.value.date).getTime() > Date.now() &&
  availableSeats.value > 0 &&
  !store.isRegistered(eventId)
)

function handleRegistration() {
  error.value = ''

  if (!canRegister.value) {
    error.value = 'Registration is not available.'
    return
  }

  const result = store.register(eventId, { ...form })

  if (result === 'Registration successful!') {
    router.push('/registrations')
  } else {
    error.value = result
  }
}
</script>

<template>
  <div class="registration-page">
    <div v-if="event">
      <h1>Event Registration</h1>

      <p>
        Complete your information and select
        the number of seats you want to reserve.
      </p>

      <!-- Event information -->
      <section class="panel">
        <h2>{{ event.title }}</h2>

        <p>📅 {{ new Date(event.date).toLocaleString() }}</p>
        <p>📍 {{ event.location }}</p>

        <div class="seat-summary">
          <strong>{{ availableSeats }}</strong>
          <span>Seats Remaining</span>
        </div>
      </section>

      <!-- Student registration form -->
      <section class="panel">
        <h2>Student Information</h2>

        <form
          class="form-grid"
          @submit.prevent="handleRegistration"
        >
          <label>
            Full Name *
            <input
              v-model="form.fullName"
              type="text"
              placeholder="Enter your full name"
              maxlength="100"
              required
            />
          </label>

          <label>
            Student ID *
            <input
              v-model="form.studentId"
              type="text"
              placeholder="e.g. ST2027001"
              maxlength="30"
              required
            />
          </label>

          <label>
            Department *
            <select v-model="form.department" required>
              <option value="" disabled>
                Select Department
              </option>

              <option
                v-for="department in [
                  ...new Set(
                    store.clubs.map(c => c.department)
                  )
                ]"
                :key="department"
                :value="department"
              >
                {{ department }}
              </option>
            </select>
          </label>

          <label>
            Phone Number *
            <input
              v-model="form.phoneNumber"
              type="tel"
              placeholder="Enter your phone number"
              autocomplete="tel"
              maxlength="20"
              required
            />
          </label>

          <!-- Seat quantity -->
          <div class="full-width">
            <h3>Number of Seats</h3>

            <p class="muted">
              You can reserve up to
              {{ availableSeats }} available seats.
            </p>

            <div class="quantity-selector">
              <button
                type="button"
                :disabled="form.quantity <= 1"
                @click="form.quantity--"
              >
                −
              </button>

              <input
                v-model.number="form.quantity"
                type="number"
                min="1"
                :max="availableSeats"
                step="1"
                required
              />

              <button
                type="button"
                :disabled="
                  form.quantity >= availableSeats
                "
                @click="form.quantity++"
              >
                +
              </button>
            </div>

            <p class="muted">
              Selected: {{ form.quantity }} seat(s)
            </p>
          </div>

          <!-- Summary -->
          <div class="full-width booking-summary">
            <h3>Registration Summary</h3>

            <p>Event: {{ event.title }}</p>

            <p>
              Seats requested:
              <strong>{{ form.quantity }}</strong>
            </p>

            <p>
              Seats remaining after booking:
              <strong>
                {{ Math.max(0, availableSeats - (Number(form.quantity) || 0)) }}
              </strong>
            </p>
          </div>

          <p
            v-if="error"
            class="error-message full-width"
            role="alert"
          >
            {{ error }}
          </p>

          <div class="full-width">
            <button
              type="submit"
              class="btn"
              :disabled="
                !canRegister ||
                !Number.isInteger(form.quantity) ||
                form.quantity < 1 ||
                form.quantity > availableSeats
              "
            >
              Confirm Registration
            </button>

            <button
              type="button"
              class="btn btn-secondary"
              @click="router.push(`/events/${eventId}`)"
            >
              Back
            </button>
          </div>
        </form>
      </section>
    </div>

    <section v-else class="panel">
      <h1>Event Not Found</h1>
    </section>
  </div>
</template>
