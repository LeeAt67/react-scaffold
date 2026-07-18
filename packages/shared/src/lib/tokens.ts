/**
 * KUI Design Tokens — Monochrome
 *
 * Six core semantic tokens. Extend on demand.
 * Key: warm-leaning monochrome — avoids cold blue-gray defaults.
 */

export type TokenEntry = {
  name: string
  cssVar: string
  light: string
  dark: string
  usage: string
}

export const tokens: TokenEntry[] = [
  {
    name: 'Background',
    cssVar: '--background',
    light: '#FAFAF8',
    dark: '#121212',
    usage: '页面底色',
  },
  {
    name: 'Foreground',
    cssVar: '--foreground',
    light: '#1A1A17',
    dark: '#EBEBE5',
    usage: '主文字色',
  },
  {
    name: 'Surface',
    cssVar: '--card',
    light: '#FFFFFF',
    dark: '#1E1E1E',
    usage: '卡片/面板背景',
  },
  {
    name: 'Primary',
    cssVar: '--primary',
    light: '#171717',
    dark: '#EBEBE5',
    usage: '主按钮/强调',
  },
  {
    name: 'Muted',
    cssVar: '--muted',
    light: '#F0F0EB',
    dark: '#2A2A2A',
    usage: '次级背景',
  },
  {
    name: 'Accent',
    cssVar: '--accent',
    light: '#E8E8E2',
    dark: '#333333',
    usage: '悬停/选中背景',
  },
]
