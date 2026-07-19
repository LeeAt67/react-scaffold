import React, { useEffect, useRef } from 'react'
import { cn, createLogger } from '@yes/shared'

const logger = createLogger('call:waveform')

/**
 * AudioWaveform — 麦克风实时声波可视化。
 *
 * 使用 Canvas 绘制 FFT 频率柱状波形，实时反映音频输入强度。
 * 无需外部依赖，直接读取 MediaRecorder 关联的 MediaStream。
 */
export interface AudioWaveformProps {
  /** 音频流（来自 MediaRecorder.stream） */
  stream: MediaStream | null
  /** 波形条颜色 */
  color?: string
  /** 宽度 */
  width?: number
  /** 高度 */
  height?: number
  /** 条形宽度 */
  barWidth?: number
  className?: string
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({
  stream,
  color = '#171717',
  width = 300,
  height = 60,
  barWidth = 3,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    if (!stream) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const audioCtx = new AudioContext()
    const source = audioCtx.createMediaStreamSource(stream)
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.3
    source.connect(analyser)

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animRef.current = requestAnimationFrame(draw)

      analyser.getByteFrequencyData(dataArray)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)

      const gap = 2
      const totalBars = Math.min(dataArray.length, Math.floor(width / (barWidth + gap)))
      const startX = (width - totalBars * (barWidth + gap)) / 2

      for (let i = 0; i < totalBars; i++) {
        const value = dataArray[i]
        const barHeight = (value / 255) * height * 0.8
        const x = startX + i * (barWidth + gap)
        const y = (height - barHeight) / 2

        // 渐变色：底部透明 → 顶部实色
        const gradient = ctx.createLinearGradient(0, height, 0, 0)
        gradient.addColorStop(0, color + '1A') // 10% 透明度
        gradient.addColorStop(0.5, color + '66') // 40%
        gradient.addColorStop(1, color)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2)
        ctx.fill()
      }
    }

    draw()

    return () => {
      cancelAnimationFrame(animRef.current)
      source.disconnect()
      audioCtx.close()
    }
  }, [stream, color, width, height, barWidth])

  return (
    <canvas
      ref={canvasRef}
      className={cn('block', className)}
      style={{ width, height }}
    />
  )
}

AudioWaveform.displayName = 'AudioWaveform'
export default AudioWaveform
