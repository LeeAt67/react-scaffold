/**
 * 密码 HMAC-SHA256 哈希。
 *
 * 以 username 为盐，HMAC-SHA256(username, password)。
 * 同一密码不同用户名产出不同的哈希值，抵御彩虹表。
 */
export const hashPassword = async (password: string, username: string): Promise<string> => {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(username),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(password))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
