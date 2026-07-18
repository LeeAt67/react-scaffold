import 'katex/dist/katex.min.css'
import './index.css'

import { Component, memo, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { cn, createLogger } from '@yes/shared'

import CodeBlock from './CodeBlock'
import { preprocessContent } from './utils/katex'
import rehypeRaw from './utils/rehypeRaw'

export interface MarkdownProps {
  /** 外部样式类名 */
  className?: string
  /** Markdown 原始内容 */
  content: string
  /** 是否正在流式输出 */
  isTyping?: boolean
}

// ── 错误边界 ──

interface ErrorBoundaryState {
  hasError: boolean
  frozenResetKey: string | null
}

/**
 * Markdown 渲染错误边界。
 *
 * react-markdown 在部分机型/浏览器上可能抛错。
 * 此处做"报错→纯文本"降级；流式期间冻结 resetKey 避免抖动。
 */
class MarkdownErrorBoundary extends Component<
  { children: React.ReactNode; resetKey: string; isTyping: boolean },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, frozenResetKey: null }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true, frozenResetKey: null }
  }

  componentDidUpdate(prevProps: { resetKey: string; isTyping: boolean }) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      if (!this.props.isTyping) {
        this.setState({ hasError: false, frozenResetKey: null })
      }
    }
  }

  componentDidCatch(error: Error) {
    createLogger('chat:markdown').warn('Markdown render error:', error.message)
    if (this.props.isTyping) {
      this.setState({ frozenResetKey: this.props.resetKey })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="select-text whitespace-pre-wrap break-words text-sm">
          {this.props.children}
        </div>
      )
    }
    return this.props.children
  }
}

/** 生成内容唯一标识 key，用于错误边界重置判断 */
const getContentKey = (text: string) => `${text.length}:${text.slice(0, 128)}`

/**
 * Markdown 渲染组件。
 *
 * 支持：
 * - GFM（表格/任务列表/删除线）
 * - 数学公式（KaTeX，含 \(/\)、\[/\]、\begin{equation} 定界符兼容）
 * - 内嵌原始 HTML（安全过滤：危险标签降级为纯文本）
 * - 代码块语法高亮（Shiki，流式中禁用，行号展示）
 * - 渲染错误→纯文本降级
 */
const Markdown = memo(
  ({ className, content, isTyping = false }: MarkdownProps) => {
    const processedContent = preprocessContent(content)
    const contentKey = getContentKey(processedContent)

    /** 代码渲染组件，根据是否为代码块决定使用 CodeBlock 还是行内 code */
    const codeComponent = useMemo(
      () =>
        ({
          className: cls,
          children,
        }: React.ComponentPropsWithoutRef<'code'>) => {
          const match = /language-(\w+)/.exec(cls || '')
          const text = String(children ?? '')

          // 行内代码
          if (!match && !text.includes('\n')) {
            return <code className="codespan">{children}</code>
          }

          return (
            <CodeBlock
              code={text.replace(/\n$/, '')}
              language={match ? match[1] : 'text'}
              isTyping={isTyping}
            />
          )
        },
      [isTyping],
    )

    return (
      <MarkdownErrorBoundary resetKey={contentKey} isTyping={isTyping}>
        <div className={cn('markdown-prose select-text', className)}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath, remarkHtml]}
            rehypePlugins={[
              // rehypeRaw 必须在 rehypeKatex 之前：
              // 先由 rehypeRaw 解析原始 HTML 生成完整 hast 节点，
              // rehypeKatex 才能正确识别其中的数学公式。
              rehypeRaw,
              rehypeKatex,
            ]}
            components={{ code: codeComponent }}
          >
            {processedContent}
          </ReactMarkdown>
        </div>
      </MarkdownErrorBoundary>
    )
  },
  (prev, next) =>
    prev.content === next.content &&
    prev.isTyping === next.isTyping &&
    prev.className === next.className,
)

Markdown.displayName = 'Markdown'
export default Markdown
