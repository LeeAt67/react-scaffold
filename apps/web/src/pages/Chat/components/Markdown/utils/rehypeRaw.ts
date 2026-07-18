import { raw } from 'hast-util-raw'
import DOMPurify from 'dompurify'

/** 危险标签：直接降级为纯文本 */
const BLOCKED_TAGS = new Set([
  'script', 'style', 'iframe', 'object', 'embed',
  'head', 'html', 'body', 'meta', 'link', 'base',
  'title', 'noscript', 'template',
])

/** 危险属性 */
const BLOCKED_ATTRS = new Set(['style', 'onclick', 'onerror', 'onload', 'onmouseover', 'onfocus', 'onblur'])

/** URL 属性名 */
const URL_ATTRS = new Set(['href', 'src', 'cite', 'poster', 'action', 'formAction'])

/** 危险协议 */
const BLOCKED_PROTOCOLS = /^(javascript|data|vbscript):/i

/**
 * 自定义 rehypeRaw 插件：解析 Markdown 中的原始 HTML，同时做安全过滤。
 *
 * 策略：
 * 1. `hast-util-raw` 将原始 HTML 解析为 HAST 节点
 * 2. 用 DOMPurify 对最终 HTML 做净化
 * 3. 过滤危险标签和属性的节点
 *
 * @returns rehype 插件函数
 */
const rehypeRawPlugin = () => {
  return (tree: any) => {
    // 先用 hast-util-raw 解析 raw HTML
    raw(tree)

    // 遍历树，过滤危险节点
    walkTree(tree)
  }
}

/** 递归遍历 HAST 树，过滤危险标签和属性 */
const walkTree = (node: any): boolean => {
  if (!node) return false

  // 元素节点
  if (node.type === 'element') {
    // 危险标签 → 转为文本节点展示源码
    if (BLOCKED_TAGS.has(node.tagName)) {
      node.type = 'text'
      node.value = stringifyNode(node)
      delete node.children
      delete node.properties
      delete node.tagName
      return true
    }

    // 过滤危险属性
    if (node.properties) {
      for (const attr of Object.keys(node.properties)) {
        const lower = attr.toLowerCase()
        if (BLOCKED_ATTRS.has(lower)) {
          delete node.properties[attr]
        }
        // URL 属性检查协议
        if (URL_ATTRS.has(lower) && typeof node.properties[attr] === 'string') {
          if (BLOCKED_PROTOCOLS.test(node.properties[attr])) {
            delete node.properties[attr]
          }
        }
      }
    }
  }

  // 递归处理子节点
  if (node.children) {
    node.children = node.children.filter((child: any) => {
      walkTree(child)
      return true
    })
  }

  return false
}

/** 将节点序列化为 HTML 源码字符串 */
const stringifyNode = (node: any): string => {
  if (!node) return ''
  if (node.type === 'text') return node.value ?? ''
  if (node.type === 'comment') return `<!--${node.value ?? ''}-->`

  if (node.type === 'element') {
    const attrs = node.properties
      ? Object.entries(node.properties)
          .filter(([, v]) => v != null && v !== false)
          .map(([k, v]) => v === true ? k : `${k}="${DOMPurify.sanitize(String(v))}"`)
          .join(' ')
      : ''
    const open = attrs ? `<${node.tagName} ${attrs}>` : `<${node.tagName}>`
    const body = node.children?.map((c: any) => stringifyNode(c)).join('') ?? ''
    const close = `</${node.tagName}>`
    return open + body + close
  }

  return ''
}

export default rehypeRawPlugin
