<template>
  <div class="w-80 bg-gray-100 p-4 rounded-lg border-2 border-solid border-gray-400">
    <h2 class="font-semibold text-lg mb-4">{{ column.title }}</h2>
    <Draggable
      v-model="cards"
      group="cards"
      item-key="id"
      @add="onCardUpdate"
      @update="onCardUpdate"
    >
      <template #item="{ element }: { element: Card }">
        <KanbanCard :card="element" />
      </template>
    </Draggable>

    <div class="mt-4">
      <button
        @click="showModal = true"
        class="w-full bg-gray-600/80 text-gray-600 p-2 rounded-lg border-2 border-dotted border-white hover:bg-gray-700/80 transition"
      >
        ＋ Add New Task
      </button>
    </div>
  </div>

  <transition name="fade">
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white text-black p-6 rounded-xl w-80 shadow-xl relative">
        <h2 class="text-lg font-bold mb-4">Create New Task</h2>
        <input
          v-model="newTaskContent"
          type="text"
          placeholder="Task name..."
          class="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none"
        />
        <div class="flex justify-end space-x-2">
          <button
            @click="showModal = false"
            class="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            @click="handleCreateCard"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Draggable from 'vuedraggable'
import KanbanCard from '@/components/Card.vue'
import { Column, Card } from '@/firebase-api/api-interfaces'
import { getCards, createCard, updateCard } from '@/firebase-api/api'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import router from '@/router'

const props = defineProps<{
  column: Column
  boardId: string
}>()

const emit = defineEmits<{
  (e: 'card-added', payload: { card: Card; newColumnId: string; newIndex: number }): void
  (e: 'card-reordered', payload: { columnId: string; newIndex: number; card: Card }): void
}>()

const cards = ref<Card[]>([])
const showModal = ref(false)
const newTaskContent = ref('')

const handleCreateCard = async () => {
  if (!newTaskContent.value.trim()) return

  console.log('🧩Creating card with content:', newTaskContent.value)
  await createUserCard(newTaskContent.value, props.column.id, props.boardId)
  newTaskContent.value = ''
  showModal.value = false
}

const onCardUpdate = async (event: any) => {
  const movedCard = event.item.__draggable_context.element
  const newColumnId = props.column.id
  const oldColumnId = movedCard.columnId
  const newOrder = event.newIndex
  const oldOrder = movedCard.order

  if (oldColumnId === newColumnId) {
    // 🔁 Only reordering within the same column
    if (oldOrder === newOrder) {
      console.log('🛑 No move needed: same column, same order')
      return
    }

    movedCard.order = newOrder

    // Recalculate and update all cards in order
    cards.value.forEach((card, index) => {
      card.order = index
    })

    await Promise.all(
      cards.value.map((card) =>
        updateCard(props.boardId, oldColumnId, oldColumnId, card.order, card.id, {
          order: card.order,
        }),
      ),
    )

    console.log('✅ Same-column reorder complete')
  } else {
    // 🔀 Card moved to a different column
    movedCard.columnId = newColumnId
    movedCard.order = newOrder

    // Update moved card (with new columnId and order)
    await updateCard(props.boardId, oldColumnId, newColumnId, newOrder, movedCard.id, {
      columnId: newColumnId,
      order: newOrder,
    })

    // Recalculate order of all cards in new column (cards.value should be new column's cards)
    cards.value.forEach((card, index) => {
      card.order = index
    })

    await Promise.all(
      cards.value
        .filter((card) => card.id !== movedCard.id)
        .map((card) =>
          updateCard(props.boardId, newColumnId, newColumnId, card.order, card.id, {
            order: card.order,
          }),
        ),
    )

    console.log('✅ Cross-column move complete')
  }

  // Emit to parent
  emit('card-reordered', {
    columnId: newColumnId,
    newIndex: newOrder,
    card: movedCard,
  })

  // Sort locally
  cards.value.sort((a, b) => a.order - b.order)
}

// Create A Card
const createUserCard = async (content: string, columnId: string, boardId?: string) => {
  if (!content.trim()) return

  try {
    // Fetch all cards in the given column to determine the order for the new card
    const userCards = await getCards(columnId, boardId)
    const order = userCards.length > 0 ? userCards[userCards.length - 1].order + 1 : 0
    console.log('🧩 New Card:', order)
    const newCard = await createCard(content, order, columnId, boardId)

    cards.value.push({
      id: newCard.id,
      content,
      order,
      columnId,
    })

    console.log('🧩 Card created:', cards.value)

    console.log(`✅ Created Card: ${newCard.id} in Column: ${columnId} (Board ID: ${boardId})`)
  } catch (error) {
    console.error('❌ Error during card creation:', error)
  }
}

// Load Cards
const loadCards = async () => {
  try {
    cards.value = await getCards(props.column.id, props.boardId)
    console.log('✅ Cards Loaded:', cards.value)
  } catch (error) {
    console.error('Error loading cards:', error)
  }
}

// Watch for authentication state
onMounted(() => {
  const auth = getAuth()
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await loadCards()
      watch(
        () => props.column.id,
        async () => {
          await loadCards()
        },
      )
    } else {
      console.warn('❌ No user logged in. Redirecting...')
      router.push('/login')
    }
  })
})
</script>
