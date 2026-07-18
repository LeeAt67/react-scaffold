import { Req } from '@yes/shared'
import { authStore } from '@/controller/instances'

/**
 * 统一 API 客户端。
 *
 * 所有请求都走这个实例，token 通过 setToken 切换。
 * HTTP 401 时自动清空 authStore，触发 AuthGuard 重定向到登录页。
 *
 * dev → http://localhost:8081
 * prod → process.env.API_BASE_URL（构建时 DefinePlugin 替换为 .env 值）
 */
const API_BASE = process.env.NODE_ENV === 'production'
  ? process.env.API_BASE_URL!
  : 'http://localhost:8081'

export const api = new Req({
  baseURL: API_BASE,
  /** HTTP 401 → 清空登录态，AuthGuard 自动重定向到 /login */
  onUnauthorized: () => authStore.logout(),
})

/** 设置后续所有请求的 Authorization token */
export const setApiToken = (token: string | null) => api.setToken(token)
