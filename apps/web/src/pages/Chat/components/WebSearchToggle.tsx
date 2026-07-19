import * as React from 'react'
import { Globe, GlobeOff } from 'lucide-react'
import { IconButton } from '@yes/ui'
import { cn } from '@yes/shared'

export interface WebSearchToggleProps {
  /** 是否启用联网搜索 */
  enabled: boolean
  /** 切换回调 */
  onToggle: () => void
  /** 是否禁用（如发送中） */
  disabled?: boolean
  className?: string
}

/**
 * WebSearchToggle — 联网搜索开关按钮。
 *
 * 与 ModelSelector、VoiceButton 风格一致的工具栏按钮，
 * 点击后在 enabled/disabled 之间切换。
 */
const WebSearchToggle: React.FC<WebSearchToggleProps> = ({
  enabled,
  onToggle,
  disabled = false,
  className,
}) => {
  return (
    <IconButton
      label={enabled ? '关闭联网搜索' : '开启联网搜索'}
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        enabled && 'text-primary',
        className,
      )}
    >
      {enabled ? (
        <Globe className="h-4 w-4" />
      ) : (
        <GlobeOff className="h-4 w-4" />
      )}
    </IconButton>
  )
}

export default WebSearchToggle
