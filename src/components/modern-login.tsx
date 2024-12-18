import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader } from "./ui/card";
import { LineChartIcon as LineIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 通常ログイン処理
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${REACT_APP_API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "ログインに失敗しました。");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/word-master");
    } catch (error: any) {
      setError("ログインに失敗しました。メールアドレスまたはパスワードを確認してください。");
    } finally {
      setLoading(false);
    }
  };

  // LINEログイン処理
  const handleLineLogin = () => {
    const clientId = "2006672186";
    const redirectUri = "http://localhost:3001/api/auth/line/callback";
    const state = "random_csrf_protection_string";
    const lineLoginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=profile%20openid`;

    window.location.href = lineLoginUrl;
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-white">
      {/* Animated background */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-white to-purple-100 animate-gradient-x" />
        <div className="absolute inset-0 opacity-50">
          <div className="absolute w-[500px] h-[500px] rounded-full bg-purple-200/50 blur-3xl -top-48 -left-24 animate-blob" />
          <div className="absolute w-[400px] h-[400px] rounded-full bg-blue-200/50 blur-3xl top-48 -right-24 animate-blob animation-delay-2000" />
          <div className="absolute w-[300px] h-[300px] rounded-full bg-pink-200/50 blur-3xl -bottom-32 left-48 animate-blob animation-delay-4000" />
        </div>
      </div>

      <Card className="w-full max-w-md mx-4 shadow-xl relative bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-3 items-center pb-6">
          {/* Logo */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <div className="text-2xl font-bold text-white">A</div>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">ログイン</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="email">
                メールアドレス
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="password">
                パスワード
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-300"
              disabled={loading}
            >
              {loading ? "ログイン中..." : "ログイン"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">または</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full flex items-center justify-center"
            onClick={handleLineLogin}
          >
            <LineIcon className="mr-2 h-4 w-4" />
            LINEでログイン
          </Button>

          <p className="text-center text-sm text-gray-600 mt-6">
            アカウントが必要ですか？{" "}
            <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              登録
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
