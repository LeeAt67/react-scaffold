# React 19 + MobX + shadcn/ui 前端脚手架

基于 **Rspack** 构建，集成 React 19、MobX 状态管理、shadcn/ui 组件库、Tailwind CSS。

## 技术栈

| 工具 | 版本 |
|------|------|
| React | 19 |
| MobX | 6 + mobx-react-lite |
| shadcn/ui | Radix UI + Tailwind CSS |
| Tailwind CSS | 3 |
| Rspack | 2 |
| TypeScript | 5 |
| SWC | 内置（builtin:swc-loader） |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 项目结构

```
src/
├── components/
│   ├── ui/                  # shadcn/ui 组件（可自由修改）
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── select.tsx
│   ├── Counter.tsx          # 计数器示例（MobX + shadcn）
│   ├── TodoList.tsx         # 待办列表容器
│   └── TodoItem.tsx         # 待办项组件
├── lib/
│   └── utils.ts             # cn() 工具函数
├── stores/                  # MobX 状态管理
│   ├── index.ts             # RootStore + useStore Hook
│   ├── CounterStore.ts      # 计数器 Store
│   └── TodoStore.ts         # 待办 Store
├── types/
│   └── index.ts
├── App.tsx                  # 根组件
├── main.tsx                 # 入口文件
├── index.css                # Tailwind + CSS 变量主题
└── global.d.ts              # 全局类型声明
```

## 路径别名

使用 `@/` 指向 `src/` 目录（Rspack resolve.alias + tsconfig paths）：

```tsx
import { Button } from '@/components/ui/button'
import { useStore } from '@/stores'
import { cn } from '@/lib/utils'
```

## shadcn/ui 使用说明

所有组件位于 `src/components/ui/`，可像普通组件一样导入和修改：

```tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
```

### 添加更多 shadcn 组件

从 [shadcn/ui 官网](https://ui.shadcn.com/docs) 复制组件源码到 `src/components/ui/` 即可。
部分组件需要安装额外的 Radix UI 包，例如：

```bash
npm install @radix-ui/react-dropdown-menu @radix-ui/react-tabs @radix-ui/react-tooltip
```

## MobX 使用方式

```tsx
import { observer } from 'mobx-react-lite'
import { useStore } from '@/stores'

const MyComponent = observer(() => {
  const { counter, todo } = useStore()
  return <div>{counter.count}</div>
})
```

## 主题

支持 light / dark 模式切换，通过给 `<html>` 添加 `.dark` 类启用暗色主题。
主题变量定义在 `src/index.css` 的 `:root` 和 `.dark` 选择器中。
