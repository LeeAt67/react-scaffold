import { makeAutoObservable } from 'mobx'
import type { ToolCallState, ToolResult } from '@/service/tools/types'

/**
 * ToolStore — 管理当前消息的工具调用状态。
 *
 * 每次发送消息时重置，流式过程中追加 tool_call 事件。
 */
class ToolStore {
  /** 当前消息的工具调用列表 */
  calls: ToolCallState[] = []

  constructor() {
    makeAutoObservable(this)
  }

  /**
   * 追加一条工具调用（SSE 流中收到 tool_call 事件时调用）。
   */
  addCall = (toolName: string, input: unknown): void => {
    this.calls.push({
      toolName,
      input,
      status: 'running',
      startedAt: Date.now(),
    })
  }

  /**
   * 更新工具进度消息（SSE tool_progress 事件）。
   */
  setProgress = (name: string, message: string): void => {
    for (let i = this.calls.length - 1; i >= 0; i--) {
      if (this.calls[i].toolName === name && this.calls[i].status === 'running') {
        this.calls[i].progressMessage = message
        break
      }
    }
  }

  /**
   * 标记工具调用完成。
   */
  completeCall = (index: number, result: ToolResult): void => {
    if (index < 0 || index >= this.calls.length) return
    const call = this.calls[index]
    call.status = result.error ? 'error' : 'completed'
    call.result = result
    call.progressMessage = undefined
  }

  /**
   * 重置（新消息发送前调用）。
   */
  reset = (): void => {
    this.calls = []
  }
}

export default ToolStore
