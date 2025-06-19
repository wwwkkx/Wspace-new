'use client'

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Mail, Lock, LogIn, UserPlus, ArrowLeft } from "lucide-react"
import { signIn } from "next-auth/react"
import { useLanguage, useTranslation } from "@/components/language-provider"
import { useRouter } from "next/navigation"

interface MobileAuthProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'login' | 'register'
}

const MobileAuth: React.FC<MobileAuthProps> = ({ isOpen, onClose, defaultTab = 'login' }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" })
  const [activeTab, setActiveTab] = useState(defaultTab)
  
  const { language } = useLanguage()
  const t = useTranslation()
  const router = useRouter()

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 使用NextAuth的credentials provider进行登录
      const result = await signIn('credentials', {
        email: loginForm.email,
        password: loginForm.password,
        redirect: false,
      })

      if (result?.ok) {
        // 关闭登录窗口
        onClose()
        
        // 强制刷新会话状态
        await fetch('/api/auth/session', { method: 'GET' })
        // 刷新页面以更新登录状态
        window.location.reload()
      } else {
        alert(result?.error || "登录失败")
      }
    } catch (error) {
      console.error("Login error:", error)
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

    try {
      // 先注册用户
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      })

      const data = await response.json()

      if (data.success) {
        // 注册成功后自动登录
        const result = await signIn('credentials', {
          email: registerForm.email,
          password: registerForm.password,
          redirect: false,
        })

        if (result?.ok) {
          // 关闭注册窗口
          onClose()
          
          // 强制刷新会话状态
          await fetch('/api/auth/session', { method: 'GET' })
          // 刷新页面以更新登录状态
          window.location.reload()
        } else {
          alert("注册成功但登录失败，请手动登录")
        }
      } else {
        alert(data.error || "注册失败")
      }
    } catch (error) {
      console.error("Registration error:", error)
      if (error instanceof Error) {
        alert(`注册失败: ${error.message}`)
      } else {
        alert("注册失败，请重试")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true)
    try {
      console.log(`移动端开始${provider}登录...`)
      // 使用当前页面作为回调URL，确保登录后回到手机端
      // 保留callbackUrl参数，因为社交登录需要重定向回应用
      await signIn(provider, { callbackUrl: window.location.href })
    } catch (error) {
      console.error(`移动端${provider}登录错误:`, error)
      // 尝试记录更详细的错误信息
      if (error instanceof Error) {
        console.error("错误详情:", error.message, error.stack)
      }
      alert(`${provider}登录失败，请重试`)
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-2xl bg-white dark:bg-gray-900 border-0 rounded-3xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        <CardHeader className="text-center bg-gradient-to-b from-white/50 to-transparent dark:from-gray-800/50 pb-6 pt-6 relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-4 h-8 w-8 p-0 rounded-full"
            onClick={onClose}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            Wspace
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300 text-xs font-medium">
            AI驱动的笔记和文档管理平台
          </p>
        </CardHeader>
        
        <CardContent className="px-6 pb-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-1 border-0">
              <TabsTrigger 
                value="login" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 transition-all duration-300 text-sm"
              >
                {t.login}
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 transition-all duration-300 text-sm"
              >
                {t.register}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile-login-email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t.email || "邮箱"}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="mobile-login-email"
                      type="email"
                      placeholder={t.enterEmail || "请输入邮箱"}
                      className="pl-10 h-12 rounded-xl border-0 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile-login-password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t.password || "密码"}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="mobile-login-password"
                      type="password"
                      placeholder={t.enterPassword || "请输入密码"}
                      className="pl-10 h-12 rounded-xl border-0 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 dark:from-blue-600 dark:to-purple-700 dark:hover:from-blue-700 dark:hover:to-purple-800 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 border-0" 
                  disabled={isLoading}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {isLoading ? (t.loggingIn || "登录中...") : t.login}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile-register-name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t.name || "姓名"}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="mobile-register-name"
                      type="text"
                      placeholder={t.enterName || "请输入姓名"}
                      className="pl-10 h-12 rounded-xl border-0 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile-register-email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t.email || "邮箱"}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="mobile-register-email"
                      type="email"
                      placeholder={t.enterEmail || "请输入邮箱"}
                      className="pl-10 h-12 rounded-xl border-0 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile-register-password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t.password || "密码"}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="mobile-register-password"
                      type="password"
                      placeholder={t.enterPassword || "请输入密码"}
                      className="pl-10 h-12 rounded-xl border-0 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 dark:from-green-600 dark:to-blue-700 dark:hover:from-green-700 dark:hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 border-0" 
                  disabled={isLoading}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isLoading ? (t.registering || "注册中...") : t.register}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default MobileAuth