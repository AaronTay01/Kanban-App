<!-- Card.vue -->
<template>
  <div class="bg-grey p-4 rounded-lg shadow-md">
    <h4 class="text-sm font-medium">{{ card.title }}</h4>
  </div>
</template>

<script>
export default {
  props: {
    card: Object,
  },
}
</script>

<style scoped>
/* No extra styles needed as we're using Tailwind */
</style>
