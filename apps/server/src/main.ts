import 'reflect-metadata'
import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ResponseInterceptor } from './common/response.interceptor'
import { HttpExceptionFilter } from './common/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({ origin: '*' })
  app.useGlobalInterceptors(new ResponseInterceptor())
  app.useGlobalFilters(new HttpExceptionFilter())

  const port = Number(process.env.PORT!)
  await app.listen(port)
  console.log(`🚀 YES Server running on http://localhost:${port}`)
}

bootstrap()
