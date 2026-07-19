/**
 * 日志工具 — 服务端本地实现，与 @yes/shared 中 createLogger 接口一致。
 *
 * NestJS + SWC 构建不支持 tsconfig paths，故在 server 内自建 logger。
 * 用法：
 *   const logger = createLogger('chat:web-search')
 *   logger.warn('Failed to get data:', error)
 */

type LogFn = (...args: unknown[]) => void

export interface Logger {
  debug: LogFn
  info: LogFn
  warn: LogFn
  error: LogFn
}

/**
 * 创建带命名空间的日志实例。
 *
 * @param namespace - 模块命名，格式 `大模块:子模块`
 */
export const createLogger = (namespace: string): Logger => {
  const prefix = `[${namespace}]`

  return {
    debug: (...args: unknown[]) => {
      console.debug(prefix, ...args)
    },
    info: (...args: unknown[]) => {
      console.log(prefix, ...args)
    },
    warn: (...args: unknown[]) => {
      console.warn(prefix, ...args)
    },
    error: (...args: unknown[]) => {
      console.error(prefix, ...args)
    },
  }
}
