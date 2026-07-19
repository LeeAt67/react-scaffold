/**
 * 内置工具注册 — 在应用启动时注册所有可用工具。
 *
 * 新增工具只需在此文件添加 register 调用即可。
 */

import { z } from 'zod'
import { toolRegistry } from './registry'
import { createLogger } from '@yes/shared'

const logger = createLogger('tools:builtin')

/** 联网搜索输入 schema */
const webSearchInputSchema = z.object({
  query: z.string().min(1).max(2000),
})

/**
 * 注册所有内置工具。
 *
 * 应用启动时调用一次。
 */
export const registerBuiltinTools = (): void => {
  // ── 联网搜索 ──
  toolRegistry.register({
    name: 'web_search',
    description: '搜索互联网获取实时信息',
    schema: webSearchInputSchema,
    preWebSearch: true,
    handler: async (input, ctx) => {
      logger.info('执行 web_search:', (input as { query: string }).query.slice(0, 50))
      // 搜索由服务端 ChatService 执行，前端 handler 为占位
      // 实际搜索结果的展示通过 SSE 事件驱动
      ctx.onProgress?.('正在搜索…')
      return { data: { query: (input as { query: string }).query } }
    },
  })

  logger.info(`已注册 ${toolRegistry.list().length} 个工具:`, toolRegistry.list())
}
