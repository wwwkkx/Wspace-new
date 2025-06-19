'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useTranslation, useLanguage } from '@/components/language-provider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft,
  PaletteIcon,
  UserIcon,
  BellIcon,
  ShieldIcon,
  GlobeIcon,
  ChevronRight,
  LogOut
} from 'lucide-react';

// 导入子页面组件
import MobileAppearanceSettings from './settings-appearance';
import MobileAccountSettings from './settings-account';
import MobileNotificationSettings from './settings-notifications';
import MobilePrivacySettings from './settings-privacy';
import MobileLanguageSettings from './settings-language';
import MobileAuth from './auth';

// 手机端设置页面的翻译配置
const mobileSettingsTranslations = {
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
    languageDesc: "选择您偏好的语言",
    logout: "退出登录",
    notLoggedIn: "未登录用户",
    clickToLogin: "点击登录"
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
    languageDesc: "Choose your preferred language",
    logout: "Sign Out",
    notLoggedIn: "Not Logged In",
    clickToLogin: "Click to Login"
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
    privacyDesc: "プライバシーとセキュリティ設定を管理",
    language: "言語",
    languageDesc: "お好みの言語を選択",
    logout: "ログアウト",
    notLoggedIn: "未ログイン",
    clickToLogin: "ログインをクリック"
  }
};

interface MobileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
}

interface SettingItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  hasArrow: boolean;
}

const MobileSettings: React.FC<MobileSettingsProps> = ({ isOpen, onClose, onBack }) => {
  const { data: session } = useSession();
  const { language } = useLanguage();
  const { translations } = useTranslation();
  const [currentSubPage, setCurrentSubPage] = useState<string | null>(null);
  const [showMobileAuth, setShowMobileAuth] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  // 获取当前语言的翻译
  const st = mobileSettingsTranslations[language as keyof typeof mobileSettingsTranslations] || mobileSettingsTranslations["zh-CN"];

  const settingItems: SettingItem[] = [
    {
      id: 'appearance',
      title: st.appearance,
      description: st.appearanceDesc,
      icon: PaletteIcon,
      hasArrow: true
    },
    {
      id: 'account',
      title: st.account,
      description: st.accountDesc,
      icon: UserIcon,
      hasArrow: true
    },
    {
      id: 'notifications',
      title: st.notifications,
      description: st.notificationsDesc,
      icon: BellIcon,
      hasArrow: true
    },
    {
      id: 'privacy',
      title: st.privacy,
      description: st.privacyDesc,
      icon: ShieldIcon,
      hasArrow: true
    },
    {
      id: 'language',
      title: st.language,
      description: st.languageDesc,
      icon: GlobeIcon,
      hasArrow: true
    }
  ];

  const handleSettingClick = (settingId: string) => {
    setCurrentSubPage(settingId);
  };

  const handleLogout = async () => {
    try {
      console.log("移动端开始退出登录...")
      // 修改退出登录方式，不使用callbackUrl参数
      await signOut({ redirect: false })
      console.log("移动端退出登录成功，手动重定向到/")
      // 成功退出后手动重定向
      window.location.href = "/"
    } catch (error) {
      console.error("移动端退出登录错误:", error)
      // 尝试记录更详细的错误信息
      if (error instanceof Error) {
        console.error("错误详情:", error.message, error.stack)
      }
      // 即使出错也尝试重定向到首页
      window.location.href = "/"
    }
  };

  const handleBackToMain = () => {
    setCurrentSubPage(null);
  };

  if (!isOpen) return null;

  // 如果有子页面打开，渲染对应的子页面
  if (currentSubPage) {
    return (
      <>
        <MobileAppearanceSettings 
          isOpen={currentSubPage === 'appearance'} 
          onBack={handleBackToMain} 
        />
        <MobileAccountSettings 
          isOpen={currentSubPage === 'account'} 
          onBack={handleBackToMain} 
        />
        <MobileNotificationSettings 
          isOpen={currentSubPage === 'notifications'} 
          onBack={handleBackToMain} 
        />
        <MobilePrivacySettings 
          isOpen={currentSubPage === 'privacy'} 
          onBack={handleBackToMain} 
        />
        <MobileLanguageSettings 
          isOpen={currentSubPage === 'language'} 
          onBack={handleBackToMain} 
        />
      </>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 z-50 flex flex-col">
      {/* 头部 */}
      <div className="flex items-center p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack || onClose}
          className="mr-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{st.settingsTitle}</h1>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* 用户信息卡片 */}
        <Card 
          className={`rounded-xl border border-gray-200/50 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 ${
            !session?.user ? 'cursor-pointer hover:scale-[1.02]' : ''
          }`}
          onClick={!session?.user ? () => {
            setAuthTab('login');
            setShowMobileAuth(true);
          } : undefined}
        >
          <CardHeader className="p-6">
            <div className="flex items-center space-x-5">
              <Avatar className="h-16 w-16 border-4 border-white dark:border-gray-700 shadow-lg">
                <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                <AvatarFallback className={session?.user ? "bg-blue-500 text-white text-2xl font-semibold" : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-2xl font-semibold"}>
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : '?'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {session?.user?.name || st.notLoggedIn}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {session?.user?.email || ''}
                </p>
                {!session?.user && (
                  <p className="text-sm text-blue-500 dark:text-blue-400 mt-1">{st.clickToLogin || '点击登录'}</p>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 设置选项列表 */}
        <div className="space-y-4">
          {settingItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Card 
                key={item.id} 
                className="cursor-pointer rounded-xl border border-gray-200/50 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-sm hover:shadow-md hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 hover:scale-[1.02]"
                onClick={() => handleSettingClick(item.id)}
              >
                <CardHeader className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-5">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl shadow-sm">
                        <IconComponent className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</CardTitle>
                        <CardDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.description}</CardDescription>
                      </div>
                    </div>
                    {item.hasArrow && (
                      <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* 退出登录按钮 */}
        {session?.user && (
          <Card className="rounded-xl border border-red-200/50 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <CardHeader className="p-5">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-0 rounded-xl transition-colors"
                onClick={handleLogout}
              >
                <div className="flex items-center space-x-5 w-full">
                  <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-xl shadow-sm">
                    <LogOut className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-lg">{st.logout}</div>
                  </div>
                </div>
              </Button>
            </CardHeader>
          </Card>
        )}
      </div>
      
      <MobileAuth
        isOpen={showMobileAuth}
        onClose={() => setShowMobileAuth(false)}
        defaultTab={authTab}
      />
    </div>
  );
};

export default MobileSettings;