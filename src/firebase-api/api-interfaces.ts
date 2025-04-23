export interface Board {
  id: string
  name: string
  userId: string
  createdAt: Date
}

export interface Column {
  id: string
  title: string
  order: number
}

export interface Card {
  id: string
  content: string
  order: number
}

export interface User {
  id: string
  email: string
  password: string
  createdAt: Date
  boardIds: string[]
}
