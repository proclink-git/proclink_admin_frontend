/* eslint-disable no-useless-escape */
/* eslint-disable multiline-ternary */
import { Crypt } from 'hybrid-crypto-js'
import { PUBLIC_KEY, DESIGNATION, SEO_REDIRECTS_TYPE_BY_CODE, S3_PREFIX, API_URL, GTPHY_API_URL, GTPHY_API_KEY, GOOGLE_MAPS_EMBED_API_KEY } from './constants'
import { DOT_LOTTIE_CONTENT_TYPES, LOTTIE_JSON_CONTENT_TYPES } from './utils/dotlottie'
import moment from 'moment'

let currentUser
let uniqueIdCounter = 0

export const setCurrentUser = (data) => {
  currentUser = data
}

export const getCurrentUser = () => currentUser

export const generateUniqueId = (length = 24) => {
  const idLength = Math.max(Number(length) || 24, 1)
  const alphabet = '0123456789abcdef'

  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    const values = new Uint8Array(idLength)
    globalThis.crypto.getRandomValues(values)

    return Array.from(values, (value) => alphabet[value % alphabet.length]).join('')
  }

  uniqueIdCounter += 1
  let id = `${Date.now().toString(16)}${uniqueIdCounter.toString(16)}${Math.random().toString(16).slice(2)}`

  while (id.length < idLength) {
    id += Math.random().toString(16).slice(2)
  }

  return id.slice(0, idLength)
}

export const encryption = (data) => {
  const crypt = new Crypt()
  const encrypted = crypt.encrypt(PUBLIC_KEY, data)
  return encrypted.toString()
}

export const setSortType = (data, fieldName) => {
  return data.map((d) => {
    if (d.internalName === fieldName) {
      d.type = d.type === 1 ? -1 : 1
    }
    return d
  })
}

export const sortArray = (data, fieldName, sortOrder) => {
  return data.sort((a, b) => (sortOrder === 1 ? b[fieldName].localeCompare(a[fieldName]) : a[fieldName].localeCompare(b[fieldName])))
}

export const searchFromArray = (data, searchTxt, fieldName) => {
  const searchData = []
  data.filter((item) => {
    item[fieldName].toLowerCase().toString().indexOf(searchTxt.toLowerCase()) > -1 && searchData.push(item)
    return item
  })
  return searchData
}

export const generatePassword = () => {
  const char = String.fromCharCode(65 + Math.floor(Math.random() * 26))
  const specialChar = '!%&?'
  const number = '1234567890'
  return `${char}${specialChar.substr(Math.floor(specialChar.length * Math.random()), 1)}${Math.random()
    .toString(36)
    .substr(2, 5)}${number.substr(Math.floor(number.length * Math.random()), 1)}${char.toLowerCase()}`
}

export const range = (start, end) => {
  const length = end - start + 1
  return Array.from({ length }, (_, idx) => idx + start)
}

// Backend expects nSkip as a 1-based page number, not a record offset.
export const toBackendPagination = (page = 1, pageSize = 10) => {
  return {
    nSkip: Math.max(1, Number(page) || 1),
    nLimit: Number(pageSize) || 10
  }
}

export const scrollTop = (value = 0) => {
  const container = document.getElementsByClassName('main-container')
  container[0].scrollTop = value
}

export const scrollBottom = (className) => {
  const container = document.getElementsByClassName(className)
  container[0].scrollTop = container[0].scrollHeight
}

export const bottomReached = ({ target }, early = 5) => {
  return target.offsetHeight + target.scrollTop + early >= target.scrollHeight
}

// For comments
export const eStatus = (para) => {
  switch (para) {
    case 'a':
      return 'Approved'
    case 'd':
      return 'Delete'
    case 'p':
      return 'Pending'
    case 'r':
      return 'Rejected'
    case 'sp':
      return 'Spam'
    case 't':
      return 'Trash'
    default:
      return ''
  }
}

// Color of Comments,article badges
export const colorBadge = (para) => {
  switch (para) {
    case 'a':
    case 'pub':
      return 'success'
    case 'p':
      return 'warning'
    case 'r':
      return 'danger'
    case 's':
      return 'warning-light'
    case 'sp':
      return 'danger-light'
    case 't':
    case 'd':
      return 'secondary'
    case 'i':
    case 'cr':
    case 'cd':
    case 'cs':
      return 'info'
    default:
      return ''
  }
}

export const getArticleState = (state, isPicked = false) => {
  switch (state) {
    case 'd':
      return 'draft'
    case 'cr':
      return 'changesRemaining'
    case 'crs':
      return 'changesResubmitted'
    case 'cs':
      return 'changesSubmitted'
    case 'p':
      return isPicked ? 'pendingButLocked' : 'pending'
    case 'pub':
      return 'published'
    case 's':
      return 'scheduled'
    case 'r':
      return 'rejected'
    case 't':
      return 'trash'
    default:
      return ''
  }
}

export const parseParams = (params = '') => {
  const urlParams = new URLSearchParams(params)
  const array = [
    'aFilters',
    'aStatusFiltersInput',
    'aStatus',
    'aCountryFilter',
    'aRoleFilter',
    'aCodeFilters',
    'eDesignationFilter',
    'aCategoryFilters',
    'aTagFilters',
    'aFilter',
    'eState',
    'aState',
    'aTeamTagFilters',
    'aVenueTagFilters',
    'aSeriesFilters',
    'aAuthorsFilters',
    'aType',
    'aPollType',
    'aWriterFilters'
  ]
  const value = Object.fromEntries(urlParams.entries())
  Object.keys(value).forEach((key) => {
    if (array.includes(key)) {
      value[key] = value[key].split(',')
    }
  })
  return value
}

export const appendParams = (value) => {
  const params = parseParams(location.search)
  const data = { ...params, ...value }
  Object.keys(data).filter((e) => (data[e] === '' || !data[e].toString().length) && delete data[e])
  window.history.pushState({}, null, `${location.pathname}?${new URLSearchParams(data).toString()}`)
}

// Image Type check function
export const checkImageType = (e) => {
  try {
    if (e === 'image/png' || e === 'image/jpeg' || e === 'image/jpg' || e === 'image/webp' || e === 'image/svg+xml') {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
  }
}
/**
 * @description Remove __typeName key from the object
 * @param obj Graph ql api object
 */
export const removeTypeName = (obj) => {
  const data = { ...obj }
  delete data.__typename
  return data
}

export function removeTypenameKey(data) {
  if (Array.isArray(data)) {
    return data.map(removeTypenameKey)
  } else if (data !== null && typeof data === 'object') {
    const newObj = {}
    Object.entries(data).forEach(([key, value]) => {
      if (key !== '__typename') {
        newObj[key] = removeTypenameKey(value)
      }
    })
    return newObj
  }
  return data
}

export const abbreviateNumber = (n) => {
  if (n < 1e3) return n
  if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + 'K'
  if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + 'M'
  if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + 'B'
  if (n >= 1e12) return +(n / 1e12).toFixed(1) + 'T'
}

export const getDesignation = (type) => {
  return DESIGNATION.find((item) => type !== item.value).label
}

export const getSeoRedirectTypeByCode = (type) => {
  return SEO_REDIRECTS_TYPE_BY_CODE.find((item) => type === item.value)
}

export const debounce = (callBack, delay = 500) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      callBack(...args)
    }, delay)
  }
}

// contact us query type
export const queryType = (data) => {
  switch (data) {
    case 'g':
      return 'General Issue'
    case 't':
      return 'Technical Issue'
    default:
      return ''
  }
}

// feedback query type
export const feedbackQueryType = (data) => {
  switch (data) {
    case 's':
      return 'Site Feedback'
    case 'e':
      return 'Editorial Feedback'
    default:
      return ''
  }
}

export function getFileInfo(file, mime) {
  if (typeof file === 'string') {
    const type = file.split('.').pop()
    const fileName = file.split('/').pop()
    return {
      filename: fileName,
      mime: `image/${type}`
    }
  } else {
    const pos = file.name.lastIndexOf('.')
    if (mime === 'image/jpeg') {
      const filename = `${String(file.name).substr(0, pos < 0 ? String(file.name).length : pos)}.jpg`
      return {
        filename,
        mime: 'image/jpeg'
      }
    }
    return {
      filename: file.name,
      mime: file.type
    }
  }
}

export const getGender = (gender) => {
  switch (gender) {
    case 'm':
      return 'Male'
    case 'f':
      return 'Female'
    case 'o':
      return 'Other'
    default:
      return ''
  }
}

export const getS3Url = (url) => {
  if (!url) return ''

  const value = String(url)

  if (/^(?:https?:)?\/\//i.test(value) || /^(?:blob|data):/i.test(value)) {
    return value
  }

  return `${S3_PREFIX}${value.replace(/^\/+/, '').replace(/\+/g, '%2B')}`
}

export const getImgURL = (url) => {
  return getS3Url(url)
}

export const getMediaKind = (url, mime) => {
  const mediaMime = String(mime || '').toLowerCase().split(';')[0].trim()

  if (LOTTIE_JSON_CONTENT_TYPES.includes(mediaMime) || DOT_LOTTIE_CONTENT_TYPES.includes(mediaMime)) return 'lottie'
  if (mediaMime.startsWith('video/')) return 'video'
  if (mediaMime.startsWith('image/')) return 'image'
  if (
    mediaMime === 'application/pdf' ||
    mediaMime === 'application/msword' ||
    mediaMime === 'application/rtf' ||
    mediaMime === 'text/plain' ||
    mediaMime === 'text/csv' ||
    mediaMime.includes('officedocument') ||
    mediaMime.includes('ms-excel') ||
    mediaMime.includes('ms-powerpoint')
  ) {
    return 'document'
  }

  const cleanUrl = String(url || '')
    .split('?')[0]
    .split('#')[0]
    .toLowerCase()

  if (/\.(mp4|webm|mov|m4v|ogg|ogv)$/i.test(cleanUrl)) return 'video'
  if (/(^|\/)lotties?\//i.test(cleanUrl)) return 'lottie'
  if (/\.(json|lottie)$/i.test(cleanUrl)) return 'lottie'
  if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|rtf)$/i.test(cleanUrl)) return 'document'

  return 'image'
}

export const isVideoMedia = (url, mime) => getMediaKind(url, mime) === 'video'
export const isLottieMedia = (url, mime) => getMediaKind(url, mime) === 'lottie'
export const isVideoGalleryMedia = (url, mime) => ['video', 'lottie'].includes(getMediaKind(url, mime))
export const isDocumentMedia = (url, mime) => getMediaKind(url, mime) === 'document'
export const isSvgMedia = (url, mime) => {
  const mediaMime = String(mime || '').toLowerCase()

  if (mediaMime === 'image/svg' || mediaMime === 'image/svg+xml') return true

  const cleanUrl = String(url || '')
    .split('?')[0]
    .split('#')[0]
    .toLowerCase()

  return /\.(svg|svg\+xml)$/i.test(cleanUrl)
}

export async function graphQlToRest(query, variables, apiName) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: { input: variables }
    })
  })
  const { data } = await response.json()
  const html = JSON.parse(data[apiName]?.oData || '')
  return html
}

/**
 * @description Removes style and class attributes from the element
 * @param string HTML For ex: '<div>Hello</div>'
 * @returns DOM HTML For ex: DocumentFragment
 */
export const removeStylesFromString = (string) => {
  const htmlNode = document.createElement('div')
  htmlNode.innerHTML = string
  htmlNode.querySelectorAll('*').forEach((node) => {
    node.removeAttribute('style')
    // node.removeAttribute('class')
  })
  return htmlNode.innerHTML
}

// Handle Drag and Drop items
export const handleDragEnd = (result, submenu, menu, setMenu, inputName = 'category') => {
  const { type, source, destination } = result
  if (!destination) return

  const sourceCategoryId = source.droppableId
  const destinationCategoryId = destination.droppableId

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
  }

  // Reordering items
  if (type === 'droppable-item') {
    // If drag and dropping within the same category
    if (sourceCategoryId === destinationCategoryId) {
      const updatedOrder = reorder(
        menu.find((category) => (category._id || category?.id) === sourceCategoryId)?.[submenu],
        source.index,
        destination.index
      )

      const updatedCategories = menu.map((category) =>
        (category._id || category?.id) !== sourceCategoryId ? category : { ...category, [submenu]: updatedOrder }
      )

      setMenu(inputName, updatedCategories)
    } else {
      const sourceOrder = menu.find((category) => (category._id || category?.id) === sourceCategoryId)?.[submenu]
      const destinationOrder = menu.find((category) => (category._id || category?.id) === destinationCategoryId)?.[submenu]

      const [removed] = sourceOrder.splice(source.index, 1)
      destinationOrder.splice(destination.index, 0, removed)

      destinationOrder[removed] = sourceOrder[removed]
      delete sourceOrder[removed]

      // const updatedCategories = menu.map((category) =>
      //   (category._id || category?.id) === sourceCategoryId
      //     ? { ...category, [submenu]: sourceOrder }
      //     : (category._id || category?.id) === destinationCategoryId
      //     ? { ...category, [submenu]: destinationOrder }
      //     : category
      // )
      const updatedCategories = menu.map((category) => {
        if ((category._id || category?.id) === sourceCategoryId) {
          return { ...category, [submenu]: sourceOrder }
        } else if ((category._id || category?.id) === destinationCategoryId) {
          return { ...category, [submenu]: destinationOrder }
        } else {
          return category
        }
      })
      setMenu(inputName, updatedCategories)
    }
  }

  // Reordering categories
  if (type === 'droppable-category') {
    const updatedCategories = reorder(menu, source.index, destination.index)

    setMenu(inputName, updatedCategories)
  }
}

/**
 * @description Convert string HTML to DOM HTML
 * @param str String HTML For ex: '<div>Hello</div>'
 * @returns DOM HTML For ex: DocumentFragment
 */
export const HTMLParser = (str) => {
  const parser = new DOMParser()
  return parser.parseFromString(str, 'text/html')
}

/**
 * @description Convert date intoUTC formate
 * @param date String date
 * @returns date in UTC format
 * @developer Vrund Shah
 */
export const dateCheck = (data) => {
  if (data && isNaN(Number(data))) {
    return new Date(data)
  } else if (data) {
    return new Date(Number(data))
  } else {
    return new Date()
  }
}

/**
 * @description Compare date to current date
 * @param Date String date in any format
 * @returns Boolean true or false
 * @developer Kuldip Dobariya
 */
export const compareDateToCurrentDate = (date) => {
  return moment(date).isBefore(new Date(), 'h:mm aa')
}

/**
 * @description Check time with current time
 * @param time String date in any format
 * @returns Boolean true or false
 * @developer Kuldip Dobariya
 */
export const filterPassedTime = (time) => {
  const currentDate = new Date()
  const date = new Date(time)
  return currentDate.getTime() < date.getTime()
}
/**
 * @description Check time with current time
 * @param time String date in any format
 * @returns Boolean true or false
 * @developer Kuldip Dobariya
 */
export const filterFutureTime = (time) => {
  const currentDate = new Date()
  const date = new Date(time)
  return currentDate.getTime() > date.getTime()
}

export function isBottomReached(id, callBack) {
  document.getElementsByTagName('body')[0].onscroll = () => {
    const ele = document.getElementById(id)
    if (ele) {
      callBack(ele.offsetTop <= window.scrollY + window.innerHeight)
    } else {
      document.getElementsByTagName('body')[0].onscroll = null
    }
  }
}

export function convertIntoKb(data) {
  const modifiedData = data / 1000
  return Math.round(modifiedData)
}

// export function getImageHeightWidth(event) {
//   var width, height
//   const img = new Image()
//   console.log(event)
//   img.src = window.URL.createObjectURL(event)
//   img.onload = () => {
//     width = img.width
//     height = img.height
//   }
//   return { width, height }
// }

/**
 * @description For Differentiate month between two Dates
 * @param DateRange (Ex - 2022-05-02 to 2022-11-01)
 * @returns Array of Month with Year
 * @developer Vrund Shah
 */
export function DiffMonthBetweenTwoDates(dMax, dMin) {
  const minDate = moment(+dMax).format('YYYY-M-D')
  const maxDate = moment(+dMin).format('YYYY-M-D')
  let startDate = moment(minDate, 'YYYY-M-DD')
  const endDate = moment(maxDate, 'YYYY-M-DD').endOf('month')

  const allMonthsInPeriod = []

  while (startDate.isBefore(endDate)) {
    allMonthsInPeriod.push(startDate.format('MMM YYYY'))
    startDate = startDate.add(1, 'month')
  }
  return allMonthsInPeriod
}

export function inverseMonth(data) {
  const mData = moment(data).format('YYYY-MM-01')
  return mData
}

/**
 * @description Wrap table responsive class on table tag
 * @param htmlString String HTML
 * @returns Modified String HTML
 * @developer Kuldip Dobariya
 */
export function wrapTable(htmlString) {
  const div = document.createElement('div')
  div.innerHTML = htmlString || ''

  const scrollTable = div.getElementsByTagName('table')
  for (let i = 0; i < scrollTable.length; i++) {
    const parentClass = scrollTable[i].parentNode?.classList
    if (![...parentClass].includes('table-responsive')) {
      const wrapper = document.createElement('div')
      wrapper.classList.add('table-responsive')
      wrapper.append(scrollTable[i].cloneNode(true))
      scrollTable[i].replaceWith(wrapper)
    }
  }
  return div.innerHTML
}

export async function getGiphyImage(category, offset, search) {
  const response = await fetch(`${GTPHY_API_URL}${category}?api_key=${GTPHY_API_KEY}&limit=20&offset=${offset}&q=${search || ''}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
  const { data } = await response.json()
  return data
}

export function getNestedObject(obj, pathStr) {
  if (!pathStr) return obj

  const keys = String(pathStr).match(/[^.[\]]+/g) || []

  return keys.reduce((nestedObj, key) => {
    return nestedObj?.[key]
  }, obj)
}

export function convertToEmbed(url) {
  const youtubeURL = 'https://www.youtube.com/embed/'
  const embedConfig = {
    autoplay: 1,
    // loop: 1,
    // disablekb: 1,
    // controls: 1,
    mute: 1
    // rel: 0,
    // fs: 0
  }
  if (url?.includes('youtube.com') || url?.includes('youtu.be')) {
    url = url.trim()
    const youtubeRegEx = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const youtubeURLMatch = url.match(youtubeRegEx)

    if (youtubeURLMatch && youtubeURLMatch[2].length) {
      const params = Object.entries(embedConfig)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')
      const embedUrl = youtubeURL + youtubeURLMatch[2]
      return `${embedUrl}?${params}`
    } else {
      return url
    }
  } else return url
}

export function embedFromMap(url) {
  const apiToken = GOOGLE_MAPS_EMBED_API_KEY
  if (!apiToken) return ''
  const regex = /place\/([^/]+)\/@([^/]+)/
  const match = url.match(regex)
  let extractedUrl = ''
  if (match) {
    const placeValue = encodeURI(match[1])
    const coords = match[2].split(',')
    const coordinateValue = coords.slice(0, 2).join(',')
    extractedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiToken}&q=${placeValue}`
    if (coordinateValue) {
      extractedUrl += `&center=${encodeURI(coordinateValue)}`
    }
    const zoom = parseInt(coords.slice(2, 3))
    if (zoom) {
      extractedUrl += `&zoom=${encodeURI(zoom)}`
    }
    return extractedUrl
  } else {
    return extractedUrl
  }
}

export function jsonToCsvAndDownload(jsonData, filename = 'data.csv') {
  if (!jsonData || !jsonData.length) {
    console.error('Invalid JSON data')
    return
  }

  // Convert JSON to CSV
  const csvRows = []
  const headers = Object.keys(jsonData[0]).filter((header) => header !== '__typename')
  csvRows.push(headers.join(','))

  for (const row of jsonData) {
    const values = headers.map((header) => {
      const value = row[header] !== undefined ? row[header] : ''
      const escaped = ('' + value).replace(/"/g, '\\"')
      return `"${escaped}"`
    })
    csvRows.push(values.join(','))
  }

  const csvString = csvRows.join('\n')

  // Create a Blob from the CSV string
  const blob = new Blob([csvString], { type: 'text/csv' })

  // Create a link element
  const link = document.createElement('a')

  // Set the download attribute with a filename
  link.setAttribute('download', filename)

  // Create a URL for the Blob and set it as the href attribute
  link.href = URL.createObjectURL(blob)

  // Append the link to the body
  document.body.appendChild(link)

  // Programmatically click the link to trigger the download
  link.click()

  // Remove the link from the document
  document.body.removeChild(link)
}

export function sanitizeDecimalInput(value = '', decimalPlaces = 2) {
  const sanitized = String(value || '').replace(/[^\d.]/g, '')
  const dotIndex = sanitized.indexOf('.')

  if (dotIndex === -1) return sanitized

  const beforeDot = sanitized.slice(0, dotIndex)
  const afterDot = sanitized.slice(dotIndex + 1).replace(/\./g, '').slice(0, decimalPlaces)

  return `${beforeDot}.${afterDot}`
}

export function sanitizeDurationLabelInput(value = '', decimalPlaces = 2) {
  let sanitized = String(value || '').replace(/[^\d.:]/g, '')

  if (!sanitized.includes(':')) {
    return sanitizeDecimalInput(sanitized, decimalPlaces)
  }

  sanitized = sanitized.replace(/\./g, '')

  const parts = sanitized.split(':').slice(0, 3)

  return parts
    .map((part, index) => {
      const digitsOnly = part.replace(/[^\d]/g, '')

      if (index === 0) return digitsOnly

      return digitsOnly.slice(0, 2)
    })
    .join(':')
}

export function normalizeDurationLabel(value = '') {
  const trimmed = String(value || '').trim()

  if (!trimmed) return ''

  return sanitizeDurationLabelInput(trimmed).replace(/[.:]$/, '')
}

export function formatVideoDurationLabel(duration = 0) {
  const totalSeconds = Math.round(Number(duration) || 0)

  if (!totalSeconds) return ''

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
