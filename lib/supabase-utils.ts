import { supabase } from './supabase';

// 这里可以添加与 Supabase 相关的实用工具函数

// 示例：获取用户列表
export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) {
    throw error;
  }
  
  return data;
}

// 示例：获取单个用户
export async function getUser(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}