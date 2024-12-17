'use client'

import { useState } from 'react'
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader , CardTitle} from "./ui/card";

import { Background } from './background'

export default function RegisterPage() {
  const [error, setError] = useState('')
  
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <Background />
      
      {/* Animated blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-[10%] top-0 h-[500px] w-[500px] animate-blob rounded-full bg-blue-300/30 mix-blend-multiply blur-3xl" />
        <div className="absolute left-[20%] top-[20%] h-[500px] w-[500px] animate-blob animation-delay-2000 rounded-full bg-green-300/30 mix-blend-multiply blur-3xl" />
        <div className="absolute right-[20%] top-[10%] h-[500px] w-[500px] animate-blob animation-delay-4000 rounded-full bg-indigo-300/30 mix-blend-multiply blur-3xl" />
        <div className="absolute bottom-[10%] right-[10%] h-[500px] w-[500px] animate-blob animation-delay-6000 rounded-full bg-purple-300/30 mix-blend-multiply blur-3xl" />
      </div>

      <div className="container relative flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-xl">
          <CardHeader className="space-y-6">
            <div className="flex justify-center">
              
            </div>
            <CardTitle className="text-center text-2xl font-bold">登録</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  メールアドレス
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="w-full"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="password">
                  パスワード
                </label>
                <Input
                  id="password"
                  type="password"
                  className="w-full"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="confirm-password">
                  パスワード確認
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  className="w-full"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">
                  {error}
                </p>
              )}

              <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-transform hover:scale-[1.02]">
                登録
              </Button>

              <div className="space-y-4 text-center">
                <p className="text-sm text-gray-500">または</p>
                <Button
                  variant="outline"
                  className="w-full border-2"
                >
                  LINEで登録
                </Button>
              </div>

              <p className="text-center text-sm text-gray-500">
                既にアカウントをお持ちですか？{' '}
                <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  ログイン
                </a>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

