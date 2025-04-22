import { getBoard, createBoard, getColumns, createColumn } from '../firebase-api/api'
import type { Column } from '../firebase-api/api-interfaces'

async function setupMainBoardStructure() {
  let board = await getBoard()

  if (!board) {
    console.log('❌ Board "Main Board" not found! Creating it...')
    // Create the board with a specific name
    const boardId = await createBoard('Main Board')
    console.log(`✅ Created board with ID: ${boardId}`)
    board = await getBoard()
  } else {
    console.log(`✅ Found board: ${board.name} (ID: ${board.id})`)
  }

  const requiredColumns: { title: string; order: number }[] = [
    { title: 'To Do', order: 1 },
    { title: 'Progress', order: 2 },
    { title: 'Done', order: 3 },
  ]

  const existingColumns = await getColumns(board.id)
  const existingTitles = existingColumns.map((col: Column) => col.title)

  for (const { title, order } of requiredColumns) {
    const existingColumn = existingColumns.find((col: Column) => col.title === title)

    if (!existingColumn) {
      // Column doesn't exist, create it
      await createColumn(title, board.id)
      console.log(`✅ Created column "${title}" (order: ${order})`)
    } else {
      // Column exists, check if the order matches
      if (existingColumn.order !== order) {
        console.log(
          `❌ Column "${title}" exists but order is incorrect. Expected order: ${order}, Found order: ${existingColumn.order}`,
        )
      } else {
        console.log(`✅ Column "${title}" already exists, Order ${order} Correct`)
      }
    }
  }
}

setupMainBoardStructure()
  .catch((err) => console.error('❌ Error during initial setup:', err))
  .finally(() => console.log('🏁 Setup completed'))
