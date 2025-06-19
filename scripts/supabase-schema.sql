-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  email TEXT UNIQUE,
  email_verified TIMESTAMP WITH TIME ZONE,
  image TEXT,
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建账户表
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, provider_account_id)
);

-- 创建会话表
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 创建验证令牌表
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- 创建笔记表
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建文档表
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建AI配置表
CREATE TABLE IF NOT EXISTS ai_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  api_key TEXT,
  endpoint TEXT,
  model TEXT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  key TEXT,
  type TEXT
);

-- 创建聊天会话表
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建消息表
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  role TEXT NOT NULL,
  chat_session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有表添加更新时间触发器
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ai_configs_updated_at
BEFORE UPDATE ON ai_configs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_chat_sessions_updated_at
BEFORE UPDATE ON chat_sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- 创建存储桶用于文档存储
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建RLS策略函数
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS UUID
LANGUAGE SQL STABLE
AS $$
  SELECT COALESCE(
    auth.uid(),
    (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::UUID
  );
$$;

-- 为所有表启用行级安全性
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 创建用户表的RLS策略
CREATE POLICY "用户只能查看自己的信息" ON users
FOR SELECT
USING (id = auth.user_id());

CREATE POLICY "用户只能更新自己的信息" ON users
FOR UPDATE
USING (id = auth.user_id());

-- 创建笔记表的RLS策略
CREATE POLICY "用户只能查看自己的笔记" ON notes
FOR SELECT
USING (user_id = auth.user_id());

CREATE POLICY "用户只能创建自己的笔记" ON notes
FOR INSERT
WITH CHECK (user_id = auth.user_id());

CREATE POLICY "用户只能更新自己的笔记" ON notes
FOR UPDATE
USING (user_id = auth.user_id());

CREATE POLICY "用户只能删除自己的笔记" ON notes
FOR DELETE
USING (user_id = auth.user_id());

-- 创建文档表的RLS策略
CREATE POLICY "用户只能查看自己的文档" ON documents
FOR SELECT
USING (user_id = auth.user_id());

CREATE POLICY "用户只能创建自己的文档" ON documents
FOR INSERT
WITH CHECK (user_id = auth.user_id());

CREATE POLICY "用户只能更新自己的文档" ON documents
FOR UPDATE
USING (user_id = auth.user_id());

CREATE POLICY "用户只能删除自己的文档" ON documents
FOR DELETE
USING (user_id = auth.user_id());

-- 创建AI配置表的RLS策略
CREATE POLICY "用户只能查看自己的AI配置" ON ai_configs
FOR SELECT
USING (user_id = auth.user_id());

CREATE POLICY "用户只能创建自己的AI配置" ON ai_configs
FOR INSERT
WITH CHECK (user_id = auth.user_id());

CREATE POLICY "用户只能更新自己的AI配置" ON ai_configs
FOR UPDATE
USING (user_id = auth.user_id());

CREATE POLICY "用户只能删除自己的AI配置" ON ai_configs
FOR DELETE
USING (user_id = auth.user_id());

-- 创建聊天会话表的RLS策略
CREATE POLICY "用户只能查看自己的聊天会话" ON chat_sessions
FOR SELECT
USING (user_id = auth.user_id());

CREATE POLICY "用户只能创建自己的聊天会话" ON chat_sessions
FOR INSERT
WITH CHECK (user_id = auth.user_id());

CREATE POLICY "用户只能更新自己的聊天会话" ON chat_sessions
FOR UPDATE
USING (user_id = auth.user_id());

CREATE POLICY "用户只能删除自己的聊天会话" ON chat_sessions
FOR DELETE
USING (user_id = auth.user_id());

-- 创建消息表的RLS策略
CREATE POLICY "用户只能查看自己的聊天会话中的消息" ON messages
FOR SELECT
USING (
  chat_session_id IN (
    SELECT id FROM chat_sessions WHERE user_id = auth.user_id()
  )
);

CREATE POLICY "用户只能在自己的聊天会话中创建消息" ON messages
FOR INSERT
WITH CHECK (
  chat_session_id IN (
    SELECT id FROM chat_sessions WHERE user_id = auth.user_id()
  )
);

CREATE POLICY "用户只能更新自己的聊天会话中的消息" ON messages
FOR UPDATE
USING (
  chat_session_id IN (
    SELECT id FROM chat_sessions WHERE user_id = auth.user_id()
  )
);

CREATE POLICY "用户只能删除自己的聊天会话中的消息" ON messages
FOR DELETE
USING (
  chat_session_id IN (
    SELECT id FROM chat_sessions WHERE user_id = auth.user_id()
  )
);

-- 为服务角色创建特殊策略
CREATE POLICY "服务角色可以管理所有用户数据" ON users
FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "服务角色可以管理所有账户数据" ON accounts
FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "服务角色可以管理所有会话数据" ON sessions
FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "服务角色可以管理所有验证令牌数据" ON verification_tokens
FOR ALL
USING (auth.role() = 'service_role');