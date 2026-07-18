import { Controller, Post, Body, BadRequestException, Res, UseGuards } from '@nestjs/common'
import type { Response } from 'express'
import { ChatService, chatRequestSchema, type ChatRequest } from './chat.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

/**
 * ChatController — 聊天 API。
 *
 * 路由前缀 `/api/chat`，需要 JWT 鉴权。
 */
@UseGuards(JwtAuthGuard)
@Controller('/api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * POST /api/chat
   *
   * 接收 { msgId, conversationId, query, modelConfig, ... }
   * 转发 LLM API 流式响应，SSE 格式返回 { token, done }。
   */
  @Post('/')
  async chat(
    @Body() rawBody: unknown,
    @Res() res: Response,
  ): Promise<void> {
    // Zod 校验
    const parsed = chatRequestSchema.safeParse(rawBody)
    if (!parsed.success) {
      throw new BadRequestException({
        error: 'Invalid request',
        details: parsed.error.flatten(),
      })
    }

    const body: ChatRequest = parsed.data

    // SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    /** 写一条完整 SSE 事件 */
    const sseId = body.conversationId
    const writeEvent = (event: string, data: Record<string, unknown>) => {
      res.write(`id:${sseId}\n`)
      res.write(`event:${event}\n`)
      res.write(`data:${JSON.stringify(data)}\n\n`)
    }

    // 首个事件：对话 ID
    writeEvent('dialogId', { content: body.conversationId })

    // AsyncGenerator → SSE 行输出
    for await (const evt of this.chatService.streamChat(body)) {
      const type = evt.type as string
      switch (type) {
        case 'text':
          writeEvent('message', { type: 'text', content: evt.content as string })
          break
        case 'error':
          writeEvent('error', { content: evt.content as string })
          break
        case 'usage':
          writeEvent('usage', {
            promptTokens: evt.promptTokens,
            completionTokens: evt.completionTokens,
            totalTokens: evt.totalTokens,
          })
          break
        case 'done':
          writeEvent('finish', { content: '[DONE]' })
          break
      }
    }

    res.end()
  }
}
