"use client"

import { create } from "zustand"
import type { Chapter, Subject } from "./types"

interface ChapterState {
  chapters: Chapter[]
  filteredChapters: Chapter[]
  selectedSubject: Subject
  selectedClasses: string[]
  selectedUnits: string[]
  showNotStarted: boolean
  showWeakChapters: boolean
  sortAscending: boolean

  setChapters: (chapters: Chapter[]) => void
  setSelectedSubject: (subject: Subject) => void
  toggleClass: (className: string) => void
  toggleUnit: (unit: string) => void
  setShowNotStarted: (show: boolean) => void
  setShowWeakChapters: (show: boolean) => void
  toggleSort: () => void
  applyFilters: () => void
}

export const useChapterStore = create<ChapterState>((set, get) => ({
  chapters: [],
  filteredChapters: [],
  selectedSubject: "Physics",
  selectedClasses: [],
  selectedUnits: [],
  showNotStarted: false,
  showWeakChapters: false,
  sortAscending: true,

  setChapters: (chapters) => {
    set({ chapters })
    get().applyFilters()
  },

  setSelectedSubject: (subject) => {
    set({
      selectedSubject: subject,
      selectedClasses: [],
      selectedUnits: [],
      showNotStarted: false,
      showWeakChapters: false,
    })
    get().applyFilters()
  },

  toggleClass: (className) => {
    set((state) => ({
      selectedClasses: state.selectedClasses.includes(className)
        ? state.selectedClasses.filter((c) => c !== className)
        : [...state.selectedClasses, className],
    }))
    get().applyFilters()
  },

  toggleUnit: (unit) => {
    set((state) => ({
      selectedUnits: state.selectedUnits.includes(unit)
        ? state.selectedUnits.filter((u) => u !== unit)
        : [...state.selectedUnits, unit],
    }))
    get().applyFilters()
  },

  setShowNotStarted: (show) => {
    set({ showNotStarted: show })
    get().applyFilters()
  },

  setShowWeakChapters: (show) => {
    set({ showWeakChapters: show })
    get().applyFilters()
  },

  toggleSort: () => {
    set((state) => ({ sortAscending: !state.sortAscending }))
    get().applyFilters()
  },

  applyFilters: () => {
    const {
      chapters,
      selectedSubject,
      selectedClasses,
      selectedUnits,
      showNotStarted,
      showWeakChapters,
      sortAscending,
    } = get()

    let filtered = chapters.filter((chapter) => chapter.subject === selectedSubject)

    // Apply class filter
    if (selectedClasses.length > 0) {
      filtered = filtered.filter((chapter) => selectedClasses.includes(chapter.class))
    }

    // Apply unit filter
    if (selectedUnits.length > 0) {
      filtered = filtered.filter((chapter) => selectedUnits.includes(chapter.unit))
    }

    // Apply not started filter
    if (showNotStarted) {
      filtered = filtered.filter((chapter) => chapter.status === "Not Started")
    }

    // Apply weak chapters filter
    if (showWeakChapters) {
      filtered = filtered.filter((chapter) => chapter.isWeakChapter)
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortAscending) {
        return a.chapter.localeCompare(b.chapter)
      } else {
        return b.chapter.localeCompare(a.chapter)
      }
    })

    set({ filteredChapters: filtered })
  },
}))
