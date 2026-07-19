/**
 * 工具注册中心 — 全局单例，管理所有可用工具的定义。
 *
 * TOOL_CONFIGS 查找模式：
 *   registry.get(name) → ToolDefinition | undefined
 *
 * 与   的区别：
 *   -   的工具由 LLM 驱动（Anthropic tool_use），前端只渲染
 *   - 我们的工具由前端调度：注册 schema + handler，SSE 流中触发执行 → 渲染结果
 */

import type { ToolDefinition } from './types'

class ToolRegistry {
  /** 内部注册表：工具名 → 定义 */
  private tools = new Map<string, ToolDefinition>()

  /**
   * 注册一个工具。
   *
   * @param def - 工具定义
   */
  register = (def: ToolDefinition): void => {
    if (this.tools.has(def.name)) {
      console.warn(`[ToolRegistry] 工具 "${def.name}" 已注册，将被覆盖`)
    }
    this.tools.set(def.name, def)
  }

  /**
   * 按名称获取工具定义。
   *
   * @param name - 工具名称
   * @returns 工具定义，未注册则返回 undefined
   */
  get = (name: string): ToolDefinition | undefined => {
    return this.tools.get(name)
  }

  /**
   * 列出所有已注册的工具名称。
   */
  list = (): string[] => {
    return Array.from(this.tools.keys())
  }

  /**
   * 是否已注册指定工具。
   */
  has = (name: string): boolean => {
    return this.tools.has(name)
  }
}

/** 全局单例 */
export const toolRegistry = new ToolRegistry()
