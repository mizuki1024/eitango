import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { GraduationCap, Home } from 'lucide-react';

const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function App() {
  const { level } = useParams();
  const location = useLocation();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [usedQuestions, setUsedQuestions] = useState(location.state?.usedQuestions || []);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const navigate = useNavigate();

  // Fetch questions from the API
  useEffect(() => {
    fetch(`${REACT_APP_API_BASE_URL}/words/${level}`)
      .then((response) => response.json())
      .then((data) => {
        setQuestions(data);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, [level]);

  // Pick a random question
  const pickRandomQuestion = useCallback(() => {
    const availableQuestions = questions.filter((q) => !usedQuestions.includes(q.id));
    if (availableQuestions.length === 0 || usedQuestions.length >= 20) {
      return null;
    }
    const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    setUsedQuestions((prevUsed) => [...prevUsed, randomQuestion.id]);
    return randomQuestion;
  }, [questions, usedQuestions]);

  // Set initial question and progress
  useEffect(() => {
    if (questions.length > 0 && !currentQuestion) {
      setCurrentQuestion(pickRandomQuestion());
    }
  }, [questions, currentQuestion, pickRandomQuestion]);

  useEffect(() => {
    setProgressPercentage((usedQuestions.length / 20) * 100);
  }, [usedQuestions]);

  const handleAnswer = (selectedOption) => {
    const isCorrect =
      currentQuestion.options[currentQuestion.correctOption].word === selectedOption.word;

    const nextQuestion = pickRandomQuestion();

    navigate('/answer', {
      state: {
        selectedOption,
        result: isCorrect ? '正解！' : '不正解...',
        word: currentQuestion.word,
        correctOption: currentQuestion.options[currentQuestion.correctOption],
        usedQuestionsLength: usedQuestions.length,
        level,
        nextQuestion,
        options: currentQuestion.options,
        wordId: currentQuestion.id,
        userId: 1,
      },
    });
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  if (!currentQuestion) {
    return <div className="loading">問題をロード中...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 space-y-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold">レベル{level} クイズ</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            {usedQuestions.length}/20 問完了
          </div>
        </div>

        <Progress value={progressPercentage} className="h-2 bg-blue-500" />

        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-medium mb-4">{currentQuestion.word}</h2>
            <p className="text-sm text-muted-foreground">
              以下の選択肢から正しい日本語訳を選んでください
            </p>
          </div>

          <div className="grid gap-4">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                className="h-14 text-lg bg-gray-100 hover:bg-gray-200"
                onClick={() => handleAnswer(option)}
              >
                {option.meaning}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button variant="outline" className="gap-2" onClick={handleBackToHome}>
            <Home className="w-4 h-4" />
            トップページに戻る
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default App;
