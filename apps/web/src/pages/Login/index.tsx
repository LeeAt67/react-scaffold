import { forwardRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn, createLogger, hashPassword } from '@yes/shared'
import { FormTip } from '@yes/ui'
import { api } from '@/service/api'
import { authStore } from '@/controller/instances'
import { observer } from 'mobx-react-lite'

const logger = createLogger('login:page')

interface LoginPageClassNames {
  root?: string
  card?: string
  input?: string
  button?: string
  tip?: string
}

export interface LoginPageProps {
  className?: string
  classNames?: LoginPageClassNames
}

/**
 * 登录页面 — 居中卡片式布局。
 *
 * 用户名 + 密码 → /api/auth/login，成功后跳转首页。
 * 底部提供「没有账号？注册一个」跳转提示。
 */
const LoginPage = forwardRef<HTMLDivElement, LoginPageProps>(
  ({ className, classNames }, ref) => {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
      if (!username || !password) return
      setError('')
      setLoading(true)

      // HMAC-SHA256 哈希，username 为盐，明文不离开浏览器
      const hashed = await hashPassword(password, username)

      const [data, err] = await api.post<{
        accessToken: string
        refreshToken: string
        user: { id: number; username: string }
      }>('/api/auth/login', { username, password: hashed })

      setLoading(false)

      if (err) {
        setError('用户名或密码错误')
        logger.warn('Login failed:', err.status)
        return
      }

      authStore.setAuth(data!.accessToken, data!.refreshToken, data!.user.username)
      logger.info('Login success:', username)
      navigate('/')
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex min-h-screen items-center justify-center bg-muted/30 px-4',
          classNames?.root,
          className,
        )}
      >
        <div
          className={cn(
            'w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm',
            classNames?.card,
          )}
        >
          <h1 className="mb-6 text-center text-xl font-semibold tracking-tight">
            登录 YES
          </h1>

          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <input
              type="text"
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className={cn(
                'w-full rounded-lg border bg-transparent px-3 py-2 text-sm',
                'placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring',
                classNames?.input,
              )}
            />
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className={cn(
                'w-full rounded-lg border bg-transparent px-3 py-2 text-sm',
                'placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring',
                classNames?.input,
              )}
            />
            <button
              onClick={handleLogin}
              disabled={loading || !username || !password}
              className={cn(
                'w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground',
                'transition-colors hover:bg-primary/90 disabled:opacity-50',
                classNames?.button,
              )}
            >
              {loading ? '登录中…' : '登录'}
            </button>
          </div>

          <FormTip
            text="没有账号？"
            linkText="注册一个"
            to="/register"
            className="mt-6"
            classNames={{ root: classNames?.tip }}
          />
        </div>
      </div>
    )
  },
)

LoginPage.displayName = 'LoginPage'
export default observer(LoginPage)
