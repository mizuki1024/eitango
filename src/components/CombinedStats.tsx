import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { CheckCircle, XCircle, BookOpen, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// ダッシュボードデータ
const summaryData = [
  {
    title: "総学習時間",
    value: "465分",
    icon: <Clock className="w-6 h-6 text-gray-500" />,
    description: "先週比 +12%",
    trend: "up",
    trendColor: "text-green-500",
  },
  {
    title: "学習単語数",
    value: "284",
    icon: <BookOpen className="w-6 h-6 text-gray-500" />,
    description: "今月の目標まで残り16単語",
    trend: "neutral",
    trendColor: "text-gray-500",
  },
  {
    title: "正解数",
    value: "198",
    icon: <CheckCircle className="w-6 h-6 text-green-500" />,
    description: "正答率 70%",
    trend: "up",
    trendColor: "text-green-500",
  },
  {
    title: "間違い数",
    value: "86",
    icon: <XCircle className="w-6 h-6 text-red-500" />,
    description: "要復習単語",
    trend: "down",
    trendColor: "text-red-500",
  },
];

// 週間学習記録データ
const data = [
  { date: "2024-06-01", minutes: 120, correctAnswers: 20, wrongAnswers: 5 },
  { date: "2024-06-02", minutes: 90, correctAnswers: 18, wrongAnswers: 7 },
  { date: "2024-06-03", minutes: 150, correctAnswers: 45, wrongAnswers: 5 },
];

export default function CombinedStats() {
  const chartData = data.map((day) => ({
    date: format(new Date(day.date), "E", { locale: ja }),
    minutes: day.minutes,
    correct: day.correctAnswers,
    incorrect: day.wrongAnswers,
  }));

  return (
    <div className="p-8">
      {/* タイトル */}
      <h1 className="text-3xl font-bold mb-2">学習ダッシュボード</h1>
      <p className="text-gray-500 mb-8">あなたの学習進捗を可視化します</p>

      {/* カードのグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryData.map((item, index) => (
          <Card key={index} className="shadow-md rounded-lg p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <p className="text-gray-500 font-medium">{item.title}</p>
              {item.icon}
            </div>
            <div>
              <h2 className="text-4xl font-bold mt-2">{item.value}</h2>
              <p className={`mt-2 text-sm ${item.trendColor}`}>
                {item.trend === "up" && <TrendingUp className="inline w-4 h-4 mr-1" />}
                {item.description}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* 週間学習記録セクション */}
      <Card>
        <CardHeader>
          <CardTitle>週間学習記録</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={chartData}>
              <XAxis dataKey="date" stroke="#888888" />
              <YAxis yAxisId="time" stroke="#888888" tickFormatter={(value) => `${value}分`} />
              <YAxis yAxisId="answers" orientation="right" stroke="#888888" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="answers" dataKey="correct" fill="#22c55e" stackId="answers" />
              <Bar yAxisId="answers" dataKey="incorrect" fill="#ef4444" stackId="answers" />
              <Line yAxisId="time" type="monotone" dataKey="minutes" stroke="#2563eb" strokeWidth={3} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
