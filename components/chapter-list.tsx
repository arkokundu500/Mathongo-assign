"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Atom, Flask, Calculator, SortAscending, Sun, Moon, ArrowLeft, CaretDown } from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ChapterCard } from "@/components/chapter-card"
import { getChapterData } from "@/lib/data"
import type { Chapter, Subject } from "@/lib/types"
import { cn } from "@/lib/utils"

export function ChapterList() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<Chapter[]>([])
  const [filteredData, setFilteredData] = useState<Chapter[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject>("Physics")
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [selectedUnits, setSelectedUnits] = useState<string[]>([])
  const [showNotStarted, setShowNotStarted] = useState(false)
  const [showWeakChapters, setShowWeakChapters] = useState(false)
  const [sortAscending, setSortAscending] = useState(true)
  const [uniqueClasses, setUniqueClasses] = useState<string[]>([])
  const [uniqueUnits, setUniqueUnits] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const chaptersData = await getChapterData()
        setData(chaptersData)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Update unique classes and units when subject changes
  useEffect(() => {
    if (data.length > 0) {
      const subjectData = data.filter((chapter) => chapter.subject === selectedSubject)

      // Get unique classes for the selected subject
      const classes = [...new Set(subjectData.map((chapter) => chapter.class))]
      setUniqueClasses(classes)

      // Get unique units for the selected subject
      const units = [...new Set(subjectData.map((chapter) => chapter.unit))]
      setUniqueUnits(units)

      // Reset selected filters when subject changes
      setSelectedClasses([])
      setSelectedUnits([])
      setShowNotStarted(false)
      setShowWeakChapters(false)
    }
  }, [selectedSubject, data])

  // Apply filters
  useEffect(() => {
    if (data.length > 0) {
      let filtered = data.filter((chapter) => chapter.subject === selectedSubject)

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

      setFilteredData(filtered)
    }
  }, [data, selectedSubject, selectedClasses, selectedUnits, showNotStarted, showWeakChapters, sortAscending])

  // Toggle class selection
  const toggleClass = (className: string) => {
    setSelectedClasses((prev) =>
      prev.includes(className) ? prev.filter((c) => c !== className) : [...prev, className],
    )
  }

  // Toggle unit selection
  const toggleUnit = (unit: string) => {
    setSelectedUnits((prev) => (prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit]))
  }

  // Toggle sort order
  const toggleSort = () => {
    setSortAscending((prev) => !prev)
  }

  // Toggle theme with proper handling
  const toggleTheme = () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark"
    setTheme(newTheme)
  }

  const subjects = [
    {
      id: "Physics" as Subject,
      label: "Physics",
      shortLabel: "Phy",
      icon: Atom,
      color: "bg-orange-500",
      textColor: "text-orange-500",
    },
    {
      id: "Chemistry" as Subject,
      label: "Chemistry",
      shortLabel: "Chem",
      icon: Flask,
      color: "bg-green-500",
      textColor: "text-green-500",
    },
    {
      id: "Mathematics" as Subject,
      label: "Mathematics",
      shortLabel: "Math",
      icon: Calculator,
      color: "bg-blue-500",
      textColor: "text-blue-500",
    },
  ]

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Layout */}
      <div className="hidden xl:flex">
        {/* Desktop Sidebar */}
        <div className="xl:w-64 xl:flex-col xl:border-r xl:bg-card">
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">JEE Main</h1>
                <p className="text-sm text-muted-foreground">2025-2009 | 173 Papers | 15825 Qs</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9 hover:bg-muted transition-colors"
                aria-label="Toggle theme"
              >
                {resolvedTheme === "dark" ? (
                  <Sun size={20} className="text-foreground hover:text-yellow-500 transition-colors" />
                ) : (
                  <Moon size={20} className="text-foreground hover:text-blue-500 transition-colors" />
                )}
              </Button>
            </div>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Subjects</h2>
            <nav className="space-y-2">
              {subjects.map((subject) => {
                const Icon = subject.icon
                return (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors",
                      selectedSubject === subject.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon size={20} weight={selectedSubject === subject.id ? "fill" : "regular"} />
                    <span>{subject.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Desktop Main Content */}
        <div className="flex-1 p-6">
          {/* Desktop Subject Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              {(() => {
                const currentSubject = subjects.find((s) => s.id === selectedSubject)
                const Icon = currentSubject?.icon || Atom
                return (
                  <>
                    <div className={cn("w-8 h-8 rounded-md flex items-center justify-center", currentSubject?.color)}>
                      <Icon size={20} className="text-white" weight="fill" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">{selectedSubject} PYQs</h1>
                  </>
                )
              })()}
            </div>
            <p className="text-sm text-muted-foreground">Chapter-wise Collection of {selectedSubject} PYQs</p>
          </div>

          {/* Desktop Filters */}
          <div className="flex flex-col sm:flex-row justify-between gap-2 mb-4">
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    Class
                    {selectedClasses.length > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 px-1">
                        {selectedClasses.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {uniqueClasses.map((className) => (
                    <DropdownMenuCheckboxItem
                      key={className}
                      checked={selectedClasses.includes(className)}
                      onCheckedChange={() => toggleClass(className)}
                    >
                      {className}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    Units
                    {selectedUnits.length > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 px-1">
                        {selectedUnits.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {uniqueUnits.map((unit) => (
                    <DropdownMenuCheckboxItem
                      key={unit}
                      checked={selectedUnits.includes(unit)}
                      onCheckedChange={() => toggleUnit(unit)}
                    >
                      {unit}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center space-x-2">
                <Switch id="not-started" checked={showNotStarted} onCheckedChange={setShowNotStarted} />
                <Label htmlFor="not-started" className="text-sm">
                  Not Started
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="weak-chapters" checked={showWeakChapters} onCheckedChange={setShowWeakChapters} />
                <Label htmlFor="weak-chapters" className="text-sm">
                  Weak Chapters
                </Label>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={toggleSort} className="flex items-center gap-1 h-8">
              <SortAscending size={16} />
              Sort
            </Button>
          </div>

          {/* Desktop Chapter Count */}
          <div className="text-sm text-muted-foreground mb-4">
            Showing {filteredData.length} chapters
            {filteredData.length !== data.filter((chapter) => chapter.subject === selectedSubject).length && (
              <span> (filtered from {data.filter((chapter) => chapter.subject === selectedSubject).length})</span>
            )}
          </div>

          {/* Desktop Chapter List */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredData.map((chapter) => (
                <ChapterCard key={chapter.chapter} chapter={chapter} />
              ))}
              {filteredData.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No chapters found matching the filters</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="xl:hidden">
        {/* Mobile Header */}
        <div className="bg-card border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <ArrowLeft size={24} className="text-muted-foreground" />
            <h1 className="text-lg font-semibold text-foreground">JEE Main</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? (
                <Sun size={18} className="text-foreground hover:text-yellow-500 transition-colors" />
              ) : (
                <Moon size={18} className="text-foreground hover:text-blue-500 transition-colors" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Subject Tabs */}
        <div className="bg-card border-b px-4 py-4">
          <div className="flex justify-center gap-8">
            {subjects.map((subject) => {
              const Icon = subject.icon
              const isSelected = selectedSubject === subject.id
              return (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject.id)}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                      isSelected ? subject.color : "bg-muted",
                    )}
                  >
                    <Icon
                      size={24}
                      className={isSelected ? "text-white" : "text-muted-foreground"}
                      weight={isSelected ? "fill" : "regular"}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isSelected ? subject.textColor : "text-muted-foreground",
                    )}
                  >
                    {subject.shortLabel}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Mobile Filters */}
        <div className="bg-card px-4 py-3 border-b">
          <div className="flex gap-2 overflow-x-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 whitespace-nowrap">
                  Class
                  <CaretDown size={12} className="ml-1" />
                  {selectedClasses.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
                      {selectedClasses.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {uniqueClasses.map((className) => (
                  <DropdownMenuCheckboxItem
                    key={className}
                    checked={selectedClasses.includes(className)}
                    onCheckedChange={() => toggleClass(className)}
                  >
                    {className}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 whitespace-nowrap">
                  Units
                  <CaretDown size={12} className="ml-1" />
                  {selectedUnits.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
                      {selectedUnits.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {uniqueUnits.map((unit) => (
                  <DropdownMenuCheckboxItem
                    key={unit}
                    checked={selectedUnits.includes(unit)}
                    onCheckedChange={() => toggleUnit(unit)}
                  >
                    {unit}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant={showNotStarted ? "default" : "outline"}
              size="sm"
              className="h-8 whitespace-nowrap"
              onClick={() => setShowNotStarted(!showNotStarted)}
            >
              Not Started
            </Button>

            <Button
              variant={showWeakChapters ? "default" : "outline"}
              size="sm"
              className="h-8 whitespace-nowrap"
              onClick={() => setShowWeakChapters(!showWeakChapters)}
            >
              Weak
            </Button>
          </div>
        </div>

        {/* Mobile Chapter Count and Sort */}
        <div className="bg-card px-4 py-3 flex items-center justify-between border-b">
          <span className="text-sm text-muted-foreground">Showing all chapters ({filteredData.length})</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSort}
            className="flex items-center gap-1 h-8 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <SortAscending size={16} />
            Sort
          </Button>
        </div>

        {/* Mobile Chapter List */}
        <div className="p-4 bg-background">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredData.map((chapter) => (
                <ChapterCard key={chapter.chapter} chapter={chapter} />
              ))}
              {filteredData.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No chapters found matching the filters</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
