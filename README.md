<<<<<<< HEAD
# internet_programming_project_e20230191_sokunthika
=======
## State Management — Pinia vs Component State

Our Club Event Management System uses **Pinia** for shared application state and Vue 3's `ref()` and `reactive()` for local component state.

### 1. State stored in Pinia

The Pinia store (`src/stores/events.ts`) manages data shared between multiple pages.

Examples:
- **Users and authentication:** Current logged-in user, user role, and login status.
- **Events:** Event information, event status, capacity, and organizer ownership.
- **Registrations:** Students registered for events and their reserved seats.
- **Clubs:** Information about university clubs.

We use Pinia because several components need access to the same data. For example, when an organizer creates an event, the event list and dashboard should update automatically.

### 2. State stored inside components

Local component state is used for information needed by only one page or component.

Examples:
- **LoginView.vue:** Email, password, error message, and loading indicator.
- **ManageEventsView.vue:** Event form inputs, editing event ID, search text, and selected status filter.
- **OrganizerRegistrationsView.vue:** Student search text and selected event filter.
- **OrganizerSettingsView.vue:** Profile form inputs and success/error messages.

We keep these values inside components because they are only needed for user interaction on that specific page.

### 3. Why separate these states?

Separating shared state and local state makes our application easier to maintain.

**Pinia** provides a central source of data for different pages, while **component state** handles temporary user inputs and interface behavior.

For example, when an organizer creates an event:

1. The organizer enters information into a local form using `reactive()`.
2. After validation, the component calls `store.createEvent()`.
3. Pinia updates the shared events list.
4. The organizer dashboard and My Events page can display the updated data.

This approach avoids unnecessary duplication and keeps the frontend organized.
>>>>>>> 3b31760 (M1 submission)
