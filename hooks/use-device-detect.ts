'use client'

import { useState, useEffect } from 'react'

/**
 * 设备检测钩子函数
 * 用于检测当前设备是移动设备还是桌面设备
 * 可以在组件中使用此钩子来条件渲染移动端或桌面端UI
 */
export function useDeviceDetect() {
  // 初始状态设为undefined，避免服务端渲染不一致
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // 标记为客户端
    setIsClient(true);
    
    // 检测设备类型的函数
    const checkIfMobile = () => {
      // 使用窗口宽度作为判断标准
      // 可以根据需要调整这个阈值
      setIsMobile(window.innerWidth < 768);
    };
    
    // 初始检查
    checkIfMobile();
    
    // 监听窗口大小变化
    window.addEventListener('resize', checkIfMobile);
    
    // 清理函数
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return { isMobile: isMobile ?? false, isClient };
}