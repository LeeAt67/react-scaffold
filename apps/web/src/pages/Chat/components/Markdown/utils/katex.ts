/**
 * KaTeX 定界符列表：将各种 LaTeX 定界符统一替换为 $$...$$ 格式。
 */
const DELIMITER_LIST = [
  { left: '$$', right: '$$', display: true },
  { left: '\\(', right: '\\)', display: false },
  { left: '\\[', right: '\\]', display: true },
  { left: '\\begin{equation}', right: '\\end{equation}', display: true },
] as const

/** 正则元字符转义 */
const escapeRegex = (s: string): string => s.replace(/[$()*+./?[\\]^{|}-]/g, '\\$&')

/** 生成匹配所有定界符的正则 */
const buildRegex = (): RegExp => {
  const parts = DELIMITER_LIST.map(({ left, right }) => {
    const el = escapeRegex(left)
    const er = escapeRegex(right)
    return `${el}((?:\\\\[^]|[^\\\\])+?)${er}`
  })
  return new RegExp(`(${parts.join('|')})`, 'g')
}

const DELIMITER_REGEX = buildRegex()

/** 提取定界符内部纯内容 */
const extractContent = (match: string): string =>
  match
    .replace(/^\$\$|\\\[\$|\\begin{equation}|\$|\\\(|\\\[/, '')
    .replace(/\$\$|\\]\$|\\end{equation}|\$|\\\)|\\]/, '')

/**
 * 将输入中的各种 LaTeX 定界符统一替换为 `$$...$$` 格式，
 * 确保 remark-math + rehype-katex 能正确识别。
 *
 * 处理：
 * - `\(...\)` → `$$...$$`（行内公式）
 * - `\[...\]` / `\begin{equation}...\end{equation}` → `$$...$$`（块级公式）
 * - `$$...$$` → 保持不变
 * - 同时去除每行行末空格
 *
 * @param input - 原始 Markdown 内容
 * @returns 定界符统一后的内容
 */
export const replaceDelimiters = (input: string): string => {
  if (!input) return ''

  // 去行末空格，避免影响公式渲染
  const trimmed = input.replace(/[\t ]+$/gm, '')

  return trimmed.replace(DELIMITER_REGEX, (match: string) => {
    const content = extractContent(match)
    return `$$${content}$$`
  })
}

/**
 * 预处理 Markdown 内容：定界符统一 + 特殊标签转义。
 *
 * @param input - 原始内容
 * @returns 可直接传入 react-markdown 的内容
 */
export const preprocessContent = (input: string): string => {
  if (!input) return ''

  // 转义 <think> 标签（防止被 rehypeRaw 当作 HTML 吃掉）
  const escaped = input
    .replace(/<think>/g, '&lt;think&gt;')
    .replace(/<\/think>/g, '&lt;/think&gt;')

  return replaceDelimiters(escaped)
}
