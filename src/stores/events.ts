import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import {
  users as sampleUsers,
  clubs as sampleClubs,
  registrations as sampleRegistrations,
} from '@/data/sampleData'

import type { User, ClubEvent, Registration, Role } from '@/types'

interface DemoCredential {
  userId: number
  salt: string
  hash: string
}

function readSaved<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key)
    return saved ? (JSON.parse(saved) as T) : fallback
  } catch {
    return fallback
  }
}

// Demo only: do not use client-side password verification
// as real application authentication.
async function hashPassword(password: string, salt: string): Promise<string> {
  const text = new TextEncoder().encode(salt + password)
  const digest = await crypto.subtle.digest('SHA-256', text)

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function createCredential(userId: number, password: string): Promise<DemoCredential> {
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return {
    userId,
    salt,
    hash: await hashPassword(password, salt),
  }
}

const eventDataResetKey = 'eventDataResetV1'

export const useEventsStore = defineStore('events', () => {
  // ---------------- DATA ----------------

  const users = ref<User[]>(readSaved('users', sampleUsers))

  if (!localStorage.getItem(eventDataResetKey)) {
    localStorage.removeItem('events')
    localStorage.removeItem('registrations')
    localStorage.setItem(eventDataResetKey, 'true')
  }

  const events = ref<ClubEvent[]>(readSaved('events', []))

  const registrations = ref<Registration[]>(readSaved('registrations', sampleRegistrations))

  const credentials = ref<DemoCredential[]>(readSaved('demoCredentials', []))

  const clubs = ref([...sampleClubs])

  // A null value means the visitor is not signed in.
  const currentUserId = ref<number | null>(Number(sessionStorage.getItem('currentUserId')) || null)

  const currentUser = computed(() => users.value.find((u) => u.id === currentUserId.value) ?? null)

  const myEvents = computed(() => {
    if (!currentUser.value) return []

    return events.value.filter((event) => event.organizerId === currentUser.value?.id)
  })

  const myRegistrationRecords = computed(() => {
    const eventIds = new Set(myEvents.value.map((e) => e.id))

    return registrations.value.filter(
      (r) => eventIds.has(r.eventId) && r.status === ('active' as Registration['status']),
    )
  })

  const totalRegisteredStudents = computed(() => myRegistrationRecords.value.length)

  const totalReservedSeats = computed(() =>
    myRegistrationRecords.value.reduce(
      (total, registration) => total + (registration.quantity ?? 1),
      0,
    ),
  )

  const upcomingEventCount = computed(
    () =>
      myEvents.value.filter(
        (event) => event.status === 'published' && new Date(event.date).getTime() > Date.now(),
      ).length,
  )

  const pendingEventCount = computed(
    () => myEvents.value.filter((event) => event.status === 'pending').length,
  )

  const currentRole = computed<Role | null>(() => currentUser.value?.role ?? null)

  const isAuthenticated = computed(() => currentUser.value !== null)

  const homeRoute = computed(() => {
    switch (currentRole.value) {
      case 'student':
        return '/dashboard'
      case 'organizer':
        return '/organizer'
      case 'admin':
        return '/admin'
      default:
        return '/login'
    }
  })

  // ---------------- AUTHENTICATION DEMO ----------------

  async function login(email: string, password: string): Promise<string | null> {
    const normalizedEmail = email.trim().toLowerCase()

    const user = users.value.find((u) => u.email.toLowerCase() === normalizedEmail)

    if (!user) return 'Invalid email or password.'

    const credential = credentials.value.find((c) => c.userId === user.id)

    let valid = false

    if (credential) {
      const hash = await hashPassword(password, credential.salt)
      valid = hash === credential.hash
    } else if (user.id <= 3) {
      // Fixed example accounts from sampleData.ts.
      valid = password === 'Demo123!'
    }

    if (!valid) return 'Invalid email or password.'

    currentUserId.value = user.id
    return null
  }

  async function signUp(name: string, email: string, password: string): Promise<string | null> {
    const normalizedEmail = email.trim().toLowerCase()

    if (!name.trim() || !normalizedEmail.includes('@')) {
      return 'Enter a valid name and email.'
    }

    if (password.length < 8) {
      return 'Password must contain at least 8 characters.'
    }

    if (users.value.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      return 'This email is already registered.'
    }

    const userId = Math.max(0, ...users.value.map((u) => u.id)) + 1

    users.value.push({
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      role: 'student',
    })

    credentials.value.push(await createCredential(userId, password))
    currentUserId.value = userId

    return null
  }

  function updateProfile(name: string, email: string): string | null {
    if (!currentUser.value) return 'You must be signed in.'

    const normalizedEmail = email.trim().toLowerCase()

    if (!name.trim() || !normalizedEmail.includes('@')) {
      return 'Enter a valid name and email.'
    }

    const emailTaken = users.value.some(
      (user) => user.id !== currentUser.value?.id && user.email.toLowerCase() === normalizedEmail,
    )

    if (emailTaken) return 'This email is already in use.'

    currentUser.value.name = name.trim()
    currentUser.value.email = normalizedEmail
    return null
  }

  async function changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<string | null> {
    if (!currentUser.value) return 'You must be signed in.'

    if (newPassword.length < 8) {
      return 'Password must contain at least 8 characters.'
    }

    const credential = credentials.value.find((item) => item.userId === currentUser.value?.id)
    const validCurrentPassword = credential
      ? (await hashPassword(currentPassword, credential.salt)) === credential.hash
      : currentUser.value.id <= 3 && currentPassword === 'Demo123!'

    if (!validCurrentPassword) return 'Current password is incorrect.'

    const nextCredential = await createCredential(currentUser.value.id, newPassword)
    const existingIndex = credentials.value.findIndex(
      (item) => item.userId === currentUser.value?.id,
    )

    if (existingIndex === -1) {
      credentials.value.push(nextCredential)
    } else {
      credentials.value[existingIndex] = nextCredential
    }

    return null
  }

  function logout() {
    currentUserId.value = null
  }

  // ---------------- EVENTS ----------------

  const publishedEvents = computed(() => events.value.filter((e) => e.status === 'published'))

  function getClub(clubId: number) {
    return clubs.value.find((c) => c.id === clubId)
  }

  function getEvent(eventId: number) {
    return events.value.find((e) => e.id === eventId)
  }

  function getAttendees(eventId: number) {
    return registrations.value
      .filter((r) => r.eventId === eventId && r.status === ('active' as Registration['status']))
      .map((r) => users.value.find((u) => u.id === r.userId))
      .filter((u): u is User => u !== undefined)
  }

  function seatsLeft(eventId: number): number {
    const event = getEvent(eventId)

    if (!event) return 0

    const reservedSeats = registrations.value
      .filter((r) => r.eventId === eventId && r.status === ('active' as Registration['status']))
      .reduce((total, r) => total + r.quantity, 0)

    return Math.max(0, event.capacity - reservedSeats)
  }

  function isRegistered(eventId: number) {
    if (!currentUser.value) return false

    return registrations.value.some(
      (r) =>
        r.eventId === eventId &&
        r.userId === currentUser.value?.id &&
        r.status === ('active' as Registration['status']),
    )
  }

  type RegistrationForm = Pick<
    Registration,
    'fullName' | 'studentId' | 'department' | 'phoneNumber' | 'quantity'
  >

  function register(eventId: number, form: RegistrationForm): string {
    if (!isAuthenticated.value || currentRole.value !== 'student' || !currentUser.value) {
      return 'Please sign in with a student account.'
    }

    const event = getEvent(eventId)

    if (!event) return 'Event not found.'

    if (event.status !== 'published') {
      return 'This event is not open for registration.'
    }
    //check if the registration deadline has passed or if the event date has already occurred
    if (event.registrationDeadline && Date.now() > new Date(event.registrationDeadline).getTime()) {
      return 'The registration deadline has passed.'
    }

    if (new Date(event.date).getTime() <= Date.now()) {
      return 'Registration has closed.'
    }

    if (isRegistered(eventId)) {
      return 'You have already registered for this event.'
    }

    // Validate required student information.
    if (
      !form.fullName.trim() ||
      !form.studentId.trim() ||
      !form.department.trim() ||
      !form.phoneNumber.trim()
    ) {
      return 'Please fill in all required fields.'
    }

    if (!/^[0-9+() -]{7,20}$/.test(form.phoneNumber.trim())) {
      return 'Please enter a valid phone number.'
    }

    // Validate the number of seats.
    if (!Number.isSafeInteger(form.quantity) || form.quantity < 1) {
      return 'Please select at least one seat.'
    }

    const available = seatsLeft(eventId)

    if (available === 0) {
      return 'This event is full.'
    }

    if (form.quantity > available) {
      return `Only ${available} seats are available.`
    }

    // Create the registration.
    registrations.value.push({
      id: Math.max(0, ...registrations.value.map((r) => r.id)) + 1,

      userId: currentUser.value.id,
      eventId,

      fullName: form.fullName.trim(),
      studentId: form.studentId.trim(),
      department: form.department.trim(),
      phoneNumber: form.phoneNumber.trim(),
      quantity: form.quantity,

      status: 'active' as Registration['status'],
    })

    return 'Registration successful!'
  }

  function cancelRegistration(eventId: number): boolean {
    if (currentRole.value !== 'student' || !currentUser.value) return false

    const event = getEvent(eventId)

    if (!event || new Date(event.date).getTime() <= Date.now()) {
      return false
    }

    const registration = registrations.value.find(
      (r) =>
        r.eventId === eventId &&
        r.userId === currentUser.value!.id &&
        r.status === ('active' as Registration['status']),
    )

    if (!registration) return false

    registration.status = 'cancelled'
    return true
  }

  function changeRole(userId: number, role: Role) {
    if (currentRole.value !== 'admin') return

    const user = users.value.find((u) => u.id === userId)

    if (user && user.id !== currentUserId.value) {
      user.role = role
    }
  }

  function canManageEvent(event: ClubEvent): boolean {
    return (
      currentRole.value === 'admin' ||
      (currentRole.value === 'organizer' && event.organizerId === currentUser.value?.id)
    )
  }

  function createEvent(data: Omit<ClubEvent, 'id'>) {
    if (!currentUser.value || !['organizer', 'admin'].includes(currentRole.value ?? '')) {
      return
    }

    const now = new Date().toISOString()

    events.value.push({
      ...data,
      id: Math.max(0, ...events.value.map((e) => e.id)) + 1,
      organizerId: currentUser.value.id,
      status: 'published',
      createdAt: now,
      updatedAt: now,
    })
  }

  function updateEvent(id: number, changes: Partial<ClubEvent>) {
    const event = getEvent(id)

    if (!event || !canManageEvent(event)) return

    if (event.status === 'pending' && currentRole.value !== 'admin') return

    const reserved = event.capacity - seatsLeft(id)

    if (changes.capacity !== undefined && changes.capacity < reserved) return

    const editableChanges = { ...changes }

    delete editableChanges.id
    delete editableChanges.organizerId
    delete editableChanges.createdAt
    delete editableChanges.status

    Object.assign(event, editableChanges, {
      updatedAt: new Date().toISOString(),
    })
  }

  function submitForApproval(id: number): string {
    const event = getEvent(id)

    if (!event || !canManageEvent(event)) return 'Permission denied.'

    if (!['draft', 'rejected'].includes(event.status)) return 'This event cannot be submitted.'

    if (
      !event.title.trim() ||
      !event.description.trim() ||
      !event.location.trim() ||
      event.capacity < 1 ||
      new Date(event.date).getTime() <= Date.now()
    ) {
      return 'Complete all required event information first.'
    }

    event.status = 'pending'
    event.updatedAt = new Date().toISOString()

    return 'Event submitted for admin approval.'
  }

  function reviewEvent(id: number, decision: 'published' | 'rejected') {
    if (currentRole.value !== 'admin') return

    const event = getEvent(id)

    if (!event || event.status !== 'pending') return

    event.status = decision
    event.updatedAt = new Date().toISOString()
  }

  function cancelEvent(id: number) {
    const event = getEvent(id)

    if (!event || !canManageEvent(event)) return

    event.status = 'cancelled'
    event.updatedAt = new Date().toISOString()
  }

  // ---------------- LOCAL STORAGE ----------------

  watch(
    users,
    (value) => {
      localStorage.setItem('users', JSON.stringify(value))
    },
    { deep: true },
  )

  watch(
    events,
    (value) => {
      localStorage.setItem('events', JSON.stringify(value))
    },
    { deep: true },
  )

  watch(
    registrations,
    (value) => {
      localStorage.setItem('registrations', JSON.stringify(value))
    },
    { deep: true },
  )

  watch(
    credentials,
    (value) => {
      localStorage.setItem('demoCredentials', JSON.stringify(value))
    },
    { deep: true },
  )

  watch(currentUserId, (id) => {
    if (id === null) {
      sessionStorage.removeItem('currentUserId')
    } else {
      sessionStorage.setItem('currentUserId', String(id))
    }
  })

  return {
    // Existing data
    users,
    clubs,
    events,
    registrations,
    currentUser,
    currentRole,
    isAuthenticated,
    homeRoute,

    // Authentication
    login,
    signUp,
    updateProfile,
    changePassword,
    logout,

    // Event information
    publishedEvents,
    getClub,
    getEvent,
    getAttendees,
    seatsLeft,
    isRegistered,
    register,
    cancelRegistration,

    // Event management
    createEvent,
    updateEvent,
    changeRole,

    // New organizer properties
    myEvents,
    myRegistrationRecords,
    totalRegisteredStudents,
    totalReservedSeats,
    upcomingEventCount,
    pendingEventCount,

    // New organizer and admin functions
    canManageEvent,
    submitForApproval,
    reviewEvent,
    cancelEvent,
    
  }
})
