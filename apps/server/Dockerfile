# ---- 构建阶段 ----#
# context: . (monorepo 根目录)
FROM node:22-alpine AS builder

WORKDIR /app

# 复制 root workspace 配置 + server 的 package.json
COPY package.json package-lock.json ./
COPY apps/server/package.json apps/server/

# 安装 server workspace 依赖（含 devDeps，需要 prisma CLI + nest CLI + SWC）
RUN npm ci --workspace=apps/server --include-workspace-root

# 复制 server 源码 + Prisma schema + 构建配置
COPY apps/server/tsconfig.json apps/server/nest-cli.json apps/server/
COPY apps/server/prisma.config.ts apps/server/
COPY apps/server/src/ apps/server/src/
COPY apps/server/prisma/ apps/server/prisma/

# 生成 Prisma Client → NestJS 构建（SWC 编译器）
RUN cd apps/server && npx prisma generate && npx nest build

# ---- 生产依赖阶段 ----#
FROM node:22-alpine AS prod-deps

WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/server/package.json apps/server/
RUN npm ci --workspace=apps/server --omit=dev --include-workspace-root

# ---- 运行阶段 ----#
FROM node:22-alpine

WORKDIR /app

# 从构建阶段复制 dist
COPY --from=builder /app/apps/server/dist /app/dist
# 从构建阶段复制 prisma（含生成的 client）
COPY --from=builder /app/apps/server/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/apps/server/prisma /app/prisma
COPY --from=builder /app/apps/server/prisma.config.ts /app/
COPY --from=builder /app/apps/server/package.json /app/
# 从生产依赖阶段复制 node_modules
COPY --from=prod-deps /app/apps/server/node_modules /app/node_modules

ENV PORT=3001
EXPOSE 3001
CMD ["node", "dist/main.js"]
