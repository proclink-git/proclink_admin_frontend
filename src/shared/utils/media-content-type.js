export const CONTENT_TYPE = {
  image: 'i',
  pdf: 'p',
  video: 'v'
}

export const CONTENT_TYPE_LABEL = {
  [CONTENT_TYPE.image]: 'Image',
  [CONTENT_TYPE.pdf]: 'PDF',
  [CONTENT_TYPE.video]: 'Video'
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.bmp', '.ico']
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v']
const CONTENT_TYPE_VALUES = new Set(Object.values(CONTENT_TYPE))

function normalizeFileName(value = '') {
  return String(value || '')
    .split('?')[0]
    .split('#')[0]
    .toLowerCase()
}

function hasExtension(name, extensions) {
  return extensions.some((extension) => name.endsWith(extension))
}

export function getContentTypeFromFile(file = {}) {
  const name = normalizeFileName(file.name || file.sUrl || file.url)
  const mime = String(file.type || file.sContentType || '').toLowerCase()

  if (mime === 'application/pdf' || name.endsWith('.pdf')) return CONTENT_TYPE.pdf

  if (mime.startsWith('video/') || hasExtension(name, VIDEO_EXTENSIONS)) return CONTENT_TYPE.video

  if (name.endsWith('.json') && ['application/json', 'text/json', ''].includes(mime)) return CONTENT_TYPE.video
  if (name.endsWith('.lottie')) return CONTENT_TYPE.video

  if (mime === 'image/gif' || name.endsWith('.gif')) return CONTENT_TYPE.image

  if (mime.startsWith('image/') || hasExtension(name, IMAGE_EXTENSIONS)) return CONTENT_TYPE.image

  return CONTENT_TYPE.image
}

export function getContentTypeFromMediaType(mediaType = '') {
  if (mediaType === 'image') return CONTENT_TYPE.image
  if (mediaType === 'video') return CONTENT_TYPE.video
  if (mediaType === 'document' || mediaType === 'pdf') return CONTENT_TYPE.pdf

  return undefined
}

export function getGalleryItemContentType(item = {}) {
  if (CONTENT_TYPE_VALUES.has(item?.eContentType)) return item.eContentType

  return getContentTypeFromFile({ name: item?.sUrl || '', type: item?.sContentType || '' })
}

export function isLottieFile(file = {}) {
  const name = normalizeFileName(file.name || file.sUrl || file.url)
  const mime = String(file.type || file.sContentType || '').toLowerCase()

  return name.endsWith('.json') || name.endsWith('.lottie') || mime.includes('lottie') || mime === 'application/json' || mime === 'text/json'
}

export function getGalleryItemMediaKind(item = {}) {
  const contentType = getGalleryItemContentType(item)

  if (contentType === CONTENT_TYPE.pdf) return 'document'
  if (contentType === CONTENT_TYPE.video) return isLottieFile({ name: item?.sUrl, type: item?.sContentType }) ? 'lottie' : 'video'

  return 'image'
}

export function getUploadTypeFromFile(file = {}) {
  const contentType = getContentTypeFromFile(file)

  if (contentType === CONTENT_TYPE.pdf) return 'pdf'
  if (isLottieFile(file)) return 'lottie'

  return 'articleEditorMedia'
}
