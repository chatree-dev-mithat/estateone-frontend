'use client'

import axios from 'axios'
import { getSession, signOut } from 'next-auth/react'

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

// Request interceptor — แนบ Bearer token อัตโนมัติ
apiClient.interceptors.request.use(async config => {
  const session = await getSession()

  if (session?.error === 'RefreshTokenError') {
    await signOut({ callbackUrl: '/login' })
    return Promise.reject(new Error('Session expired'))
  }

  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`
  }

  return config
})

// Response interceptor — แปลง backend error format + handle 401
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const status = error.response?.status
    const backendError = error.response?.data?.error

    // 401 — session หมดอายุ หรือ token ไม่ valid → force logout
    if (status === 401) {
      await signOut({ callbackUrl: '/login' })
      return Promise.reject(error)
    }

    // แปลง backend error format ให้ใช้ง่ายใน catch block
    if (backendError) {
      const err = new Error(backendError.message ?? 'An error occurred') as any
      err.code = backendError.code
      err.statusCode = backendError.statusCode
      err.original = error
      return Promise.reject(err)
    }

    return Promise.reject(error)
  }
)

export default apiClient
