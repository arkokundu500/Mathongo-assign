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
} from "@phosphor-icons/react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { Chapter } from "@/lib/types"

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

// Function to get a random icon for a chapter
const getRandomIcon = (chapterName: string) => {
  // Use the chapter name to consistently get the same icon for the same chapter
  const hash = chapterName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const index = hash % ICONS.length
  return ICONS[index]
}

interface ChapterCardProps {
  chapter: Chapter
}

export function ChapterCard({ chapter }: ChapterCardProps) {
  // Get the latest year and previous year
  const years = Object.keys(chapter.yearWiseQuestionCount).sort((a, b) => Number.parseInt(b) - Number.parseInt(a))
  const latestYear = years[0]
  const previousYear = years[1]

  // Calculate the trend (up, down, or same)
  const latestCount = chapter.yearWiseQuestionCount[latestYear]
  const previousCount = chapter.yearWiseQuestionCount[previousYear]
  const trend = latestCount > previousCount ? "up" : latestCount < previousCount ? "down" : "same"

  // Calculate progress percentage
  const totalQuestions = Object.values(chapter.yearWiseQuestionCount).reduce((sum, count) => sum + count, 0)
  const progressPercentage = totalQuestions > 0 ? (chapter.questionSolved / totalQuestions) * 100 : 0

  // Get a random icon for the chapter
  const ChapterIcon = getRandomIcon(chapter.chapter)

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="bg-muted rounded-md p-2 flex items-center justify-center h-12 w-12 flex-shrink-0">
            <ChapterIcon size={24} weight="duotone" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-base truncate">{chapter.chapter}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <span>{chapter.class}</span>
                  <span>•</span>
                  <span>{chapter.unit}</span>
                </div>
              </div>

              {chapter.isWeakChapter && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <Warning size={12} />
                  <span>Weak</span>
                </Badge>
              )}
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center gap-1">
                  <span>
                    {latestYear}: {latestCount}Qs
                  </span>
                  {trend === "up" && <ArrowUp size={14} className="text-green-500" />}
                  {trend === "down" && <ArrowDown size={14} className="text-red-500" />}
                </div>
                <span className="text-muted-foreground">
                  {chapter.questionSolved}/{totalQuestions} Qs
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <div className="mt-2 flex items-center justify-between">
              <Badge
                variant={
                  chapter.status === "Completed"
                    ? "outline"
                    : chapter.status === "In Progress"
                      ? "secondary"
                      : "destructive"
                }
                className="text-xs"
              >
                {chapter.status}
              </Badge>

              <div className="text-xs text-muted-foreground">
                {previousYear}: {previousCount}Qs
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
