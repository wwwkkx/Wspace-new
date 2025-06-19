"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeftIcon, UserIcon, LogInIcon, UserPlusIcon } from "lucide-react"
import { useLanguage, useTranslation } from "@/components/language-provider"
import { NotionSetup } from "@/components/notion-setup"

// 账户设置页面的翻译配置
const accountTranslations = {
  "zh-CN": {
    accountInfo: "账户信息",
    manageAccount: "管理您的账户信息和设置。",
    name: "姓名",
    email: "邮箱",
    logout: "退出登录",
    back: "返回",
    notLoggedIn: "您尚未登录",
    pleaseLogin: "请登录以查看和管理您的账户信息。",
    login: "登录",
    register: "注册",
    loginToAccount: "登录到您的账户",
    createAccount: "创建新账户"
  },
  "en-US": {
    accountInfo: "Account Information",
    manageAccount: "Manage your account information and settings.",
    name: "Name",
    email: "Email",
    logout: "Logout",
    back: "Back",
    notLoggedIn: "You are not logged in",
    pleaseLogin: "Please log in to view and manage your account information.",
    login: "Login",
    register: "Register",
    loginToAccount: "Login to your account",
    createAccount: "Create new account"
  },
  "ja-JP": {
    accountInfo: "アカウント情報",
    manageAccount: "アカウント情報と設定を管理します。",
    name: "名前",
    email: "メール",
    logout: "ログアウト",
    back: "戻る",
    notLoggedIn: "ログインしていません",
    pleaseLogin: "アカウント情報を表示・管理するにはログインしてください。",
    login: "ログイン",
    register: "登録",
    loginToAccount: "アカウントにログイン",
    createAccount: "新しいアカウントを作成"
  },
  "ko-KR": {
    accountInfo: "계정 정보",
    manageAccount: "계정 정보 및 설정을 관리합니다.",
    name: "이름",
    email: "이메일",
    logout: "로그아웃",
    back: "뒤로",
    notLoggedIn: "로그인하지 않았습니다",
    pleaseLogin: "계정 정보를 보고 관리하려면 로그인하세요.",
    login: "로그인",
    register: "등록",
    loginToAccount: "계정에 로그인",
    createAccount: "새 계정 만들기"
  }
}

export default function AccountPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()
  
  const { language } = useLanguage()
  const t = useTranslation()
  
  // 获取账户设置页面特定的翻译
  const at = accountTranslations[language as keyof typeof accountTranslations]
  
  // 防止水合错误，确保组件只在客户端渲染
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      console.log("开始退出登录...")
      // 修改退出登录方式，不使用callbackUrl参数
      await signOut({ redirect: false })
      console.log("退出登录成功，手动重定向到/auth")
      // 成功退出后手动重定向
      window.location.href = "/auth"
    } catch (error) {
      console.error("退出登录错误:", error)
      // 尝试记录更详细的错误信息
      if (error instanceof Error) {
        console.error("错误详情:", error.message, error.stack)
      }
      // 即使出错也尝试重定向到登录页面
      window.location.href = "/auth"
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <>
      <Header />
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>{at.back}</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{at.accountInfo}</h1>
        </div>
        
        {!session?.user ? (
          // 未登录状态 - 显示登录注册选项
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5" />
                <span>{at.notLoggedIn}</span>
              </CardTitle>
              <CardDescription>{at.pleaseLogin}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  className="flex items-center space-x-2"
                  onClick={() => router.push("/auth")}
                >
                  <LogInIcon className="h-4 w-4" />
                  <span>{at.loginToAccount}</span>
                </Button>
                <Button 
                  variant="outline"
                  className="flex items-center space-x-2"
                  onClick={() => router.push("/auth?tab=register")}
                >
                  <UserPlusIcon className="h-4 w-4" />
                  <span>{at.createAccount}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // 已登录状态 - 显示账户信息
          <>
            <Card>
              <CardHeader>
                <CardTitle>{at.accountInfo}</CardTitle>
                <CardDescription>{at.manageAccount}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>{at.name}</Label>
                  <Input value={session.user.name || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label>{at.email}</Label>
                  <Input value={session.user.email || ""} disabled />
                </div>
                <Separator />
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  disabled={isLoading}
                >
                  {isLoading ? "..." : at.logout}
                </Button>
              </CardContent>
            </Card>
            
            {session.user.id && (
              <NotionSetup userId={session.user.id} />
            )}
          </>
        )}
      </div>
    </>
  )
}