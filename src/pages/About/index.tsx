import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const techStack = [
  { name: 'React 19', desc: '最新 React 版本，支持 Server Components' },
  { name: 'MobX 6', desc: '响应式状态管理，简洁高效' },
  { name: 'Tailwind CSS 3', desc: '原子化 CSS 框架' },
  { name: 'shadcn/ui', desc: '基于 Radix UI 的组件库' },
  { name: 'Rspack 2', desc: 'Rust 驱动，极速构建' },
  { name: 'React Router 7', desc: '声明式路由 + HashRouter' },
]

interface AboutPageClassNames {
  root?: string
}

export interface AboutPageProps {
  className?: string
  classNames?: AboutPageClassNames
}

/**
 * 关于页面（`/about`）。
 * 展示技术栈与项目结构。
 */
const AboutPage = forwardRef<HTMLDivElement, AboutPageProps>(
  ({ className, classNames }, ref) => (
    <div ref={ref} className={cn('mx-auto max-w-2xl px-4 py-12', classNames?.root, className)}>
      <header className="mb-10 text-center space-y-3">
        <h1 className="text-3xl font-bold">关于 YES</h1>
        <p className="text-muted-foreground">
          AI 对话应用，基于 React 19 + MobX + Tailwind
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {techStack.map(({ name, desc }) => (
          <Card key={name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="secondary">{name.split(' ')[0]}</Badge>
                {name}
              </CardTitle>
              <CardDescription>{desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  ),
)

AboutPage.displayName = 'AboutPage'
export default AboutPage
