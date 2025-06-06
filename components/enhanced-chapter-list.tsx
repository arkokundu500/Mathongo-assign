"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import {
  Atom,
  Flask,
  Calculator,
  Sun,
  Moon,
  ArrowLeft,
  CaretDown,
  MagnifyingGlass,
  Funnel,
  ChartBar,
  BookOpen,
  Warning,
} from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { EnhancedChapterCard } from "@/components/enhanced-chapter-card"
import { SubjectStatsCard } from "@/components/subject-stats-card"
import { getEnhancedChapterData, getSubjectStats } from "@/lib/enhanced-data"
import type { Chapter, Subject, FilterOptions, SortOption, Difficulty, Status } from "@/lib/types"
import { cn } from "@/lib/utils"

export function EnhancedChapterList() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<Chapter[]>([])
  const [filteredData, setFilteredData] = useState<Chapter[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject>("Physics")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<"list" | "stats">("list")

  // Filter states
  const [filters, setFilters] = useState<FilterOptions>({
    subjects: [],
    classes: [],
    units: [],
    statuses: [],
    difficulties: [],
    showWeakOnly: false,
    showNotStartedOnly: false,
  })

  // Sort state
  const [sortOption, setSortOption] = useState<SortOption>({
    field: "chapter",
    direction: "asc",
  })

  // Derived data
  const [uniqueClasses, setUniqueClasses] = useState<string[]>([])
  const [uniqueUnits, setUniqueUnits] = useState<string[]>([])
  const [subjectStats, setSubjectStats] = useState<any>(null)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const chaptersData = await getEnhancedChapterData()
        setData(chaptersData)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Update derived data when subject or data changes
  useEffect(() => {
    if (data.length > 0) {
      const subjectData = data.filter((chapter) => chapter.subject === selectedSubject)

      // Get unique classes and units
      const classes = [...new Set(subjectData.map((chapter) => chapter.class))]
      const units = [...new Set(subjectData.map((chapter) => chapter.unit))]
      setUniqueClasses(classes)
      setUniqueUnits(units)

      // Get subject stats
      getSubjectStats(selectedSubject, data).then(setSubjectStats)

      // Reset filters when subject changes
      setFilters((prev) => ({
        ...prev,
        classes: [],
        units: [],
        statuses: [],
        difficulties: [],
        showWeakOnly: false,
        showNotStartedOnly: false,
      }))
      setSearchQuery("")
    }
  }, [selectedSubject, data])

  // Apply filters and search
  useEffect(() => {
    if (data.length > 0) {
      let filtered = data.filter((chapter) => chapter.subject === selectedSubject)

      // Apply search
      if (searchQuery) {
        filtered = filtered.filter(
          (chapter) =>
            chapter.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chapter.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
            chapter.description.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      }

      // Apply filters
      if (filters.classes.length > 0) {
        filtered = filtered.filter((chapter) => filters.classes.includes(chapter.class))
      }

      if (filters.units.length > 0) {
        filtered = filtered.filter((chapter) => filters.units.includes(chapter.unit))
      }

      if (filters.statuses.length > 0) {
        filtered = filtered.filter((chapter) => filters.statuses.includes(chapter.status))
      }

      if (filters.difficulties.length > 0) {
        filtered = filtered.filter((chapter) => filters.difficulties.includes(chapter.difficulty))
      }

      if (filters.showWeakOnly) {
        filtered = filtered.filter((chapter) => chapter.isWeakChapter)
      }

      if (filters.showNotStartedOnly) {
        filtered = filtered.filter((chapter) => chapter.status === "Not Started")
      }

      // Apply sorting
      filtered = [...filtered].sort((a, b) => {
        let aValue: any, bValue: any

        switch (sortOption.field) {
          case "chapter":
            aValue = a.chapter
            bValue = b.chapter
            break
          case "difficulty":
            const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 }
            aValue = difficultyOrder[a.difficulty]
            bValue = difficultyOrder[b.difficulty]
            break
          case "accuracy":
            aValue = a.accuracy || 0
            bValue = b.accuracy || 0
            break
          case "lastStudied":
            aValue = a.lastStudied ? new Date(a.lastStudied).getTime() : 0
            bValue = b.lastStudied ? new Date(b.lastStudied).getTime() : 0
            break
          case "totalQuestions":
            aValue = a.totalQuestions
            bValue = b.totalQuestions
            break
          case "progress":
            aValue = a.totalQuestions > 0 ? (a.questionSolved / a.totalQuestions) * 100 : 0
            bValue = b.totalQuestions > 0 ? (b.questionSolved / b.totalQuestions) * 100 : 0
            break
          default:
            aValue = a.chapter
            bValue = b.chapter
        }

        if (sortOption.direction === "asc") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        }
      })

      setFilteredData(filtered)
    }
  }, [data, selectedSubject, searchQuery, filters, sortOption])

  // Toggle functions
  const toggleFilter = (type: keyof FilterOptions, value: any) => {
    setFilters((prev) => {
      if (type === "showWeakOnly" || type === "showNotStartedOnly") {
        return { ...prev, [type]: !prev[type] }
      }

      const currentArray = prev[type] as any[]
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value]

      return { ...prev, [type]: newArray }
    })
  }

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

  // Don't render until mounted
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
        <div className="xl:w-80 xl:flex-col xl:border-r xl:bg-card">
          <div className="p-6">
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

            {/* Subject Navigation */}
            <div className="mb-6">
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

            {/* Quick Stats */}
            {subjectStats && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {Math.round((subjectStats.solvedQuestions / subjectStats.totalQuestions) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(subjectStats.solvedQuestions / subjectStats.totalQuestions) * 100}
                    className="h-2"
                  />
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-medium text-foreground">{subjectStats.completedChapters}</div>
                      <div className="text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-medium text-foreground">{subjectStats.weakChapters}</div>
                      <div className="text-muted-foreground">Weak</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View Toggle */}
            <div className="mb-4">
              <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as "list" | "stats")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <BookOpen size={16} />
                    Chapters
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="flex items-center gap-2">
                    <ChartBar size={16} />
                    Analytics
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Desktop Main Content */}
        <div className="flex-1 p-6">
          {/* Desktop Header */}
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

          {currentView === "stats" ? (
            <SubjectStatsCard subject={selectedSubject} chapters={data} />
          ) : (
            <>
              {/* Search and Filters */}
              <div className="mb-6 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <MagnifyingGlass
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    placeholder="Search chapters, tags, or descriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filter Row */}
                <div className="flex flex-wrap gap-2 items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <Funnel size={16} className="mr-2" />
                        Class
                        {filters.classes.length > 0 && (
                          <Badge variant="secondary" className="ml-2 h-5 px-1">
                            {filters.classes.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      {uniqueClasses.map((className) => (
                        <DropdownMenuCheckboxItem
                          key={className}
                          checked={filters.classes.includes(className)}
                          onCheckedChange={() => toggleFilter("classes", className)}
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
                        {filters.units.length > 0 && (
                          <Badge variant="secondary" className="ml-2 h-5 px-1">
                            {filters.units.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      {uniqueUnits.map((unit) => (
                        <DropdownMenuCheckboxItem
                          key={unit}
                          checked={filters.units.includes(unit)}
                          onCheckedChange={() => toggleFilter("units", unit)}
                        >
                          {unit}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        Status
                        {filters.statuses.length > 0 && (
                          <Badge variant="secondary" className="ml-2 h-5 px-1">
                            {filters.statuses.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      {(["Not Started", "In Progress", "Completed"] as Status[]).map((status) => (
                        <DropdownMenuCheckboxItem
                          key={status}
                          checked={filters.statuses.includes(status)}
                          onCheckedChange={() => toggleFilter("statuses", status)}
                        >
                          {status}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        Difficulty
                        {filters.difficulties.length > 0 && (
                          <Badge variant="secondary" className="ml-2 h-5 px-1">
                            {filters.difficulties.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      {(["Easy", "Medium", "Hard"] as Difficulty[]).map((difficulty) => (
                        <DropdownMenuCheckboxItem
                          key={difficulty}
                          checked={filters.difficulties.includes(difficulty)}
                          onCheckedChange={() => toggleFilter("difficulties", difficulty)}
                        >
                          {difficulty}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="weak-only"
                      checked={filters.showWeakOnly}
                      onCheckedChange={() => toggleFilter("showWeakOnly", null)}
                    />
                    <Label htmlFor="weak-only" className="text-sm">
                      Weak Only
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="not-started-only"
                      checked={filters.showNotStartedOnly}
                      onCheckedChange={() => toggleFilter("showNotStartedOnly", null)}
                    />
                    <Label htmlFor="not-started-only" className="text-sm">
                      Not Started
                    </Label>
                  </div>

                  <Select
                    value={`${sortOption.field}-${sortOption.direction}`}
                    onValueChange={(value) => {
                      const [field, direction] = value.split("-")
                      setSortOption({ field: field as any, direction: direction as "asc" | "desc" })
                    }}
                  >
                    <SelectTrigger className="w-40 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chapter-asc">Name A-Z</SelectItem>
                      <SelectItem value="chapter-desc">Name Z-A</SelectItem>
                      <SelectItem value="difficulty-asc">Difficulty ↑</SelectItem>
                      <SelectItem value="difficulty-desc">Difficulty ↓</SelectItem>
                      <SelectItem value="accuracy-desc">Accuracy ↓</SelectItem>
                      <SelectItem value="progress-desc">Progress ↓</SelectItem>
                      <SelectItem value="lastStudied-desc">Recently Studied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results Count */}
              <div className="text-sm text-muted-foreground mb-4">
                Showing {filteredData.length} chapters
                {filteredData.length !== data.filter((chapter) => chapter.subject === selectedSubject).length && (
                  <span> (filtered from {data.filter((chapter) => chapter.subject === selectedSubject).length})</span>
                )}
              </div>

              {/* Chapter List */}
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredData.map((chapter) => (
                    <EnhancedChapterCard key={chapter.id} chapter={chapter} />
                  ))}
                  {filteredData.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No chapters found matching the filters</p>
                    </div>
                  )}
                </div>
              )}
            </>
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

        {/* Mobile Search */}
        <div className="bg-card px-4 py-3 border-b">
          <div className="relative">
            <MagnifyingGlass
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search chapters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Mobile Filters */}
        <div className="bg-card px-4 py-3 border-b">
          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant={filters.showWeakOnly ? "default" : "outline"}
              size="sm"
              className="h-8 whitespace-nowrap"
              onClick={() => toggleFilter("showWeakOnly", null)}
            >
              <Warning size={14} className="mr-1" />
              Weak
            </Button>

            <Button
              variant={filters.showNotStartedOnly ? "default" : "outline"}
              size="sm"
              className="h-8 whitespace-nowrap"
              onClick={() => toggleFilter("showNotStartedOnly", null)}
            >
              Not Started
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 whitespace-nowrap">
                  More Filters
                  <CaretDown size={12} className="ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                {(["Not Started", "In Progress", "Completed"] as Status[]).map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={filters.statuses.includes(status)}
                    onCheckedChange={() => toggleFilter("statuses", status)}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Difficulty</DropdownMenuLabel>
                {(["Easy", "Medium", "Hard"] as Difficulty[]).map((difficulty) => (
                  <DropdownMenuCheckboxItem
                    key={difficulty}
                    checked={filters.difficulties.includes(difficulty)}
                    onCheckedChange={() => toggleFilter("difficulties", difficulty)}
                  >
                    {difficulty}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
                <EnhancedChapterCard key={chapter.id} chapter={chapter} />
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
