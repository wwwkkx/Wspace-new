import { Adapter, AdapterAccount, AdapterSession, AdapterUser, VerificationToken } from 'next-auth/adapters'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

export function SupabaseAdapter(supabaseUrl: string, supabaseKey: string): Adapter {
  const supabase = createClient<Database>(supabaseUrl, supabaseKey)

  return {
    async createUser(user: Omit<AdapterUser, 'id'>) {
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: user.email,
          name: user.name,
          image: user.image,
          email_verified: user.emailVerified?.toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return transformUser(data)
    },

    async getUser(id: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error) return null
      if (!data) return null
      return transformUser(data)
    },

    async getUserByEmail(email: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error) return null
      if (!data) return null
      return transformUser(data)
    },

    async getUserByAccount({ provider, providerAccountId }: { provider: string, providerAccountId: string }) {
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('provider', provider)
        .eq('provider_account_id', providerAccountId)
        .single()

      if (accountError) return null
      if (!account) return null

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', account.user_id)
        .single()

      if (userError) return null
      if (!user) return null

      return transformUser(user)
    },

    async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
      // 创建一个更新对象，只包含提供的字段
      const updateData: any = {
        updated_at: new Date().toISOString(),
      }
      
      // 只有当字段存在时才添加到更新对象中
      if (user.name !== undefined) updateData.name = user.name
      if (user.email !== undefined) updateData.email = user.email
      if (user.image !== undefined) updateData.image = user.image
      if (user.emailVerified !== undefined && user.emailVerified !== null) updateData.email_verified = user.emailVerified.toISOString()
      
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      return transformUser(data)
    },

    async deleteUser(userId: string) {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) throw error
    },

    async linkAccount(account: AdapterAccount) {
      const { error } = await supabase.from('accounts').insert({
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
        session_state: account.session_state,
      })

      if (error) throw error
    },

    async unlinkAccount({ provider, providerAccountId }: { provider: string, providerAccountId: string }) {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('provider', provider)
        .eq('provider_account_id', providerAccountId)

      if (error) throw error
    },

    async createSession(session: Omit<AdapterSession, 'id'>) {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user_id: session.userId,
          expires: session.expires.toISOString(),
          session_token: session.sessionToken,
        })
        .select()
        .single()

      if (error) throw error
      return transformSession(data)
    },

    async getSessionAndUser(sessionToken: string) {
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .single()

      if (sessionError) return null
      if (!session) return null

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user_id)
        .single()

      if (userError) return null
      if (!user) return null

      return {
        user: transformUser(user),
        session: transformSession(session),
      }
    },

    async updateSession(session: Partial<AdapterSession> & Pick<AdapterSession, 'sessionToken'>) {
      const { data, error } = await supabase
        .from('sessions')
        .update({
          expires: session.expires?.toISOString(),
        })
        .eq('session_token', session.sessionToken)
        .select()
        .single()

      if (error) throw error
      return transformSession(data)
    },

    async deleteSession(sessionToken: string) {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('session_token', sessionToken)

      if (error) throw error
    },

    async createVerificationToken(verificationToken: VerificationToken) {
      const { error } = await supabase.from('verification_tokens').insert({
        identifier: verificationToken.identifier,
        token: verificationToken.token,
        expires: verificationToken.expires.toISOString(),
      })

      if (error) throw error
      return verificationToken
    },

    async useVerificationToken({ identifier, token }: { identifier: string, token: string }) {
      const { data, error } = await supabase
        .from('verification_tokens')
        .select()
        .eq('identifier', identifier)
        .eq('token', token)
        .single()

      if (error) return null

      if (data) {
        await supabase
          .from('verification_tokens')
          .delete()
          .eq('identifier', identifier)
          .eq('token', token)
      }

      return {
        identifier: data.identifier,
        token: data.token,
        expires: new Date(data.expires),
      }
    },
  }
}

// 转换函数，将Supabase的数据结构转换为NextAuth期望的结构
function transformUser(user: Database['public']['Tables']['users']['Row']): AdapterUser {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.email_verified ? new Date(user.email_verified) : null,
    name: user.name || null,
    image: user.image || null,
  }
}

function transformSession(session: Database['public']['Tables']['sessions']['Row']): AdapterSession {
  return {
    sessionToken: session.session_token,
    userId: session.user_id,
    expires: new Date(session.expires),
  }
}