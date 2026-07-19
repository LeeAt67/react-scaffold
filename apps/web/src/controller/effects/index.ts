/**
 * Controller 层副作用（骨架）。
 */

import { createLogger } from '@yes/shared'
import { registerBuiltinTools } from '@/service/tools'

const logger = createLogger('controller:effects')

/** 初始化应用副作用 */
export const initApp = () => {
  logger.info('App initialized')

  // 注册内置工具（web_search 等）
  registerBuiltinTools()
}
