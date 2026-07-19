import React from 'react'
import { cn } from '@yes/shared'
import { Mic, MicOff, Video, VideoOff, Volume2, PhoneOff } from 'lucide-react'

/**
 * CallControls — 通话底部控制栏（KUI 暖白色调适配）。
 *
 * 四按钮：静音 / 摄像头 / 扬声器 / 挂断（destructive 红色突出）。
 */
export interface CallControlsProps {
  isMuted: boolean
  isVideoOff: boolean
  onToggleMute: () => void
  onToggleVideo: () => void
  onHangUp: () => void
  className?: string
}

const btn = cn(
  'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
)

const CallControls: React.FC<CallControlsProps> = ({
  isMuted,
  isVideoOff,
  onToggleMute,
  onToggleVideo,
  onHangUp,
  className,
}) => {
  return (
    <div className={cn(
      'flex items-center justify-center gap-4 px-6 pt-3',
      className,
    )}>
      {/* 静音 */}
      <button
        onClick={onToggleMute}
        className={cn(
          btn,
          isMuted
            ? 'bg-destructive/10 text-destructive hover:bg-destructive/15'
            : 'hover:bg-muted',
        )}
        title={isMuted ? '取消静音' : '静音'}
      >
        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </button>

      {/* 摄像头 */}
      <button
        onClick={onToggleVideo}
        className={cn(
          btn,
          isVideoOff
            ? 'bg-destructive/10 text-destructive hover:bg-destructive/15'
            : 'hover:bg-muted',
        )}
        title={isVideoOff ? '开启摄像头' : '关闭摄像头'}
      >
        {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
      </button>

      {/* 扬声器 */}
      <button
        className={cn(btn, 'text-muted-foreground hover:bg-muted')}
        title="扬声器"
        onClick={() => {}}
      >
        <Volume2 className="h-5 w-5" />
      </button>

      {/* 挂断 — 红色突出 */}
      <button
        onClick={onHangUp}
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full',
          'bg-destructive text-destructive-foreground shadow-md',
          'transition-transform hover:scale-110 active:scale-95',
        )}
        title="挂断"
      >
        <PhoneOff className="h-6 w-6" />
      </button>
    </div>
  )
}

CallControls.displayName = 'CallControls'
export default CallControls
