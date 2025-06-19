"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useLanguage, useTranslation } from "@/components/language-provider"

export default function Loading() {
  const { language } = useLanguage();
  const t = useTranslation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">{t.loading || "加载中..."}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t.preparingPage || "请稍候，正在为您准备页面"}</p>
        </CardContent>
      </Card>
    </div>
  )
}
