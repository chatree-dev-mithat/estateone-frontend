import CredentialProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'

function decodeJwtPayload(token: string): Record<string, any> {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'))
}

async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; accessTokenExpires: number } | null> {
  try {
    const res = await fetch(`${process.env.API_URL}/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    const body = await res.json()
    if (!res.ok || !body.success) return null

    const payload = decodeJwtPayload(body.data.accessToken)
    return {
      accessToken: body.data.accessToken,
      accessTokenExpires: payload.exp * 1000,
    }
  } catch {
    return null
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialProvider({
      name: 'Credentials',
      type: 'credentials',
      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string }

        try {
          const res = await fetch(`${process.env.API_URL}/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })

          const body = await res.json()

          if (!res.ok) {
            const message = body?.error?.message ?? 'Login failed'
            throw new Error(JSON.stringify({ message: [message] }))
          }

          const { accessToken, refreshToken, passwordExpired } = body.data
          const payload = decodeJwtPayload(accessToken)

          return {
            id: String(payload.userId),
            name: payload.name,
            email: payload.email,
            role: payload.role,
            companyId: payload.companyId,
            branchId: payload.branchId,
            accessToken,
            refreshToken,
            accessTokenExpires: payload.exp * 1000,
            passwordExpired,
          }
        } catch (e: any) {
          throw new Error(e.message)
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: '/login',
  },

  callbacks: {
    async jwt({ token, user }) {
      // login ครั้งแรก — copy user → token
      if (user) {
        token.id = user.id
        token.name = user.name
        token.role = user.role
        token.companyId = user.companyId
        token.branchId = user.branchId
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.accessTokenExpires = user.accessTokenExpires
        token.passwordExpired = user.passwordExpired
        return token
      }

      // token ยังไม่หมดอายุ (เผื่อ 1 นาที)
      if (Date.now() < token.accessTokenExpires - 60_000) {
        return token
      }

      // refresh
      const refreshed = await refreshAccessToken(token.refreshToken)
      if (!refreshed) {
        return { ...token, error: 'RefreshTokenError' as const }
      }

      return {
        ...token,
        accessToken: refreshed.accessToken,
        accessTokenExpires: refreshed.accessTokenExpires,
        error: undefined,
      }
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      session.accessTokenExpires = token.accessTokenExpires
      session.error = token.error
      session.user = {
        id: token.id,
        name: token.name ?? '',
        email: token.email ?? '',
        role: token.role,
        companyId: token.companyId,
        branchId: token.branchId,
      }
      return session
    },
  },
}
