import { getBoard, createBoard, getColumns, createColumn, createCard } from '../firebase-api/api'
import type { Column } from '../firebase-api/api-interfaces'

async function testBoardAndSetup() {
  let board = await getBoard()

  if (!board) {
    throw new Error('❌Board not found!')
  } else {
    console.log(`✅ Found board: ${board.name} (ID: ${board.id})`)
  }

  const requiredColumns = ['To Do', 'Progress', 'Done']
  const existingColumns = await getColumns(board.id)
  const existingTitles = existingColumns.map((col: Column) => col.title)

  for (const [index, title] of requiredColumns.entries()) {
    if (!existingTitles.includes(title)) {
      throw new Error(`❌Column ${title}  not found!`)
    } else {
      console.log(`✅ Column "${title}" already exists`)
    }
  }

  return board
}

async function createCardsInExistingColumns(boardId: string) {
  const columns = await getColumns(boardId)
  const columnMap = Object.fromEntries(columns.map((col) => [col.title, col]))

  const cardsToCreate = [
    { title: 'Set up project structure', column: 'To Do' },
    { title: 'Write board API tests', column: 'Progress' },
    { title: 'Review pull requests', column: 'Done' },
  ]

  for (const [index, { title, column }] of cardsToCreate.entries()) {
    const col = columnMap[column]
    if (!col) {
      console.warn(`⚠️ Column "${column}" not found, skipping card "${title}"`)
      continue
    }

    const cardRef = await createCard(title, index + 1, col.id, boardId)
    console.log(`✅ Created card "${title}" in column "${column}" (Card ID: ${cardRef.id})`)
  }
}

async function createColumnAndCard(boardId: string) {
  const newColumn = await createColumn('Review', boardId)
  console.log(`✅ Created new column "Review" (ID: ${newColumn.id})`)

  const cardRef = await createCard('Write documentation', 1, newColumn.id, boardId)
  console.log(`✅ Created card "Write documentation" in "Review" (Card ID: ${cardRef.id})`)
}

async function runAllTests() {
  const board = await testBoardAndSetup()
  await createCardsInExistingColumns(board.id)
  await createColumnAndCard(board.id)
}

runAllTests()
  .catch(console.error)
  .finally(() => console.log('🏁 All tests completed'))
