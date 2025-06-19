'use client';

import React from 'react';
import { useLanguage, LanguageType } from '@/components/language-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, Globe } from 'lucide-react';

// 语言设置页面的翻译配置
const languageTranslations = {
  "zh-CN": {
    languageSettings: "语言设置",
    selectLanguage: "选择您的首选语言。",
    currentLanguage: "当前语言",
    availableLanguages: "可用语言",
    back: "返回"
  },
  "en-US": {
    languageSettings: "Language Settings",
    selectLanguage: "Select your preferred language.",
    currentLanguage: "Current Language",
    availableLanguages: "Available Languages",
    back: "Back"
  },
  "ja-JP": {
    languageSettings: "言語設定",
    selectLanguage: "お好みの言語を選択してください。",
    currentLanguage: "現在の言語",
    availableLanguages: "利用可能な言語",
    back: "戻る"
  },
  "ko-KR": {
    languageSettings: "언어 설정",
    selectLanguage: "선호하는 언어를 선택하세요.",
    currentLanguage: "현재 언어",
    availableLanguages: "사용 가능한 언어",
    back: "뒤로"
  }
};

// 支持的语言列表
const supportedLanguages = [
  {
    code: 'zh-CN',
    name: '简体中文',
    nativeName: '简体中文',
    flag: '🇨🇳'
  },
  {
    code: 'en-US',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'ja-JP',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵'
  },
  {
    code: 'ko-KR',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷'
  }
];

interface MobileLanguageSettingsProps {
  isOpen: boolean;
  onBack: () => void;
}

const MobileLanguageSettings: React.FC<MobileLanguageSettingsProps> = ({ isOpen, onBack }) => {
  const { language, setLanguage } = useLanguage();

  // 获取语言设置页面特定的翻译
  const lt = languageTranslations[language as keyof typeof languageTranslations];

  if (!isOpen) return null;

  const handleLanguageChange = (languageCode: LanguageType) => {
    setLanguage(languageCode);
  };

  const currentLanguageInfo = supportedLanguages.find(lang => lang.code === language);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* 头部 */}
      <div className="flex items-center p-4 border-b bg-background">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          className="mr-3"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">{lt.languageSettings}</h1>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{lt.selectLanguage}</p>
        </div>

        {/* 当前语言 */}
        {currentLanguageInfo && (
          <Card className="border-border/20 bg-gradient-to-br from-muted/30 to-muted/15 backdrop-blur-md shadow-xl rounded-3xl border border-white/10">
            <CardHeader className="p-6">
              <CardTitle className="flex items-center text-lg font-semibold">
                <Globe className="h-5 w-5 mr-2" />
                {lt.currentLanguage}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 p-4 rounded-2xl bg-primary/10 border border-primary/30">
                <span className="text-3xl">{currentLanguageInfo.flag}</span>
                <div className="flex-1">
                  <div className="font-semibold text-lg">{currentLanguageInfo.nativeName}</div>
                  <div className="text-base text-muted-foreground">{currentLanguageInfo.name}</div>
                </div>
                <Check className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* 可用语言列表 */}
        <Card className="border-border/20 bg-gradient-to-br from-muted/30 to-muted/15 backdrop-blur-md shadow-xl rounded-3xl border border-white/10">
          <CardHeader className="p-6">
            <CardTitle className="text-lg font-semibold">{lt.availableLanguages}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-6">
            {supportedLanguages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <div
                  key={lang.code}
                  className={`flex items-center space-x-4 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-primary/30 bg-primary/10 shadow-md' 
                      : 'border-border/20 bg-muted/20 hover:bg-muted/30'
                  }`}
                  onClick={() => handleLanguageChange(lang.code as LanguageType)}
                >
                  <span className="text-3xl">{lang.flag}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{lang.nativeName}</div>
                    <div className="text-base text-muted-foreground">{lang.name}</div>
                  </div>
                  {isSelected && (
                    <Check className="h-6 w-6 text-primary" />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* 语言说明 */}
        <Card className="border-border/20 bg-gradient-to-br from-muted/30 to-muted/15 backdrop-blur-md shadow-xl rounded-3xl border border-white/10">
          <CardContent className="p-6">
            <div className="text-center space-y-3">
              <Globe className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="text-base text-muted-foreground">
                {language === 'zh-CN' && '语言更改将立即生效，无需重启应用。'}
                {language === 'en-US' && 'Language changes will take effect immediately without restarting the app.'}
                {language === 'ja-JP' && '言語の変更はアプリを再起動することなく、すぐに有効になります。'}
                {language === 'ko-KR' && '언어 변경은 앱을 다시 시작하지 않고 즉시 적용됩니다.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileLanguageSettings;