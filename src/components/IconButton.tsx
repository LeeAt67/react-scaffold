import * as React from 'react'
import { Button, type ButtonProps } from './Button'

/**
 * IconButton — 图标按钮原子
 *
 * 封装 KUI Button，默认 variant="toolbar" + size="iconSm"
 */
export interface IconButtonProps extends Omit<ButtonProps, 'variant' | 'size'> {
  /** 按钮变体，默认 toolbar */
  variant?: ButtonProps['variant']
  /** 按钮尺寸，默认 iconSm */
  size?: ButtonProps['size']
  /** 无障碍标签（必传） */
  label: string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, variant = 'toolbar', size = 'iconSm', children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        aria-label={label}
        title={label}
        {...props}
      >
        {children}
      </Button>
    )
  },
)
IconButton.displayName = 'KuiIconButton'

export { IconButton }
