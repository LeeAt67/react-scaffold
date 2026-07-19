import React from 'react'
import { cn } from '@yes/shared'
import { ArrowLeft } from 'lucide-react'
import type { ConnectionState } from '@/controller/stores/livekit'

/**
 * CallStatusBar — 通话顶部状态栏（KUI 适配）。
 *
 * 左：返回 | 中：状态指示灯 + 文字 | 右：通话时长。
 */
export interface CallStatusBarProps {
  connectionState: ConnectionState
  duration: string
  onBack: () => void
  className?: string
}

const cfg: Record<ConnectionState, { label: string; dot: string }> = {
  disconnected: { label: '未连接', dot: 'bg-muted-foreground' },
  connecting: { label: '连接中', dot: 'bg-yellow-400 animate-pulse' },
  connected: { label: '通话中', dot: 'bg-green-500' },
  disconnecting: { label: '断开中', dot: 'bg-orange-400' },
}

const CallStatusBar: React.FC<CallStatusBarProps> = ({
  connectionState,
  duration,
  onBack,
  className,
}) => {
  const s = cfg[connectionState]

  return (
    <div className={cn(
      'flex h-12 shrink-0 items-center justify-between px-3',
      className,
    )}>
      <button
        onClick={onBack}
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        title="返回"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-1.5">
        <span className={cn('h-2 w-2 rounded-full', s.dot)} />
        <span className="text-xs text-muted-foreground">{s.label}</span>
      </div>

      <span className="font-mono text-xs tabular-nums text-muted-foreground">
        {connectionState === 'connected' ? duration : '00:00'}
      </span>
    </div>
  )
}

CallStatusBar.displayName = 'CallStatusBar'
export default CallStatusBar
