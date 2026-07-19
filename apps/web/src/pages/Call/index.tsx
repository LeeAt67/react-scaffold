import React, { useEffect, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { cn, createLogger } from '@yes/shared'
import { livekitStore, conversationStore } from '@/controller/instances'
import livekitService from '@/service/livekit'
import CallControls from './components/CallControls'
import VideoGrid from './components/VideoGrid'
import CallStatusBar from './components/CallStatusBar'
import AudioWaveform from './components/AudioWaveform'
import TranscriptionPanel from './components/TranscriptionPanel'

const logger = createLogger('call:page')

/**
 * CallPage — 语音/视频通话页面（KUI 暖白色调）。
 *
 * 顶部状态栏 → 远端头像/视频 → 本地声波 → ASR 字幕 → 底部控制栏。
 */
const CallPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    connectionState,
    callState,
    remoteVideoTrack,
    isMuted,
    isVideoOff,
    transcriptionMessages,
  } = livekitStore

  const [localStream, setLocalStream] = useState<MediaStream | null>(null)

  /** 进入页面 → Token / 连接 LiveKit / 获取本地麦克风流 */
  useEffect(() => {
    const initCall = async () => {
      try {
        const roomName = `room_${conversationStore.activeId ?? 'default'}`
        const { wsUrl, token } = await livekitService.getToken(roomName)
        await livekitStore.connect(wsUrl, token, roomName)

        // 获取本地麦克风流供声波可视化
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          setLocalStream(stream)
        } catch {
          logger.warn('无法获取本地音频流用于波形显示')
        }

        logger.info('通话已连接:', roomName)
      } catch (error) {
        logger.error('通话连接失败:', error)
        navigate(-1)
      }
    }

    initCall()

    return () => {
      localStream?.getTracks().forEach(t => t.stop())
      livekitStore.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  /** 挂断 */
  const handleHangUp = useCallback(async () => {
    localStream?.getTracks().forEach(t => t.stop())
    await livekitStore.disconnect()
    navigate(-1)
  }, [navigate, localStream])

  /** 返回 */
  const handleBack = useCallback(async () => {
    localStream?.getTracks().forEach(t => t.stop())
    await livekitStore.disconnect()
    navigate(-1)
  }, [navigate, localStream])

  return (
    <div className="flex h-full flex-col bg-background">
      {/* 顶部状态栏 */}
      <CallStatusBar
        connectionState={connectionState}
        duration={livekitStore.formattedDuration}
        onBack={handleBack}
        className="border-b"
      />

      {/* 主区域 */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-4">
        {/* 远端视频 / 头像 */}
        {remoteVideoTrack ? (
          <VideoGrid
            remoteTrack={remoteVideoTrack}
            localTrack={livekitStore.localVideoTrack}
            isVideoOff={isVideoOff}
            className="max-h-[45%] w-full"
          />
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className={cn(
              'flex h-24 w-24 items-center justify-center rounded-full bg-muted ring-4 ring-muted transition-all',
              connectionState === 'connecting' && 'animate-pulse',
              connectionState === 'connected' && 'ring-primary/20',
            )}>
              <span className="text-2xl select-none">🤖</span>
            </div>

            {connectionState === 'connecting' && (
              <span className="text-sm text-muted-foreground">正在呼叫...</span>
            )}
            {connectionState === 'connected' && (
              <span className="text-sm text-muted-foreground">通话中</span>
            )}
            {callState === 'ended' && (
              <span className="text-sm text-muted-foreground">
                通话已结束 · {livekitStore.formattedDuration}
              </span>
            )}
          </div>
        )}

        {/* 本地麦克风声波 */}
        {connectionState === 'connected' && localStream && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              你的声音
            </span>
            <AudioWaveform
              stream={localStream}
              color="hsl(var(--primary))"
              width={240}
              height={48}
              barWidth={3}
            />
          </div>
        )}

        {/* ASR 转写字幕 */}
        {connectionState === 'connected' && (
          <TranscriptionPanel
            messages={transcriptionMessages}
            className="w-full max-w-sm"
          />
        )}
      </div>

      {/* 底部控制栏 */}
      <CallControls
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        onToggleMute={livekitStore.toggleMute}
        onToggleVideo={livekitStore.toggleVideo}
        onHangUp={handleHangUp}
        className="border-t pb-6"
      />
    </div>
  )
}

CallPage.displayName = 'CallPage'
export default observer(CallPage)
