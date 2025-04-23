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
} from 'firebase/firestore'
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth'
import { db } from '../firebase'
import type { Board, Column, Card } from './api-interfaces'

// Board APIs
export async function getBoard(): Promise<Board> {
  const auth = getAuth()
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated')

  const q = query(collection(db, 'boards'), where('userId', '==', user.uid))
  const snapshot = await getDocs(q)

  // TODO: This assumes that a user can only have one board. If you want to support multiple boards, you need to adjust this logic.
  const docSnap = snapshot.docs[0] // Get the first board for the user which is main-board

  if (!docSnap) throw new Error('No board found for user')

  return { id: docSnap.id, ...(docSnap.data() as Omit<Board, 'id'>) }
}

export async function createUserBoard(boardId: string, boardData: Board) {
  const auth = getAuth()
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
  const board = boardId ? { id: boardId } : await getBoard()
  const ref = collection(db, 'boards', board.id, 'columns')
  const snapshot = await getDocs(ref)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Column, 'id'>),
  }))
}

export async function createColumn(title: string, boardId?: string) {
  const auth = getAuth()
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated')

  // Get board either by param or default
  const board = boardId
    ? await getDoc(doc(db, 'boards', boardId)).then((doc) => doc.data())
    : await getBoard()

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
    newOrder = (lastColumn.order ?? 0) + 1
  }

  const docRef = await addDoc(ref, {
    title,
    order: newOrder,
    boardId: board.id,
    userId: user.uid,
    createdAt: new Date().toISOString(),
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
  const board = boardId ? { id: boardId } : await getBoard()
  const ref = collection(db, 'boards', board.id, 'columns', columnId, 'cards')
  return await addDoc(ref, { content, order })
}

export async function updateCard(
  boardId: string,
  oldColumnId: string,
  newColumnId: string,
  cardId: string,
  updatedCardData: Partial<Card>,
) {
  const oldCardRef = doc(db, 'boards', boardId, 'columns', oldColumnId, 'cards', cardId)
  const newCardRef = doc(collection(db, 'boards', boardId, 'columns', newColumnId, 'cards'))

  const cardSnap = await getDoc(oldCardRef)
  if (!cardSnap.exists()) throw new Error('Card not found')

  await setDoc(newCardRef, { ...cardSnap.data(), ...updatedCardData })
  await updateDoc(newCardRef, { columnId: newColumnId })
}

// User APIs
export async function createUser(email: string, password: string): Promise<UserCredential> {
  const auth = getAuth()

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    const userRef = doc(db, 'users', user.uid)
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      createdAt: new Date().toISOString(),
    })

    return userCredential
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      console.log('❌ Email already in use')
    }
    throw err
  }
}
export async function loginUser(email: string, password: string): Promise<UserCredential> {
  const auth = getAuth()
  return await signInWithEmailAndPassword(auth, email, password)
}

export async function logoutUser() {
  const auth = getAuth()
  await auth.signOut()
}

export async function getCurrentUser() {
  const auth = getAuth()
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated')

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
  }
}
