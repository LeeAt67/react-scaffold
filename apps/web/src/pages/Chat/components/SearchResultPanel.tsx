import * as React from 'react'
import { X, ExternalLink } from 'lucide-react'
import { cn } from '@yes/shared'
import type { WebSearchResult } from '@/service/chat'

export interface SearchResultPanelProps {
  /** 搜索结果列表 */
  results: WebSearchResult[]
  /** 是否打开 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  className?: string
}

/**
 * SearchResultPanel — 联网搜索结果侧边栏。
 *
 * 从右侧滑入，展示搜索结果列表（标题、摘要、来源）并支持点击跳转。
 */
const SearchResultPanel: React.FC<SearchResultPanelProps> = ({
  results,
  open,
  onClose,
  className,
}) => {
  if (!open) return null

  /** 打开链接（新标签页） */
  const handleOpenLink = (url?: string) => {
    if (!url) return
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 侧边栏 */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l bg-background shadow-lg',
          className,
        )}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">
            搜索结果（{results.length}）
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 结果列表 */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无搜索结果</p>
          ) : (
            <ul className="space-y-3">
              {results.map((result, i) => (
                <li key={result.url ?? i}>
                  <button
                    type="button"
                    onClick={() => handleOpenLink(result.url)}
                    className="block w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-medium text-foreground">
                          {result.name || '无标题'}
                        </h4>
                        {result.snippet && (
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {result.snippet}
                          </p>
                        )}
                        <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground/70">
                          <span className="truncate">{result.siteName || result.url}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}

export default SearchResultPanel
