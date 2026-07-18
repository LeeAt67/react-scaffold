import { useEffect, useRef, useState } from 'react'

/**
 * 元素进入视口（含提前量）后置为 true，且只触发一次。
 *
 * 用于代码块「可视区优先高亮」：仅当进入视口时才触发 shiki 高亮，
 * 视口外的块保持纯文本，避免同帧全量高亮造成丢帧。
 *
 * @param rootMargin - 视口提前量，默认 '300px'
 * @returns `[ref, inView]`
 */
const useInViewOnce = <T extends HTMLElement>(
  rootMargin = '300px',
): readonly [React.RefObject<T | null>, boolean] => {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState<boolean>(
    () => typeof IntersectionObserver === 'undefined',
  )

  useEffect(() => {
    if (inView) return undefined
    const el = ref.current
    if (!el) return undefined

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )
    observer.observe(el)

    return () => observer.disconnect()
  }, [inView, rootMargin])

  return [ref, inView] as const
}

export default useInViewOnce
