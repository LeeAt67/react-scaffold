import { type RouteObject } from 'react-router-dom'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import AboutPage from '@/pages/AboutPage'
import ChatInputDemo from '@/pages/ChatInputDemo'

/**
 * 路由配置数组 — 集中管理所有路由
 *
 * 优势：
 * - 一眼看清所有路由结构
 * - 方便动态增删、权限过滤
 * - 未来可扩展 meta 信息（标题、图标、权限等）
 */
const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'kui', element: <ChatInputDemo /> },
    ],
  },
]

export default routes
