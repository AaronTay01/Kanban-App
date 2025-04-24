<template>
  <div class="rounded-lg bg-white shadow p-4 mb-2 cursor-move min-h-[100px]">
    <p class="text-sm text-gray-900">{{ card.content }}</p>
  </div>
</template>

<script setup lang="ts">
import type { Card } from '@/firebase-api/api-interfaces'

defineProps<{ card: Card }>()
</script>
