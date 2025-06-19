"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { ArrowLeftIcon, UserIcon, ShieldIcon } from "lucide-react"
import { useLanguage, useTranslation } from "@/components/language-provider"

// 隐私与安全设置页面的翻译配置
const privacyTranslations = {
  "zh-CN": {
    privacySettings: "隐私与安全",
    managePrivacy: "管理您的隐私和安全设置。",
    profileVisibility: "个人资料可见性",
    profileVisibilityDesc: "控制谁可以查看您的个人资料",
    public: "公开",
    private: "私密",
    twoFactor: "双因素认证",
    twoFactorDesc: "增强账户安全性",
    setup: "设置",
    back: "返回"
  },
  "en-US": {
    privacySettings: "Privacy & Security",
    managePrivacy: "Manage your privacy and security settings.",
    profileVisibility: "Profile Visibility",
    profileVisibilityDesc: "Control who can view your profile",
    public: "Public",
    private: "Private",
    twoFactor: "Two-Factor Authentication",
    twoFactorDesc: "Enhance account security",
    setup: "Setup",
    back: "Back"
  },
  "ja-JP": {
    privacySettings: "プライバシーとセキュリティ",
    managePrivacy: "プライバシーとセキュリティの設定を管理します。",
    profileVisibility: "プロフィールの可視性",
    profileVisibilityDesc: "プロフィールを閲覧できる人を制御する",
    public: "公開",
    private: "非公開",
    twoFactor: "二要素認証",
    twoFactorDesc: "アカウントセキュリティを強化する",
    setup: "設定",
    back: "戻る"
  },
  "ko-KR": {
    privacySettings: "개인 정보 및 보안",
    managePrivacy: "개인 정보 및 보안 설정을 관리합니다.",
    profileVisibility: "프로필 가시성",
    profileVisibilityDesc: "프로필을 볼 수 있는 사람 제어",
    public: "공개",
    private: "비공개",
    twoFactor: "이중 인증",
    twoFactorDesc: "계정 보안 강화",
    setup: "설정",
    back: "뒤로"
  }
}

export default function PrivacyPage() {
  const router = useRouter()
  
  const { language } = useLanguage()
  const t = useTranslation()
  
  // 获取隐私与安全设置页面特定的翻译
  const pt = privacyTranslations[language as keyof typeof privacyTranslations]
  
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
            <span>{pt.back}</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{pt.privacySettings}</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{pt.privacySettings}</CardTitle>
            <CardDescription>{pt.managePrivacy}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <UserIcon className="h-5 w-5" />
                <div className="space-y-0.5">
                  <Label>{pt.profileVisibility}</Label>
                  <p className="text-sm text-muted-foreground">{pt.profileVisibilityDesc}</p>
                </div>
              </div>
              <RadioGroup defaultValue="private" className="flex space-x-4">
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public">{pt.public}</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private">{pt.private}</Label>
                </div>
              </RadioGroup>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <ShieldIcon className="h-5 w-5" />
                <div className="space-y-0.5">
                  <Label>{pt.twoFactor}</Label>
                  <p className="text-sm text-muted-foreground">{pt.twoFactorDesc}</p>
                </div>
              </div>
              <Button variant="outline">{pt.setup}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}