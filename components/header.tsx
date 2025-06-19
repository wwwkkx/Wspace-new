"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { MessageSquare, BarChart3, Settings, Home } from "lucide-react"
import { UserMenu } from "./user-menu"
import { useTranslation } from "./language-provider"

export function Header() {
  const pathname = usePathname()
  const t = useTranslation()
  
  const navigation = [
    { name: t.home, href: "/", icon: Home },
    { name: t.dashboard, href: "/dashboard", icon: BarChart3 },
    { name: t.chat, href: "/chat", icon: MessageSquare },
    { name: t.settings, href: "/settings", icon: Settings },
  ]

  return (
    <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-900/80 shadow-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white transition-colors duration-200">Wspace</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200",
                    pathname === item.href
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          <div className="flex items-center">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
}