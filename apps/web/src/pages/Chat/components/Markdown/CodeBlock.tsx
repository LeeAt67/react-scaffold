import { Suspense, lazy, useState } from 'react'
import { createLogger } from '@yes/shared'

const logger = createLogger('chat:code-block')

/** Shiki 高亮器懒加载，减小初始包体积 */
const SafeShikiHighlighter = lazy(() => import('react-shiki'))

export interface CodeBlockProps {
  /** 代码内容 */
  code: string
  /** 语言标识 */
  language: string
  /** 是否正在流式输出 */
  isTyping?: boolean
}

/**
 * 代码块渲染组件。
 *
 * 流式输出期间渲染纯文本，结束后异步加载 Shiki 进行语法高亮。
 */
const CodeBlock = ({ code, language, isTyping = false }: CodeBlockProps) => {
  const [copyLabel, setCopyLabel] = useState('复制')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopyLabel('已复制')
      setTimeout(() => setCopyLabel('复制'), 2000)
    } catch (err) {
      logger.error('复制代码失败:', err)
    }
  }

  // 流式中：纯文本展示
  if (isTyping) {
    return (
      <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
        <code>{code}</code>
      </pre>
    )
  }

  return (
    <div className="group relative">
      <div className="flex items-center justify-between rounded-t-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
        >
          {copyLabel}
        </button>
      </div>
      <Suspense
        fallback={
          <pre className="overflow-x-auto rounded-b-lg bg-muted px-3 pb-3 text-xs">
            <code>{code}</code>
          </pre>
        }
      >
        <SafeShikiHighlighter
          language={language}
          theme="github-light"
          className="overflow-x-auto rounded-b-lg text-xs"
        >
          {code}
        </SafeShikiHighlighter>
      </Suspense>
    </div>
  )
}

export default CodeBlock
