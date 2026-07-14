import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import Counter from './components/Counter'
import TodoList from './components/TodoList'

function App() {
  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-12">
      {/* Header */}
      <header className="mb-10 text-center space-y-3">
        <h1 className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
          React 19 + MobX + Tailwind CSS
        </h1>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Badge>shadcn/ui</Badge>
          <Badge variant="secondary">Rspack 2</Badge>
          <Badge variant="outline">SWC</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          前端脚手架 — 集成 shadcn/ui 组件库
        </p>
      </header>

      {/* Demo */}
      <div className="space-y-6">
        <Counter />
        <TodoList />

        {/* shadcn Dialog 示例 */}
        <div className="flex justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">打开对话框</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>shadcn/ui 对话框</DialogTitle>
                <DialogDescription>
                  这是使用 shadcn/ui Dialog 组件的示例。
                  所有样式基于 CSS 变量主题，支持 dark mode。
                </DialogDescription>
              </DialogHeader>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong className="text-foreground">技术栈：</strong>
                  React 19 + MobX 6 + Tailwind CSS 3
                </p>
                <p>
                  <strong className="text-foreground">构建工具：</strong>
                  Rspack 2 + builtin:swc-loader
                </p>
                <p>
                  <strong className="text-foreground">组件库：</strong>
                  shadcn/ui（基于 Radix UI）
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-muted-foreground">
        <p>React {React.version} · MobX 6 · shadcn/ui · Rspack</p>
      </footer>
    </div>
  )
}

export default App
