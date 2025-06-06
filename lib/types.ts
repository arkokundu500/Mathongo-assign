export type Subject = "Physics" | "Chemistry" | "Mathematics"

export type Status = "Not Started" | "In Progress" | "Completed"

export type Difficulty = "Easy" | "Medium" | "Hard"

export interface YearWiseQuestionCount {
  [year: string]: number
}

export interface Chapter {
  id: string
  subject: Subject
  chapter: string
  class: string
  unit: string
  yearWiseQuestionCount: YearWiseQuestionCount
  questionSolved: number
  totalQuestions: number
  status: Status
  isWeakChapter: boolean
  difficulty: Difficulty
  estimatedTime: number // in minutes
  lastStudied?: string // ISO date string
  accuracy?: number // percentage
  tags: string[]
  description: string
  prerequisites: string[]
  relatedChapters: string[]
}

export interface SubjectStats {
  totalChapters: number
  completedChapters: number
  inProgressChapters: number
  notStartedChapters: number
  weakChapters: number
  totalQuestions: number
  solvedQuestions: number
  averageAccuracy: number
  totalTimeSpent: number
}

export interface FilterOptions {
  subjects: Subject[]
  classes: string[]
  units: string[]
  statuses: Status[]
  difficulties: Difficulty[]
  showWeakOnly: boolean
  showNotStartedOnly: boolean
  minAccuracy?: number
  maxAccuracy?: number
}

export interface SortOption {
  field: "chapter" | "difficulty" | "accuracy" | "lastStudied" | "totalQuestions" | "progress"
  direction: "asc" | "desc"
}
