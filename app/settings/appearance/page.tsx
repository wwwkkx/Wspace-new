"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ArrowLeftIcon, MoonIcon, SunIcon, MonitorIcon, Loader2 } from "lucide-react"
import { useLanguage, useTranslation } from "@/components/language-provider"

// 外观设置页面的翻译配置
const appearanceTranslations = {
  "zh-CN": {
    appearanceSettings: "外观设置",
    customizeAppearance: "自定义应用的外观和主题。",
    theme: "主题",
    light: "浅色",
    dark: "深色",
    system: "系统",
    autoSave: "自动保存",
    autoSaveDesc: "自动保存您的更改",
    back: "返回"
  },
  "en-US": {
    appearanceSettings: "Appearance Settings",
    customizeAppearance: "Customize the appearance and theme of the application.",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    autoSave: "Auto Save",
    autoSaveDesc: "Automatically save your changes",
    back: "Back"
  },
  "ja-JP": {
    appearanceSettings: "外観設定",
    customizeAppearance: "アプリケーションの外観とテーマをカスタマイズします。",
    theme: "テーマ",
    light: "ライト",
    dark: "ダーク",
    system: "システム",
    autoSave: "自動保存",
    autoSaveDesc: "変更を自動的に保存する",
    back: "戻る"
  },
  "ko-KR": {
    appearanceSettings: "외관 설정",
    customizeAppearance: "애플리케이션의 외관과 테마를 사용자 지정합니다.",
    theme: "테마",
    light: "라이트",
    dark: "다크",
    system: "시스템",
    autoSave: "자동 저장",
    autoSaveDesc: "변경 사항을 자동으로 저장",
    back: "뒤로"
  }
}

export default function AppearancePage() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [autoSave, setAutoSave] = useState(true)
  
  const { language } = useLanguage()
  const t = useTranslation()
  
  // 获取外观设置页面特定的翻译
  const at = appearanceTranslations[language as keyof typeof appearanceTranslations]
  
  // 防止水合错误，确保组件只在客户端渲染
  useEffect(() => {
    setMounted(true)
  }, [])
  
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
          <h1 className="text-3xl font-bold tracking-tight">{at.appearanceSettings}</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{at.appearanceSettings}</CardTitle>
            <CardDescription>{at.customizeAppearance}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>{at.theme}</Label>
              <div className="grid grid-cols-3 gap-2">
                {mounted ? (
                  <>
                    <Button 
                      variant={theme === "light" ? "default" : "outline"} 
                      className="flex flex-col items-center justify-between gap-1 h-auto p-4"
                      onClick={() => setTheme("light")}
                    >
                      <SunIcon className="h-5 w-5" />
                      <span>{at.light}</span>
                    </Button>
                    <Button 
                      variant={theme === "dark" ? "default" : "outline"} 
                      className="flex flex-col items-center justify-between gap-1 h-auto p-4"
                      onClick={() => setTheme("dark")}
                    >
                      <MoonIcon className="h-5 w-5" />
                      <span>{at.dark}</span>
                    </Button>
                    <Button 
                      variant={theme === "system" ? "default" : "outline"} 
                      className="flex flex-col items-center justify-between gap-1 h-auto p-4"
                      onClick={() => setTheme("system")}
                    >
                      <MonitorIcon className="h-5 w-5" />
                      <span>{at.system}</span>
                    </Button>
                  </>
                ) : (
                  <div className="col-span-3 h-[72px] flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{at.autoSave}</Label>
                <p className="text-sm text-muted-foreground">{at.autoSaveDesc}</p>
              </div>
              <Switch 
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}