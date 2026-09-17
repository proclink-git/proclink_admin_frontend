export const PUBLIC_URL = process.env.PUBLIC_URL || ''

export function appPath(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${PUBLIC_URL}${normalizedPath}`
}
