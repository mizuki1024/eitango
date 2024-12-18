'use client';

import React, { useEffect, useState } from 'react';
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const translations = {
  "適切な": "appropriate",
  "次の": "next",
  "起こる": "happen"
};

export default function QuizAnswer({
  question = "appropriate",
  correctAnswer = "適切な",
  userAnswer = "適切な",
  options = ["適切な", "次の", "起こる"],
  questionNumber = 2,
  totalQuestions = 20,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    userId,
    wordId,
    result,
    word,
    level,
    nextQuestion,
    usedQuestions = []
  } = location.state || {};

  const isCorrect = userAnswer === correctAnswer;
  const progressPercentage = (questionNumber / totalQuestions) * 100;

  // 時間計測のためのステート
  const [startTime, setStartTime] = useState(Date.now()); // ページ読み込み時間
  const [timeSpent, setTimeSpent] = useState(0); // 滞在時間

  // サーバーへ履歴を保存
  const saveResultToHistory = async () => {
    if (!userId || !wordId || !result) {
      console.error("保存データが不足しています。", { userId, wordId, result });
      return;
    }

    try {
      const state = isCorrect ? 1 : 2; // 正解なら1、間違いなら2
      const bodyData = {
        wordId: wordId,
        word: word,
        jword: correctAnswer,
        date: new Date().toISOString().split("T")[0],
        state: state,
      };

      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        throw new Error(`履歴保存に失敗しました: ${response.status}`);
      }
      console.log("履歴保存成功:", bodyData);
    } catch (error) {
      console.error("履歴保存中のエラー:", error);
    }
  };

  useEffect(() => {
    saveResultToHistory();
  }, [userId, wordId, result]);

  // ページ遷移時に滞在時間を計算して保存する処理
  const handleNextQuestion = () => {
    // 現在の時間からページ読み込み時の時間を引いて滞在時間を計算
    const endTime = Date.now();
    const spentTimeInSeconds = Math.floor((endTime - startTime) / 1000); // 秒単位で計算
    setTimeSpent(spentTimeInSeconds); // 計算した滞在時間を状態に保存
    saveTimeSpent(spentTimeInSeconds); // サーバーに保存

    // 次の問題に進む
    if (nextQuestion) {
      // 時間をリセットして次の質問をロード
      setStartTime(Date.now()); // 新しい開始時間を設定
      navigate(`/level/${level}`, {
        state: { usedQuestions: [...usedQuestions, { result: isCorrect ? '正解！' : '不正解' }] },
      });
    } else {
      const correctAnswers = usedQuestions.filter((q) => q.result === '正解！').length;
      navigate('/score', {
        state: { score: correctAnswers, correctAnswers, level },
      });
    }
  };

  const saveTimeSpent = async (spentTimeInSeconds) => {
    const userId = userId || 1; // ユーザーID（適宜設定）

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/save-time?user_id=${userId}&time_spent=${spentTimeInSeconds}`,
        { method: 'GET' }
      );

      if (response.ok) {
        console.log('時間が正常に保存されました');
      } else {
        console.error('時間保存に失敗しました');
      }
    } catch (error) {
      console.error('エラー:', error);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <Card className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="text-xl font-bold">レベル1 クイズ</div>
          <div className="ml-auto text-gray-600">
            {questionNumber}/{totalQuestions} 問完了
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={progressPercentage} className="h-2 bg-blue-500 mb-6" />

        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">{question}</h2>
            <p className="text-gray-600">以下の選択肢から正しい日本語訳を選んでください</p>
          </div>

          {/* Options */}
          <div className="space-y-4">
            {options.map((option, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  option === correctAnswer
                    ? 'bg-green-100 border-green-500'
                    : option === userAnswer && option !== correctAnswer
                    ? 'bg-red-100 border-red-500'
                    : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {option !== correctAnswer && (
                    <span className="text-gray-700 text-sm ml-2">
                      {translations[option] || "unknown"}
                    </span>
                  )}
                  {option === correctAnswer && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                  {option === userAnswer && option !== correctAnswer && (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Result */}
          <div className="text-center">
            {isCorrect ? (
              <p className="text-green-600 font-bold">正解です！</p>
            ) : (
              <p className="text-red-600 font-bold">
                不正解です。正解は「{correctAnswer}」でした。
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="pt-8 space-y-4">
            <Button className="w-full" onClick={handleNextQuestion}>
              次の問題へ
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
