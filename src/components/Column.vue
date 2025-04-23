<template>
  <div class="bg-gray-100 p-4 rounded-xl shadow-md">
    <h2 class="text-lg font-semibold mb-4">{{ column.title }}</h2>
    <draggable
      v-model="column.cards"
      :group="{ name: 'cards', pull: true, put: true }"
      item-key="id"
    >
      <template #item="{ element }">
        <Card :card="element" />
      </template>
    </draggable>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import draggable from 'vuedraggable'
import Card from './Card.vue'

defineProps({
  column: Object,
})
</script>
