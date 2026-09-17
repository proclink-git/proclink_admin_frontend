import { strFromU8, unzipSync } from 'fflate'

export const DOT_LOTTIE_CONTENT_TYPE = 'application/zip+dotlottie'

export const DOT_LOTTIE_CONTENT_TYPES = [DOT_LOTTIE_CONTENT_TYPE, 'application/dotlottie', 'application/x-dotlottie']

export const LOTTIE_JSON_CONTENT_TYPES = ['application/json', 'application/lottie+json', 'video/lottie+json']

function normalizeMime(mime = '') {
  return String(mime || '').toLowerCase().split(';')[0].trim()
}

function getFileExtension(fileName = '') {
  return String(fileName).split('?')[0].split('#')[0].split('.').pop()?.toLowerCase() || ''
}

function getBaseFileName(fileName = '') {
  return String(fileName).split('/').pop()?.split('\\').pop() || ''
}

function normalizeArchivePath(path = '') {
  return String(path).replace(/\\/g, '/').replace(/^\.?\//, '').replace(/^\/+/, '')
}

function getArchiveEntriesMap(entries = {}) {
  return Object.keys(entries).reduce((acc, key) => {
    acc[normalizeArchivePath(key).toLowerCase()] = key
    return acc
  }, {})
}

function getArchiveEntry(entries, entriesMap, path) {
  return entries[entriesMap[normalizeArchivePath(path).toLowerCase()]]
}

function getJsonEntry(entries, entriesMap, path) {
  const entry = getArchiveEntry(entries, entriesMap, path)

  return entry ? JSON.parse(strFromU8(entry)) : null
}

function findFirstJsonEntry(entries, entriesMap) {
  const entryName = Object.keys(entries).find((key) => {
    const path = normalizeArchivePath(key).toLowerCase()
    return path !== 'manifest.json' && (path.startsWith('a/') || path.startsWith('animations/')) && path.endsWith('.json')
  }) || Object.keys(entries).find((key) => {
    const path = normalizeArchivePath(key).toLowerCase()
    return path !== 'manifest.json' && path.endsWith('.json')
  })

  return entryName ? getArchiveEntry(entries, entriesMap, entryName) : null
}

function getAnimationFileEntry(entries, entriesMap, manifest = {}) {
  const firstAnimationId = manifest.initial?.animation || manifest.activeAnimationId || manifest.animations?.[0]?.id

  if (firstAnimationId) {
    const normalizedId = normalizeArchivePath(firstAnimationId)
    const animationFileName = normalizedId.endsWith('.json') ? normalizedId : `${normalizedId}.json`
    const candidates = [
      animationFileName,
      `a/${animationFileName}`,
      `animations/${animationFileName}`,
      `a/${getBaseFileName(animationFileName)}`,
      `animations/${getBaseFileName(animationFileName)}`
    ]

    for (const candidate of candidates) {
      const entry = getArchiveEntry(entries, entriesMap, candidate)
      if (entry) return entry
    }
  }

  return findFirstJsonEntry(entries, entriesMap)
}

function getMimeType(fileName = '') {
  switch (getFileExtension(fileName)) {
    case 'gif':
      return 'image/gif'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'svg':
      return 'image/svg+xml'
    case 'webp':
      return 'image/webp'
    default:
      return 'application/octet-stream'
  }
}

function getAssetCandidates(asset = {}) {
  const assetPath = normalizeArchivePath(asset.p)
  const assetBaseName = getBaseFileName(assetPath)
  const assetPathWithFolder = normalizeArchivePath(`${asset.u || ''}${asset.p || ''}`)

  return [
    assetPathWithFolder,
    assetPath,
    `images/${assetBaseName}`,
    `i/${assetBaseName}`,
    `images/${assetPath}`,
    `i/${assetPath}`
  ].filter(Boolean)
}

function isExternalAssetPath(path = '') {
  return /^(?:https?:)?\/\//i.test(path) || /^(?:blob|data):/i.test(path)
}

function applyDotLottieAssetUrls(animationData, entries, entriesMap) {
  const objectUrls = []

  if (!Array.isArray(animationData?.assets)) return objectUrls

  animationData.assets.forEach((asset) => {
    if (!asset?.p || isExternalAssetPath(asset.p)) return

    const assetEntryName = getAssetCandidates(asset).find((candidate) => getArchiveEntry(entries, entriesMap, candidate))
    const assetEntry = assetEntryName ? getArchiveEntry(entries, entriesMap, assetEntryName) : null

    if (!assetEntry) return

    const blobUrl = URL.createObjectURL(new Blob([assetEntry], { type: getMimeType(assetEntryName) }))
    objectUrls.push(blobUrl)
    asset.u = ''
    asset.p = blobUrl
    asset.e = 1
  })

  return objectUrls
}

export function isDotLottieFile(file = {}) {
  return getFileExtension(file.name) === 'lottie' || DOT_LOTTIE_CONTENT_TYPES.includes(normalizeMime(file.type))
}

export function isLottieJsonFile(file = {}) {
  return getFileExtension(file.name) === 'json' || LOTTIE_JSON_CONTENT_TYPES.includes(normalizeMime(file.type))
}

export function isDotLottieSource(src = '', contentType = '') {
  return getFileExtension(src) === 'lottie' || DOT_LOTTIE_CONTENT_TYPES.includes(normalizeMime(contentType))
}

export function getDotLottieAnimationData(arrayBuffer, options = {}) {
  const { createAssetUrls = false } = options
  const entries = unzipSync(new Uint8Array(arrayBuffer))
  const entriesMap = getArchiveEntriesMap(entries)
  const manifest = getJsonEntry(entries, entriesMap, 'manifest.json') || {}
  const animationEntry = getAnimationFileEntry(entries, entriesMap, manifest)

  if (!animationEntry) throw new Error('There was an error loading the Lottie file.')

  const animationData = JSON.parse(strFromU8(animationEntry))
  const objectUrls = createAssetUrls ? applyDotLottieAssetUrls(animationData, entries, entriesMap) : []

  return { animationData, manifest, objectUrls }
}
