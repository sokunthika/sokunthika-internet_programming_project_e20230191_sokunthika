import type { ClubEvent } from '@/types'

// Simulate a small delay from a real API
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export const eventService = {
  // Get all events
  async getAllEvents(): Promise<ClubEvent[]> {
    await delay(300)

    return []
  },

  // Get one event by ID
  async getEventById(id: number): Promise<ClubEvent | null> {
    await delay(300)

    void id
    return null
  },

  // Get published events
  async getPublishedEvents(): Promise<ClubEvent[]> {
    await delay(300)

    return []
  },
}
