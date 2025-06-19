import { NextAuthOptions } from "next-auth"
import { authOptions as nextAuthOptions } from "../app/api/auth/[...nextauth]/route"

// 从 [...nextauth]/route.ts 重新导出 authOptions
export const authOptions: NextAuthOptions = nextAuthOptions