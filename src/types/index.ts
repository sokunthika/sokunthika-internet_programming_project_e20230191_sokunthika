export type Role = 'student' | 'organizer' | 'admin'


export type EventStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'completed' | 'cancelled'

export type RegistrationStatus = 'active' | 'pending' | 'confirmed' | 'cancelled'

export interface Club {
  id: number
  name: string
  department: string
}

export interface User {
  id: number
  name: string
  email: string
  role: Role
}

export interface ClubEvent {
  id: number
  title: string
  description: string
  category: string
  date: string
  location: string
  capacity: number
  clubId: number
  status: EventStatus
  image?: string
  organizerId: number
  createdAt: string
  updatedAt: string
  registrationDeadline?: string
  contactEmail?: string
  requirements?: string
  meetingLink?: string
  endTime?: string
  admission?: string
  activities?: string
  targetAudience?: string
  additionalImage?: string
}


export interface Registration {
  id: number
  userId: number
  eventId: number

  fullName: string
  studentId: string
  department: string
  phoneNumber: string
  quantity: number
  status: RegistrationStatus
}
