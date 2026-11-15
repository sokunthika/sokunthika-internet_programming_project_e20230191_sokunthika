import type { User, Club, Registration } from '@/types'

export const users: User[] = [
  {
    id: 1,
    name: 'Student Demo',
    email: 'student@university.edu',
    role: 'student',
  },
  {
    id: 2,
    name: 'Organizer Demo',
    email: 'organizer@university.edu',
    role: 'organizer',
  },
  {
    id: 3,
    name: 'Admin Demo',
    email: 'admin@university.edu',
    role: 'admin',
  },
]

export const clubs: Club[] = [
  {
    id: 1,
    name: 'Robotics Club',
    department: 'MechanicalEngineering',
  },
  {
    id: 2,
    name: 'Computer Science Club',
    department: 'Computer Science',
  },
  {
    id: 3,
    name: 'Chemical and Food Engineering Club',
    department: 'Chemical and Food Engineering',
  },
  {
    id: 4,
    name: 'Electrical and Automation Club',
    department: 'Electrical and Automation Engineering',
  },
  {
    id: 5,
    name: 'Telecommunication and Networking Club',
    department: 'Telecommunication and Networking Engineering',
  },
  {
    id: 6,
    name: 'Architect, Civil and Transportation Engineering Club',
    department: 'Architect, Civil and Transportation Engineering',
  },
]

export const registrations: Registration[] = []
