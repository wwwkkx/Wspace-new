"use client"

import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, LogOut, Settings } from "lucide-react"
import { useTranslation } from "./language-provider"

export function UserMenu() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslation()

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

  // 导航到设置页面
  const navigateToSettings = () => {
    router.push('/settings')
  }
  
  // 如果用户未登录，显示默认头像并导航到设置页面
  if (!session?.user) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full" onClick={navigateToSettings}>
        <Avatar>
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </Button>
    )
  }

  const userInitials = session.user.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-2xl hover:bg-gray-100 transition-colors duration-200">
          <Avatar className="h-9 w-9">
            <AvatarImage src={session.user.image || ""} alt={session.user.name || "用户"} className="rounded-2xl" />
            <AvatarFallback className="rounded-2xl bg-blue-100 text-blue-600 font-semibold">{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 rounded-2xl border-gray-200/50 shadow-lg bg-white/95 backdrop-blur-md" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-4">
          <div className="flex flex-col space-y-1 leading-none">
            {session.user.name && <p className="text-sm font-semibold leading-none text-gray-900">{session.user.name}</p>}
            {session.user.email && (
              <p className="w-[200px] truncate text-xs leading-none text-gray-500">{session.user.email}</p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator className="bg-gray-200/50" />
        <DropdownMenuItem asChild className="rounded-xl mx-2 my-1 hover:bg-blue-50 transition-colors duration-200">
          <a href="/dashboard" className="flex w-full cursor-pointer items-center px-3 py-2">
            <User className="mr-3 h-4 w-4 text-blue-500" />
            <span className="text-gray-700 font-medium">仪表盘</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-xl mx-2 my-1 hover:bg-blue-50 transition-colors duration-200">
          <a href="/settings" className="flex w-full cursor-pointer items-center px-3 py-2">
            <Settings className="mr-3 h-4 w-4 text-blue-500" />
            <span className="text-gray-700 font-medium">设置</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-200/50" />
        <DropdownMenuItem
          className="rounded-xl mx-2 my-1 hover:bg-red-50 transition-colors duration-200 flex cursor-pointer items-center text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
          disabled={isLoading}
          onSelect={(event) => {
            event.preventDefault()
            handleSignOut()
          }}
        >
          <div className="flex items-center px-3 py-2">
            <LogOut className="mr-3 h-4 w-4 text-red-500" />
            <span className="text-gray-700 font-medium">{isLoading ? "退出中..." : "退出登录"}</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}