import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ClawPageClassNames {
  root?: string
}

export interface ClawPageProps {
  className?: string
  classNames?: ClawPageClassNames
}

/**
 * Claw 页面（`/claw`）。
 * 占位页面，后续开发。
 */
const ClawPage = forwardRef<HTMLDivElement, ClawPageProps>(
  ({ className, classNames }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex h-full items-center justify-center',
        classNames?.root,
        className,
      )}
    >
      <p className="text-muted-foreground text-sm">Claw — 开发中</p>
    </div>
  ),
)

ClawPage.displayName = 'ClawPage'
export default ClawPage
