export interface Board {
  id: string
  name: string
  createdAt?: Date
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
