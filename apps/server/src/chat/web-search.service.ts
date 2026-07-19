import { Injectable } from '@nestjs/common'
import { createLogger } from '../lib/logger'

const logger = createLogger('chat:web-search')

/** 搜索引擎 API 配置 — 通过环境变量注入 */
const SEARCH_API_URL = process.env.SEARCH_API_URL!
const SEARCH_API_KEY = process.env.SEARCH_API_KEY!

/** 单条搜索结果 */
export interface WebSearchResult {
  /** 结果的抓取或发布时间 */
  datePublished?: string
  /** 结果网页的链接 */
  url?: string
  /** 网页标题 */
  name?: string
  /** 来源网站名称 */
  siteName?: string
  /** 网页内容摘要 */
  snippet?: string
  /** 网站图标的 URL */
  siteIcon?: string
}

/** 搜索 API 可用的标志 */
const isAvailable = (): boolean => !!(SEARCH_API_URL && SEARCH_API_KEY)

/**
 * WebSearchService — 封装博查 AI 搜索引擎 API 的调用。
 *
 * 环境变量：
 * - SEARCH_API_URL  — 搜索接口地址，默认 https://api.bocha.cn/v1/web-search
 * - SEARCH_API_KEY  — API KEY，在 https://open.bocha.cn 获取
 *
 * 未配置 SEARCH_API_KEY 时自动降级，不搜索。
 */
@Injectable()
export class WebSearchService {
  /**
   * 判断搜索服务是否可用。
   */
  get available(): boolean {
    return isAvailable()
  }

  /**
   * 调用搜索引擎 API 执行搜索。
   *
   * @param query - 搜索关键词
   * @returns 搜索结果列表；搜索失败或不可用时返回空数组
   */
  search = async (query: string): Promise<WebSearchResult[]> => {
    if (!isAvailable()) {
      logger.debug('搜索 API 未配置，跳过联网搜索')
      return []
    }

    logger.info('开始联网搜索:', query.slice(0, 50))

    try {
      const res = await fetch(SEARCH_API_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SEARCH_API_KEY!}`,
        },
        body: JSON.stringify({
          query,
          count: 5,
          freshness: 'noLimit',
          summary: true,
        }),
      })

      if (!res.ok) {
        logger.warn('搜索 API 返回错误:', res.status)
        return []
      }

      const data = await res.json()

      // 博查 API 错误响应：{ code, message }，code 可能是字符串或数字
      if (data.code && String(data.code) !== '200') {
        logger.warn('搜索 API 业务错误:', data.code, data.message)
        return []
      }

      // 博查 API 成功响应：data.webPages.value[] → { url, name, snippet, siteName, siteIcon, dateLastCrawled }
      const rawResults: unknown[] = data?.data?.webPages?.value ?? data?.results ?? []

      return (rawResults as Array<Record<string, unknown>>).map((r) => ({
        url: typeof r.url === 'string' ? r.url : undefined,
        name: typeof r.name === 'string' ? r.name : typeof r.title === 'string' ? r.title : undefined,
        snippet: typeof r.snippet === 'string' ? r.snippet : typeof r.content === 'string' ? r.content : undefined,
        siteName: typeof r.siteName === 'string' ? r.siteName : undefined,
        siteIcon: typeof r.siteIcon === 'string' ? r.siteIcon : undefined,
        datePublished: typeof r.dateLastCrawled === 'string'
          ? r.dateLastCrawled
          : typeof r.datePublished === 'string'
            ? r.datePublished
            : undefined,
      }))
    } catch (err) {
      logger.warn('搜索 API 调用失败:', (err as Error).message)
      return []
    }
  }
}
