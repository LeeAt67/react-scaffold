import * as React from 'react'
import { ChevronRight, Globe, Loader2 } from 'lucide-react'
import { cn } from '@yes/shared'
import type { WebSearchResult } from '@/service/chat'

export interface WebSearchActionBarProps {
  /** 搜索结果列表 */
  results?: WebSearchResult[]
  /** 搜索是否已完成 */
  done?: boolean
  /** 点击打开侧边栏回调 */
  onOpen?: () => void
  className?: string
}

/**
 * WebSearchActionBar — 联网搜索状态栏。
 *
 * 在 AI 回答上方显示搜索进度或结果摘要：
 * - 搜索中：转圈动画 + "正在搜索..."
 * - 搜索完成：结果数量 + 点击打开侧边栏
 * - 无结果/未启用：不渲染
 */
const WebSearchActionBar: React.FC<WebSearchActionBarProps> = ({
  results = [],
  done = true,
  onOpen,
  className,
}) => {
  const isLoading = !done
  const hasResults = results.length > 0
  const show = isLoading || hasResults

  if (!show) return null

  return (
    <div className={cn('mx-auto max-w-2xl px-4', className)}>
      <button
        type="button"
        onClick={hasResults ? onOpen : undefined}
        disabled={!hasResults}
        className={cn(
          'mb-2 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground transition-colors',
          hasResults && 'cursor-pointer hover:bg-muted hover:text-foreground',
          !hasResults && 'cursor-default',
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>正在搜索…</span>
          </>
        ) : (
          <>
            <Globe className="h-3.5 w-3.5" />
            <span>找到 {results.length} 条搜索结果</span>
            <ChevronRight className="ml-auto h-3.5 w-3.5" />
          </>
        )}
      </button>
    </div>
  )
}

export default WebSearchActionBar
