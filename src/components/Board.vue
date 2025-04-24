<template>
  <div class="flex gap-4 overflow-x-auto">
    <KanbanColumn
      v-for="column in columns"
      :key="column.id"
      :column="column"
      :boardId="boardId"
      :allCards="allCards[column.id] || []"
      @card-added="handleCardAdded"
      @card-updated="handleCardUpdated"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import KanbanColumn from '@/components/Column.vue'
import { getColumns, getCards } from '@/firebase-api/api'
import { Board, Column, Card } from '@/firebase-api/api-interfaces'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase'
import router from '@/router'

const props = defineProps<{ board: Board }>()
const board = ref<Board>(props.board)
const columns = ref<Column[]>([])

const boardId = ref<string>(board.value.id) // Store the board ID
// Store cards by column ID
const allCards = ref<{ [columnId: string]: Card[] }>({})

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('✅ Logged in user ID:', user.uid)
    loadColumnsAndCards()
  } else {
    console.warn('❌ No user logged in. Redirecting...')
    router.push('/login')
  }
})

// Load columns and cards for the board
const loadColumnsAndCards = async () => {
  try {
    // Load columns for the board
    const retrievedColumns = await getColumns(board.value.id)
    columns.value = retrievedColumns.sort((a, b) => a.order - b.order)

    // Load cards for each column
    for (const column of columns.value) {
      const cards = await getCards(column.id, board.value.id)
      allCards.value[column.id] = cards
    }
    console.log('Columns and cards loaded:', columns.value, allCards.value)
  } catch (error) {
    console.error('Error loading columns or cards:', error)
  }
}

// Handle card addition
const handleCardAdded = ({ card }: { card: Card }) => {
  if (card.columnId && !allCards.value[card.columnId]) {
    allCards.value[card.columnId] = []
  }
  if (card.columnId) {
    allCards.value[card.columnId].push(card)
  } else {
    console.error('Card columnId is undefined:', card)
  }
}

// Handle card update (after move or reorder)
const handleCardUpdated = async ({
  card,
  newIndex,
  oldColumnId,
  newColumnId,
}: {
  card: Card
  newIndex: number
  oldColumnId: string
  newColumnId: string
}) => {
  // Update local state first
  if (oldColumnId !== newColumnId) {
    // Card moved between columns
    const oldColumnCards = allCards.value[oldColumnId]
    const newColumnCards = allCards.value[newColumnId] || []

    // Remove card from old column
    const oldIndex = oldColumnCards.findIndex((c) => c.id === card.id)
    oldColumnCards.splice(oldIndex, 1)

    // Add card to new column
    newColumnCards.splice(newIndex, 0, card)

    // Update cards state
    allCards.value[oldColumnId] = oldColumnCards
    allCards.value[newColumnId] = newColumnCards
  } else {
    // Reorder within the same column
    const columnCards = allCards.value[oldColumnId]
    const oldIndex = columnCards.findIndex((c) => c.id === card.id)
    columnCards.splice(oldIndex, 1)
    columnCards.splice(newIndex, 0, card)

    // Update column state
    allCards.value[oldColumnId] = columnCards
  }
}
</script>
