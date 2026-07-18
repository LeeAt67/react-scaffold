# NestJS DI 注入失败 — 深层根因完整分析

> **日期**：2026-07-18
> **标签**：NestJS, DI, tsx, esbuild, SWC, emitDecoratorMetadata

---

## 现象

调用 `/api/auth/login` 或 `/api/auth/register` 返回 500 Internal Server Error：

```
TypeError: Cannot read properties of undefined (reading 'login')
    at AuthController.login (...)
```

`this.authService` 为 `undefined`。

---

## 排查过程

| 步骤 | 假设 | 结果 |
|:--:|------|:--:|
| 1 | `AuthModule` 未注册 `providers` | ❌ 已正确配置 |
| 2 | `PrismaModule` 未 `@Global()` | ❌ 已声明 |
| 3 | `"module": "NodeNext"` 与 DI 冲突 | ❌ 改 `ESNext + bundler` 仍失败 |
| 4 | `"type": "module"` 导致 DI 失效 | ❌ 删除后仍失败 |
| 5 | 缺少 `import 'reflect-metadata'` | ❌ 添加后仍失败 |
| 6 | `ModuleRef.get()` 手动获取 | ❌ `moduleRef` 自身也是 `undefined` |
| 7 | 手动 `new AuthService()` | ✅ 临时通过 — 锁定 DI 容器环节 |
| **8** | **tsx 底层编译器是 esbuild** | **✅✅ 命中根因** |

**关键证据**：

```typescript
constructor(private readonly authService: AuthService) {
  console.log('[Auth] authService present:', !!this.authService)
}
// 输出：false — 所有依赖都无法注入
```

---

## 深层根因

```
tsx watch src/main.ts
  → tsx 检测到 TypeScript → 调用 esbuild 编译（默认行为）
    → esbuild 不支持 emitDecoratorMetadata
      → 编译产物缺少 setMetadata("design:paramtypes", ...)
        → NestJS DI 不知道第一个构造参数是 AuthService
          → 注入时为 undefined
```

**esbuild 设计上拒绝 `emitDecoratorMetadata`**：这个特性需要完整的 TS 类型系统才能生成 `design:paramtypes`，与 esbuild "只做语法转换、不做类型检查"的哲学冲突。

### 尝试过的无效修复

| 方案 | 为什么失败 |
|------|-----------|
| `@swc/core` + `TSX_SWC=1` | tsx 不读 `.swcrc` 的 `decoratorMetadata` |
| 项目根放置 `.swcrc` | 同上 |
| `ts-node --swc` | moduleResolution 与 Prisma 路径不兼容 |

---

## 解决方案

**用 NestJS 官方 `nest start --watch`，内置 SWC builder（默认支持 decoratorMetadata）。**

### 关键文件

**`nest-cli.json`**
```json
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": { "builder": "swc" }
}
```

**`tsconfig.json`**
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

**`package.json`**
```json
{ "scripts": { "dev": "nest start --watch" } }
```

**`prisma/schema.prisma`** — 客户端必须在 src 内：
```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}
```

**额外依赖**：`@swc/core`、`@swc/cli`、`@nestjs/cli`

---

## 预防

1. NestJS 开发首选 `nest start --watch`，不直接用 `tsx`/`ts-node`
2. 如必须用 `tsx`，确认编译器实际生成了 `design:paramtypes`
3. 构造函数开头加断言：
   ```typescript
   if (!this.authService) throw new Error('DI failed')
   ```
