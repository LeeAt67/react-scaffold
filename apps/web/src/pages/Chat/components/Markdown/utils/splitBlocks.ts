/**
 * 流式 Markdown 分块工具。
 *
 * 把累积的 Markdown 文本按「安全空行」切分为多个 block，
 * 供分块记忆化渲染（blockMode）使用。
 *
 * 安全保证：
 * - 不在代码围栏（``` / ~~~）内部切分
 * - 不在块级数学（$$）内部切分
 * - 不在 HTML details 块内部切分
 * - 切分后合并相邻的列表块 / 引用块，保持语义
 */

const LIST_ITEM_RE = /^\s*(?:[-*+]|\d+[.)])\s+/

const firstNonEmptyLine = (block: string): string =>
  block.split('\n').find(line => line.trim() !== '') ?? ''

const isListLike = (block: string): boolean => LIST_ITEM_RE.test(firstNonEmptyLine(block))

const isQuoteLike = (block: string): boolean => /^\s*>/.test(firstNonEmptyLine(block))

/**
 * 将 Markdown 文本切分为可独立渲染的 block 数组。
 *
 * @param text - 完整（累积）的 Markdown 文本
 * @returns block 字符串数组，按原文顺序排列
 */
export const splitMarkdownIntoBlocks = (text: string): string[] => {
  const lines = text.split('\n')
  const rawBlocks: string[] = []
  let current: string[] = []
  let inCodeFence = false
  let inMathFence = false
  let detailsDepth = 0
  let fenceChar = ''

  const pushCurrent = () => {
    if (current.length > 0) {
      rawBlocks.push(current.join('\n'))
      current = []
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()

    // 代码围栏开关
    const fenceMatch = trimmed.match(/^(`{3,}|~{3,})/)
    if (fenceMatch && !inMathFence) {
      const char = fenceMatch[1][0]
      if (!inCodeFence) {
        inCodeFence = true
        fenceChar = char
      } else if (char === fenceChar) {
        inCodeFence = false
      }
      current.push(line)
      continue
    }

    // 块级数学开关（代码围栏内不处理）
    if (trimmed === '$$' && !inCodeFence) {
      inMathFence = !inMathFence
      current.push(line)
      continue
    }

    // 顶层空行 → block 边界
    if (trimmed === '' && !inCodeFence && !inMathFence && detailsDepth === 0) {
      pushCurrent()
      continue
    }

    current.push(line)

    // details 嵌套深度跟踪
    if (!inCodeFence && !inMathFence) {
      if (/^\s*<details(?:\s|>)/i.test(trimmed) && !/<\/details>/i.test(trimmed)) {
        detailsDepth += 1
      }
      if (/<\/details>/i.test(trimmed)) {
        detailsDepth = Math.max(0, detailsDepth - 1)
      }
    }
  }
  pushCurrent()

  // 合并相邻的列表块 / 引用块
  const merged: string[] = []
  for (const block of rawBlocks) {
    const prev = merged[merged.length - 1]
    const mergeable =
      prev !== undefined &&
      ((isListLike(block) && isListLike(prev)) || (isQuoteLike(block) && isQuoteLike(prev)))
    if (mergeable) {
      merged[merged.length - 1] = `${prev}\n\n${block}`
    } else {
      merged.push(block)
    }
  }

  return merged
}
