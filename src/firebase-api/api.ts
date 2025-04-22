import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  where,
  setDoc,
  limit,
  orderBy,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Board, Column, Card } from './api-interfaces'

// Board APIs
export async function getBoard(): Promise<Board> {
  const snapshot = await getDocs(collection(db, 'boards'))
  const docSnap = snapshot.docs[0]
  return { id: docSnap.id, ...(docSnap.data() as Omit<Board, 'id'>) }
}

export async function createBoard(name: string) {
  const ref = await addDoc(collection(db, 'boards'), { name })
  return ref.id
}

// Column APIs
export async function getColumns(boardId?: string): Promise<Column[]> {
  if (!boardId) {
    const board = await getBoard()
    if (!board) return []
    boardId = board.id
  }
  const ref = collection(db, 'boards', boardId, 'columns')
  const snapshot = await getDocs(ref)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Column, 'id'>),
  }))
}

export async function createColumn(title: string, boardId?: string) {
  if (!boardId) {
    const board = await getBoard()
    if (!board) throw new Error('Board not found')
    boardId = board.id
  }

  // Get the columns from the board, order by 'order' in descending order to find the largest order
  const ref = collection(db, 'boards', boardId, 'columns')
  const q = query(ref, orderBy('order', 'desc'), limit(1))
  const snapshot = await getDocs(q)

  let newOrder = 1 // Default to 1 if no columns exist
  if (!snapshot.empty) {
    const lastColumn = snapshot.docs[0].data()
    newOrder = lastColumn.order + 1 // Increment the largest existing order
  }

  // Create the new column with the incremented order
  const docRef = await addDoc(ref, { title, order: newOrder })

  console.log(`✅ Created column "${title}" with order ${newOrder}`)
  return docRef // Return the document reference, which includes the ID
}

// Card APIs
export async function createCard(
  content: string,
  order: number,
  columnId: string,
  boardId?: string,
) {
  if (!boardId) {
    const board = await getBoard()
    if (!board) throw new Error('Board not found')
    boardId = board.id
  }
  const ref = collection(db, 'boards', boardId, 'columns', columnId, 'cards')
  return await addDoc(ref, { content, order })
}
