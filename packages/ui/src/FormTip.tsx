import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@yes/shared'

interface FormTipClassNames {
  root?: string
  link?: string
}

export interface FormTipProps {
  /** 前导文字 */
  text?: string
  /** 链接文字 */
  linkText?: string
  /** 链接跳转路径 */
  to?: string
  className?: string
  classNames?: FormTipClassNames
}

/**
 * 表单底部提示组件 — 文本 + 可点击链接。
 *
 * 用于登录/注册等表单底部的跳转提示。
 */
const FormTip = forwardRef<HTMLDivElement, FormTipProps>(
  ({ text = '没有账号？', linkText = '注册一个', to = '/register', className, classNames }, ref) => (
    <div
      ref={ref}
      className={cn('text-center text-sm text-muted-foreground', classNames?.root, className)}
    >
      {text}
      <Link
        to={to}
        className={cn('ml-1 font-medium text-primary hover:underline', classNames?.link)}
      >
        {linkText}
      </Link>
    </div>
  ),
)

FormTip.displayName = 'FormTip'
export default FormTip
