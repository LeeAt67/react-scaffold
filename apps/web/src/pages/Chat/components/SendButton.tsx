import * as React from 'react'
import { ArrowUp, Loader2, Square } from 'lucide-react'
import { Button } from '@yes/ui'

/**
 * SendButton — 发送按钮
 *
 * 有内容时亮色圆形，无内容时隐藏/禁用
 */
export interface SendButtonProps {
  /** 是否可发送 */
  canSend: boolean
  /** 是否加载中 */
  loading?: boolean
  /** 点击回调 */
  onSend: () => void
  /** 停止生成 */
  onStop?: () => void
}

const SendButton: React.FC<SendButtonProps> = ({
  canSend,
  loading = false,
  onSend,
  onStop,
}) => {
  // 加载中显示停止按钮
  if (loading && onStop) {
    return (
      <Button
        variant="primaryCircle"
        size="iconMd"
        onClick={onStop}
        aria-label="停止生成"
        title="停止生成"
      >
        <Square className="h-3.5 w-3.5" />
      </Button>
    )
  }

  if (!canSend && !loading) {
    return (
      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
        <ArrowUp className="h-4 w-4 text-muted-foreground/40" />
      </div>
    )
  }

  return (
    <Button
      variant="primaryCircle"
      size="iconMd"
      onClick={onSend}
      disabled={!canSend || loading}
      aria-label="发送"
      title="发送 (Enter)"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ArrowUp className="h-4 w-4" />
      )}
    </Button>
  )
}
SendButton.displayName = 'SendButton'

export { SendButton }
