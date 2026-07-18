/**
 * 种子脚本 — 创建初始管理员用户。
 *
 * 密码与前端一致：SHA-256 哈希后再 bcrypt 存储。
 * 运行：npx tsx prisma/seed.ts
 */
import 'dotenv/config'
import { createHmac } from 'node:crypto'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({ url: process.env.DATABASE_URL! }),
})

async function main() {
  const username = 'admin'
  const password = 'admin123'

  // 前端使用 HMAC-SHA256(username, password)，这里保持一致
  const hashed = createHmac('sha256', username).update(password).digest('hex')

  const admin = await prisma.user.upsert({
    where: { username },
    update: { passwordHash: await bcrypt.hash(hashed, 10) },
    create: {
      username,
      passwordHash: await bcrypt.hash(hashed, 10),
    },
  })

  console.log(`✅ 种子用户: ${admin.username} (id: ${admin.id})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
