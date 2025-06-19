import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 存储桶名称
const DOCUMENTS_BUCKET = 'documents';
const UPLOADS_BUCKET = 'uploads';

/**
 * 确保存储桶存在
 * @param bucketName 存储桶名称
 */
async function ensureBucketExists(bucketName: string) {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
  
  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: false,
      fileSizeLimit: 52428800, // 50MB
    });
    
    if (error) {
      console.error(`创建存储桶 ${bucketName} 失败:`, error);
      throw new Error(`创建存储桶失败: ${error.message}`);
    }
  }
}

/**
 * 上传文件到Supabase存储
 * @param file 文件对象
 * @param path 存储路径
 * @param bucketName 存储桶名称
 * @returns 文件URL
 */
export async function uploadFile(file: File, path: string, bucketName = UPLOADS_BUCKET): Promise<string> {
  try {
    await ensureBucketExists(bucketName);
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      throw error;
    }
    
    // 获取文件的公共URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('上传文件失败:', error);
    throw error;
  }
}

/**
 * 从Supabase存储下载文件
 * @param path 文件路径
 * @param bucketName 存储桶名称
 * @returns 文件Blob
 */
export async function downloadFile(path: string, bucketName = UPLOADS_BUCKET): Promise<Blob> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(path);
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('下载文件失败:', error);
    throw error;
  }
}

/**
 * 删除Supabase存储中的文件
 * @param path 文件路径
 * @param bucketName 存储桶名称
 */
export async function deleteFile(path: string, bucketName = UPLOADS_BUCKET): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([path]);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('删除文件失败:', error);
    throw error;
  }
}

/**
 * 获取文件的公共URL
 * @param path 文件路径
 * @param bucketName 存储桶名称
 * @returns 文件的公共URL
 */
export function getFilePublicUrl(path: string, bucketName = UPLOADS_BUCKET): string {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(path);
  
  return data.publicUrl;
}

/**
 * 列出存储桶中的文件
 * @param prefix 前缀路径
 * @param bucketName 存储桶名称
 * @returns 文件列表
 */
export async function listFiles(prefix: string, bucketName = UPLOADS_BUCKET) {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(prefix);
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('列出文件失败:', error);
    throw error;
  }
}

/**
 * 保存文档内容到Supabase存储
 * @param userId 用户ID
 * @param documentId 文档ID
 * @param content 文档内容
 */
export async function saveDocumentContent(userId: string, documentId: string, content: string): Promise<void> {
  try {
    await ensureBucketExists(DOCUMENTS_BUCKET);
    
    const path = `${userId}/${documentId}.json`;
    const contentBlob = new Blob([content], { type: 'application/json' });
    
    const { error } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .upload(path, contentBlob, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('保存文档内容失败:', error);
    throw error;
  }
}

/**
 * 获取文档内容
 * @param userId 用户ID
 * @param documentId 文档ID
 * @returns 文档内容
 */
export async function getDocumentContent(userId: string, documentId: string): Promise<string> {
  try {
    const path = `${userId}/${documentId}.json`;
    
    const { data, error } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .download(path);
    
    if (error) {
      throw error;
    }
    
    return await data.text();
  } catch (error) {
    console.error('获取文档内容失败:', error);
    throw error;
  }
}

/**
 * 删除文档内容
 * @param userId 用户ID
 * @param documentId 文档ID
 */
export async function deleteDocumentContent(userId: string, documentId: string): Promise<void> {
  try {
    const path = `${userId}/${documentId}.json`;
    
    const { error } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .remove([path]);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('删除文档内容失败:', error);
    throw error;
  }
}

export default {
  uploadFile,
  downloadFile,
  deleteFile,
  getFilePublicUrl,
  listFiles,
  saveDocumentContent,
  getDocumentContent,
  deleteDocumentContent
};