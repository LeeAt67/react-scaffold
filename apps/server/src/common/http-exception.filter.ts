import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'
import type { Response } from 'express'

/**
 * 统一异常过滤器 — 所有 HttpException 子类都包成统一格式。
 *
 * ```json
 * { "code": -1, "msg": "用户名或密码错误", "data": null }
 * ```
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse<Response>()
    const status = exception.getStatus()
    const exceptionRes = exception.getResponse()

    const msg =
      typeof exceptionRes === 'string'
        ? exceptionRes
        : typeof exceptionRes === 'object' && exceptionRes !== null
          ? (exceptionRes as Record<string, unknown>).message ?? exception.message
          : exception.message

    res.status(status).json({
      code: -1,
      msg: typeof msg === 'string' ? msg : String(msg),
      data: null,
    })
  }
}
