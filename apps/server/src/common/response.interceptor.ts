import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable, map } from 'rxjs'

/**
 * 统一 API 响应格式。
 */
export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T | null
}

/**
 * ResponseInterceptor — 统一包装所有成功响应。
 *
 * Controller 只需返回业务数据，拦截器自动包裹为：
 * ```json
 * { "code": 0, "msg": "success", "data": { ... } }
 * ```
 *
 * 如果 Controller 返回的对象本身包含 `code` 字段（如错误响应），
 * 则不再二次包裹，避免嵌套。
 */
@Injectable()
export class ResponseInterceptor<T = unknown> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // 已经是统一格式的不再包裹（如 ExceptionFilter 抛出的 ErrorResponse）
        if (data && typeof data === 'object' && 'code' in (data as object)) {
          return data as ApiResponse<T>
        }

        return {
          code: 0,
          msg: 'success',
          data: data ?? null,
        }
      }),
    )
  }
}
