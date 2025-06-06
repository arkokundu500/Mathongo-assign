"use client"

import { useEffect, useState } from "react"
import { ChartBar, TrendUp, Target, BookOpen, Warning, CheckCircle, Lightning } from "@phosphor-icons/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { getSubjectStats } from "@/lib/enhanced-data"
import type { Subject, Chapter, SubjectStats } from "@/lib/types"

interface SubjectStatsCardProps {
  subject: Subject
  chapters: Chapter[]
}

export function SubjectStatsCard({ subject, chapters }: SubjectStatsCardProps) {
  const [stats, setStats] = useState<SubjectStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const subjectStats = await getSubjectStats(subject, chapters)
        setStats(subjectStats)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching stats:", error)
        setIsLoading(false)
      }
    }

    if (chapters.length > 0) {
      fetchStats()
    }
  }, [subject, chapters])

  if (isLoading || !stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const progressPercentage = stats.totalQuestions > 0 ? (stats.solvedQuestions / stats.totalQuestions) * 100 : 0
  const completionRate = stats.totalChapters > 0 ? (stats.completedChapters / stats.totalChapters) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-md">
                <BookOpen size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Chapters</p>
                <p className="text-2xl font-bold">{stats.totalChapters}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-md">
                <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completedChapters}</p>
                <p className="text-xs text-muted-foreground">{Math.round(completionRate)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-md">
                <Lightning size={20} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgressChapters}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 dark:bg-red-900 p-2 rounded-md">
                <Warning size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weak Chapters</p>
                <p className="text-2xl font-bold">{stats.weakChapters}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendUp size={20} />
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {stats.solvedQuestions}/{stats.totalQuestions} questions
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1">{Math.round(progressPercentage)}% completed</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Chapter Completion</span>
              <span className="text-sm text-muted-foreground">
                {stats.completedChapters}/{stats.totalChapters} chapters
              </span>
            </div>
            <Progress value={completionRate} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1">{Math.round(completionRate)}% chapters completed</p>
          </div>

          {stats.averageAccuracy > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Average Accuracy</span>
                <span className="text-sm text-muted-foreground">{Math.round(stats.averageAccuracy)}%</span>
              </div>
              <Progress value={stats.averageAccuracy} className="h-3" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBar size={20} />
              Chapter Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Completed</span>
                </div>
                <Badge variant="outline">{stats.completedChapters}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">In Progress</span>
                </div>
                <Badge variant="outline">{stats.inProgressChapters}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm">Not Started</span>
                </div>
                <Badge variant="outline">{stats.notStartedChapters}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Weak Chapters</span>
                </div>
                <Badge variant="destructive">{stats.weakChapters}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target size={20} />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Questions Solved</span>
                  <span className="font-medium">{stats.solvedQuestions}</span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Total Questions</span>
                  <span className="font-medium">{stats.totalQuestions}</span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Success Rate</span>
                  <span className="font-medium">{Math.round(progressPercentage)}%</span>
                </div>
                {stats.averageAccuracy > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg. Accuracy</span>
                    <span className="font-medium">{Math.round(stats.averageAccuracy)}%</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.weakChapters > 0 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <Warning size={20} className="text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">Focus on Weak Chapters</p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    You have {stats.weakChapters} weak chapters that need more practice.
                  </p>
                </div>
              </div>
            )}

            {stats.notStartedChapters > 0 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <BookOpen size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Start New Chapters</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {stats.notStartedChapters} chapters are waiting to be started.
                  </p>
                </div>
              </div>
            )}

            {stats.inProgressChapters > 0 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <Lightning size={20} className="text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Complete In-Progress Chapters</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    {stats.inProgressChapters} chapters are partially completed.
                  </p>
                </div>
              </div>
            )}

            {stats.averageAccuracy > 0 && stats.averageAccuracy < 70 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <Target size={20} className="text-orange-600 dark:text-orange-400 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-800 dark:text-orange-200">Improve Accuracy</p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    Your average accuracy is {Math.round(stats.averageAccuracy)}%. Aim for 80%+.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
