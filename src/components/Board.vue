<!-- Board.vue -->
<template>
  <div class="flex gap-4 p-4">
    <Column v-for="column in columns" :key="column.id" :column="column" @add-card="addCard" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import Column from './Column.vue'
import { getBoard } from '../firebase-api/api'

export default {
  components: {
    Column,
  },
  setup() {
    const columns = ref([])

    onMounted(async () => {
      const board = await getBoard()
      if (board) {
        // Fetch the columns for the board
        columns.value = [
          { id: '1', title: 'To Do', order: 1 },
          { id: '2', title: 'Progress', order: 2 },
          { id: '3', title: 'Done', order: 3 },
        ]
      }
    })

    const addCard = (columnId) => {
      console.log(`Add card to column with ID: ${columnId}`)
    }

    return {
      columns,
      addCard,
    }
  },
}
</script>

<style scoped>
/* No extra styles needed as we're using Tailwind */
</style>
