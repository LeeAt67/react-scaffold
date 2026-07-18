import { z } from 'zod'
import { createLogger } from '@yes/shared'
import { EventSourceParserStream } from 'eventsource-parser/stream'
import { api } from '../api'

const logger = createLogger('service:chat')

/** 聊天消息 schema */
export const messageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  createdAt: z.number(),
})

export type Message = z.infer<typeof messageSchema>

/**
 * 流式聊天回调类型。
 */
export type StreamCallback = (token: string, done: boolean) => void

/** 模型配置 — 收敛到一个对象里 */
export interface ModelConfig {
  model?: string
  enableThinking?: boolean
  webSearchStatus?: 'disabled' | 'enabled'
  maxTokens?: number
  temperature?: number
}

/** 流式请求可选参数 */
export interface ChatStreamOptions {
  conversationId: string
  msgId?: string
  system?: string
  modelConfig?: ModelConfig
  multiMedias?: unknown[]
  /** 用于取消请求的 AbortSignal */
  signal?: AbortSignal
}

/** SSE 事件中解析出的 payload，对齐格式 */
interface SSEPayload {
  type?: string
  content?: string
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
}

/**
 * 发送聊天消息（流式 SSE）。
 *
 * 管道：
 *   Req.stream → ReadableStream
 *     → .pipeThrough(new TextDecoderStream())        // bytes → text
 *     → .pipeThrough(new EventSourceParserStream())   // text → SSE events
 *     → .getReader()                                  // 拿到 { event, data }
 *       → while(true) reader.read()
 *         → JSON.parse(data) → onToken(token) → appendToken → UI
 *
 * @param query - 用户输入内容
 * @param onToken - 每收到一个 token 时回调
 * @param options - 必传 conversationId，可选 msgId/modelConfig/system/multiMedias
 * @returns 解析后的完整消息数组
 */
export const streamChatMessage = async (
  query: string,
  onToken: StreamCallback,
  options: ChatStreamOptions,
): Promise<Message[]> => {
  const msgId = options.msgId ?? crypto.randomUUID()
  logger.info('Streaming chat message:', { msgId, conversationId: options.conversationId })

  // ① Go 风格：永不抛异常
  const [response, err] = await api.stream('/api/chat', {
    msgId,
    conversationId: options.conversationId,
    query,
    system: options.system,
    modelConfig: options.modelConfig ?? {},
    multiMedias: options.multiMedias ?? [],
  }, options.signal)

  if (err) {
    logger.warn('Chat API failed:', err.status, err.message)
    return []
  }

  // ② 管道：字节流 → 文本流 → SSE 事件
  const reader = response!
    .body!
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new EventSourceParserStream())
    .getReader()

  // ③ RAF 节流：累积 token 到当前帧，每帧最多 flush 一次
  let cachedContent = ''
  let rafId: number | null = null

  const flushCache = () => {
    if (rafId !== null) cancelAnimationFrame(rafId)
    if (cachedContent) {
      onToken(cachedContent, false)
      cachedContent = ''
    }
    rafId = null
  }

  const scheduleFlush = () => {
    if (rafId !== null) return
    rafId = requestAnimationFrame(() => {
      if (cachedContent) onToken(cachedContent, false)
      cachedContent = ''
      rafId = null
    })
  }

  let fullContent = ''

  // ④ 使用 while(true) 循环读取 SSE 事件
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value?.data) continue

      // mimo 格式：event:message → token，event:error → 错误，event:finish/dialogId → 跳过
      const eventType = (value as { event?: string }).event

      if (eventType === 'error') {
        flushCache()
        try {
          const parsed = JSON.parse(value.data) as SSEPayload
          logger.warn('Chat stream error:', parsed.content)
          return [
            { id: crypto.randomUUID(), role: 'user', content: query, createdAt: Date.now() },
            { id: crypto.randomUUID(), role: 'assistant', content: parsed.content ?? '未知错误', createdAt: Date.now() },
          ]
        } catch {
          return []
        }
      }

      if (eventType === 'message') {
        try {
          const parsed = JSON.parse(value.data) as SSEPayload
          if (parsed.type === 'text' && parsed.content) {
            fullContent += parsed.content
            cachedContent += parsed.content
            scheduleFlush()
          }
        } catch { /* skip */ }
      }

      if (eventType === 'finish') {
        flushCache()
        logger.info('Chat stream completed')
        return [
          { id: crypto.randomUUID(), role: 'user', content: query, createdAt: Date.now() },
          { id: crypto.randomUUID(), role: 'assistant', content: fullContent, createdAt: Date.now() },
        ]
      }

      // dialogId / usage → 静默跳过
    }
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      logger.info('Chat stream cancelled by user')
      flushCache()
      return [
        { id: crypto.randomUUID(), role: 'user', content: query, createdAt: Date.now() },
        { id: crypto.randomUUID(), role: 'assistant', content: fullContent, createdAt: Date.now() },
      ]
    }
    throw err
  }

  flushCache()
  logger.info('Chat stream ended without done signal')
  return [
    { id: crypto.randomUUID(), role: 'user', content: query, createdAt: Date.now() },
    { id: crypto.randomUUID(), role: 'assistant', content: fullContent, createdAt: Date.now() },
  ]
}
