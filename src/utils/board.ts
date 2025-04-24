import { createColumn, createUserBoard, getUserBoard } from '../firebase-api/api'
import type { UserCredential } from 'firebase/auth'

async function createBoardForUser(userCredential: UserCredential, boardName = 'Main Board') {
  try {
    // Create board
    console.log('Provider Id', userCredential.providerId)
    console.log('User Id', userCredential.user.uid)
    const boardId = `board-${userCredential.user.uid}` // Unique ID for the board
    const boardData = {
      id: boardId,
      name: boardName,
      userId: userCredential.user.uid,
      createdAt: new Date(),
    }

    await createUserBoard(boardId, boardData)
    console.log(`✅ Created board: ${boardData.name} (ID: ${boardId})`)
    console.log(`✅ Linked board to user`)
  } catch (error) {
    console.error('❌ Error during board creation:', error)
  }

  // Create inital columns
  console.log('🔄 Creating initial columns...')
  try {
    let board = await getUserBoard()
    if (!board) {
      throw new Error('❌ Board "Main Board" not found!')
    } else {
      console.log(`✅ Found board: ${board.name} (ID: ${board.id})`)
      const initalColumns: { title: string; order: number }[] = [
        { title: 'To Do', order: 0 },
        { title: 'Progress', order: 1 },
        { title: 'Done', order: 2 },
      ]
      for (const { title } of initalColumns) {
        await createColumn(title, board.id)
        console.log(`✅ Created column "${title}"`)
      }
    }
  } catch (error) {
    console.error('❌ Error during Column creation:', error)
  }
}
export { createBoardForUser }
