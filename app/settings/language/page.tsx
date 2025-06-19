"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeftIcon, GlobeIcon } from "lucide-react"
import { useLanguage, useTranslation } from "@/components/language-provider"

// 语言设置页面的翻译配置
const languageTranslations = {
  "zh-CN": {
    languageSettings: "语言设置",
    selectLanguage: "选择您偏好的语言。",
    saveLanguage: "保存语言设置",
    languageChanged: "已设置语言为简体中文",
    back: "返回"
  },
  "en-US": {
    languageSettings: "Language Settings",
    selectLanguage: "Select your preferred language.",
    saveLanguage: "Save Language Settings",
    languageChanged: "Language set to English",
    back: "Back"
  },
  "ja-JP": {
    languageSettings: "言語設定",
    selectLanguage: "希望する言語を選択してください。",
    saveLanguage: "言語設定を保存",
    languageChanged: "言語が日本語に設定されました",
    back: "戻る"
  },
  "ko-KR": {
    languageSettings: "언어 설정",
    selectLanguage: "선호하는 언어를 선택하세요.",
    saveLanguage: "언어 설정 저장",
    languageChanged: "언어가 한국어로 설정되었습니다",
    back: "뒤로"
  }
}

export default function LanguagePage() {
  const router = useRouter()
  
  // 使用全局语言上下文
  const { language, setLanguage: setGlobalLanguage } = useLanguage()
  const t = useTranslation()
  
  // 获取语言设置页面特定的翻译
  const lt = languageTranslations[language as keyof typeof languageTranslations]
  
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
            <span>{lt.back}</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{lt.languageSettings}</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{lt.languageSettings}</CardTitle>
            <CardDescription>{lt.selectLanguage}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup 
              value={language} 
              onValueChange={(value) => setGlobalLanguage(value as 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR')}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="zh-CN" id="zh-CN" className="peer sr-only" />
                <Label 
                  htmlFor="zh-CN" 
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <GlobeIcon className="mb-3 h-6 w-6" />
                  <span className="text-center">简体中文</span>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem value="en-US" id="en-US" className="peer sr-only" />
                <Label 
                  htmlFor="en-US" 
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <GlobeIcon className="mb-3 h-6 w-6" />
                  <span className="text-center">English (US)</span>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem value="ja-JP" id="ja-JP" className="peer sr-only" />
                <Label 
                  htmlFor="ja-JP" 
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <GlobeIcon className="mb-3 h-6 w-6" />
                  <span className="text-center">日本語</span>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem value="ko-KR" id="ko-KR" className="peer sr-only" />
                <Label 
                  htmlFor="ko-KR" 
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <GlobeIcon className="mb-3 h-6 w-6" />
                  <span className="text-center">한국어</span>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => {
                setGlobalLanguage(language);
                localStorage.setItem("language", language);
                alert(lt.languageChanged);
                // 不需要重新加载页面，因为语言上下文会自动更新UI
              }}
            >
              {lt.saveLanguage}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}