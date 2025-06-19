import SupabaseExample from "@/components/supabase-example";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Supabase 演示",
  description: "Supabase 功能演示页面，包括认证、存储和数据库操作",
};

export default function SupabaseDemoPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Supabase 功能演示</h1>
      <p className="text-center mb-8 text-gray-600">
        这个页面展示了 Supabase 的主要功能，包括认证、存储和数据库操作。
      </p>
      <SupabaseExample />
    </div>
  );
}