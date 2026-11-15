
<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/events'

const router = useRouter()
const store = useEventsStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true

  try {
    const result = await store.login(
      email.value,
      password.value
    )

    if (result) {
      error.value = result
      return
    }

    await router.push(store.homeRoute)
  } catch {
    error.value = 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-heading">
        <h1>Welcome Back!!!</h1>
        <p>Sign in to your university account</p>
      </div>

      <form @submit.prevent="handleLogin">
        <label>
          Email Address
          <input
            v-model="email"
            type="email"
            placeholder="Enter your university email"
            autocomplete="username"
            required
          />
        </label>

        <label>
          Password
          <input
            v-model="password"
            type="password"
            placeholder="Enter your password"
            autocomplete="current-password"
            required
          />
        </label>

        <p v-if="error" class="error-message" role="alert">
          {{ error }}
        </p>

        <button
          type="submit"
          class="btn auth-submit"
          :disabled="loading"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <p class="auth-footer">
        Don't have an account?
        <RouterLink to="/register">Sign Up</RouterLink>
      </p>

      <p class="muted">
        Demo accounts: student@university.edu, organizer@university.edu, or
        admin@university.edu. Password: <code>Demo123!</code>
      </p>
    </div>
  </div>
</template>
