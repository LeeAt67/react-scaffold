import { z } from 'zod'
import { createLogger } from '@yes/shared'

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
 * 发送聊天消息（模拟）�?
 *
 * @param content - 用户输入内容
 * @returns 解析后的消息数组
 */
export const sendChatMessage = async (content: string): Promise<Message[]> => {
  logger.info('Sending chat message:', { content })

  // TODO: 替换为真�?API 调用
  const raw = [
    {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `收到你的消息: "${content}"`,
      createdAt: Date.now(),
    },
  ]

  const result = z.array(messageSchema).safeParse(raw)
  if (!result.success) {
    logger.error('Chat response validation failed:', result.error)
    return []
  }

  logger.info('Chat message sent successfully')
  return result.data
}
