# YES — Claude Code 项目指引

## 项目概述

YES 是 React 19 + TypeScript + MobX 6 + Tailwind CSS 3 的 AI 对话应用，构建工具为 Rspack 2 + SWC。

## 常用命令

```bash
npm start          # 开发服务器 (http://localhost:8000)
npm run build      # 生产构建
```

---

## 架构概览

YES 采用分层架构：

| 层级 | 路径 | 说明 |
|------|------|------|
| 状态管理 | `src/controller/stores/`（global、conversation、claw、share、storage、voice） | MobX makeAutoObservable |
| 副作用 | `src/controller/effects/` | 应用初始化 |
| 服务层 | `src/service/chat/`（Zod 校验） | 聊天 API |
| 公共组件 | `src/components/` | Layout |
| KUI 组件 | `src/components/kui/`（atoms / molecules / organisms） | 原子化组件库 |
| 页面 | `src/pages/` | HomePage、AboutPage、ChatInputDemo |
| 路由 | `src/route/index.tsx` | HashRouter + useRoutes |
| 工具 | `src/utils/logger.ts` | createLogger |
| 国际化 | `src/lang/` | zh-CN、en-US |
| Design Tokens | `src/lib/tokens.ts`、`src/index.css` | 极简黑白体系 |

### 关键文件

- `src/App.tsx` — 根组件（HashRouter）
- `src/controller/index.ts` — 导出 stores 和 effects
- `src/route/index.tsx` — 路由配置
- `src/components/Layout.tsx` — 主布局（左侧栏 + 内容区）
- `src/service/chat/` — 聊天 API 客户端

### 路由

```
#/           → HomePage    （Claude 风格对话首页）
#/about      → AboutPage   （关于页）
#/kui        → ChatInputDemo（组件库演示）
```

---

## 组件规范

公共组件必须满足 forwardRef + classNames + cn 模式：

```tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface MyComponentClassNames {
  root?: string
  title?: string
}

export interface MyComponentProps {
  title: string
  className?: string
  classNames?: MyComponentClassNames
}

const MyComponent = forwardRef<HTMLDivElement, MyComponentProps>(
  ({ title, className, classNames }, ref) => (
    <div ref={ref} className={cn('flex items-center', classNames?.root, className)}>
      <span className={cn('text-base font-medium', classNames?.title)}>{title}</span>
    </div>
  ),
)

MyComponent.displayName = 'MyComponent'
export default MyComponent
```

图标使用 `lucide-react`，颜色用 `text-*` Tailwind class 控制。

---

## MobX 集成

- 响应式组件用 `observer` 包裹（`mobx-react-lite`）
- Store 构造函数调用 `makeAutoObservable(this)`
- 方法统一用箭头函数

---

## 代码规范

- 注释用中文，方法写 TSDoc
- 方法一律用箭头函数
- 日志用 `createLogger`，禁止直接用 `console`

```typescript
import { createLogger } from '@/utils/logger'
const logger = createLogger('模块:子模块')
```

国际化：

```typescript
import { t } from '@/lang'
t('common.ok')  // 确定
```

变量插值用单花括号：`{variable}`

---

## KUI 组件库

```
src/components/kui/
├── atoms/           # Button、IconButton
├── molecules/       # PromptTextarea、SendButton、VoiceButton 等
├── organisms/       # InputToolbar
├── ChatInput.tsx    # 完整组件
└── index.ts         # 统一导出
```

搭建新组件遵循 `.claude/skills/kui-component-builder/SKILL.md`

---

## 分支工作流

- 开发新功能必须建分支：`git checkout -b feat/xxx`
- 合并 main 前需用户许可
- 严禁直接 push main

---

## 注意事项

1. ESM 模式，不能用 `require`
2. `@rspack/plugin-react-refresh` 只有具名导出
3. `cn()` = clsx + twMerge
npm run tsc         # TypeScript 类型检查
```


## 组件开发流程

### 公共组件开发（开发完后进 `src/components/`）

工作区：`src/pages/KUI/components/`
预览路由：`#/kui`

开发完时：移至 `src/components/`，更新 import，改 status 为 `'over'`，删除开发目录。

### 页面私有组件开发（永远留在页面内）

工作区：`src/pages/PageName/components/Preview/components/`
预览路由：`#/page-route/components`（如 `#/c/components`）

开发完时：移至 `src/pages/PageName/components/`，更新 import，改 status，删除开发目录。
