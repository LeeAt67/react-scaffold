# ---- 构建阶段 ----#
# context: . (monorepo 根目录)
FROM node:22-alpine AS builder

WORKDIR /app

# 复制 root workspace 配置 + server 的 package.json
COPY package.json package-lock.json ./
COPY apps/server/package.json apps/server/

# 安装 server workspace 依赖（含 devDeps，需要 prisma CLI + nest CLI）
RUN npm ci --workspace=apps/server --include-workspace-root

# 复制 server 源码 + Prisma schema + 构建配置
COPY apps/server/tsconfig.json apps/server/nest-cli.json apps/server/
COPY apps/server/prisma.config.ts apps/server/
COPY apps/server/src/ apps/server/src/
COPY apps/server/prisma/ apps/server/prisma/

# 生成 Prisma Client → NestJS 构建（SWC 编译器）
RUN cd apps/server && npx prisma generate && npx nest build

# 精简：仅保留 server 自己的生产依赖
RUN npm ci --workspace=apps/server --omit=dev

# ---- 运行阶段 ----#
FROM node:22-alpine

WORKDIR /app

# 仅复制运行时必需文件
COPY --from=builder /app/apps/server/node_modules /app/node_modules
COPY --from=builder /app/apps/server/dist /app/dist
COPY --from=builder /app/apps/server/prisma /app/prisma
COPY --from=builder /app/apps/server/prisma.config.ts /app/
COPY --from=builder /app/apps/server/package.json /app/

ENV PORT=3001
EXPOSE 3001
CMD ["node", "dist/main.js"]
