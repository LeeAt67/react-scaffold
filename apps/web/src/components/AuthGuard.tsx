import { Navigate, Outlet } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { authStore } from '@/controller/instances'

/**
 * 鉴权守卫 — 未登录时重定向到 /login。
 *
 * 包裹在所有需要登录的路由外层。
 */
const AuthGuard = observer(() => {
  if (!authStore.isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
})

AuthGuard.displayName = 'AuthGuard'
export default AuthGuard
