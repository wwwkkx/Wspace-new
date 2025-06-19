import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { SupabaseAdapter } from "@/lib/supabase-adapter"

// 使用Web Crypto API代替Node.js的crypto模块
async function hashPassword(password: string): Promise<string> {
  // 将密码字符串转换为Uint8Array
  const encoder = new TextEncoder()
  const data = encoder.encode(password)

  // 使用SHA-256算法创建哈希
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)

  // 将哈希值转换为十六进制字符串
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

  return hashHex
}

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  ),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // 使用Supabase查找用户
          const { data: user, error } = await (await import('@/lib/supabase')).supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email)
            .single()
          
          if (error || !user) {
            return null
          }

          // 验证密码
          const hashedPassword = await hashPassword(credentials.password)
          if (hashedPassword !== user.password) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    // 微信登录提供者
    {
      id: "wechat",
      name: "WeChat",
      type: "oauth",
      wellKnown: "https://open.weixin.qq.com/.well-known/openid-configuration",
      authorization: {
        url: "https://open.weixin.qq.com/connect/qrconnect",
        params: {
          appid: process.env.WECHAT_APP_ID,
          scope: "snsapi_login",
          response_type: "code",
          redirect_uri: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/callback/wechat` : "",
        },
      },
      token: {
        url: "https://api.weixin.qq.com/sns/oauth2/access_token",
        params: {
          appid: process.env.WECHAT_APP_ID,
          secret: process.env.WECHAT_APP_SECRET,
          grant_type: "authorization_code",
        },
      },
      userinfo: {
        url: "https://api.weixin.qq.com/sns/userinfo",
        params: {
          openid: process.env.WECHAT_APP_ID,
          lang: "zh_CN",
        },
      },
      profile(profile) {
        return {
          id: profile.openid,
          name: profile.nickname,
          email: `${profile.openid}@wechat.com`, // 微信不提供邮箱，创建一个虚拟邮箱
          image: profile.headimgurl,
        }
      },
    },
    // Instagram登录提供者
    {
      id: "instagram",
      name: "Instagram",
      type: "oauth",
      authorization: {
        url: "https://api.instagram.com/oauth/authorize",
        params: {
          client_id: process.env.INSTAGRAM_CLIENT_ID,
          scope: "user_profile,user_media",
          response_type: "code",
          redirect_uri: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/callback/instagram` : "",
        },
      },
      token: {
        url: "https://api.instagram.com/oauth/access_token",
        async request({ client, params, checks, provider }) {
          const response = await fetch(typeof provider.token === 'string' ? provider.token : provider.token?.url || '', {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_id: process.env.INSTAGRAM_CLIENT_ID || "",
              client_secret: process.env.INSTAGRAM_CLIENT_SECRET || "",
              grant_type: "authorization_code",
              redirect_uri: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/callback/instagram` : "",
              code: params.code || "",
            }).toString(),
          })
          const tokens = await response.json()
          return { tokens }
        },
      },
      userinfo: {
        url: "https://graph.instagram.com/me",
        params: {
          fields: "id,username",
        },
      },
      profile(profile) {
        return {
          id: profile.id,
          name: profile.username,
          email: `${profile.id}@instagram.com`, // Instagram不提供邮箱，创建一个虚拟邮箱
          image: null, // Instagram API不直接提供头像
        }
      },
    },
  ],
  pages: {
    signIn: "/auth",
    signOut: "/auth",
    error: "/auth",
  },
  callbacks: {
    async session({ session, token }) {
      console.log('Session callback - 原始token:', JSON.stringify(token))
      if (session.user && token) {
        // 确保token.userId存在，如果不存在则使用token.sub作为备选
        const userId = token.userId || token.sub
        
        if (!userId) {
          console.error('Session callback - 严重错误: 无法获取用户ID，token中既没有userId也没有sub')
          // 记录完整的token信息以便调试
          console.error('完整token信息:', JSON.stringify(token))
        } else {
          // 设置session.user.id，确保它不为undefined
          session.user.id = userId as string
          console.log(`Session callback - 成功设置用户ID: ${userId}`)
        }
        
        // 设置其他用户信息
        session.user.email = token.email as string
        session.user.name = token.name as string
        
        // 记录完整的session信息
        console.log('Session callback - 设置后的session:', JSON.stringify({
          id: session.user.id,
          email: session.user.email,
          name: session.user.name
        }))
      } else {
        console.error('Session callback - 缺少session.user或token:', JSON.stringify({ 
          hasSession: !!session, 
          hasUser: !!session?.user, 
          hasToken: !!token 
        }))
      }
      return session
    },
    async jwt({ token, user, account }) {
      // 记录原始数据
      console.log('JWT callback - 原始数据:', JSON.stringify({
        tokenId: token.userId || token.sub,
        userInfo: user ? { id: user.id, email: user.email } : 'no user data',
        provider: account?.provider
      }))
      
      if (user) {
        // 确保用户ID被正确设置
        token.userId = user.id
        token.email = user.email
        token.name = user.name
        console.log('JWT callback - 设置token:', JSON.stringify({
          userId: token.userId,
          email: token.email,
          name: token.name
        }))
      } else {
        // 如果没有user数据，记录现有token信息
        console.log('JWT callback - 没有user数据，保持现有token:', JSON.stringify({
          userId: token.userId,
          sub: token.sub,
          email: token.email
        }))
      }
      
      if (account) {
        token.provider = account.provider
        console.log('JWT callback - 设置provider:', account.provider)
      }
      
      return token
    },
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30天，以秒为单位
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30天，以秒为单位
      },
    },
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }