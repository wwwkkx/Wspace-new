import { prisma } from '@/lib/db'

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

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return Response.json({ error: "邮箱和密码都是必填的" }, { status: 400 })
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return Response.json({ error: "该邮箱已被注册" }, { status: 400 })
    }

    // 密码长度验证
    if (password.length < 6) {
      return Response.json({ error: "密码长度不能少于6个字符" }, { status: 400 })
    }

    // 哈希密码
    const hashedPassword = await hashPassword(password)

    // 创建新用户
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split("@")[0], // 如果没有提供名字，使用邮箱前缀
      }
    })

    console.log("User registered:", user.id)

    // 生成简单的token (在生产环境中应使用更安全的方法)
    const token = btoa(
      JSON.stringify({ userId: user.id, email: user.email, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }),
    )

    return Response.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        notionConnected: false,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return Response.json({ error: "注册失败，请重试" }, { status: 500 })
  }
}
