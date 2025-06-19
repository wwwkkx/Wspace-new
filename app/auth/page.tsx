"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Mail, Lock, LogIn, UserPlus } from "lucide-react"
import { signIn } from "next-auth/react"
import { Header } from "@/components/header"
import { useLanguage, useTranslation } from "@/components/language-provider"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" })
  
  // 使用全局语言上下文
  const { language } = useLanguage()
  const t = useTranslation()
  
  useEffect(() => {
    // 检查URL参数，如果有tab=register，则切换到注册标签页
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get('tab') === 'register') {
      // 找到注册标签触发器并点击它
      setTimeout(() => {
        const registerTrigger = document.querySelector('[data-value="register"]')
        if (registerTrigger && registerTrigger instanceof HTMLElement) {
          registerTrigger.click()
        }
      }, 0)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    console.log("Attempting login with:", loginForm)

    try {
      // 使用NextAuth的credentials provider进行登录
      const result = await signIn('credentials', {
        email: loginForm.email,
        password: loginForm.password,
        redirect: false,
      })

      if (result?.ok) {
        // 强制刷新会话状态
        await fetch('/api/auth/session', { method: 'GET' })
        
        // 添加一个短暂的延迟，确保会话状态完全更新
        setTimeout(() => {
          // 登录成功后跳转到仪表盘
          window.location.href = "/dashboard"
        }, 500) // 500毫秒的延迟
      } else {
        alert(result?.error || "登录失败")
      }
    } catch (error) {
      console.error("Login error:", error)

      // 添加更详细的错误处理
      if (error instanceof Error) {
        alert(`登录失败: ${error.message}`)
      } else {
        alert("登录失败，请重试")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    console.log("Attempting registration with:", registerForm)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      })

      console.log("Registration response status:", response.status)

      const data = await response.json()
      console.log("Registration response data:", data)

      if (data.success) {
        // 使用NextAuth的credentials provider进行登录
        const result = await signIn('credentials', {
          email: registerForm.email,
          password: registerForm.password,
          redirect: false,
        })

        if (result?.ok) {
          // 强制刷新会话状态
          await fetch('/api/auth/session', { method: 'GET' })
          
          // 添加一个短暂的延迟，确保会话状态完全更新
          setTimeout(() => {
            // 登录成功后跳转到仪表盘
            window.location.href = "/dashboard"
          }, 500) // 500毫秒的延迟
        } else {
          alert(result?.error || "登录失败")
        }
      } else {
        alert(data.error || "注册失败")
      }
    } catch (error) {
      console.error("Registration error:", error)

      // 添加更详细的错误处理
      if (error instanceof Error) {
        alert(`注册失败: ${error.message}`)
      } else {
        alert("注册失败，请重试")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 社交登录处理函数
  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true)
    try {
      console.log(`开始${provider}登录...`)
      // 保留callbackUrl参数，因为社交登录需要重定向回应用
      await signIn(provider, { callbackUrl: "/dashboard" })
    } catch (error) {
      console.error(`${provider}登录错误:`, error)
      // 尝试记录更详细的错误信息
      if (error instanceof Error) {
        console.error("错误详情:", error.message, error.stack)
      }
      alert(`${provider}登录失败，请重试`)
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-0 rounded-3xl overflow-hidden">
        <CardHeader className="text-center bg-gradient-to-b from-white/50 to-transparent dark:from-gray-800/50 pb-8 pt-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">Wspace</CardTitle>
          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">AI驱动的笔记和文档管理平台</p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <Tabs defaultValue="login" className="space-y-6" id="auth-tabs">
            <div className="flex items-center justify-center mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100">{t.login}</h1>
            </div>
            
            <TabsList className="grid w-full grid-cols-2 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-1 border-0">
              <TabsTrigger value="login" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 transition-all duration-300">{t.login}</TabsTrigger>
              <TabsTrigger value="register" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 transition-all duration-300">{t.register}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="login-email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t.email || "邮箱"}</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder={t.enterEmail || "请输入邮箱"}
                      className="pl-12 h-14 rounded-2xl border-0 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="login-password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t.password || "密码"}</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder={t.enterPassword || "请输入密码"}
                      className="pl-12 h-14 rounded-2xl border-0 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 dark:from-blue-600 dark:to-purple-700 dark:hover:from-blue-700 dark:hover:to-purple-800 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 border-0" disabled={isLoading}>
                  <LogIn className="w-5 h-5 mr-2" />
                  {isLoading ? (t.loggingIn || "登录中...") : t.login}
                </Button>

                {/* 社交登录按钮 */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white/80 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400 font-medium">或使用以下方式登录</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialLogin("wechat")}
                      disabled={isLoading}
                      className="h-14 rounded-2xl border-0 bg-green-50/80 dark:bg-green-900/20 hover:bg-green-100/80 dark:hover:bg-green-900/40 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex flex-col items-center justify-center gap-1"
                    >
                      <svg viewBox="0 0 24 24" className="w-6 h-6">
                        <path
                          fill="#07C160"
                          d="M12 2C6.48 2 2 6.48 2 12c0 2.21.72 4.25 1.94 5.9L2 22l4.1-1.94C7.75 21.28 9.79 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm-1.5 7.5c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm3 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"
                        />
                      </svg>
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">{t.wechat || "微信"}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialLogin("instagram")}
                      disabled={isLoading}
                      className="h-14 rounded-2xl border-0 bg-pink-50/80 dark:bg-pink-900/20 hover:bg-pink-100/80 dark:hover:bg-pink-900/40 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex flex-col items-center justify-center gap-1"
                    >
                      <svg viewBox="0 0 24 24" className="w-6 h-6">
                        <defs>
                          <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f09433" />
                            <stop offset="25%" stopColor="#e6683c" />
                            <stop offset="50%" stopColor="#dc2743" />
                            <stop offset="75%" stopColor="#cc2366" />
                            <stop offset="100%" stopColor="#bc1888" />
                          </linearGradient>
                        </defs>
                        <path fill="url(#instagram-gradient)" d="M12,2.162c3.204,0,3.584,0.012,4.849,0.07c1.308,0.06,2.655,0.358,3.608,1.311c0.962,0.962,1.251,2.296,1.311,3.608 c0.058,1.265,0.07,1.645,0.07,4.849c0,3.204-0.012,3.584-0.07,4.849c-0.059,1.301-0.364,2.661-1.311,3.608 c-0.962,0.962-2.295,1.251-3.608,1.311c-1.265,0.058-1.645,0.07-4.849,0.07s-3.584-0.012-4.849-0.07 c-1.291-0.059-2.669-0.371-3.608-1.311c-0.957-0.957-1.251-2.304-1.311-3.608c-0.058-1.265-0.07-1.645-0.07-4.849 c0-3.204,0.012-3.584,0.07-4.849c0.059-1.296,0.367-2.664,1.311-3.608c0.96-0.96,2.299-1.251,3.608-1.311 C8.416,2.174,8.796,2.162,12,2.162 M12,0C8.741,0,8.332,0.014,7.052,0.072C5.197,0.157,3.355,0.673,2.014,2.014 C0.668,3.36,0.157,5.198,0.072,7.052C0.014,8.332,0,8.741,0,12c0,3.259,0.014,3.668,0.072,4.948c0.085,1.853,0.603,3.7,1.942,5.038 c1.345,1.345,3.186,1.857,5.038,1.942C8.332,23.986,8.741,24,12,24c3.259,0,3.668-0.014,4.948-0.072 c1.854-0.085,3.698-0.602,5.038-1.942c1.347-1.347,1.857-3.184,1.942-5.038C23.986,15.668,24,15.259,24,12 c0-3.259-0.014-3.668-0.072-4.948c-0.085-1.855-0.602-3.698-1.942-5.038c-1.343-1.343-3.189-1.858-5.038-1.942 C15.668,0.014,15.259,0,12,0z" />
                        <path fill="url(#instagram-gradient)" d="M12,5.838c-3.403,0-6.162,2.759-6.162,6.162c0,3.403,2.759,6.162,6.162,6.162s6.162-2.759,6.162-6.162 C18.162,8.597,15.403,5.838,12,5.838z M12,16c-2.209,0-4-1.791-4-4s1.791-4,4-4s4,1.791,4,4S14.209,16,12,16z" />
                        <circle fill="url(#instagram-gradient)" cx="18.406" cy="5.594" r="1.44" />
                      </svg>
                      <span className="text-xs font-medium text-pink-600 dark:text-pink-400">{t.instagram || "Instagram"}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialLogin("google")}
                      disabled={isLoading}
                      className="h-14 rounded-2xl border-0 bg-blue-50/80 dark:bg-blue-900/20 hover:bg-blue-100/80 dark:hover:bg-blue-900/40 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex flex-col items-center justify-center gap-1"
                    >
                      <svg viewBox="0 0 24 24" className="w-6 h-6">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{t.google || "Google"}</span>
                    </Button>
                  </div>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.name || "姓名"}</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="register-name"
                      type="text"
                      placeholder={t.enterName || "请输入姓名"}
                      className="h-12 pl-12 rounded-xl border-0 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.email || "邮箱"}</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder={t.enterEmail || "请输入邮箱"}
                      className="h-12 pl-12 rounded-xl border-0 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.password || "密码"}</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder={t.enterPasswordMin6 || "请输入密码（至少6位）"}
                      className="h-12 pl-12 rounded-xl border-0 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" disabled={isLoading}>
                  <UserPlus className="w-5 h-5 mr-2" />
                  {isLoading ? (t.registering || "注册中...") : t.register}
                </Button>

                {/* 社交登录按钮 */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium">{t.orRegisterWith || "或使用以下方式注册"}</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialLogin("wechat")}
                      disabled={isLoading}
                      className="h-14 rounded-2xl border-0 bg-green-50/80 dark:bg-green-900/20 hover:bg-green-100/80 dark:hover:bg-green-900/40 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex flex-col items-center justify-center gap-1"
                    >
                      <svg viewBox="0 0 24 24" className="w-6 h-6">
                        <path
                          fill="#07C160"
                          d="M12 2C6.48 2 2 6.48 2 12c0 2.21.72 4.25 1.94 5.9L2 22l4.1-1.94C7.75 21.28 9.79 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm-1.5 7.5c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm3 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"
                        />
                      </svg>
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">{t.wechat || "微信"}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialLogin("instagram")}
                      disabled={isLoading}
                      className="h-14 rounded-2xl border-0 bg-pink-50/80 dark:bg-pink-900/20 hover:bg-pink-100/80 dark:hover:bg-pink-900/40 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex flex-col items-center justify-center gap-1"
                    >
                      <svg viewBox="0 0 24 24" className="w-6 h-6">
                        <defs>
                          <linearGradient id="instagram-gradient-3" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f09433" />
                            <stop offset="25%" stopColor="#e6683c" />
                            <stop offset="50%" stopColor="#dc2743" />
                            <stop offset="75%" stopColor="#cc2366" />
                            <stop offset="100%" stopColor="#bc1888" />
                          </linearGradient>
                        </defs>
                        <path fill="url(#instagram-gradient-3)" d="M12,2.162c3.204,0,3.584,0.012,4.849,0.07c1.308,0.06,2.655,0.358,3.608,1.311c0.962,0.962,1.251,2.296,1.311,3.608 c0.058,1.265,0.07,1.645,0.07,4.849c0,3.204-0.012,3.584-0.07,4.849c-0.059,1.301-0.364,2.661-1.311,3.608 c-0.962,0.962-2.295,1.251-3.608,1.311c-1.265,0.058-1.645,0.07-4.849,0.07s-3.584-0.012-4.849-0.07 c-1.291-0.059-2.669-0.371-3.608-1.311c-0.957-0.957-1.251-2.304-1.311-3.608c-0.058-1.265-0.07-1.645-0.07-4.849 c0-3.204,0.012-3.584,0.07-4.849c0.059-1.296,0.367-2.664,1.311-3.608c0.96-0.96,2.299-1.251,3.608-1.311 C8.416,2.174,8.796,2.162,12,2.162 M12,0C8.741,0,8.332,0.014,7.052,0.072C5.197,0.157,3.355,0.673,2.014,2.014 C0.668,3.36,0.157,5.198,0.072,7.052C0.014,8.332,0,8.741,0,12c0,3.259,0.014,3.668,0.072,4.948c0.085,1.853,0.603,3.7,1.942,5.038 c1.345,1.345,3.186,1.857,5.038,1.942C8.332,23.986,8.741,24,12,24c3.259,0,3.668-0.014,4.948-0.072 c1.854-0.085,3.698-0.602,5.038-1.942c1.347-1.347,1.857-3.184,1.942-5.038C23.986,15.668,24,15.259,24,12 c0-3.259-0.014-3.668-0.072-4.948c-0.085-1.855-0.602-3.698-1.942-5.038c-1.343-1.343-3.189-1.858-5.038-1.942 C15.668,0.014,15.259,0,12,0z" />
                        <path fill="url(#instagram-gradient-3)" d="M12,5.838c-3.403,0-6.162,2.759-6.162,6.162c0,3.403,2.759,6.162,6.162,6.162s6.162-2.759,6.162-6.162 C18.162,8.597,15.403,5.838,12,5.838z M12,16c-2.209,0-4-1.791-4-4s1.791-4,4-4s4,1.791,4,4S14.209,16,12,16z" />
                        <circle fill="url(#instagram-gradient-3)" cx="18.406" cy="5.594" r="1.44" />
                      </svg>
                      <span className="text-xs font-medium text-pink-600 dark:text-pink-400">{t.instagram || "Instagram"}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialLogin("google")}
                      disabled={isLoading}
                      className="h-14 rounded-2xl border-0 bg-blue-50/80 dark:bg-blue-900/20 hover:bg-blue-100/80 dark:hover:bg-blue-900/40 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex flex-col items-center justify-center gap-1"
                    >
                      <svg viewBox="0 0 24 24" className="w-6 h-6">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{t.google || "Google"}</span>
                    </Button>
                  </div>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
    </>
  )
}
