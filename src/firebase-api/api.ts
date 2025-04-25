import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  query,
  where,
  setDoc,
  limit,
  orderBy,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth'
import { db } from '../firebase'
import type { Board, Column, Card } from './api-interfaces'
import { auth } from '@/firebase'

// Board APIs
export async function getUserBoard(): Promise<Board> {
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated')

  const q = query(collection(db, 'boards'), where('userId', '==', user.uid))
  const snapshot = await getDocs(q)

  // TODO: This assumes that a user can only have one board. If you want to support multiple boards, you need to adjust this logic.
  const docSnap = snapshot.docs[0] // Get the first board of the user aka the main board

  if (!docSnap) throw new Error('No board found for user')

  return { id: docSnap.id, ...(docSnap.data() as Omit<Board, 'id'>) }
}

export async function createUserBoard(boardId: string, boardData: Board) {
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated')

  const boardRef = doc(db, 'boards', boardId)
  const boardDataWithUserId = {
    ...boardData,
    userId: user.uid,
  }
  await setDoc(boardRef, boardDataWithUserId)
}

// Column APIs
export async function getColumns(boardId?: string): Promise<Column[]> {
  const board = boardId ? { id: boardId } : await getUserBoard()
  const ref = collection(db, 'boards', board.id, 'columns')
  const snapshot = await getDocs(ref)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Column, 'id'>),
  }))
}

export async function createColumn(title: string, boardId?: string, order?: number) {
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated')

  // Get board either by param or default
  const board = boardId
    ? await getDoc(doc(db, 'boards', boardId)).then((doc) => doc.data()) // Corrected here, no need for 'order' in path
    : await getUserBoard()

  if (!board || !board.id) {
    throw new Error('Board not found')
  }

  console.log('🧩 Using Board ID:', board.id)

  if (board.userId !== user.uid) {
    throw new Error('User is not authorized to create a column in this board')
  }

  const ref = collection(db, 'boards', board.id, 'columns')
  const q = query(ref, orderBy('order', 'desc'), limit(1))
  const snapshot = await getDocs(q)

  let newOrder = 1
  if (!snapshot.empty) {
    const lastColumn = snapshot.docs[0].data()
    newOrder = (lastColumn.order ?? 0) + 1 // Default order is incremented based on the last column
  }

  // If order is provided, use it instead of the calculated one
  if (order !== undefined) {
    newOrder = order
  }

  const docRef = await addDoc(ref, {
    title,
    order: newOrder,
    boardId: board.id,
    userId: user.uid,
    createdAt: serverTimestamp(),
  })

  console.log(`✅ Column "${title}" created with order ${newOrder}`)
  return docRef
}

// Card APIs
export async function createCard(
  content: string,
  order: number,
  columnId: string,
  boardId?: string,
) {
  const board = boardId ? { id: boardId } : await getUserBoard()
  const ref = collection(db, 'boards', board.id, 'columns', columnId, 'cards')

  try {
    // Create the card document in Firestore
    const docRef = await addDoc(ref, { content, order, columnId }) // Ensure columnId is saved along with the card
    console.log(`✅ Created card with ID: ${docRef.id} in column: ${columnId}`)

    // Fetch the created card to return its data along with its ID
    // const createdCard = await getDoc(docRef)
    return { id: docRef.id, content, order, columnId } // Return card data with ID
  } catch (error) {
    console.error('❌ Error creating card:', error)
    throw error
  }
}

export async function getCards(columnId: string, boardId?: string): Promise<Card[]> {
  const board = boardId ? { id: boardId } : await getUserBoard()
  const ref = collection(db, 'boards', board.id, 'columns', columnId, 'cards')
  const q = query(ref, orderBy('order', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    columnId,
    ...(doc.data() as Omit<Card, 'id'>),
  }))
}

export async function updateCard(
  boardId: string,
  oldColumnId: string,
  newColumnId: string,
  order: number,
  cardId: string,
  updatedCardData: Partial<Card> = {},
) {
  const oldCardRef = doc(db, 'boards', boardId, 'columns', oldColumnId, 'cards', cardId)
  const newCardRef = doc(db, 'boards', boardId, 'columns', newColumnId, 'cards', cardId)

  console.log(
    `Moving card from: boards/${boardId}/columns/${oldColumnId}/cards/${cardId}\n` +
      `            to: boards/${boardId}/columns/${newColumnId}/cards/${cardId}`,
  )

  // Check if the card exists in the old column before updating
  const oldCardSnap = await getDoc(oldCardRef)
  if (!oldCardSnap.exists()) {
    console.error('❌ Card not found in old column:', oldCardRef.path)
    throw new Error('Card not found in old column')
  }

  console.log(`✅ Card found in old column: ${oldCardSnap.id}`)

  // Proceed with the update or move
  await runTransaction(db, async (transaction) => {
    const originalData = oldCardSnap.data()
    const newCardData = {
      ...originalData,
      ...updatedCardData,
      columnId: newColumnId,
      order,
    }

    transaction.set(newCardRef, newCardData)
    // Delete old ref when the card is moved to a different column
    if (oldColumnId !== newColumnId) {
      transaction.delete(oldCardRef)
    }
  })

  console.log(`✅🔄 Reorder and Moved card "${cardId}" from "${oldColumnId}" to "${newColumnId}"`)
}

// User APIs
export async function createUser(email: string, password: string): Promise<UserCredential> {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com)$/i
    if (!emailRegex.test(email)) {
      throw new Error('Email must be valid and end with .com')
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
      throw new Error('Password must be at least 8 characters, including letters and numbers')
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    const userRef = doc(db, 'users', user.uid)
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      createdAt: serverTimestamp(),
    })

    return userCredential
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      console.log('❌ Email already in use')
    } else if (err.code === 'auth/invalid-email') {
      console.log('❌ Invalid email format')
    } else if (err.code === 'auth/weak-password') {
      console.log('❌ Weak password')
    } else {
      console.log('❌ Unknown error:', err.message || err)
    }
    throw err
  }
}
export async function loginUser(email: string, password: string): Promise<UserCredential> {
  return await signInWithEmailAndPassword(auth, email, password)
}

export async function logoutUser() {
  await auth.signOut()
}

export async function getCurrentUser() {
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated')

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
  }
}
