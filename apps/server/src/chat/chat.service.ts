import { Injectable } from '@nestjs/common'
import { z } from 'zod'

// ── LLM API 配置 ──
const LLM_API_URL = process.env.LLM_API_URL!
const LLM_API_KEY = process.env.LLM_API_KEY!

// ── Schema ──

export const modelConfigSchema = z.object({
  model: z.string().optional(),
  enableThinking: z.boolean().optional(),
  webSearchStatus: z.enum(['disabled', 'enabled']).optional(),
  maxTokens: z.number().min(1).max(16000).optional(),
  temperature: z.number().min(0).max(2).optional(),
})

export type ModelConfig = z.infer<typeof modelConfigSchema>

export const chatRequestSchema = z.object({
  msgId: z.string(),
  conversationId: z.string(),
  query: z.string().min(1).max(8000),
  isEditedQuery: z.boolean().optional().default(false),
  system: z.string().optional(),
  modelConfig: modelConfigSchema.optional(),
  multiMedias: z.array(z.any()).optional().default([]),
})

export type ChatRequest = z.infer<typeof chatRequestSchema>

const DEFAULT_MODEL_CONFIG = {
  model: 'deepseek-chat',
  enableThinking: false,
  webSearchStatus: 'disabled' as const,
  maxTokens: 2048,
}

/** 规范模型 Markdown 输出的系统提示词，每次请求自动附带 */
const MD_FORMAT_SYSTEM_PROMPT = `输出 Markdown 内容时，请严格遵守以下规则：

1. 数学公式：行内用单个 $...$ 包裹，块级单独一行用 $$...$$ 包裹。禁止在普通文本或代码中使用 $ 符号。
2. 代码块：用三个反引号围栏，标注语言，如 \`\`\`python ... \`\`\`。代码内部禁止出现 $ 符号。
3. LaTeX 语法：花括号必须成对，如 \\frac{1}{2}、\\sqrt{x}、\\int_{0}^{1}。
4. 标题：用 ## 或 ###，禁止用 #。
5. 列表、表格：用标准 GFM 语法。`

// ── LLM chunk ──
interface LLMChunk {
  choices?: Array<{ delta?: { content?: string } }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * ChatService — 封装 LLM API 调用，返回异步生成器。
 *
 * 产出 `{ type, content }` 事件，对齐SSE 格式。
 */
@Injectable()
export class ChatService {
  /**
   * 向 LLM 发起流式请求，返回 AsyncGenerator 逐 token 产出。
   *
   * 产出事件类型：
   * - `{ type: 'text', content: string }` — 消息 token
   * - `{ type: 'error', content: string }` — 错误信息
   * - `{ type: 'usage', promptTokens, completionTokens, totalTokens }` — token 用量
   * - `{ type: 'done' }` — 结束
   */
  async *streamChat(body: ChatRequest): AsyncGenerator<Record<string, unknown>> {
    const { query, system, modelConfig: rawMc } = body
    const mc = { ...DEFAULT_MODEL_CONFIG, ...rawMc }

    // 拼接系统提示词
    const mergedSystem = system
      ? `${MD_FORMAT_SYSTEM_PROMPT}\n\n---\n\n${system}`
      : MD_FORMAT_SYSTEM_PROMPT

    let llmRes: Response
    try {
      llmRes = await fetch(LLM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LLM_API_KEY}`,
        },
        body: JSON.stringify({
          model: mc.model,
          messages: [
            { role: 'system', content: mergedSystem },
            { role: 'user', content: query },
          ],
          max_tokens: mc.maxTokens,
          ...(mc.temperature !== undefined ? { temperature: mc.temperature } : {}),
          stream: true,
        }),
      })
    } catch (err) {
      yield { type: 'error', content: `LLM API unreachable: ${(err as Error).message}` }
      return
    }

    if (!llmRes.ok) {
      const errText = await llmRes.text().catch(() => '')
      console.error(`[chat] LLM API error ${llmRes.status}:`, errText)
      yield { type: 'error', content: `LLM API error ${llmRes.status}` }
      return
    }

    // 管道：字节流 → 文本流 → 消费
    const reader = llmRes.body!
      .pipeThrough(new TextDecoderStream())
      .getReader()

    let usageInfo: Record<string, number> | null = null

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (!value) continue

        for (const line of value.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (raw === '[DONE]') {
            yield { type: 'done' }
            return
          }

          try {
            const chunk: LLMChunk = JSON.parse(raw)
            const token = chunk.choices?.[0]?.delta?.content
            if (token) yield { type: 'text', content: token }

            // 捕获 usage（deepseek 在最后返回）
            if (chunk.usage) {
              usageInfo = {
                promptTokens: chunk.usage.prompt_tokens,
                completionTokens: chunk.usage.completion_tokens,
                totalTokens: chunk.usage.total_tokens,
              }
            }
          } catch { /* skip */ }
        }
      }
    } catch { /* stream interrupted */ }

    // 输出 usage
    if (usageInfo) {
      yield { type: 'usage', ...usageInfo }
    }
    yield { type: 'done' }
  }
}
