"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { useTranslation } from "./language-provider"

interface MobileHeaderProps {
  title: string
  showBackButton?: boolean
}

export function MobileHeader({ title, showBackButton = true }: MobileHeaderProps) {
  const router = useRouter()
  const t = useTranslation()

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b sticky top-0 z-10">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center">
          {showBackButton && (
            <button
              onClick={() => router.back()}
              className="mr-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={t.back || "返回"}
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>

        </div>
      </div>
    </header>
  )
}