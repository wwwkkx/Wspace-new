"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { MessageSquare, BarChart3, Settings, Home } from "lucide-react"
import { useTranslation } from "./language-provider"
import { UserMenu } from "./user-menu"

export function Navigation() {
  const pathname = usePathname()
  const t = useTranslation()
  
  const navigation = [
    { name: t.home, href: "/", icon: Home },
    { name: t.dashboard, href: "/dashboard", icon: BarChart3 },
    { name: t.chat, href: "/chat", icon: MessageSquare },
    { name: t.settings, href: "/settings", icon: Settings },
  ]

  return (
    <nav className="bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 sticky top-0 z-50 w-full border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="font-bold text-xl text-gray-900">{t.appName || "智能笔记"}</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-blue-500 transition-colors duration-200 font-medium">
              {t.home || "首页"}
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-500 transition-colors duration-200 font-medium">
              {t.dashboard || "仪表盘"}
            </Link>
            <Link href="/chat" className="text-gray-600 hover:text-blue-500 transition-colors duration-200 font-medium">
              {t.chat || "聊天"}
            </Link>
            <Link href="/settings" className="text-gray-600 hover:text-blue-500 transition-colors duration-200 font-medium">
              {t.settings || "设置"}
            </Link>
          </div>

          <div className="flex items-center">
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  )
}
