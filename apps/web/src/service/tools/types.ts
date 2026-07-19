/**
 * 前端工具注册系统 TOOL_CONFIGS 模式。
 *
 * 架构：
 *   ToolDefinition（工具元数据 + schema + handler）
 *     → ToolRegistry（注册中心，记录所有可用工具）
 *       → TOOL_CONFIGS（显示配置，控制 UI 渲染）
 *         → ToolRenderer（根据工具名路由到正确的显示组件）
 */

import type { z } from 'zod'
import type { WebSearchResult } from '../chat'

// ── 工具定义 ──

/** 工具执行上下文 — handler 可访问的运行时数据 */
export interface ToolCallContext {
  /** 当前会话 ID */
  conversationId: string
  /** 用户查询文本 */
  query: string
  /** 中止信号 */
  signal?: AbortSignal
  /** 回调：推送搜索中提示条 */
  onProgress?: (message: string) => void
  /** 回调：推送中间结果 */
  onPartialResult?: (result: unknown) => void
}

/** 工具执行结果 */
export interface ToolResult<TData = unknown> {
  /** 是否出错 */
  error?: string
  /** 工具产出数据 */
  data?: TData
}

/** 工具定义 — 描述一个可被前端调用的工具 */
export interface ToolDefinition<TInput = unknown, TOutput = unknown> {
  /** 工具唯一名称，对齐服务端 SSE 事件类型 */
  name: string
  /** 工具描述 */
  description: string
  /** Zod schema 用于校验输入 */
  schema?: z.ZodType<TInput>
  /** 是否在联网搜索启用时自动前置执行 */
  preWebSearch?: boolean
  /** 执行器：返回 ToolResult 或 AsyncGenerator（流式） */
  handler: (input: TInput, ctx: ToolCallContext) => Promise<ToolResult<TOutput>> | AsyncGenerator<ToolResult<TOutput>>
}

// ── 工具显示配置 ──

/** 工具输入栏的展示方式 */
export type ToolInputDisplay =
  | { type: 'one-line'; getValue: (input: unknown) => string; icon?: string; label?: string }
  | { type: 'collapsible'; title: string | ((input: unknown) => string); contentType?: 'text' | 'json' | 'markdown'; defaultOpen?: boolean }
  | { type: 'hidden' }

/** 工具结果的展示方式 */
export type ToolResultDisplay =
  | { type: 'one-line'; getMessage: (result: unknown) => string }
  | { type: 'collapsible'; title: string | ((result: unknown) => string); contentType?: 'text' | 'markdown' | 'search-results' | 'json'; defaultOpen?: boolean }
  | { type: 'hidden' }
  | { type: 'search-results'; results: WebSearchResult[] }

/** 工具的完整显示配置 */
export interface ToolDisplayConfig {
  input: ToolInputDisplay
  result: ToolResultDisplay
}

/** 来自 SSE 的工具调用事件 */
export interface ToolCallEvent {
  /** 工具名称 */
  tool: string
  /** 工具输入参数 */
  input: unknown
  /** 事件类型：call / result */
  type: 'call' | 'result'
  /** 结果（仅 result 类型） */
  result?: ToolResult
}

/** 前端工具状态 */
export interface ToolCallState {
  toolName: string
  input: unknown
  status: 'running' | 'completed' | 'error'
  result?: ToolResult
  startedAt: number
  /** 进度消息（如"正在搜索…"），tool_progress 事件时更新 */
  progressMessage?: string
}
