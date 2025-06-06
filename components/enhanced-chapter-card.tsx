"use client"

import {
  ArrowDown,
  ArrowUp,
  Books,
  Brain,
  ChartBar,
  CheckCircle,
  Clock,
  Compass,
  Cube,
  Lightbulb,
  Lightning,
  MathOperations,
  Ruler,
  Scales,
  Sigma,
  Snowflake,
  Sparkle,
  Target,
  Thermometer,
  Warning,
  Waves,
  Calendar,
  Timer,
  BookOpen,
} from "@phosphor-icons/react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Chapter } from "@/lib/types"
import { cn } from "@/lib/utils"

// Map of icons to use for chapters
const ICONS = [
  Books,
  Brain,
  ChartBar,
  CheckCircle,
  Clock,
  Compass,
  Cube,
  Lightbulb,
  Lightning,
  MathOperations,
  Ruler,
  Scales,
  Sigma,
  Snowflake,
  Sparkle,
  Target,
  Thermometer,
  Waves,
]

// Function to get a consistent icon for a chapter
const getChapterIcon = (chapterName: string) => {
  const hash = chapterName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const index = hash % ICONS.length
  return ICONS[index]
}

// Function to format time ago
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }
}

interface EnhancedChapterCardProps {
  chapter: Chapter
}

export function EnhancedChapterCard({ chapter }: EnhancedChapterCardProps) {
  // Get the latest year and previous year
  const years = Object.keys(chapter.yearWiseQuestionCount).sort((a, b) => Number.parseInt(b) - Number.parseInt(a))
  const latestYear = years[0]
  const previousYear = years[1]

  // Calculate the trend
  const latestCount = chapter.yearWiseQuestionCount[latestYear]
  const previousCount = chapter.yearWiseQuestionCount[previousYear] || 0
  const trend = latestCount > previousCount ? "up" : latestCount < previousCount ? "down" : "same"

  // Calculate progress percentage
  const progressPercentage = chapter.totalQuestions > 0 ? (chapter.questionSolved / chapter.totalQuestions) * 100 : 0

  // Get chapter icon
  const ChapterIcon = getChapterIcon(chapter.chapter)

  // Difficulty colors
  const difficultyColors = {
    Easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    Hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }

  // Status colors
  const statusColors = {
    "Not Started": "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    Completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  }

  return (
    <TooltipProvider>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Chapter Icon */}
            <div className="bg-muted rounded-md p-2 flex items-center justify-center h-12 w-12 flex-shrink-0">
              <ChapterIcon size={24} weight="duotone" />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Header Row */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-base truncate">{chapter.chapter}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <span>{chapter.class}</span>
                    <span>•</span>
                    <span>{chapter.unit}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Timer size={12} />
                      {chapter.estimatedTime}m
                    </span>
                  </div>
                </div>

                {/* Status and Difficulty Badges */}
                <div className="flex flex-col gap-1">
                  <Badge className={cn("text-xs", statusColors[chapter.status])}>{chapter.status}</Badge>
                  <Badge className={cn("text-xs", difficultyColors[chapter.difficulty])}>{chapter.difficulty}</Badge>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {chapter.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {chapter.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{chapter.tags.length - 3}
                  </Badge>
                )}
              </div>

              {/* Progress Section */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <span>
                      {latestYear}: {latestCount}Qs
                    </span>
                    {trend === "up" && <ArrowUp size={14} className="text-green-500" />}
                    {trend === "down" && <ArrowDown size={14} className="text-red-500" />}
                    {trend === "same" && <span className="text-muted-foreground">—</span>}
                  </div>
                  <span className="text-muted-foreground">
                    {chapter.questionSolved}/{chapter.totalQuestions} Qs
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  {chapter.accuracy !== undefined && chapter.accuracy > 0 && (
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center gap-1">
                          <Target size={12} className="text-muted-foreground" />
                          <span
                            className={cn(
                              "font-medium",
                              chapter.accuracy >= 80
                                ? "text-green-600"
                                : chapter.accuracy >= 60
                                  ? "text-yellow-600"
                                  : "text-red-600",
                            )}
                          >
                            {chapter.accuracy}%
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Accuracy Rate</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {chapter.lastStudied && (
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar size={12} />
                          <span>{formatTimeAgo(chapter.lastStudied)}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Last Studied</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {chapter.isWeakChapter && (
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <Warning size={10} />
                          <span>Weak</span>
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Needs more practice</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>

                <div className="text-muted-foreground">
                  {previousYear}: {previousCount}Qs
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3">
                <Button size="sm" className="h-7 text-xs">
                  <BookOpen size={12} className="mr-1" />
                  Study
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  <ChartBar size={12} className="mr-1" />
                  Analytics
                </Button>
                {chapter.status === "Not Started" && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600">
                    Start Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
