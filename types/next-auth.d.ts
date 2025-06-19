import { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * 扩展Session类型，添加用户ID
   */
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  /**
   * 扩展JWT类型，添加用户ID和提供者信息
   */
  interface JWT {
    userId: string
    provider?: string
  }
}