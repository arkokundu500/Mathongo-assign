export type Subject = "Physics" | "Chemistry" | "Mathematics"

export type Status = "Not Started" | "In Progress" | "Completed"

export interface YearWiseQuestionCount {
  [year: string]: number
}

export interface Chapter {
  subject: Subject
  chapter: string
  class: string
  unit: string
  yearWiseQuestionCount: YearWiseQuestionCount
  questionSolved: number
  status: Status
  isWeakChapter: boolean
}
