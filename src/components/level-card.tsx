import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { Book, BookOpen, GraduationCap, Newspaper } from 'lucide-react'

const icons = {
  1: Book,
  2: BookOpen,
  3: GraduationCap,
  4: Newspaper
}

interface LevelCardProps {
  level: number
  title: string
  description: string
  progress: number
  wordCount: number
}

export function LevelCard({ level, title, description, progress, wordCount }: LevelCardProps) {
  const Icon = icons[level as keyof typeof icons]

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-indigo-100 p-2">
              <Icon className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          </div>
          <span className="text-sm font-medium text-gray-500">レベル {level}</span>
        </div>
        <p className="mb-4 text-sm text-gray-600">{description}</p>
        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700">進捗状況</span>
            <span className="text-gray-600">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <div className="mb-6 text-center text-sm text-gray-600">
          {wordCount.toLocaleString()} 単語
        </div>
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
          学習を始める
        </Button>
      </CardContent>
    </Card>
  )
}

