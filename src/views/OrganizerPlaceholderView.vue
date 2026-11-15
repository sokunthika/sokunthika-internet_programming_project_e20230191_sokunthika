
<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <section class="organizer-panel">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>

    <div class="module-notice">
      <strong>Module not implemented yet</strong>
      <p>
        This section is reserved for the next
        development stage.
      </p>
    </div>
  </section>
</template>
