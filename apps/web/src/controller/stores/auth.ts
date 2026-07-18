import { makeAutoObservable } from 'mobx'

const TOKEN_KEY = 'accessToken'
const REFRESH_KEY = 'refreshToken'

/**
 * AuthStore — 客户端鉴权状态管理。
 *
 * token 持久化在 localStorage，页面刷新不丢失。
 */
class AuthStore {
  accessToken: string | null = null
  refreshToken: string | null = null
  /** 当前登录用户名 */
  username: string | null = null

  constructor() {
    makeAutoObservable(this)
    this.accessToken = localStorage.getItem(TOKEN_KEY)
    this.refreshToken = localStorage.getItem(REFRESH_KEY)
  }

  /** 是否已登录 */
  get isAuthenticated(): boolean {
    return this.accessToken !== null
  }

  /** 保存登录凭据 */
  setAuth = (accessToken: string, refreshToken: string, username: string) => {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    this.username = username
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_KEY, refreshToken)
  }

  /** 退出登录 */
  logout = () => {
    this.accessToken = null
    this.refreshToken = null
    this.username = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
  }
}

export default AuthStore
