import * as React from 'react'
import { Search, ChevronDown, ChevronRight, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@yes/shared'
import { getToolConfig } from '@/service/tools/configs'
import type { ToolCallState, ToolDisplayConfig } from '@/service/tools/types'
import type { WebSearchResult } from '@/service/chat'

/** 图标映射 */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  search: Search,
}

/**
 * ToolRenderer — 工具调用显示路由。
 *
 *   根据工具名查 TOOL_CONFIGS → 确定渲染方式 → 路由到对应组件。
 *
 * Props:
 * - state: 工具执行状态
 * - onOpenSearch?: 打开搜索侧边栏
 */
export interface ToolRendererProps {
  state: ToolCallState
  onOpenSearch?: () => void
  className?: string
}

const ToolRenderer: React.FC<ToolRendererProps> = ({
  state,
  onOpenSearch,
  className,
}) => {
  const config: ToolDisplayConfig = getToolConfig(state.toolName)
  const { status, input } = state

  /** 状态图标 */
  const StatusIcon = (): React.ReactNode => {
    if (status === 'running') return <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
    if (status === 'error') return <AlertCircle className="h-3.5 w-3.5 text-destructive" />
    return <CheckCircle className="h-3.5 w-3.5 text-green-500" />
  }

  /** 进度消息（tool_progress 时的提示） */
  const progressMsg = state.progressMessage

  // ── 渲染输入栏 ──

  const renderInput = (): React.ReactNode => {
    const { input: inputCfg } = config

    if (inputCfg.type === 'hidden') return null

    if (inputCfg.type === 'one-line') {
      const Icon = inputCfg.icon ? ICON_MAP[inputCfg.icon] : null
      const value = inputCfg.getValue(input)
      return (
        <div className={cn('mb-1 flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-1.5 text-xs', className)}>
          <StatusIcon />
          {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
          {inputCfg.label && <span className="font-medium text-muted-foreground">{inputCfg.label}</span>}
          <span className="truncate text-muted-foreground/70">{progressMsg || value}</span>
        </div>
      )
    }

    // collapsible
    const title = typeof inputCfg.title === 'function' ? inputCfg.title(input) : inputCfg.title
    return <CollapsibleSection title={title ?? '参数'} contentType={inputCfg.contentType} data={input} defaultOpen={inputCfg.defaultOpen} />
  }

  // ── 渲染结果栏 ──

  const renderResult = (): React.ReactNode => {
    if (status === 'running') return null
    const { result: resultCfg } = config
    const data = state.result?.data

    if (resultCfg.type === 'hidden') return null

    // 搜索结果的特殊展示：从 tool_result 的 JSON 字符串中解析
    if (resultCfg.type === 'search-results') {
      let results: WebSearchResult[] = []
      try {
        if (typeof data === 'string') results = JSON.parse(data)
        else if (Array.isArray(data)) results = data
      } catch { /* keep empty */ }
      return <SearchResultsDisplay results={results} onOpen={onOpenSearch} />
    }

    if (resultCfg.type === 'one-line') {
      return (
        <div className="mb-1 ml-5 text-xs text-muted-foreground">
          {resultCfg.getMessage(data)}
        </div>
      )
    }

    // collapsible
    const title = typeof resultCfg.title === 'function' ? resultCfg.title(data) : resultCfg.title ?? '结果'
    return <CollapsibleSection title={title} contentType={resultCfg.contentType} data={data} defaultOpen={resultCfg.defaultOpen} />
  }

  return (
    <div className={cn('mx-auto max-w-2xl', className)}>
      {renderInput()}
      {renderResult()}
    </div>
  )
}

// ── 子组件 ──

/** 可折叠内容区 */
const CollapsibleSection: React.FC<{
  title: string
  contentType?: string
  data: unknown
  defaultOpen?: boolean
}> = ({ title, contentType, data, defaultOpen = false }) => {
  const [open, setOpen] = React.useState(defaultOpen)

  const getContent = (): string => {
    if (contentType === 'json') {
      try { return JSON.stringify(data, null, 2) } catch { return String(data) }
    }
    return typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  }

  return (
    <div className="mb-1 rounded-lg bg-muted/30 px-3 py-1.5">
      <button
        type="button"
        className="flex w-full items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(!open)}
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <span className="font-medium">{title}</span>
      </button>
      {open && (
        <div className="mt-1.5 overflow-auto rounded bg-muted/50 p-2 text-xs text-muted-foreground whitespace-pre-wrap">
          {getContent()}
        </div>
      )}
    </div>
  )
}

/** 搜索结果展示 */
const SearchResultsDisplay: React.FC<{
  results: WebSearchResult[]
  onOpen?: () => void
}> = ({ results, onOpen }) => {
  if (results.length === 0) return null

  return (
    <button
      type="button"
      onClick={onOpen}
      className="mb-1 flex w-full items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Search className="h-3.5 w-3.5" />
      <span>找到 {results.length} 条搜索结果</span>
      <ChevronRight className="ml-auto h-3.5 w-3.5" />
    </button>
  )
}

export default ToolRenderer
