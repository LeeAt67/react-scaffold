---
name: kui-component-builder
description: "Use when user asks to build a new complex component (like ChatInput, FormDialog, DataTable, etc.) or says '搭建组件' / '复刻XX组件'. This skill enforces building from atomic components bottom-up and registering into the KUI library."
argument-hint: 'Describe the complex component to build (e.g. "a Claude-style chat input")'
---

# KUI Component Builder

## Overview

当需要创建复杂组件时，强制执行**原子化搭建**流程：拆解 → 原子 → 分子 → 有机体 → 完整组件 → 注册到 KUI 库 → 创建 Demo 页面。

## Trigger

激活条件（满足任一）：
- 用户说"搭建组件"、"复刻 XX 组件"、"做一个 XX 组件"
- 用户描述了一个**由多个子组件组成**的复杂 UI 组件
- 用户问"如何搭建一个 XX"且 XX 是复杂交互组件

## 项目上下文

- 组件路径：`src/components/`（平坦目录，与 MiMo Chat 对齐）
- 导出索引：`src/components/kui/index.ts`（向后兼容 re-export）
- Demo 页面：`src/pages/ComponentPreview/`
- Demo 路由：`#/components`
- 路由注册：`src/route/index.tsx`
- 基础原子 Button 位于 `src/components/Button.tsx`，提供 6 种 variant + 5 种 size
- IconButton 位于 `src/components/IconButton.tsx`，封装 Button 为图标按钮
- 项目使用 Tailwind CSS + shadcn/ui + lucide-react 图标

## Procedure

### Step 1: 需求拆解

先不写代码，输出**组件拆解树**：

```
目标组件 (完整组件)
│
├── 子组件A  (有机体) — 职责描述
│   ├── 子子组件A1 (分子)
│   │   └── IconButton (原子)
│   └── 子子组件A2 (分子)
│       └── Button (原子)
│
├── 子组件B  (分子) — 职责描述
│   └── Button (原子)
│
└── 子组件C  (分子) — 职责描述
```

确认后再继续。

### Step 2: 自底向上搭建

按层级从底向上创建文件：

| 层级 | 目录 | 命名 |
|------|------|------|
| 原子 / 分子 / 有机体 | `src/components/` | 如 `Switch.tsx`、`ToggleButton.tsx`、`FormToolbar.tsx` |
| 完整组件 | `src/components/` | 如 `SearchForm.tsx` |

**原子组件规则：**
- 优先复用已有 Button / IconButton，除非确实需要新的基础元素
- 每个原子导出 Props 类型
- 添加 `displayName`：`{Component}.displayName = 'Kui{Component}'`

**分子组件规则：**
- 必定依赖原子组件，组合而非重新实现
- 注释注明依赖链：`// 封装自 IconButton → Button`

**有机体组件规则：**
- 组装多个分子，提供完整的交互区域

### Step 3: 注册到 KUI 库

在 `src/components/kui/index.ts` 中按层级添加 re-export：

```ts
// 从 src/components/ 统一 re-export
export { NewAtom } from '@/components/NewAtom'
export { NewMolecule } from '@/components/NewMolecule'
export { NewOrganism } from '@/components/NewOrganism'
export { NewComponent } from '@/components/NewComponent'
```

### Step 4: 创建 Demo 页面

在 `src/pages/ComponentPreview/index.tsx` 追加 Demo 组件：

- 注册到 `entries` 数组（name / desc / status / Demo）
- status: `incubating`（孵化中）→ 毕业后改为 `graduated`

## Anti-patterns

- ❌ 直接把所有逻辑写在一个大文件里
- ❌ 分子组件直接实现底层逻辑而不复用原子
- ❌ 忘记注册到 `kui/index.ts`
- ❌ Demo 页面不按 AntD 分类导航布局
- ❌ 命名不使用 PascalCase

## 示例：ChatInput 搭建过程

```
Step 1 拆解:
ChatInput
├── PromptTextarea  — 自动撑高输入区
├── InputToolbar    — 底部工具栏
│   ├── AttachButton   → IconButton → KuiButton
│   ├── ModelSelector  — 模型下拉
│   ├── VoiceButton    → IconButton → KuiButton
│   ├── SettingsButton → IconButton → KuiButton
│   └── SendButton     → KuiButton

Step 2 搭建:
atoms:     Button.tsx, IconButton.tsx
molecules: PromptTextarea.tsx, SendButton.tsx, VoiceButton.tsx,
           AttachButton.tsx, ModelSelector.tsx
organisms: InputToolbar.tsx
组件:      ChatInput.tsx

Step 3 注册:
kui/index.ts 按层级导出所有新增组件

Step 4 Demo:
pages/ChatInputDemo.tsx — AntD 风格导航 + 各组件独立 Demo

Step 5 路由:
routes.tsx → { path: 'kui', element: <ChatInputDemo /> }
```
