<!-- Board.vue -->
<template>
  <div class="flex gap-4 overflow-x-auto">
    <KanbanColumn v-for="column in columns" :key="column.id" :column="column" :boardId="board.id" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import KanbanColumn from '@/components/Column.vue'
import { getColumns } from '@/firebase-api/api'
import { Board, Column } from '@/firebase-api/api-interfaces'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase'
import router from '@/router'

const props = defineProps<{ board: Board }>()
const board = ref<Board>(props.board)
const columns = ref<Column[]>([])

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('✅ Logged in user ID:', user.uid)
    try {
      loadColumns()
    } catch (error) {
      console.error('Error loading columns:', error)
    }
  } else {
    console.warn('❌ No user logged in. Redirecting...')
    router.push('/login')
  }
})

async function loadColumns() {
  const retrievedColumns = await getColumns(props.board.id)
  columns.value = retrievedColumns.sort((a, b) => a.order - b.order)
}
</script>
