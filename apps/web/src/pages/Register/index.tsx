import { forwardRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn, createLogger, hashPassword } from '@yes/shared'
import { FormTip } from '@yes/ui'
import { api } from '@/service/api'
import { observer } from 'mobx-react-lite'

const logger = createLogger('register:page')

interface RegisterPageClassNames {
  root?: string
  card?: string
  input?: string
  button?: string
  tip?: string
}

export interface RegisterPageProps {
  className?: string
  classNames?: RegisterPageClassNames
}

/**
 * 注册页面 — 居中卡片式布局。
 *
 * 用户名 + 密码 → /api/auth/register，成功后提示跳转登录。
 */
const RegisterPage = forwardRef<HTMLDivElement, RegisterPageProps>(
  ({ className, classNames }, ref) => {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const handleRegister = async () => {
      if (!username || !password) return
      setError('')
      setSuccess('')
      setLoading(true)

      const hashed = await hashPassword(password, username)

      const [, err] = await api.post('/api/auth/register', {
        username,
        password: hashed,
      })

      setLoading(false)

      if (err) {
        setError(err.body && err.body.includes('已存在') ? '用户名已存在' : '注册失败，请重试')
        logger.warn('Register failed:', err.status)
        return
      }

      setSuccess('注册成功！即将跳转登录页...')
      logger.info('Register success:', username)
      setTimeout(() => navigate('/login'), 1500)
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
            注册 YES
          </h1>

          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <input
              type="text"
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
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
              onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
              className={cn(
                'w-full rounded-lg border bg-transparent px-3 py-2 text-sm',
                'placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring',
                classNames?.input,
              )}
            />
            <button
              onClick={handleRegister}
              disabled={loading || !username || !password}
              className={cn(
                'w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground',
                'transition-colors hover:bg-primary/90 disabled:opacity-50',
                classNames?.button,
              )}
            >
              {loading ? '注册中…' : '注册'}
            </button>
          </div>

          <FormTip
            text="已有账号？"
            linkText="去登录"
            to="/login"
            className="mt-6"
            classNames={{ root: classNames?.tip }}
          />
        </div>
      </div>
    )
  },
)

RegisterPage.displayName = 'RegisterPage'
export default observer(RegisterPage)
