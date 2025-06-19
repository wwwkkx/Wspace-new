"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ArrowLeftIcon, BellIcon } from "lucide-react"
import { useLanguage, useTranslation } from "@/components/language-provider"

// 通知设置页面的翻译配置
const notificationsTranslations = {
  "zh-CN": {
    notificationSettings: "通知设置",
    configureNotifications: "配置如何接收通知。",
    emailNotifications: "电子邮件通知",
    emailNotificationsDesc: "接收有关账户活动的电子邮件",
    pushNotifications: "推送通知",
    pushNotificationsDesc: "接收浏览器推送通知",
    back: "返回"
  },
  "en-US": {
    notificationSettings: "Notification Settings",
    configureNotifications: "Configure how you receive notifications.",
    emailNotifications: "Email Notifications",
    emailNotificationsDesc: "Receive emails about account activity",
    pushNotifications: "Push Notifications",
    pushNotificationsDesc: "Receive browser push notifications",
    back: "Back"
  },
  "ja-JP": {
    notificationSettings: "通知設定",
    configureNotifications: "通知の受信方法を設定します。",
    emailNotifications: "メール通知",
    emailNotificationsDesc: "アカウントアクティビティに関するメールを受信する",
    pushNotifications: "プッシュ通知",
    pushNotificationsDesc: "ブラウザのプッシュ通知を受信する",
    back: "戻る"
  },
  "ko-KR": {
    notificationSettings: "알림 설정",
    configureNotifications: "알림을 받는 방법을 구성합니다.",
    emailNotifications: "이메일 알림",
    emailNotificationsDesc: "계정 활동에 대한 이메일 수신",
    pushNotifications: "푸시 알림",
    pushNotificationsDesc: "브라우저 푸시 알림 수신",
    back: "뒤로"
  }
}

export default function NotificationsPage() {
  const router = useRouter()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  
  const { language } = useLanguage()
  const t = useTranslation()
  
  // 获取通知设置页面特定的翻译
  const nt = notificationsTranslations[language as keyof typeof notificationsTranslations]
  
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
            <span>{nt.back}</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{nt.notificationSettings}</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{nt.notificationSettings}</CardTitle>
            <CardDescription>{nt.configureNotifications}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <BellIcon className="h-5 w-5" />
                <div className="space-y-0.5">
                  <Label>{nt.emailNotifications}</Label>
                  <p className="text-sm text-muted-foreground">{nt.emailNotificationsDesc}</p>
                </div>
              </div>
              <Switch 
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <BellIcon className="h-5 w-5" />
                <div className="space-y-0.5">
                  <Label>{nt.pushNotifications}</Label>
                  <p className="text-sm text-muted-foreground">{nt.pushNotificationsDesc}</p>
                </div>
              </div>
              <Switch 
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}