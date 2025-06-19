-- 修复ai_configs表结构，使其与Prisma模型兼容

-- 1. 将user_id字段设置为可空（如果存在）
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_configs' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE ai_configs ALTER COLUMN user_id DROP NOT NULL;
  END IF;
END $$;

-- 2. 添加status字段（如果不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_configs' AND column_name = 'status'
  ) THEN
    ALTER TABLE ai_configs ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
END $$;

-- 3. 删除key字段（如果存在）
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_configs' AND column_name = 'key'
  ) THEN
    ALTER TABLE ai_configs DROP COLUMN key;
  END IF;
END $$;

-- 4. 删除type字段（如果存在）
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_configs' AND column_name = 'type'
  ) THEN
    ALTER TABLE ai_configs DROP COLUMN type;
  END IF;
END $$;
