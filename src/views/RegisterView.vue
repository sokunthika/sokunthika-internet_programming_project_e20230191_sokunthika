
<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/events'

const router = useRouter()
const store = useEventsStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

async function handleSignUp() {
  error.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }

  loading.value = true

  try {
    const result = await store.signUp(
      name.value,
      email.value,
      password.value
    )

    if (result) {
      error.value = result
      return
    }

    await router.push('/dashboard')
  } catch {
    error.value = 'Unable to create account.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-heading">
        <h1>Create Account</h1>
        <p>Join university club events</p>
      </div>

      <form @submit.prevent="handleSignUp">
        <label>
          Full Name
          <input
            v-model="name"
            placeholder="Enter your full name"
            autocomplete="name"
            required
          />
        </label>

        <label>
          University Email
          <input
            v-model="email"
            type="email"
            placeholder="student@university.edu"
            autocomplete="email"
            required
          />
        </label>

        <label>
          Password
          <input
            v-model="password"
            type="password"
            placeholder="At least 8 characters"
            autocomplete="new-password"
            minlength="8"
            required
          />
        </label>

        <label>
          Confirm Password
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            autocomplete="new-password"
            required
          />
        </label>

        <p class="muted">
          New accounts receive the Student role.
          Organizer and Administrator access must
          be assigned by an administrator.
        </p>

        <p v-if="error" class="error-message" role="alert">
          {{ error }}
        </p>

        <button
          type="submit"
          class="btn auth-submit"
          :disabled="loading"
        >
          {{ loading ? 'Creating Account...' : 'Create Account' }}
        </button>
      </form>

      <p class="auth-footer">
        Already have an account?
        <RouterLink to="/login">Sign In</RouterLink>
      </p>
    </div>
  </div>
</template>
