'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/components/language-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Bell, MessageSquare, Mail, Smartphone } from 'lucide-react';

// 通知设置页面的翻译配置
const notificationsTranslations = {
  "zh-CN": {
    notificationSettings: "通知设置",
    manageNotifications: "管理您的通知偏好设置。",
    pushNotifications: "推送通知",
    pushNotificationsDesc: "接收应用推送通知",
    emailNotifications: "邮件通知",
    emailNotificationsDesc: "接收邮件通知",
    messageNotifications: "消息通知",
    messageNotificationsDesc: "接收新消息通知",
    systemNotifications: "系统通知",
    systemNotificationsDesc: "接收系统更新和重要通知",
    soundAndVibration: "声音和振动",
    notificationSound: "通知声音",
    notificationSoundDesc: "播放通知声音",
    vibration: "振动",
    vibrationDesc: "通知时振动",
    back: "返回"
  },
  "en-US": {
    notificationSettings: "Notification Settings",
    manageNotifications: "Manage your notification preferences.",
    pushNotifications: "Push Notifications",
    pushNotificationsDesc: "Receive push notifications from the app",
    emailNotifications: "Email Notifications",
    emailNotificationsDesc: "Receive email notifications",
    messageNotifications: "Message Notifications",
    messageNotificationsDesc: "Receive notifications for new messages",
    systemNotifications: "System Notifications",
    systemNotificationsDesc: "Receive system updates and important notifications",
    soundAndVibration: "Sound & Vibration",
    notificationSound: "Notification Sound",
    notificationSoundDesc: "Play sound for notifications",
    vibration: "Vibration",
    vibrationDesc: "Vibrate for notifications",
    back: "Back"
  },
  "ja-JP": {
    notificationSettings: "通知設定",
    manageNotifications: "通知の設定を管理します。",
    pushNotifications: "プッシュ通知",
    pushNotificationsDesc: "アプリからのプッシュ通知を受信",
    emailNotifications: "メール通知",
    emailNotificationsDesc: "メール通知を受信",
    messageNotifications: "メッセージ通知",
    messageNotificationsDesc: "新しいメッセージの通知を受信",
    systemNotifications: "システム通知",
    systemNotificationsDesc: "システム更新と重要な通知を受信",
    soundAndVibration: "サウンドとバイブレーション",
    notificationSound: "通知音",
    notificationSoundDesc: "通知音を再生",
    vibration: "バイブレーション",
    vibrationDesc: "通知時にバイブレーション",
    back: "戻る"
  },
  "ko-KR": {
    notificationSettings: "알림 설정",
    manageNotifications: "알림 기본 설정을 관리합니다.",
    pushNotifications: "푸시 알림",
    pushNotificationsDesc: "앱에서 푸시 알림 받기",
    emailNotifications: "이메일 알림",
    emailNotificationsDesc: "이메일 알림 받기",
    messageNotifications: "메시지 알림",
    messageNotificationsDesc: "새 메시지 알림 받기",
    systemNotifications: "시스템 알림",
    systemNotificationsDesc: "시스템 업데이트 및 중요 알림 받기",
    soundAndVibration: "소리 및 진동",
    notificationSound: "알림음",
    notificationSoundDesc: "알림음 재생",
    vibration: "진동",
    vibrationDesc: "알림 시 진동",
    back: "뒤로"
  }
};

interface MobileNotificationSettingsProps {
  isOpen: boolean;
  onBack: () => void;
}

const MobileNotificationSettings: React.FC<MobileNotificationSettingsProps> = ({ isOpen, onBack }) => {
  const { language } = useLanguage();
  
  // 通知设置状态
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);
  const [notificationSound, setNotificationSound] = useState(true);
  const [vibration, setVibration] = useState(true);

  // 获取通知设置页面特定的翻译
  const nt = notificationsTranslations[language as keyof typeof notificationsTranslations];

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
        <h1 className="text-xl font-semibold">{nt.notificationSettings}</h1>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{nt.manageNotifications}</p>
        </div>

        {/* 通知类型设置 */}
        <Card className="border-border/20 bg-gradient-to-br from-muted/30 to-muted/15 backdrop-blur-md shadow-xl rounded-3xl border border-white/10">
          <CardHeader className="p-6">
            <CardTitle className="flex items-center text-lg font-semibold">
              <Bell className="h-5 w-5 mr-2" />
              {nt.notificationSettings}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* 推送通知 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/20 rounded-2xl">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <Label htmlFor="push-notifications" className="text-base font-medium">
                    {nt.pushNotifications}
                  </Label>
                  <p className="text-sm text-muted-foreground">{nt.pushNotificationsDesc}</p>
                </div>
              </div>
              <Switch
                id="push-notifications"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>

            {/* 邮件通知 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <Label htmlFor="email-notifications" className="text-base font-medium">
                    {nt.emailNotifications}
                  </Label>
                  <p className="text-sm text-muted-foreground">{nt.emailNotificationsDesc}</p>
                </div>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            {/* 消息通知 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl">
                  <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <Label htmlFor="message-notifications" className="text-base font-medium">
                    {nt.messageNotifications}
                  </Label>
                  <p className="text-sm text-muted-foreground">{nt.messageNotificationsDesc}</p>
                </div>
              </div>
              <Switch
                id="message-notifications"
                checked={messageNotifications}
                onCheckedChange={setMessageNotifications}
              />
            </div>

            {/* 系统通知 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl">
                  <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <Label htmlFor="system-notifications" className="text-base font-medium">
                    {nt.systemNotifications}
                  </Label>
                  <p className="text-sm text-muted-foreground">{nt.systemNotificationsDesc}</p>
                </div>
              </div>
              <Switch
                id="system-notifications"
                checked={systemNotifications}
                onCheckedChange={setSystemNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* 声音和振动设置 */}
        <Card className="border-border/20 bg-gradient-to-br from-muted/30 to-muted/15 backdrop-blur-md shadow-xl rounded-3xl border border-white/10">
          <CardHeader className="p-6">
            <CardTitle className="text-lg font-semibold">{nt.soundAndVibration}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* 通知声音 */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="notification-sound" className="text-base font-medium">
                  {nt.notificationSound}
                </Label>
                <p className="text-sm text-muted-foreground">{nt.notificationSoundDesc}</p>
              </div>
              <Switch
                id="notification-sound"
                checked={notificationSound}
                onCheckedChange={setNotificationSound}
              />
            </div>

            {/* 振动 */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="vibration" className="text-base font-medium">
                  {nt.vibration}
                </Label>
                <p className="text-sm text-muted-foreground">{nt.vibrationDesc}</p>
              </div>
              <Switch
                id="vibration"
                checked={vibration}
                onCheckedChange={setVibration}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileNotificationSettings;