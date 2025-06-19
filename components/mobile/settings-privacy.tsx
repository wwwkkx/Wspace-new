'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/components/language-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Shield, Eye, Database, Cookie, FileText } from 'lucide-react';

// 隐私设置页面的翻译配置
const privacyTranslations = {
  "zh-CN": {
    privacySettings: "隐私设置",
    managePrivacy: "管理您的隐私和数据设置。",
    dataCollection: "数据收集",
    analytics: "分析数据",
    analyticsDesc: "允许收集匿名使用数据以改进服务",
    crashReports: "崩溃报告",
    crashReportsDesc: "自动发送崩溃报告帮助改进应用",
    personalizedAds: "个性化广告",
    personalizedAdsDesc: "基于您的使用习惯显示相关广告",
    dataSharing: "数据共享",
    thirdPartySharing: "第三方共享",
    thirdPartySharingDesc: "与合作伙伴共享匿名数据",
    marketingEmails: "营销邮件",
    marketingEmailsDesc: "接收产品更新和营销信息",
    privacy: "隐私控制",
    profileVisibility: "个人资料可见性",
    profileVisibilityDesc: "控制谁可以查看您的个人资料",
    activityStatus: "活动状态",
    activityStatusDesc: "显示您的在线状态",
    dataManagement: "数据管理",
    downloadData: "下载数据",
    downloadDataDesc: "下载您的个人数据副本",
    deleteAccount: "删除账户",
    deleteAccountDesc: "永久删除您的账户和所有数据",
    back: "返回"
  },
  "en-US": {
    privacySettings: "Privacy Settings",
    managePrivacy: "Manage your privacy and data settings.",
    dataCollection: "Data Collection",
    analytics: "Analytics",
    analyticsDesc: "Allow collection of anonymous usage data to improve services",
    crashReports: "Crash Reports",
    crashReportsDesc: "Automatically send crash reports to help improve the app",
    personalizedAds: "Personalized Ads",
    personalizedAdsDesc: "Show relevant ads based on your usage patterns",
    dataSharing: "Data Sharing",
    thirdPartySharing: "Third-party Sharing",
    thirdPartySharingDesc: "Share anonymous data with partners",
    marketingEmails: "Marketing Emails",
    marketingEmailsDesc: "Receive product updates and marketing information",
    privacy: "Privacy Controls",
    profileVisibility: "Profile Visibility",
    profileVisibilityDesc: "Control who can view your profile",
    activityStatus: "Activity Status",
    activityStatusDesc: "Show your online status",
    dataManagement: "Data Management",
    downloadData: "Download Data",
    downloadDataDesc: "Download a copy of your personal data",
    deleteAccount: "Delete Account",
    deleteAccountDesc: "Permanently delete your account and all data",
    back: "Back"
  },
  "ja-JP": {
    privacySettings: "プライバシー設定",
    managePrivacy: "プライバシーとデータ設定を管理します。",
    dataCollection: "データ収集",
    analytics: "分析データ",
    analyticsDesc: "サービス改善のための匿名使用データの収集を許可",
    crashReports: "クラッシュレポート",
    crashReportsDesc: "アプリ改善のためクラッシュレポートを自動送信",
    personalizedAds: "パーソナライズ広告",
    personalizedAdsDesc: "使用パターンに基づいた関連広告を表示",
    dataSharing: "データ共有",
    thirdPartySharing: "第三者共有",
    thirdPartySharingDesc: "パートナーと匿名データを共有",
    marketingEmails: "マーケティングメール",
    marketingEmailsDesc: "製品更新とマーケティング情報を受信",
    privacy: "プライバシー制御",
    profileVisibility: "プロフィール表示",
    profileVisibilityDesc: "プロフィールを表示できる人を制御",
    activityStatus: "アクティビティステータス",
    activityStatusDesc: "オンラインステータスを表示",
    dataManagement: "データ管理",
    downloadData: "データダウンロード",
    downloadDataDesc: "個人データのコピーをダウンロード",
    deleteAccount: "アカウント削除",
    deleteAccountDesc: "アカウントとすべてのデータを永久削除",
    back: "戻る"
  },
  "ko-KR": {
    privacySettings: "개인정보 설정",
    managePrivacy: "개인정보 및 데이터 설정을 관리합니다.",
    dataCollection: "데이터 수집",
    analytics: "분석 데이터",
    analyticsDesc: "서비스 개선을 위한 익명 사용 데이터 수집 허용",
    crashReports: "충돌 보고서",
    crashReportsDesc: "앱 개선을 위해 충돌 보고서 자동 전송",
    personalizedAds: "맞춤형 광고",
    personalizedAdsDesc: "사용 패턴을 기반으로 관련 광고 표시",
    dataSharing: "데이터 공유",
    thirdPartySharing: "제3자 공유",
    thirdPartySharingDesc: "파트너와 익명 데이터 공유",
    marketingEmails: "마케팅 이메일",
    marketingEmailsDesc: "제품 업데이트 및 마케팅 정보 수신",
    privacy: "개인정보 제어",
    profileVisibility: "프로필 공개 범위",
    profileVisibilityDesc: "프로필을 볼 수 있는 사람 제어",
    activityStatus: "활동 상태",
    activityStatusDesc: "온라인 상태 표시",
    dataManagement: "데이터 관리",
    downloadData: "데이터 다운로드",
    downloadDataDesc: "개인 데이터 사본 다운로드",
    deleteAccount: "계정 삭제",
    deleteAccountDesc: "계정과 모든 데이터를 영구 삭제",
    back: "뒤로"
  }
};

interface MobilePrivacySettingsProps {
  isOpen: boolean;
  onBack: () => void;
}

const MobilePrivacySettings: React.FC<MobilePrivacySettingsProps> = ({ isOpen, onBack }) => {
  const { language } = useLanguage();
  
  // 隐私设置状态
  const [analytics, setAnalytics] = useState(true);
  const [crashReports, setCrashReports] = useState(true);
  const [personalizedAds, setPersonalizedAds] = useState(false);
  const [thirdPartySharing, setThirdPartySharing] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [activityStatus, setActivityStatus] = useState(true);

  // 获取隐私设置页面特定的翻译
  const pt = privacyTranslations[language as keyof typeof privacyTranslations];

  if (!isOpen) return null;

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
        <h1 className="text-xl font-semibold">{pt.privacySettings}</h1>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{pt.managePrivacy}</p>
        </div>

        {/* 数据收集设置 */}
        <Card className="border-border/20 bg-gradient-to-br from-muted/30 to-muted/15 backdrop-blur-md shadow-xl rounded-3xl border border-white/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <Database className="h-6 w-6 mr-3" />
              {pt.dataCollection}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            {/* 分析数据 */}
            <div className="flex items-center justify-between py-2">
              <div className="flex-1">
                <Label htmlFor="analytics" className="text-base font-medium">
                  {pt.analytics}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{pt.analyticsDesc}</p>
              </div>
              <Switch
                id="analytics"
                checked={analytics}
                onCheckedChange={setAnalytics}
                className="ml-4"
              />
            </div>

            {/* 崩溃报告 */}
            <div className="flex items-center justify-between py-2">
              <div className="flex-1">
                <Label htmlFor="crash-reports" className="text-base font-medium">
                  {pt.crashReports}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{pt.crashReportsDesc}</p>
              </div>
              <Switch
                id="crash-reports"
                checked={crashReports}
                onCheckedChange={setCrashReports}
                className="ml-4"
              />
            </div>

            {/* 个性化广告 */}
            <div className="flex items-center justify-between py-2">
              <div className="flex-1">
                <Label htmlFor="personalized-ads" className="text-base font-medium">
                  {pt.personalizedAds}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{pt.personalizedAdsDesc}</p>
              </div>
              <Switch
                id="personalized-ads"
                checked={personalizedAds}
                onCheckedChange={setPersonalizedAds}
                className="ml-4"
              />
            </div>
          </CardContent>
        </Card>

        {/* 数据共享设置 */}
        <Card className="border-border/20 bg-gradient-to-br from-muted/30 to-muted/15 backdrop-blur-md shadow-xl rounded-3xl border border-white/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <Cookie className="h-6 w-6 mr-3" />
              {pt.dataSharing}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            {/* 第三方共享 */}
            <div className="flex items-center justify-between py-2">
              <div className="flex-1">
                <Label htmlFor="third-party-sharing" className="text-base font-medium">
                  {pt.thirdPartySharing}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{pt.thirdPartySharingDesc}</p>
              </div>
              <Switch
                id="third-party-sharing"
                checked={thirdPartySharing}
                onCheckedChange={setThirdPartySharing}
                className="ml-4"
              />
            </div>

            {/* 营销邮件 */}
            <div className="flex items-center justify-between py-2">
              <div className="flex-1">
                <Label htmlFor="marketing-emails" className="text-base font-medium">
                  {pt.marketingEmails}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{pt.marketingEmailsDesc}</p>
              </div>
              <Switch
                id="marketing-emails"
                checked={marketingEmails}
                onCheckedChange={setMarketingEmails}
                className="ml-4"
              />
            </div>
          </CardContent>
        </Card>

        {/* 隐私控制设置 */}
        <Card className="border-border/20 bg-gradient-to-br from-muted/30 to-muted/15 backdrop-blur-md shadow-xl rounded-3xl border border-white/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <Eye className="h-6 w-6 mr-3" />
              {pt.privacy}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            {/* 个人资料可见性 */}
            <div className="flex items-center justify-between py-2">
              <div className="flex-1">
                <Label htmlFor="profile-visibility" className="text-base font-medium">
                  {pt.profileVisibility}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{pt.profileVisibilityDesc}</p>
              </div>
              <Switch
                id="profile-visibility"
                checked={profileVisibility}
                onCheckedChange={setProfileVisibility}
                className="ml-4"
              />
            </div>

            {/* 活动状态 */}
            <div className="flex items-center justify-between py-2">
              <div className="flex-1">
                <Label htmlFor="activity-status" className="text-base font-medium">
                  {pt.activityStatus}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{pt.activityStatusDesc}</p>
              </div>
              <Switch
                id="activity-status"
                checked={activityStatus}
                onCheckedChange={setActivityStatus}
                className="ml-4"
              />
            </div>
          </CardContent>
        </Card>

        {/* 数据管理 */}
        <Card className="border-border/20 bg-gradient-to-br from-muted/30 to-muted/15 backdrop-blur-md shadow-xl rounded-3xl border border-white/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <FileText className="h-6 w-6 mr-3" />
              {pt.dataManagement}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {/* 下载数据 */}
            <Button variant="outline" className="w-full justify-start h-auto p-4 rounded-2xl border-0 bg-background/50 hover:bg-background/80" disabled>
              <Database className="h-5 w-5 mr-4 flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium text-base">{pt.downloadData}</div>
                <div className="text-sm text-muted-foreground mt-1">{pt.downloadDataDesc}</div>
              </div>
            </Button>

            {/* 删除账户 */}
            <Button variant="outline" className="w-full justify-start h-auto p-4 rounded-2xl border-0 bg-background/50 hover:bg-background/80 text-destructive" disabled>
              <Shield className="h-5 w-5 mr-4 flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium text-base">{pt.deleteAccount}</div>
                <div className="text-sm text-muted-foreground mt-1">{pt.deleteAccountDesc}</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobilePrivacySettings;