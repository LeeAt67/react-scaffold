import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { createLogger } from '@/utils/logger'
import { ChatInput } from '@/components/kui'

const logger = createLogger('home:page')

/** 发送模拟 */
const sendMessage = (text: string) => {
  logger.info('Sending:', text)
  alert(`消息已发送: ${text}`)
}

// 内部 Demo 组件略 (复用 ChatInputDemo 逻辑，按 CLAUDE.md 规范精简)
import { useState } from 'react'

interface HomePageClassNames {
  root?: string
}

export interface HomePageProps {
  className?: string
  classNames?: HomePageClassNames
}

/**
 * Home 页面（`/c`）。
 * KUI 组件库演示。
 */
const HomePage = forwardRef<HTMLDivElement, HomePageProps>(
  ({ className, classNames }, ref) => {
    const [inputValue, setInputValue] = useState('')

    const handleSend = () => {
      if (!inputValue.trim()) return
      sendMessage(inputValue)
      setInputValue('')
    }

    return (
      <div ref={ref} className={cn('px-8 py-8', classNames?.root, className)}>
        <h2 className="text-lg font-bold mb-6">KUI 组件演示</h2>
        <ChatInput
          value={inputValue}
          onValueChange={setInputValue}
          onSend={handleSend}
          placeholder="输入您的问题，Enter 发送..."
        />
      </div>
    )
  },
)

HomePage.displayName = 'HomePage'
export default HomePage
