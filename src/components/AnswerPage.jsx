'use client';

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { CheckCircle2, XCircle } from 'lucide-react';

export default function QuizAnswer() {
  const location = useLocation();
  const navigate = useNavigate();

  // location.state からデータ取得
  const {
    word = "appropriate",
    correctOption = { word: "適切な", meaning: "appropriate" },
    selectedOption = { word: "適切な" },
    options = [
      { word: "適切な", meaning: "appropriate" },
      { word: "次の", meaning: "next" },
      { word: "起こる", meaning: "happen" },
    ],
    result = "不正解",
    usedQuestions = [],
    usedQuestionsLength = 2,
    nextQuestion = true,
    level = 1,
    userId = null,
    wordId = null,
  } = location.state || {};

  // 正誤判定
  const isCorrect = selectedOption.word === correctOption.word;
  const progressPercentage = (usedQuestionsLength / 20) * 100;

  // 結果履歴をサーバーに保存
  const saveResultToHistory = async () => {
    if (!userId || !wordId) return;

    const bodyData = {
      wordId: wordId,
      word: word,
      jword: correctOption.meaning,
      date: new Date().toISOString().split("T")[0],
      state: isCorrect ? 1 : 2,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) throw new Error("履歴保存に失敗しました");
      console.log("履歴保存成功:", bodyData);
    } catch (error) {
      console.error("履歴保存エラー:", error);
    }
  };

  useEffect(() => {
    saveResultToHistory();
  }, [userId, wordId]);

  // 次の問題への遷移
  const handleNextQuestion = () => {
    if (nextQuestion) {
      navigate(`/level/${level}`, {
        state: {
          usedQuestions: [...usedQuestions, { word, result: isCorrect ? "正解！" : "不正解" }],
          usedQuestionsLength: usedQuestionsLength + 1,
          level,
        },
      });
    } else {
      const correctAnswers = usedQuestions.filter((q) => q.result === "正解！").length;
      navigate('/score', {
        state: { score: correctAnswers, level },
      });
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <Card className="max-w-2xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="flex items-center gap-2 mb-6">
          <div className="text-xl font-bold">レベル{level} クイズ</div>
          <div className="ml-auto text-gray-600">
            {usedQuestionsLength}/20 問完了
          </div>
        </div>

        {/* 進捗バー */}
        <Progress value={progressPercentage} className="h-2 mb-6" />

        {/* 質問 */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">{word}</h2>
          <p className="text-gray-600">以下の選択肢から正しい日本語訳を選んでください</p>
        </div>

        {/* 選択肢 */}
        <div className="space-y-4 mt-4">
          {options.map((option, index) => {
            const isCorrectOption = option.word === correctOption.word;
            const isUserSelected = option.word === selectedOption.word;

            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  isCorrectOption
                    ? 'bg-green ' // 正解の場合
                    : isUserSelected && !isCorrectOption
                    ? 'bg-red-800 border-red-500' // ユーザーが選んだ不正解の場合
                    : 'bg-black' // 他の選択肢
                }`}
              >
                <div className="flex justify-between">
                  <span>{option.word}</span>
                  <span className="text-gray-700 text-sm">{option.meaning}</span>
                  {isCorrectOption && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                  {isUserSelected && !isCorrectOption && (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 結果 */}
        <div className="text-center mt-4">
          {isCorrect ? (
            <p className="text-green-600 font-bold">正解です！</p>
          ) : (
            <p className="text-red-600 font-bold">
              不正解です。正解は「{correctOption.word} ({correctOption.meaning})」でした。
            </p>
          )}
        </div>

        {/* 次の問題へ */}
        <div className="pt-8">
          <Button className="w-full" onClick={handleNextQuestion}>
            次の問題へ
          </Button>
        </div>
      </Card>
    </div>
  );
}
