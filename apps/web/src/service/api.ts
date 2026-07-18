import { Req } from '@yes/shared'

/**
 * 统一 API 客户端。
 *
 * 所有请求都走这个实例，token 通过 setToken 切换。
 *
 * dev → http://localhost:8081
 * prod → process.env.API_BASE_URL（构建时 DefinePlugin 替换为 .env 值）
 */
const API_BASE = process.env.NODE_ENV === 'production'
  ? process.env.API_BASE_URL!
  : 'http://localhost:8081'

export const api = new Req({ baseURL: API_BASE })

/** 设置后续所有请求的 Authorization token */
export const setApiToken = (token: string | null) => api.setToken(token)
