# CLAUDE.md

## 项目概述

React 19 + MobX 6 + Tailwind CSS 3 + shadcn/ui 前端脚手架，构建工具为 Rspack 2 + SWC，集成 React Router v7 路由系统。

## 常用命令

```bash
npm start          # 启动开发服务器 (http://localhost:3000)
npm run build      # 生产构建
npm run preview    # 预览生产构建
```

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | React | ^19.0.0 |
| 状态管理 | MobX + mobx-react-lite | ^6.13.5 / ^4.1.0 |
| CSS | Tailwind CSS + tailwindcss-animate | ^3.4.17 |
| 组件库 | shadcn/ui (基于 Radix UI) | — |
| 路由 | react-router-dom | latest |
| 构建 | Rspack + builtin:swc-loader | ^2.1.4 |
| 语言 | TypeScript | ~5.6.2 |
| CSS 工具 | clsx + tailwind-merge | — |
| 图标 | lucide-react | ^1.24.0 |

## 项目结构

```
src/
├── App.tsx              # 根组件：StoreContext.Provider + BrowserRouter + Layout
├── main.tsx             # 入口：createRoot + StrictMode
├── index.css            # 全局样式：CSS 变量主题 (light/dark)
├── global.d.ts          # 全局类型声明 (*.css, *.svg, *.png, *.jpg)
├── components/
│   ├── Layout.tsx       # 公共布局：导航栏 + 暗色模式切换 + <Outlet /> + 页脚
│   ├── Counter.tsx      # MobX 计数器示例 (observer)
│   ├── TodoList.tsx     # 待办事项示例 (observer)
│   ├── TodoItem.tsx     # 单条待办项组件
│   └── ui/              # shadcn/ui 组件 (badge, button, card, dialog, input, label, select)
├── pages/
│   ├── HomePage.tsx     # 首页：Counter + TodoList + Dialog 示例
│   └── AboutPage.tsx    # 关于：技术栈卡片 + 项目结构
├── stores/
│   ├── index.ts         # RootStore + StoreContext + useStore() hook
│   ├── CounterStore.ts  # 计数器 store (makeAutoObservable)
│   └── TodoStore.ts     # 待办事项 store (makeAutoObservable)
├── lib/
│   └── utils.ts         # cn() 工具函数 (clsx + twMerge)
└── types/
    └── index.ts         # Todo 接口定义
```

## 架构模式

### App.tsx 角色

`App.tsx` 是应用根组件，只做三件事：

```tsx
<StoreContext.Provider value={rootStore}>   // 注入 MobX 全局状态
  <BrowserRouter>                            // 启用客户端路由
    <Routes>
      <Route element={<Layout />}>           // 公共布局壳 (导航+页脚)
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
</StoreContext.Provider>
```

### 状态管理 (MobX)

- `stores/index.ts` 定义 `RootStore` 单例，通过 `StoreContext` 提供
- 子组件使用 `useStore()` hook 获取 store，用 `observer()` 包裹
- Store 使用 `makeAutoObservable(this)` 自动追踪可观察属性

### 路由

- 嵌套路由：Layout 作为父路由，通过 `<Outlet />` 渲染子页面
- `historyApiFallback: true` 在 rspack devServer 中处理 SPA 刷新
- 导航链接高亮：`useLocation()` 判断当前路径

### 主题 (Dark Mode)

- CSS 变量方案：`:root` 定义亮色，`.dark` 定义暗色
- 切换：`document.documentElement.classList.toggle('dark')`
- 状态持久化：初始化时读取当前 class 状态
- tailwind.config.js 中 `darkMode: 'class'`

## 关键配置

### 路径别名

`@/` → `src/`（在 tsconfig.json 和 rspack.config.mjs 中均配置）

### SWC 配置

TypeScript + React 编译使用 `builtin:swc-loader`，JSX 运行时为 `automatic`。

### CSS 处理

PostCSS + Tailwind CSS，通过 `postcss-loader` 处理 `.css` 文件。

### 开发服务器

- 端口：3000
- 自动打开浏览器
- `historyApiFallback: true` 支持 SPA 路由

## 注意事项

1. 项目使用 ESM 模式 (`"type": "module"`)，所有配置文件、Tailwind 插件导入需使用 `import` 语法，不能使用 `require`
2. `@rspack/plugin-react-refresh` 只有具名导出 `ReactRefreshRspackPlugin`，无默认导出
3. shadcn/ui 组件依赖 `tailwindcss-animate` 插件提供动画
4. 生产构建时 ReactRefreshPlugin 会被 `.filter(Boolean)` 移除
5. `cn()` 函数合并 clsx 和 tailwind-merge，用于条件拼接 className 并消除冲突
