<template>
  <div class="w-80 bg-gray-100 p-4 rounded-lg border-2 border-solid border-gray-400">
    <h2 class="font-semibold text-lg mb-4">{{ column.title }}</h2>

    <Draggable :list="cards" group="cards" item-key="id" @add="onCardDrop" @update="onCardReorder">
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
import { ref, computed } from 'vue'
import Draggable from 'vuedraggable'
import KanbanCard from '@/components/Card.vue'
import { Column, Card } from '@/firebase-api/api-interfaces'
import { createCard, getCards, updateCard } from '@/firebase-api/api'

const props = defineProps<{
  column: Column
  boardId: string
  allCards: Card[]
}>()

// Filter cards for this column
const cards = computed(() => {
  const filteredCards = props.allCards.filter((card) => card.columnId === props.column.id)
  return filteredCards
})

const emit = defineEmits<{
  (e: 'card-added', payload: { card: Card }): void
  (
    e: 'card-updated',
    payload: {
      card: Card
      newIndex: number
      oldColumnId: string
      newColumnId: string
    },
  ): void
}>()

const showModal = ref(false)
const newTaskContent = ref('')

const handleCreateCard = async () => {
  if (!newTaskContent.value.trim()) return

  await createUserCard(newTaskContent.value, props.column.id, props.boardId)
  newTaskContent.value = ''
  showModal.value = false
}

const onCardDrop = async (event: any) => {
  const movedCard = { ...event.item.__draggable_context.element }
  const newColumnId = props.column.id
  const oldColumnId = movedCard.columnId
  const newIndex = event.newIndex

  try {
    await updateCard(props.boardId, oldColumnId, newColumnId, newIndex, movedCard.id, {
      columnId: newColumnId,
      order: newIndex,
    })

    emit('card-updated', {
      card: movedCard,
      newIndex,
      oldColumnId,
      newColumnId,
    })
  } catch (error) {
    console.error('❌ Failed to move card:', error)
  }
}

const onCardReorder = async (event: any) => {
  const movedCard = { ...event.item.__draggable_context.element }
  const oldIndex = event.oldIndex
  const newIndex = event.newIndex

  if (oldIndex === newIndex) return

  try {
    await updateCard(
      props.boardId,
      movedCard.columnId,
      movedCard.columnId,
      newIndex,
      movedCard.id,
      {
        order: newIndex,
      },
    )

    movedCard.order = newIndex

    emit('card-updated', {
      card: movedCard,
      newIndex,
      oldColumnId: movedCard.columnId,
      newColumnId: movedCard.columnId,
    })
  } catch (error) {
    console.error('❌ Failed to reorder card:', error)
  }
}

const createUserCard = async (content: string, columnId: string, boardId?: string) => {
  if (!content.trim()) return

  try {
    const userCards = await getCards(columnId, boardId)
    const order = userCards.length > 0 ? userCards[userCards.length - 1].order + 1 : 0

    const newCard = await createCard(content, order, columnId, boardId)

    emit('card-added', {
      card: {
        id: newCard.id,
        content,
        order,
        columnId,
      },
    })
  } catch (error) {
    console.error('❌ Error during card creation:', error)
  }
}
</script>
