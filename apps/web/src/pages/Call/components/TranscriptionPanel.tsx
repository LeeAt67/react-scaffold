import React, { useEffect, useRef } from 'react'
import { cn } from '@yes/shared'
import type { TranscriptionMessage } from '@/controller/stores/livekit'

/**
 * TranscriptionPanel — 实时 ASR 转写字幕面板。
 *
 * 接收 Agent 通过 Data Channel RPC 回传的语音识别文本，
 * 按说话人左右分列展示，自动滚动到最新消息。
 */
export interface TranscriptionPanelProps {
  /** ASR 转写消息列表 */
  messages: TranscriptionMessage[]
  className?: string
}

const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({
  messages,
  className,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length])

  if (messages.length === 0) {
    return (
      <div className={cn(
        'flex items-center justify-center rounded-lg border border-dashed px-4 py-6',
        className,
      )}>
        <span className="text-xs text-muted-foreground">
          等待语音识别结果...
        </span>
      </div>
    )
  }

  // 去重：同一句 isFinal 覆盖之前的 interim
  const displayMessages = messages.filter((msg, i) => {
    if (msg.isFinal) return true
    // 保留最后一条 interim
    const nextSame = messages.slice(i + 1).find(m => m.speaker === msg.speaker)
    return !nextSame
  })

  return (
    <div
      ref={scrollRef}
      className={cn(
        'max-h-32 overflow-y-auto rounded-lg border bg-card px-3 py-2 space-y-1.5',
        className,
      )}
    >
      {displayMessages.map((msg, i) => (
        <div
          key={msg.timestamp + '-' + i}
          className={cn(
            'flex gap-2 text-xs leading-relaxed',
            msg.speaker === 'user' ? 'justify-end' : 'justify-start',
          )}
        >
          <span className={cn(
            'inline-block max-w-[85%] rounded-lg px-2.5 py-1',
            msg.speaker === 'user'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground',
            !msg.isFinal && 'italic opacity-70',
          )}>
            {msg.speaker === 'agent' && (
              <span className="mr-1 select-none text-[10px] opacity-50">🤖</span>
            )}
            {msg.text}
          </span>
        </div>
      ))}
    </div>
  )
}

TranscriptionPanel.displayName = 'TranscriptionPanel'
export default TranscriptionPanel
