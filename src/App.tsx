import { BrowserRouter, useRoutes } from 'react-router-dom'
import { StoreContext, rootStore } from '@/stores'
import routes from '@/routes'

/**
 * 路由渲染组件 — 使用 useRoutes() 将数组配置转为路由树
 */
function AppRoutes() {
  return useRoutes(routes)
}

/**
 * App — 应用根组件
 *
 * 职责：
 * 1. StoreContext.Provider — 注入 MobX 全局状态
 * 2. BrowserRouter — 启用客户端路由
 * 3. AppRoutes — 渲染路由树（配置来自 routes.tsx）
 */
function App() {
  return (
    <StoreContext.Provider value={rootStore}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </StoreContext.Provider>
  )
}

export default App
