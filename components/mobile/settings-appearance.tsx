'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/components/language-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, MoonIcon, SunIcon, MonitorIcon, Loader2 } from 'lucide-react';

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
};

interface MobileAppearanceSettingsProps {
  isOpen: boolean;
  onBack: () => void;
}

const MobileAppearanceSettings: React.FC<MobileAppearanceSettingsProps> = ({ isOpen, onBack }) => {
  const { theme, setTheme } = useTheme();
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  // 获取外观设置页面特定的翻译
  const at = appearanceTranslations[language as keyof typeof appearanceTranslations];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const themeOptions = [
    {
      value: 'light',
      label: at.light,
      icon: SunIcon
    },
    {
      value: 'dark', 
      label: at.dark,
      icon: MoonIcon
    },
    {
      value: 'system',
      label: at.system,
      icon: MonitorIcon
    }
  ];

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 z-50 flex flex-col">
      {/* 头部 */}
      <div className="flex items-center p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          className="mr-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{at.appearanceSettings}</h1>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">{at.customizeAppearance}</p>
        </div>

        {/* 主题设置 */}
        <Card className="rounded-xl border border-gray-200/50 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="p-6">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">{at.theme}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-6">
            {themeOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <div
                  key={option.value}
                  className={`flex items-center space-x-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    theme === option.value 
                      ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/30 shadow-sm' 
                      : 'border-gray-200/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 backdrop-blur-sm'
                  }`}
                  onClick={() => setTheme(option.value)}
                >
                  <div className={`p-3 rounded-xl shadow-sm ${
                    theme === option.value 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">{option.label}</div>
                  </div>
                  {theme === option.value && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm" />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* 其他设置 */}
        <Card className="rounded-xl border border-gray-200/50 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="p-6">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">{at.autoSave}</CardTitle>
            <CardDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">{at.autoSaveDesc}</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-save" className="flex-1 font-semibold text-gray-900 dark:text-white">
                {at.autoSave}
              </Label>
              <Switch
                id="auto-save"
                checked={autoSave}
                onCheckedChange={setAutoSave}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileAppearanceSettings;