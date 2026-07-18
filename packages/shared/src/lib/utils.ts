import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 Tailwind 类名。
 *
 * @param inputs - 任意数量的类名参数
 * @returns 去重合并后的类名字符串
 */
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}
