import { useState } from 'react';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { GraduationCap, Home } from 'lucide-react';

function App() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const answers = ['少し', '問題', '率直な'];
  const correctAnswer = '少し';
  const currentQuestion = 2;
  const totalQuestions = 20;
  const progress = (currentQuestion / totalQuestions) * 100;

  const checkAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const getButtonVariant = (answer: string) => {
    if (!selectedAnswer) return 'outline';
    if (answer === correctAnswer) return 'success';
    if (answer === selectedAnswer && answer !== correctAnswer) return 'destructive';
    return 'outline';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 space-y-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">レベル1 クイズ</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            {currentQuestion}/{totalQuestions} 問完了
          </div>
        </div>

        <Progress value={progress} className="h-2" />

        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-medium mb-4">slightly</h2>
            <p className="text-sm text-muted-foreground">
              以下の選択肢から正しい日本語訳を選んでください
            </p>
          </div>

          <div className="grid gap-4">
            {answers.map((answer) => (
              <Button
                key={answer}
                variant={getButtonVariant(answer) as any}
                className="h-14 text-lg"
                onClick={() => checkAnswer(answer)}
                disabled={selectedAnswer !== null}
              >
                {answer}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button variant="outline" className="gap-2">
            <Home className="w-4 h-4" />
            トップページに戻る
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default App;