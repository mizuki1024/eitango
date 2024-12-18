import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Background } from "./background";
import { BookOpen, HelpCircle, Link, LogOut, Star } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";



const levels = [
  { level: 1, title: "基礎", description: "日常生活で使う基本的な単語", progress: 30, wordCount: 2000 },
  { level: 2, title: "中級", description: "大学入試レベルの単語", progress: 0, wordCount: 2000 },
  { level: 3, title: "上級", description: "TOEFL・TOEIC対策の単語", progress: 0, wordCount: 2000 },
  { level: 4, title: "マスター", description: "ネイティブレベルの単語", progress: 0, wordCount: 2000 },
];

export default function WordMasterPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: number; email: string } | null>(null);



  // ページ読み込み時に認証状態を確認
  useEffect(() => {
    axios
      .get("http://localhost:3001/profile", { withCredentials: true }) // 認証状態確認リクエスト
      .then((response) => {
        setIsAuthenticated(true);
        setUser(response.data.user);
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  return (
    <div className="relative min-h-screen w-full pb-20">
      <Background />

      {/* ヘッダー */}
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="mb-2 text-4xl font-bold text-indigo-800">Word Master</h1>
          <p className="text-xl text-indigo-600">
            <Star className="inline-block h-5 w-5 text-yellow-500 mx-1" />
            めざせ習得8,000単語！
            <Star className="inline-block h-5 w-5 text-yellow-500 mx-1" />
          </p>
          <p className="text-lg text-gray-700">
            {isAuthenticated ? `こんにちは、${user?.email} さん` : "ログインしてください"}
          </p>
          <div>
            <p>
              {isAuthenticated
                ? `こんにちは、${user?.email} さん`
                : "ログインしてください"}
            </p>
          </div>
        </header>

        

        {/* レベルカード */}
        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {levels.map((level) => (
            <div key={level.level} className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-2xl font-bold mb-2 text-indigo-700">{level.title}</h2>
              <p className="mb-4 text-gray-600">{level.description}</p>
              <div className="relative h-4 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
                <div
                  className="absolute top-0 left-0 h-full bg-indigo-500"
                  style={{ width: `${level.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">進捗: {level.progress}%</p>
              <RouterLink
                to={`/level/${level.level}`}
                className="mt-4 inline-block px-4 py-2 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600"
              >
                このレベルを始める
              </RouterLink>
            </div>
          ))}
        </div>

        {/* ボタン */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span>ヘルプ</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            <RouterLink to="/links">リンク</RouterLink>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <RouterLink to="/combined-stats">間違えた単語</RouterLink>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            <RouterLink to="/logout">ログアウト</RouterLink>
          </Button>
        </div>

        {/* フッター */}
        <footer className="mt-12 text-center text-sm text-gray-600">
          <p>最終学習日：2024年11月8日</p>
          <p>© 2023 Word Master. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
