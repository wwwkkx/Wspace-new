"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
// 移除 MobileHeader 引用
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRightIcon, PaletteIcon, UserIcon, BellIcon, ShieldIcon, GlobeIcon } from "lucide-react"
import { useLanguage, useTranslation } from "@/components/language-provider"
// 移除 useIsMobile 引用

// 设置页面的翻译配置
const settingsTranslations = {
  "zh-CN": {
    settingsTitle: "设置",
    appearance: "外观",
    appearanceDesc: "自定义应用的外观和主题",
    account: "账户",
    accountDesc: "管理您的账户信息和设置",
    notifications: "通知",
    notificationsDesc: "配置如何接收通知",
    privacy: "隐私与安全",
    privacyDesc: "管理您的隐私和安全设置",
    language: "语言",
    languageDesc: "选择您偏好的语言"
  },
  "en-US": {
    settingsTitle: "Settings",
    appearance: "Appearance",
    appearanceDesc: "Customize the appearance and theme of the application",
    account: "Account",
    accountDesc: "Manage your account information and settings",
    notifications: "Notifications",
    notificationsDesc: "Configure how you receive notifications",
    privacy: "Privacy & Security",
    privacyDesc: "Manage your privacy and security settings",
    language: "Language",
    languageDesc: "Select your preferred language"
  },
  "ja-JP": {
    settingsTitle: "設定",
    appearance: "外観",
    appearanceDesc: "アプリケーションの外観とテーマをカスタマイズ",
    account: "アカウント",
    accountDesc: "アカウント情報と設定を管理",
    notifications: "通知",
    notificationsDesc: "通知の受信方法を設定",
    privacy: "プライバシーとセキュリティ",
    privacyDesc: "プライバシーとセキュリティの設定を管理",
    language: "言語",
    languageDesc: "希望する言語を選択"
  },
  "ko-KR": {
    settingsTitle: "설정",
    appearance: "외관",
    appearanceDesc: "애플리케이션의 외관과 테마를 사용자 지정",
    account: "계정",
    accountDesc: "계정 정보 및 설정을 관리",
    notifications: "알림",
    notificationsDesc: "알림을 받는 방법을 구성",
    privacy: "개인 정보 및 보안",
    privacyDesc: "개인 정보 및 보안 설정을 관리",
    language: "언어",
    languageDesc: "선호하는 언어를 선택"
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const t = useTranslation()
  const { language } = useLanguage()
  // 移除 isMobile 状态
  
  // 获取设置页面特定的翻译
  const st = settingsTranslations[language as keyof typeof settingsTranslations]
  
  // 设置项目配置
  const settingsItems = [
    {
      id: 'appearance',
      title: st.appearance,
      description: st.appearanceDesc,
      icon: PaletteIcon,
      href: '/settings/appearance'
    },
    {
      id: 'account',
      title: st.account,
      description: st.accountDesc,
      icon: UserIcon,
      href: '/settings/account'
    },
    {
      id: 'notifications',
      title: st.notifications,
      description: st.notificationsDesc,
      icon: BellIcon,
      href: '/settings/notifications'
    },
    {
      id: 'privacy',
      title: st.privacy,
      description: st.privacyDesc,
      icon: ShieldIcon,
      href: '/settings/privacy'
    },
    {
      id: 'language',
      title: st.language,
      description: st.languageDesc,
      icon: GlobeIcon,
      href: '/settings/language'
    }
  ]
  
  return (
    <>
      <Header />
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{st.settingsTitle}</h1>
        </div>
        
        <div className="space-y-4">
          {settingsItems.map((item) => {
            const IconComponent = item.icon
            return (
              <Card 
                key={item.id} 
                className="cursor-pointer rounded-xl border border-gray-200/50 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-sm hover:shadow-md hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 hover:scale-[1.02]"
                onClick={() => router.push(item.href)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl shadow-sm">
                        <IconComponent className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</CardTitle>
                        <CardDescription className="mt-1 text-gray-500 dark:text-gray-400">{item.description}</CardDescription>
                      </div>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>
    </>
  )
}