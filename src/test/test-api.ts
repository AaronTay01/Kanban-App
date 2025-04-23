import { getBoard, createUserBoard, getColumns, createColumn, loginUser } from '../firebase-api/api'
import type { Column } from '../firebase-api/api-interfaces'

async function setupMainBoardStructure() {
  let board = await getBoard()

  if (!board) {
    console.log('❌ Board "Main Board" not found! Creating it...')
    const boardId = await createUserBoard('Main Board', {
      id: 'main-board-id',
      name: 'Main Board',
      userId: 'placeholder-user-id',
      createdAt: new Date(),
    })
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

  for (const { title, order } of requiredColumns) {
    const existingColumn = existingColumns.find((col: Column) => col.title === title)

    if (!existingColumn) {
      await createColumn(title, board.id)
      console.log(`✅ Created column "${title}" (order: ${order})`)
    } else if (existingColumn.order !== order) {
      console.log(
        `❌ Column "${title}" exists but order is incorrect. Expected order: ${order}, Found: ${existingColumn.order}`,
      )
    } else {
      console.log(`✅ Column "${title}" already exists, Order ${order} Correct`)
    }
  }
}

async function test() {
  try {
    console.log('🔐 Logging in with test user...')
    await loginUser('testuser@gmail.com', 'testuser123')
    console.log('✅ Login successful')

    await setupMainBoardStructure()
  } catch (err) {
    console.error('❌ Error during test:', err)
  } finally {
    console.log('🏁 Test completed')
  }
}

test()
