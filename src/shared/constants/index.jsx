/* eslint-disable no-unused-expressions */
/* eslint-disable no-useless-escape */
/* eslint-disable react/jsx-key */
/* eslint-disable react/react-in-jsx-scope */
import { FormattedMessage } from 'react-intl'

// RegEx
export const ONLY_NUMBER = /^[0-9]*$/
export const ONLY_NUMBER_WITH_DECIMAL = /^(?:[0-9]*\.?[0-9]{0,2}|[0-9]+(?::[0-9]{0,2}){0,2})$/
export const ONLY_NUMBER_EXCEPT_0 = /^(0*[1-9]\d*(\.\d+)?|0+\.\d*[1-9]\d*)$/
export const EMAIL = /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/
export const PASSWORD = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])/
export const IFSC_CODE = /^[A-Za-z]{4}[a-zA-Z0-9]{7}$/
export const ACCOUNT_NO = /^\d{9,18}$/
export const URL_REGEX = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=%]+$/
export const SPOTIFY_URL_REGEX = /^https?:\/\/(?:open\.)?spotify\.com\/(?:show|episode|album|playlist|track)\/.*/i
export const AMAZON_MUSIC_URL_REGEX =
  /^https?:\/\/music\.amazon\.(?:com|in|co\.uk|de|fr|it|es)\/(?:podcasts\/[a-z0-9-]+\/[a-z0-9-]+|(?:.*\/)?(?:dp|gp\/product)\/(?:B[0-9A-Z]{9}|\d{9}|\d{10}))(?:\/|\?|$)/i
export const GOOGLE_PODCAST_URL_REGEX = /^https?:\/\/music\.youtube\.com\/watch\?v=[\w-]{11}(?:&list=[\w-]+)?/i
export const SOUND_CLOUD_URL_REGEX = /^https?:\/\/(?:www\.)?soundcloud\.com\/[\w-]+(?:\/[\w-]+){1,2}$/i
export const POBDEAN_URL_REGEX = /^https?:\/\/(?:www\.)?podbean\.com\/(?:ew\/dir-[\w]+-[\w]+|(?:podcast-episode|site|pu)\/[\w-]+)/i
export const NO_SPACE = /^\S*$/
export const CUSTOM_URL = /^[A-Za-z0-9\-]+$/
export const CUSTOM_URL_WITH_SLASH = /^[A-Za-z0-9\-\/]+$/
export const NO_SPECIAL_CHARACTER = /^[A-Za-z0-9 ]+$/
export const ONLY_DOT_AND_UNDERSCORE_WITH_NO_SPACE = /^[a-zA-Z0-9._]+$/
export const YOUTUBE_URL_REG_EX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/

const runtimeEnv = typeof window !== 'undefined' && window.__ENV__ ? window.__ENV__ : {}

const buildTimeEnv = {
  REACT_APP_ENV: process.env.REACT_APP_ENV,
  REACT_APP_S3_PREFIX: process.env.REACT_APP_S3_PREFIX,
  REACT_APP_REST_API_URL: process.env.REACT_APP_REST_API_URL,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  REACT_APP_URL_PREFIX: process.env.REACT_APP_URL_PREFIX,
  REACT_APP_PREVIEW_URL: process.env.REACT_APP_PREVIEW_URL,
  REACT_APP_KNOWLEDGE_CENTER_URL: process.env.REACT_APP_KNOWLEDGE_CENTER_URL,
  REACT_APP_GIPHY_API_URL: process.env.REACT_APP_GIPHY_API_URL,
  REACT_APP_GIPHY_API_KEY: process.env.REACT_APP_GIPHY_API_KEY,
  REACT_APP_GOOGLE_MAPS_EMBED_API_KEY: process.env.REACT_APP_GOOGLE_MAPS_EMBED_API_KEY
}

const getEnv = (key, fallback) => {
  const value = runtimeEnv[key] || buildTimeEnv[key]
  const normalizedValue = typeof value === 'string' ? value.trim() : value
  return normalizedValue || fallback
}

export const S3_PREFIX = getEnv('REACT_APP_S3_PREFIX')
export const REST_API_URL = getEnv('REACT_APP_REST_API_URL')
export const API_URL = getEnv('REACT_APP_API_URL')
export const URL_PREFIX = getEnv('REACT_APP_URL_PREFIX')
export const PREVIEW_URL = getEnv('REACT_APP_PREVIEW_URL', 'http://localhost:3000/article-preview/')
export const APP_ENV = getEnv('REACT_APP_ENV')
export const KNOWLEDGE_CENTER_URL = getEnv('REACT_APP_KNOWLEDGE_CENTER_URL', 'knowledge-center/')
export const GOOGLE_MAPS_EMBED_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_EMBED_API_KEY || ''

// KEY FOR GIF API
export const GTPHY_API_URL = getEnv('REACT_APP_GIPHY_API_URL', 'https://api.giphy.com/v1/gifs/')
export const GTPHY_API_KEY = getEnv('REACT_APP_GIPHY_API_KEY', 'Vmci5nqMozQzI71R4gvlrR48V4pj037H')

// Encryption key
export const PUBLIC_KEY = process.env.REACT_APP_PUBLIC_KEY || `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCFt7U4h2G/pgXKeVJK++os7+Zv/Cl0qK9On40YQSgFW3j+RKxK3LBVI
WMPb5+0by0d92wbOIO8Qx9KwSHBrWHHChLSeepls69QHPZs66lm6HI2dSdsMbqFVBKPZegHrsN8p+hVLE60/lbsmgYI7cPc
kUbVop4eptpWa5AikGKMXQIDAQAB-----END PUBLIC KEY-----`

export const TOAST_TYPE = {
  Error: 'danger',
  Success: 'success'
}

export const RESEND_OTP_S = 30

export const PERMISSION_CATEGORY = {
  content: 'content',
  admin: 'admin',
  analytics: 'analytics'
}

export const HEADER_CATEGORY_SLUG = {
  b: 'blogs/',
  w: 'webinar/',
  p: 'podcasts/',
  wp: 'white-papers/',
  cu: 'company-updates/',
  cs: 'case-studies/',
  cy: 'careers/',
  rr: 'research-reports/',
  vl: 'video-listing/',
  mg: 'media-gallery/',
  ne: 'company-updates/'
}

export const HEADER_CATEGORY_SLUG_ADMIN = {
  b: 'blogs',
  w: 'webinars',
  p: 'podcasts',
  wp: 'white-papers',
  cu: 'company-updates',
  cs: 'case-studies',
  cy: 'careers',
  rr: 'research-reports',
  vl: 'video-listing',
  mg: 'media-gallery',
  ne: 'company-updates'
}

export const HEADER_CATEGORY_TYPE = {
  blog: 'b',
  webinar: 'w',
  podcast: 'p',
  'white-papers': 'wp',
  'company-updates': 'cu',
  'case-studies': 'cs',
  'case-study': 'cs',
  careers: 'cy',
  career: 'cy',
  'research-reports': 'rr',
  'video-listing': 'vl',
  'media-gallery': 'mg',
  'news-and-events': 'cu'
}

export const E_HEADER_CATEGORY_TYPE = {
  value: ['b', 'w', 'p', 'wp', 'cu', 'cs', 'cy', 'rr', 'vl', 'mg'],
  description: {
    b: 'blog',
    w: 'webinars',
    p: 'podcast',
    wp: 'white_papers',
    cu: 'company_updates',
    cs: 'case_study',
    cy: 'careers',
    rr: 'research_reports',
    vl: 'video_listing',
    mg: 'media_gallery'
  }
}

export const PODCAST_PLATFORM_TYPE = [
  { label: 'Spotify', value: 'sf' },
  { label: 'Amazon Music', value: 'am' },
  { label: 'Google Podcast', value: 'gp' },
  { label: 'Sound Cloud', value: 'sc' },
  { label: 'Podbean', value: 'pb' },
  { label: 'Apple Podcast', value: 'ap' }
]

export const SOCIAL_LIST = [
  { label: <FormattedMessage id="X" />, value: 't' },
  { label: <FormattedMessage id="facebook" />, value: 'f' },
  // { label: <FormattedMessage id="instagram" />, value: 'i' },
  { label: <FormattedMessage id="linkedIn" />, value: 'l' },
  { label: 'Youtube', value: 'y' }
]
// export const META_ROBOTS = [
//   <FormattedMessage id="followIndex" />,
//   <FormattedMessage id="followNoIndex" />,
//   <FormattedMessage id="nofollowIndex" />,
//   <FormattedMessage id="noFollowNoIndex" />
// ]
export const META_ROBOTS = ['Follow, Index', 'Follow, No Index', 'Nofollow, Index', 'No follow, No Index']

export const DESIGNATION = [
  { label: 'Managing Director', value: 'md' },
  { label: 'Founder and Chief Executive Officer', value: 'fceo' },
  { label: 'Co-Founder', value: 'cf' },
  { label: 'Director', value: 'd' },
  { label: 'Regional Director', value: 'rd' },
  { label: 'Associate Director', value: 'ad' },
  { label: 'Chief Operating Officer', value: 'coo' },
  { label: 'Chief Strategy Officer', value: 'cso' },
  { label: 'Chief Product Officer', value: 'cpo' },
  { label: 'Chief Financial Officer', value: 'cfo' },
  { label: 'Chief Executive Officer', value: 'ceo' },
  { label: 'Chief Revenue Officer', value: 'cro' },
  { label: 'Chief Technology Officer', value: 'cto' },
  { label: 'Chief Marketing Officer', value: 'cmo' },
  { label: 'President', value: 'p' },
  { label: 'Senior Vice President', value: 'svp' },
  { label: 'Vice President', value: 'vp' },
  { label: 'Executive Vice President', value: 'evp' },
  { label: 'Assistant Vice President', value: 'avp' },
  { label: 'Marketing Head', value: 'mh' },
  { label: 'Department Head', value: 'dh' },
  { label: 'General Manager', value: 'gm' },
  { label: 'Regional Manager', value: 'rm' },
  { label: 'Branch Manager', value: 'bm' },
  { label: 'Senior Manager', value: 'sm' },
  { label: 'Department Manager', value: 'dm' },
  { label: 'Product Manager', value: 'pm' },
  { label: 'Project Manager', value: 'prm' },
  { label: 'Operations Manager', value: 'om' },
  { label: 'Assistant Manager', value: 'am' },
  { label: 'Product Specialist', value: 'ps' },
  { label: 'Business Analyst', value: 'ba' },
  { label: 'Team Leader', value: 'tl' },
  { label: 'Guest Speaker', value: 'gs' },
  { label: 'Moderator', value: 'mod' },
  { label: 'Executive', value: 'exe' }
]

export const FEEDBACK_CONTACT_STATUS = [
  { label: <FormattedMessage id="read" />, value: 'r' },
  { label: <FormattedMessage id="unread" />, value: 'ur' }
]

// export const USER_CUSTOM_FILTER = [
//   <FormattedMessage id="customRole" />,
//   <FormattedMessage id="verifiedUsers" />,
//   <FormattedMessage id="activeUsers" />,
//   <FormattedMessage id="deactivateUsers" />
// ]
// export const USER_CUSTOM_FILTER = ['custom Role', 'active Users', 'deactivate Users']
export const USER_CUSTOM_FILTER = []

export const FRONT_USER_FILTER = [
  { label: <FormattedMessage id="activateUsers" />, value: 'a' },
  { label: <FormattedMessage id="deActiveUsers" />, value: 'i' }
]

export const REJECT_REASON = [
  { label: 'One', value: 'one' },
  { label: 'Two', value: 'two' },
  { label: 'Custom', value: 'custom' }
]

export const SEO_REDIRECTS_TYPE_BY_CODE = [
  { label: <FormattedMessage id="movedPermanently" />, value: 301 },
  // { label: <FormattedMessage id="found" />, value: 302 },
  { label: <FormattedMessage id="temporaryRedirect" />, value: 302 },
  { label: <FormattedMessage id="contentDeleted" />, value: 404 },
  { label: <FormattedMessage id="unAvailableForLegalReasons" />, value: 451 }
]
export const POPUP_TYPE = [
  { label: 'Event', value: 'e' },
  { label: 'General', value: 'g' },
  { label: 'Content Recommendations', value: 'cr' },
  { label: 'Downloadable', value: 'dc' },
  { label: 'Survey', value: 's' },
  { label: 'Exit Intent', value: 'ei' }
]

export const CAREER_LOCATION = [
  { label: 'Remote', value: 'rm' },
  { label: 'New York', value: 'ny' },
  { label: 'London', value: 'ln' },
  { label: 'San Francisco', value: 'sf' }
]

export const CAREER_LOCATION_LABEL = {
  rm: 'Remote',
  ny: 'New York',
  ln: 'London',
  sf: 'San Francisco'
}

export const CAREER_STATUS = [
  { label: 'Active', value: 'a' },
  { label: 'Inactive', value: 'i' }
]
