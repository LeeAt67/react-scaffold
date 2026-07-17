import * as React from 'react'
import { cn } from '@/lib/utils'
import { PromptTextarea } from '@/components/kui/molecules/PromptTextarea'
import { InputToolbar } from '@/components/kui/organisms/InputToolbar'

/**
 * ChatInput — Claude 风格输入框（完整组件）
 *
 * 原子链：KuiButton → IconButton → VoiceButton/AttachButton
 *                               → SendButton
 *          PromptTextarea
 *          ModelSelector
 *          └── InputToolbar ──→ ChatInput
 */
export interface ChatInputProps {
  /** 输入值 */
  value: string
  /** 值变化 */
  onValueChange: (value: string) => void
  /** 发送回调 */
  onSend: () => void
  /** 占位文本 */
  placeholder?: string
  /** 是否加载中 */
  loading?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 最大字符数 */
  maxLength?: number
  // 模型选择
  model?: string
  models?: readonly string[]
  onModelSelect?: (model: string) => void
  // 语音
  onVoiceToggle?: () => void
  recording?: boolean
  // 附件
  onAttach?: () => void
  // 设置
  onSettings?: () => void
  /** 外框类名 */
  className?: string
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onValueChange,
  onSend,
  placeholder = '输入您的问题，Enter 发送，Shift+Enter 换行',
  loading = false,
  disabled = false,
  maxLength = 4000,
  model = 'Sonnet 5 Medium',
  models = ['Sonnet 5 Medium', 'Sonnet 5 Fast', 'Opus 5'],
  onModelSelect = () => {},
  onVoiceToggle = () => {},
  recording = false,
  onAttach = () => {},
  onSettings = () => {},
  className,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null)

  // 监听自定义发送事件
  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const handler = () => {
      if (value.trim() && !loading) onSend()
    }
    container.addEventListener('prompt-send', handler)
    return () => container.removeEventListener('prompt-send', handler)
  }, [value, loading, onSend])

  const canSend = value.trim().length > 0 && !disabled
  const charCount = value.length

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative rounded-2xl border bg-card shadow-sm',
        'transition-shadow focus-within:shadow-md focus-within:ring-1 focus-within:ring-ring/20',
        disabled && 'opacity-60 pointer-events-none',
        className,
      )}
    >
      {/* 输入区 */}
      <PromptTextarea
        value={value}
        onValueChange={onValueChange}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className="min-h-[44px]"
      />

      {/* 工具栏 */}
      <InputToolbar
        model={model}
        models={models}
        onModelSelect={onModelSelect}
        recording={recording}
        onVoiceToggle={onVoiceToggle}
        canSend={canSend}
        loading={loading}
        onSend={onSend}
        onAttach={onAttach}
        onSettings={onSettings}
      />

      {/* 字符计数（右下角） */}
      {value.length > 0 && (
        <div className="absolute bottom-1 right-14 text-[10px] text-muted-foreground/50 pointer-events-none">
          {charCount}/{maxLength}
        </div>
      )}
    </div>
  )
}
ChatInput.displayName = 'KuiChatInput'

export { ChatInput }
