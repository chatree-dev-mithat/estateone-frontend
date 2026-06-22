import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    accessToken: string
    refreshToken: string
    accessTokenExpires: number
    error?: 'RefreshTokenError'
    user: {
      id: string
      name: string
      email: string
      role: string
      companyId: number
      branchId: number
    }
  }

  interface User {
    id: string
    name: string
    email: string
    role: string
    companyId: number
    branchId: number
    accessToken: string
    refreshToken: string
    accessTokenExpires: number
    passwordExpired: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    companyId: number
    branchId: number
    accessToken: string
    refreshToken: string
    accessTokenExpires: number
    passwordExpired: boolean
    error?: 'RefreshTokenError'
  }
}
