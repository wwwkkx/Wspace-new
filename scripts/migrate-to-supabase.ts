import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// 初始化Prisma客户端（连接到SQLite）
const prisma = new PrismaClient();

// 初始化Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('缺少Supabase配置。请确保设置了NEXT_PUBLIC_SUPABASE_URL和SUPABASE_SERVICE_ROLE_KEY环境变量。');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function migrateUsers() {
  console.log('开始迁移用户数据...');
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    const { error } = await supabase.from('users').upsert({
      id: user.id,
      name: user.name,
      email: user.email,
      email_verified: user.emailVerified,
      image: user.image,
      password: user.password,
      created_at: user.createdAt,
      updated_at: user.updatedAt
    });
    
    if (error) {
      console.error(`迁移用户 ${user.email} 失败:`, error);
    } else {
      console.log(`成功迁移用户: ${user.email}`);
    }
  }
  
  console.log(`用户迁移完成。共迁移 ${users.length} 个用户。`);
}

async function migrateAccounts() {
  console.log('开始迁移账户数据...');
  const accounts = await prisma.account.findMany();
  
  for (const account of accounts) {
    const { error } = await supabase.from('accounts').upsert({
      id: account.id,
      user_id: account.userId,
      type: account.type,
      provider: account.provider,
      provider_account_id: account.providerAccountId,
      refresh_token: account.refresh_token,
      access_token: account.access_token,
      expires_at: account.expires_at,
      token_type: account.token_type,
      scope: account.scope,
      id_token: account.id_token,
      session_state: account.session_state
    });
    
    if (error) {
      console.error(`迁移账户 ${account.provider}:${account.providerAccountId} 失败:`, error);
    } else {
      console.log(`成功迁移账户: ${account.provider}:${account.providerAccountId}`);
    }
  }
  
  console.log(`账户迁移完成。共迁移 ${accounts.length} 个账户。`);
}

async function migrateSessions() {
  console.log('开始迁移会话数据...');
  const sessions = await prisma.session.findMany();
  
  for (const session of sessions) {
    const { error } = await supabase.from('sessions').upsert({
      id: session.id,
      session_token: session.sessionToken,
      user_id: session.userId,
      expires: session.expires
    });
    
    if (error) {
      console.error(`迁移会话 ${session.sessionToken} 失败:`, error);
    } else {
      console.log(`成功迁移会话: ${session.sessionToken}`);
    }
  }
  
  console.log(`会话迁移完成。共迁移 ${sessions.length} 个会话。`);
}

async function migrateVerificationTokens() {
  console.log('开始迁移验证令牌数据...');
  const tokens = await prisma.verificationToken.findMany();
  
  for (const token of tokens) {
    const { error } = await supabase.from('verification_tokens').upsert({
      identifier: token.identifier,
      token: token.token,
      expires: token.expires
    });
    
    if (error) {
      console.error(`迁移验证令牌 ${token.token} 失败:`, error);
    } else {
      console.log(`成功迁移验证令牌: ${token.token}`);
    }
  }
  
  console.log(`验证令牌迁移完成。共迁移 ${tokens.length} 个验证令牌。`);
}

async function migrateNotes() {
  console.log('开始迁移笔记数据...');
  const notes = await prisma.note.findMany();
  
  for (const note of notes) {
    const { error } = await supabase.from('notes').upsert({
      id: note.id,
      title: note.title,
      content: note.originalContent,
      user_id: note.userId,
      created_at: note.createdAt,
      updated_at: note.updatedAt
    });
    
    if (error) {
      console.error(`迁移笔记 ${note.title} 失败:`, error);
    } else {
      console.log(`成功迁移笔记: ${note.title}`);
    }
  }
  
  console.log(`笔记迁移完成。共迁移 ${notes.length} 个笔记。`);
}

async function migrateDocuments() {
  console.log('开始迁移文档数据...');
  const documents = await prisma.document.findMany();
  
  for (const document of documents) {
    const { error } = await supabase.from('documents').upsert({
      id: document.id,
      title: document.title,
      content: document.originalContent,
      user_id: document.userId,
      created_at: document.createdAt,
      updated_at: document.updatedAt
    });
    
    if (error) {
      console.error(`迁移文档 ${document.title} 失败:`, error);
    } else {
      console.log(`成功迁移文档: ${document.title}`);
    }
  }
  
  console.log(`文档迁移完成。共迁移 ${documents.length} 个文档。`);
}

async function migrateAiConfigs() {
  console.log('开始迁移AI配置数据...');
  const aiConfigs = await prisma.aiConfig.findMany();
  
  for (const config of aiConfigs) {
    const { error } = await supabase.from('ai_configs').upsert({
      id: config.id,
      name: config.name,
      api_key: config.apiKey,
      endpoint: config.endpoint,
      model: config.model,
      // AiConfig 模型中没有 userId 字段，所以这里移除
      created_at: config.createdAt,
      updated_at: config.updatedAt,
      // key 和 type 字段在 AiConfig 模型中也不存在，所以这里移除
    });
    
    if (error) {
      console.error(`迁移AI配置 ${config.name} 失败:`, error);
    } else {
      console.log(`成功迁移AI配置: ${config.name}`);
    }
  }
  
  console.log(`AI配置迁移完成。共迁移 ${aiConfigs.length} 个AI配置。`);
}

async function migrateChatSessions() {
  console.log('开始迁移聊天会话数据...');
  const chatSessions = await prisma.chatSession.findMany();
  
  for (const session of chatSessions) {
    const { error } = await supabase.from('chat_sessions').upsert({
      id: session.id,
      title: session.title,
      user_id: session.userId,
      created_at: session.createdAt,
      updated_at: session.updatedAt
    });
    
    if (error) {
      console.error(`迁移聊天会话 ${session.title} 失败:`, error);
    } else {
      console.log(`成功迁移聊天会话: ${session.title}`);
    }
  }
  
  console.log(`聊天会话迁移完成。共迁移 ${chatSessions.length} 个聊天会话。`);
}

async function migrateMessages() {
  console.log('开始迁移消息数据...');
  const messages = await prisma.message.findMany();
  
  for (const message of messages) {
    const { error } = await supabase.from('messages').upsert({
      id: message.id,
      content: message.content,
      role: message.role,
      chat_session_id: message.sessionId,
      search_results: message.searchResults,
      created_at: message.createdAt,
      updated_at: message.updatedAt
    });
    
    if (error) {
      console.error(`迁移消息 ${message.id} 失败:`, error);
    } else {
      console.log(`成功迁移消息: ${message.id}`);
    }
  }
  
  console.log(`消息迁移完成。共迁移 ${messages.length} 条消息。`);
}

async function main() {
  try {
    console.log('开始数据迁移过程...');
    
    // 按照依赖关系顺序迁移数据
    await migrateUsers();
    await migrateAccounts();
    await migrateSessions();
    await migrateVerificationTokens();
    await migrateNotes();
    await migrateDocuments();
    await migrateAiConfigs();
    await migrateChatSessions();
    await migrateMessages();
    
    console.log('数据迁移完成！');
  } catch (error) {
    console.error('迁移过程中发生错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();