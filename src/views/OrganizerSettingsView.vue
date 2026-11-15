<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useEventsStore } from '@/stores/events'

const store = useEventsStore()

const profile = reactive({ name: '', email: '' })
const password = reactive({ current: '', next: '', confirm: '' })
const profileMessage = ref('')
const profileError = ref('')
const passwordMessage = ref('')
const passwordError = ref('')

watch(
  () => store.currentUser?.id,
  () => {
    profile.name = store.currentUser?.name ?? ''
    profile.email = store.currentUser?.email ?? ''
  },
  { immediate: true },
)

function saveProfile() {
  profileError.value = ''
  profileMessage.value = ''

  const result = store.updateProfile(profile.name, profile.email)

  if (result) {
    profileError.value = result
    return
  }

  profileMessage.value = 'Profile updated successfully.'
}

async function savePassword() {
  passwordError.value = ''
  passwordMessage.value = ''

  if (password.next !== password.confirm) {
    passwordError.value = 'New passwords do not match.'
    return
  }

  const result = await store.changePassword(password.current, password.next)

  if (result) {
    passwordError.value = result
    return
  }

  password.current = ''
  password.next = ''
  password.confirm = ''
  passwordMessage.value = 'Password updated successfully.'
}
</script>

<template>
  <div>
    <h1>Profile & Settings</h1>
    <p>Update your organizer profile and account password.</p>

    <section class="panel">
      <h2>Profile Information</h2>
      <form class="form-grid" @submit.prevent="saveProfile">
        <label>
          Name
          <input v-model="profile.name" required />
        </label>

        <label>
          Email
          <input v-model="profile.email" type="email" required />
        </label>

        <div class="full-width">
          <button type="submit" class="btn">Save Profile</button>
        </div>

        <p v-if="profileError" class="error-message full-width" role="alert">
          {{ profileError }}
        </p>
        <p v-if="profileMessage" class="success-message full-width" role="status">
          {{ profileMessage }}
        </p>
      </form>
    </section>

    <section class="panel">
      <h2>Change Password</h2>
      <form class="form-grid" @submit.prevent="savePassword">
        <label>
          Current Password
          <input v-model="password.current" type="password" minlength="8" required />
        </label>

        <label>
          New Password
          <input v-model="password.next" type="password" minlength="8" required />
        </label>

        <label>
          Confirm New Password
          <input v-model="password.confirm" type="password" minlength="8" required />
        </label>

        <div class="full-width">
          <button type="submit" class="btn">Update Password</button>
        </div>

        <p v-if="passwordError" class="error-message full-width" role="alert">
          {{ passwordError }}
        </p>
        <p v-if="passwordMessage" class="success-message full-width" role="status">
          {{ passwordMessage }}
        </p>
      </form>
    </section>
  </div>
</template>
