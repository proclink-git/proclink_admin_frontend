import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { Col, Form, Row } from 'react-bootstrap'
import { useLazyQuery } from '@apollo/client'
import { FormattedMessage } from 'react-intl'
import { useParams } from 'react-router'
import CountInput from 'shared/components/count-input'
import AddPageComponents from 'shared/components/add-page-components'
import AddPageComponentsList from 'shared/components/add-page-components/list'
import CommonSEO from 'shared/components/common-seo'
import TinyEditor from 'shared/components/editor'
import Permalink from 'shared/components/article-add-edit-components/permalink'
import Publish from 'shared/components/article-add-edit-components/publish'
import FeaturedImage from 'shared/components/article-add-edit-components/featured-image'
import EditorNotes from 'shared/components/article-add-edit-components/editor-notes'
import ArticleTags from 'shared/components/article-add-edit-components/article-tags'
import CaseStudyFields from 'shared/components/article-add-edit-components/case-study-fields'
import TagYourContent from 'shared/components/article-add-edit-components/tag-your-content'
import { GET_ARTICLE_DETAIL } from 'graph-ql/article/query'
import { removeTypeName, getCurrentUser, removeTypenameKey, dateCheck, isVideoGalleryMedia, isVideoMedia, normalizeDurationLabel } from 'shared/utils'
import { HEADER_CATEGORY_SLUG, ONLY_NUMBER, PODCAST_PLATFORM_TYPE, YOUTUBE_URL_REG_EX } from 'shared/constants'
import { validationErrors } from 'shared/constants/ValidationErrors'
import WebinarFields, { WebinarTypeSelector } from 'shared/components/article-add-edit-components/webinar'
import PodcastFields, { getPodcastPlatformType } from 'shared/components/article-add-edit-components/podcast-fields'
import PermissionProvider from 'shared/components/permission-provider'
import { FormUnsavedChangesPrompt, useMarkFormClean } from 'shared/components/unsaved-changes'
// import ArticleSocialLinksSection from 'shared/components/page-components/dynamic/article-static/social-links-section'
import {
  getPageComponentDataKey,
  getPageComponentDefaultValue,
  getPageComponentStorageKey,
  mergeDefaultFormValue,
  normalizePageComponentForForm
} from 'shared/components/page-components/registry'
import {
  getDefaultCta,
  getDefaultFaqItem,
  getDefaultImage,
  getDefaultLeadershipCard,
  getDefaultLogo,
  getDefaultMarqueeLogo,
  getDefaultMetricCard,
  getDefaultRelevantServiceCard
} from 'shared/components/page-components/dynamic/service-detail-static/utils'
import {
  DLF_FORM_TYPE,
  getDefaultDlfValue,
  inferWebinarFormType,
  isUpcomingWebinar
} from 'shared/components/page-components/dynamic/article-static/download-lead-form.utils'

const ARTICLE_COMPONENT_TITLES = {
  faq: 'FAQ',
  rsc: 'Relevant Services Carousel',
  cb: 'Career Banner',
  su: 'Subscribe Section',
  lsc: 'Leadership Showcase',
  epo: 'Exclusive Podcast Platforms',
  bpo: 'Browse Podcast Articles',
  bcs: 'Browse Case Study Articles',
  bcu: 'Browse Company Update Articles',
  brr: 'Browse Research Report Articles',
  bvl: 'Browse Video Listing Articles',
  bwe: 'Browse Webinar Articles',
  bwp: 'Browse White Paper Articles',
  pem: 'Platform Ecosystem Metrics',
  dlf: 'Download Lead Form'
}
const ARTICLE_COMPONENT_PAGE_TYPE = 'is'
const ARTICLE_STATIC_SECTION_TYPES = new Set(['b', 'w', 'p', 'wp', 'rr', 'vl', 'cs', 'cu', 'ne'])
const ARTICLE_DESCRIPTION_ENABLED_TYPES = new Set(['cs', 'rr', 'wp'])
const ARTICLE_TOP_HIGHLIGHTS_ENABLED_TYPES = new Set(['cs', 'rr', 'w', 'wp'])
const ARTICLE_FEATURED_VIDEO_ENABLED_TYPES = new Set(['p', 'w', 'vl'])
const ARTICLE_EDIT_PERMISSIONS = [
  'EDIT_BLOG',
  'EDIT_WEBINAR',
  'EDIT_PODCAST',
  'EDIT_WHITEPAPER',
  'EDIT_RESEARCH_REPORT',
  'EDIT_VIDEO_LISTING',
  'EDIT_CASE_STUDY',
  'EDIT_NEWS_EVENTS'
]
const ARTICLE_CREATE_PERMISSIONS = [
  'CREATE_BLOG',
  'CREATE_WEBINAR',
  'CREATE_PODCAST',
  'CREATE_WHITEPAPER',
  'CREATE_RESEARCH_REPORT',
  'CREATE_VIDEO_LISTING',
  'CREATE_CASE_STUDY',
  'CREATE_NEWS_EVENTS'
]
const ARTICLE_FORM_PERMISSIONS = [...new Set([...ARTICLE_EDIT_PERMISSIONS, ...ARTICLE_CREATE_PERMISSIONS])]

function stripRepeatedPrefix(value = '', prefix = '') {
  let nextValue = String(value || '').trim().replace(/^\/+/, '')
  const normalizedPrefix = String(prefix || '')

  if (!normalizedPrefix) return nextValue

  while (nextValue.startsWith(normalizedPrefix)) {
    nextValue = nextValue.slice(normalizedPrefix.length)
  }

  return nextValue.replace(/^\/+/, '')
}

function prefixArticleSlug(value = '', prefix = '') {
  const slugValue = stripRepeatedPrefix(value, prefix)
  return slugValue ? `${prefix}${slugValue}` : ''
}

function normalizeImage(value = {}) {
  return {
    ...getDefaultImage(),
    ...(removeTypenameKey(value) || {})
  }
}

function normalizeArray(items, fallbackFactory, normalizeItem = (item) => item) {
  const nextItems = (Array.isArray(items) ? items : []).map((item) => normalizeItem(removeTypenameKey(item)))
  return nextItems.length ? nextItems : [fallbackFactory()]
}

function normalizeFixedArray(items, count, fallbackFactory, normalizeItem = (item) => item) {
  const nextItems = (Array.isArray(items) ? items : [])
    .slice(0, count)
    .map((item) => normalizeItem(removeTypenameKey(item)))

  while (nextItems.length < count) {
    nextItems.push(fallbackFactory())
  }

  return nextItems
}

function normalizeCta(value = {}) {
  return {
    sLabel: value?.sLabel || '',
    sUrl: value?.sUrl || ''
  }
}

function normalizeListingCopy(value = {}) {
  return {
    sListingTitle: value?.sListingTitle || '',
    sListingDescription: value?.sListingDescription || ''
  }
}

function normalizeLogo(value = {}) {
  return {
    oImg: normalizeImage(value?.oImg),
    sRedirectUrl: value?.sRedirectUrl || ''
  }
}

function normalizeLeadershipCard(value = {}) {
  return {
    oImg: normalizeImage(value?.oImg),
    oPopupImg: normalizeImage(value?.oPopupImg),
    sName: value?.sName || '',
    sRole: value?.sRole || '',
    sRedirectUrl: value?.sRedirectUrl || '',
    eTarget: value?.eTarget || '_self'
  }
}

function normalizeLeadershipCardForSubmit(value = {}) {
  const nextCard = normalizeLeadershipCard(value)
  return {
    ...nextCard,
    oPopupImg: nextCard?.oPopupImg?.sUrl ? nextCard.oPopupImg : null
  }
}

function normalizeTopHighlight(value = {}) {
  return {
    sLabel: value?.sLabel || '',
    sValue: value?.sValue || ''
  }
}

function normalizeMetricCard(value = {}) {
  return {
    sLabel: value?.sLabel || '',
    sValue: value?.sValue || ''
  }
}

function normalizeMarqueeLogo(value = {}) {
  return {
    oImg: normalizeImage(value?.oImg)
  }
}

function normalizeArticleComponent(component = {}) {
  const eType = component?.eType || component?.iId?.eType || ''
  const sComponentTitle = component?.iId?.sComponentTitle || component?.sComponentTitle || ARTICLE_COMPONENT_TITLES[eType] || eType
  const normalizedComponent = normalizePageComponentForForm({
    ...component,
    eType,
    sComponentTitle
  })

  let iId = normalizedComponent?.iId

  if (normalizedComponent?.iId && typeof normalizedComponent.iId === 'object') {
    iId = { ...normalizedComponent.iId, sComponentTitle }
  }

  return {
    ...normalizedComponent,
    iId,
    eType,
    sComponentTitle
  }
}

function normalizeArticleSocialLink(value = {}) {
  return {
    eType: value?.eType || value?.eSocialNetworkType || '',
    sUrl: value?.sUrl || value?.sLink || ''
  }
}

function normalizeArticleImage(value = {}) {
  return {
    ...normalizeImage(value?.oImg),
    sUrl: value?.sMediaUrl || value?.oImg?.sUrl || ''
  }
}

function normalizeTextArray(items = []) {
  return (Array.isArray(items) ? items : []).map((item) => String(item || ''))
}

function getArticleComponents(data = {}) {
  const components = data?.oComponents

  if (!components) return {}

  if (typeof components === 'string') {
    try {
      const parsedComponents = JSON.parse(components)
      if (parsedComponents && typeof parsedComponents === 'object' && !Array.isArray(parsedComponents)) {
        return removeTypenameKey(parsedComponents) || {}
      }
      return {}
    } catch {
      return {}
    }
  }

  const normalizedComponents = removeTypenameKey(components)
  return normalizedComponents && typeof normalizedComponents === 'object' && !Array.isArray(normalizedComponents) ? normalizedComponents : {}
}

function getArticleComponentValue(data = {}, componentData = {}, componentOrKey = '') {
  const isKeyLookup = typeof componentOrKey === 'string'
  const dataKey = isKeyLookup ? componentOrKey : getPageComponentDataKey(componentOrKey)
  const storageKey = isKeyLookup ? componentOrKey : getPageComponentStorageKey(componentOrKey)
  const candidateKeys = [storageKey, dataKey].filter((key, index, keys) => key && keys.indexOf(key) === index)

  for (const key of candidateKeys) {
    if (componentData?.[key] !== undefined) return componentData[key]
    if (data?.oComponents?.[key] !== undefined) return data.oComponents[key]
    if (data?.[key] !== undefined) return data[key]
  }

  return undefined
}

function getFirstArticleComponentValue(data = {}, componentData = {}, components = [], dataKey = '') {
  const component = components.find((item) => getPageComponentDataKey(item) === dataKey)

  return component ? getArticleComponentValue(data, componentData, component) : getArticleComponentValue(data, componentData, dataKey)
}

function normalizeArticleComponentValues(data = {}, componentData = {}, components = []) {
  return components.reduce((values, component) => {
    const dataKey = getPageComponentDataKey(component)
    const storageKey = getPageComponentStorageKey(component)
    if (!dataKey || !storageKey) return values

    const componentValue = getArticleComponentValue(data, componentData, component)
    values[storageKey] = mergeDefaultFormValue(removeTypenameKey(componentValue), getPageComponentDefaultValue(component))

    return values
  }, {})
}

function getWebinarFormType(oDLF = {}, oWebInar = {}, sThumbnailUrl = '', categoryType = '') {
  if (categoryType !== 'w') return oDLF?.eFormType || categoryType || ''

  return inferWebinarFormType(oDLF, oWebInar, sThumbnailUrl)
}

function getFeaturedVideoSource(data = {}, videoDataKey = 'oPodcast') {
  const videoUrl = String(data?.[videoDataKey]?.sLink || '').trim()
  const mediaUrl = String(data?.sMediaUrl || data?.oImg?.sUrl || '').trim()
  const hasGalleryVideo = (data?.eMediaType === 'v' || isVideoGalleryMedia(mediaUrl)) && !!mediaUrl
  const isYoutubeVideo = YOUTUBE_URL_REG_EX.test(videoUrl)

  if (videoUrl && isVideoMedia(videoUrl) && !isYoutubeVideo) return 'gallery'
  if (hasGalleryVideo && !isYoutubeVideo) return 'gallery'

  return 'url'
}

function getFeaturedVideoDataKey(categoryType = '') {
  if (categoryType === 'w') return 'oWebInar'
  return categoryType === 'vl' ? 'oVideo' : 'oPodcast'
}

function getArticleFeaturedMediaUrl(data = {}, categoryType = '') {
  const mediaUrl = String(data?.sMediaUrl || data?.oImg?.sUrl || '').trim()
  const videoUrl = String(data?.[getFeaturedVideoDataKey(categoryType)]?.sLink || '').trim()

  if (ARTICLE_FEATURED_VIDEO_ENABLED_TYPES.has(categoryType) && YOUTUBE_URL_REG_EX.test(videoUrl)) return ''
  if (mediaUrl) return mediaUrl
  if (ARTICLE_FEATURED_VIDEO_ENABLED_TYPES.has(categoryType) && isVideoGalleryMedia(videoUrl)) return videoUrl

  return ''
}

function normalizeArticleFeaturedImage(data = {}, categoryType = '') {
  return {
    ...normalizeArticleImage(data),
    sUrl: getArticleFeaturedMediaUrl(data, categoryType)
  }
}

function AddEditArticle({ userPermission }) {
  const { id, categoryType } = useParams()
  const [sTitle, setTitle] = useState()
  const catURL = HEADER_CATEGORY_SLUG[categoryType]
  const [articleData, setArticleData] = useState(null)
  const currentUser = getCurrentUser()
  const falsySlug = useRef()
  const isPostSaveRefreshRef = useRef(false)
  const [isDisable, setIsDisabled] = useState(!!id)
  const [featuredVideoSource, setFeaturedVideoSource] = useState(categoryType === 'vl' ? 'gallery' : 'url')
  const showArticleStaticSections = ARTICLE_STATIC_SECTION_TYPES.has(categoryType)
  const markFormClean = useMarkFormClean()

  const publishPermission = {
    b: 'UPDATE_BLOG_STATUS',
    w: 'UPDATE_WEBINAR_STATUS',
    p: 'UPDATE_PODCAST_STATUS',
    wp: 'UPDATE_WHITEPAPER_STATUS',
    rr: userPermission?.includes('UPDATE_RESEARCH_REPORT_STATUS') ? 'UPDATE_RESEARCH_REPORT_STATUS' : 'UPDATE_WHITEPAPER_STATUS',
    vl: userPermission?.includes('UPDATE_VIDEO_LISTING_STATUS') ? 'UPDATE_VIDEO_LISTING_STATUS' : 'UPDATE_WEBINAR_STATUS',
    cs: 'UPDATE_CASE_STUDY_STATUS',
    cu: 'UPDATE_NEWS_EVENTS_STATUS',
    ne: 'UPDATE_NEWS_EVENTS_STATUS'
  }

  const [getArticle, { loading }] = useLazyQuery(GET_ARTICLE_DETAIL, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.getArticle) {
        const normalizedArticle = normalizeArticleData(getCategorySlog(data?.getArticle))
        setArticleData(normalizedArticle)
        if (ARTICLE_FEATURED_VIDEO_ENABLED_TYPES.has(categoryType)) {
          const loadedWebinarFormType = getWebinarFormType(
            normalizedArticle?.oDLF,
            normalizedArticle?.oWebInar,
            normalizedArticle?.sThumbnailUrl,
            categoryType
          )

          if (categoryType !== 'w' || isUpcomingWebinar(loadedWebinarFormType)) {
            setFeaturedVideoSource(getFeaturedVideoSource(normalizedArticle, getFeaturedVideoDataKey(categoryType)))
          } else {
            setFeaturedVideoSource('url')
          }
        }
        if (isPostSaveRefreshRef.current) {
          isPostSaveRefreshRef.current = false
          setIsDisabled(getEditPermission(normalizedArticle))
          return
        }
        setArticleValue(normalizedArticle)
        setIsDisabled(getEditPermission(normalizedArticle))
      }
    }
  })

  const methods = useForm({ mode: 'all' })

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    unregister,
    getValues,
    control,
    reset,
    formState: { errors }
  } = methods

  const webinarFormType =
    useWatch({ control, name: 'oDLF.eFormType' }) ||
    (categoryType === 'w' ? DLF_FORM_TYPE.WEBINAR_REGISTER : '')
  const showWebinarFeaturedVideo = categoryType !== 'w' || isUpcomingWebinar(webinarFormType)

  useEffect(() => {
    if (categoryType !== 'w' || id) return

    const currentDlf = getValues('oDLF')

    if (!currentDlf || typeof currentDlf !== 'object') {
      setValue('oDLF', { ...getDefaultDlfValue(), eFormType: DLF_FORM_TYPE.WEBINAR_REGISTER }, { shouldDirty: false, shouldValidate: false })
      return
    }

    if (!currentDlf.eFormType) {
      setValue('oDLF.eFormType', DLF_FORM_TYPE.WEBINAR_REGISTER, { shouldDirty: false, shouldValidate: false })
    }
  }, [categoryType, getValues, id, setValue])

  useEffect(() => {
    if (id) {
      getArticleData(id)
    } else {
      if (ARTICLE_FEATURED_VIDEO_ENABLED_TYPES.has(categoryType)) setFeaturedVideoSource(categoryType === 'vl' ? 'gallery' : 'url')
      // reset({
      //   iAuthorDId: { ...currentUser, sFName: <FormattedMessage id="you" /> }
      // })
    }
  }, [id, categoryType])

  function getCategorySlog(data) {
    const seoData = data?.oSeo || {}

    return {
      ...data,
      slug: prefixArticleSlug(seoData?.sSlug, catURL),
      oSeo: {
        ...seoData,
        sSlug: stripRepeatedPrefix(seoData?.sSlug, catURL),
        sCUrl: stripRepeatedPrefix(seoData?.sCUrl, catURL)
      }
    }
  }

  function normalizeArticleData(data = {}) {
    const componentData = getArticleComponents(data)
    const selectedComponents = (Array.isArray(data?.aComponents) ? data.aComponents : []).map(normalizeArticleComponent)
    const normalizedComponentValues = normalizeArticleComponentValues(data, componentData, selectedComponents)
    const oFAQ = getFirstArticleComponentValue(data, componentData, selectedComponents, 'oFAQ')
    const oRSC = getFirstArticleComponentValue(data, componentData, selectedComponents, 'oRSC')
    const oCB = getFirstArticleComponentValue(data, componentData, selectedComponents, 'oCB')
    const oSU = getFirstArticleComponentValue(data, componentData, selectedComponents, 'oSU')
    const oLSC = getFirstArticleComponentValue(data, componentData, selectedComponents, 'oLSC')
    const oEPO = getFirstArticleComponentValue(data, componentData, selectedComponents, 'oEPO')
    const oPEM = getFirstArticleComponentValue(data, componentData, selectedComponents, 'oPEM')
    const oDLF = getFirstArticleComponentValue(data, componentData, selectedComponents, 'oDLF')
    const oListingCopy = getFirstArticleComponentValue(data, componentData, selectedComponents, 'oListingCopy')

    return {
      ...data,
      ...componentData,
      oComponents: {
        ...componentData,
        ...normalizedComponentValues
      },
      oImg: normalizeArticleFeaturedImage(data, categoryType),
      aTags: normalizeTextArray(data?.aTags),
      aComponents: selectedComponents,
      oFAQ: {
        sTitle: oFAQ?.sTitle || '',
        sDescription: oFAQ?.sDescription || '',
        aFaq: normalizeArray(oFAQ?.aFaq, getDefaultFaqItem, (item = {}) => ({
          sQuestion: item?.sQuestion || '',
          sAnswer: item?.sAnswer || ''
        }))
      },
      oRSC: {
        sTitle: oRSC?.sTitle || '',
        sDescription: oRSC?.sDescription || '',
        aCard: normalizeArray(oRSC?.aCard, getDefaultRelevantServiceCard, (card = {}) => ({
          oImg: normalizeImage(card?.oImg),
          sTitle: card?.sTitle || '',
          sRedirectUrl: card?.sRedirectUrl || '',
          eTarget: card?.eTarget || '_self',
          sSlug: card?.sSlug || ''
        }))
      },
      oCB: {
        sTitle: oCB?.sTitle || '',
        sDescription: oCB?.sDescription || '',
        oImg: normalizeImage(oCB?.oImg),
        aCta: normalizeFixedArray(oCB?.aCta, 1, getDefaultCta, normalizeCta)
      },
      oSU: {
        sTitle: oSU?.sTitle || '',
        sDescription: oSU?.sDescription || '',
        sPlaceholder: oSU?.sPlaceholder || '',
        sButtonLabel: oSU?.sButtonLabel || ''
      },
      oLSC: {
        sTitle: oLSC?.sTitle || '',
        sDescription: oLSC?.sDescription || '',
        aCard: normalizeArray(oLSC?.aCard, getDefaultLeadershipCard, normalizeLeadershipCard)
      },
      oEPO: {
        sTitle: oEPO?.sTitle || '',
        aLogo: normalizeArray(oEPO?.aLogo, getDefaultLogo, normalizeLogo)
      },
      oPEM: {
        sTitle: oPEM?.sTitle || '',
        sDescription: oPEM?.sDescription || '',
        aCard: normalizeArray(oPEM?.aCard, getDefaultMetricCard, normalizeMetricCard),
        bIsMarquee: typeof oPEM?.bIsMarquee === 'boolean' ? oPEM.bIsMarquee : true,
        aMarquee: normalizeArray(oPEM?.aMarquee, getDefaultMarqueeLogo, normalizeMarqueeLogo)
      },
      oDLF: {
        eType: 'dlf',
        sTitle: oDLF?.sTitle || '',
        sDescription: oDLF?.sDescription || '',
        eFormType: getWebinarFormType(oDLF, data?.oWebInar, data?.sThumbnailUrl, categoryType),
        oCta: normalizeCta(oDLF?.oCta),
        sFooterNote: oDLF?.sFooterNote || '',
        sThumbnailUrl: oDLF?.sThumbnailUrl || '',
        sMediaUrl: oDLF?.sMediaUrl || '',
        eMediaType: oDLF?.eMediaType || '',
        sLink: oDLF?.sLink || ''
      },
      oListingCopy: normalizeListingCopy(oListingCopy),
      oCaseStudy: {
        sLink: data?.oCaseStudy?.sLink || ''
      },
      oWebInar: {
        ...(removeTypenameKey(data?.oWebInar) || {}),
        sLink: data?.oWebInar?.sLink || '',
        sDurationLabel: normalizeDurationLabel(data?.oWebInar?.sDurationLabel)
      },
      oVideo: {
        sLink: data?.oVideo?.sLink || '',
        sDurationLabel: normalizeDurationLabel(data?.oVideo?.sDurationLabel)
      },
      aTopHighlights: (Array.isArray(data?.aTopHighlights) ? data.aTopHighlights : []).map((item) => normalizeTopHighlight(removeTypenameKey(item))),
      aSocialLinks: (Array.isArray(data?.aSocialLinks) ? data.aSocialLinks : []).map(normalizeArticleSocialLink)
    }
  }

  function getArticleData(id) {
    getArticle({ variables: { input: { _id: id, eHeaderCategoryType: categoryType } } })
  }

  function setArticleValue(data) {
    const oPodcast = removeTypenameKey(data?.oPodcast || {})
    const oWebInar = removeTypenameKey(data?.oWebInar || {})
    const oVideo = removeTypenameKey(data?.oVideo || {})
    let normalizedVideo = oVideo

    if (categoryType === 'vl') {
      normalizedVideo = {
        sLink: oVideo?.sLink || '',
        sDurationLabel: normalizeDurationLabel(oVideo?.sDurationLabel)
      }
    }

    const featuredMediaUrl = getArticleFeaturedMediaUrl(data, categoryType)
    const componentData = getArticleComponents(data)
    const selectedComponents = (Array.isArray(data?.aComponents) ? data.aComponents : []).map(normalizeArticleComponent)
    const normalizedComponentValues = normalizeArticleComponentValues(data, componentData, selectedComponents)
    let assignedUser = null

    if (data?.oAssignedTo?._id) {
      assignedUser = {
        _id: data.oAssignedTo?._id,
        sFName: data?.oAssignedTo?.sFName || '',
        sUrl: data?.oAssignedTo?.sUrl || ''
      }
    }

    if (data?.oPodcast?.aPlatform?.length && categoryType === 'p') {
      oPodcast.aPlatform = data?.oPodcast?.aPlatform?.map((e) => ({
        ePlatform: PODCAST_PLATFORM_TYPE.find((p) => p.value === e.ePlatform),
        sLink: e.sLink
      }))
    } else if (categoryType === 'p') {
      oPodcast.aPlatform = [getPodcastPlatformType()]
    }

    if (categoryType === 'p') {
      oPodcast.sDurationLabel = normalizeDurationLabel(oPodcast?.sDurationLabel)
    }
    reset({
      ...componentData,
      oComponents: {
        ...componentData,
        ...normalizedComponentValues
      },
      sTitle: data.sTitle,
      sSubtitle: data.sSubtitle,
      sSrtTitle: data.sSrtTitle,
      sContent: data.sContent,
      sInsContent: data?.sInsContent || '',
      sDescription: data?.sDescription || data?.oSeo?.sDescription || '',
      sMediaUrl: featuredMediaUrl,
      eMediaType: data?.eMediaType || (featuredMediaUrl ? (isVideoGalleryMedia(featuredMediaUrl) ? 'v' : 'i') : ''),
      sThumbnailUrl: data?.sThumbnailUrl || '',
      nDuration: data?.nDuration ?? '',
      eState: data.eState,
      aTags: data.aTags,
      // aSecCategories: data.aSeries?.filter((series) => series?.eType !== 'as'),
      iCategoryId: data.oCategory,
      iHeaderCategoryId: data?.oHeaderCategory,
      dPublishDisplayDate: dateCheck(data.dPublishDisplayDate) || dateCheck(data.dPublishDate),
      sEditorNotes: data.sEditorNotes,
      oImg: normalizeArticleFeaturedImage(data, categoryType),
      frontSlug: data?.oSeo?.sSlug || '',
      iAuthorDId: {
        _id: data.iAuthorDId || currentUser?._id,
        sFName: currentUser?._id === data.iAuthorDId ? 'You' : data?.oDisplayAuthor?.sFName,
        sUrl: data?.oDisplayAuthor?.sUrl
      },
      iAssignedTo: assignedUser,
      bPriority: data.bPriority,
      oPodcast: categoryType === 'p' ? oPodcast : removeTypenameKey(data?.oPodcast),
      oWebInar: {
        ...oWebInar,
        sLink: oWebInar?.sLink || '',
        sDurationLabel: normalizeDurationLabel(oWebInar?.sDurationLabel)
      },
      oWhitePaper: {
        sLink: data?.oWhitePaper?.sLink || ''
      },
      aComponents: selectedComponents,
      oFAQ: {
        sTitle: data?.oFAQ?.sTitle || '',
        sDescription: data?.oFAQ?.sDescription || '',
        aFaq: normalizeArray(data?.oFAQ?.aFaq, getDefaultFaqItem, (item = {}) => ({
          sQuestion: item?.sQuestion || '',
          sAnswer: item?.sAnswer || ''
        }))
      },
      oRSC: {
        sTitle: data?.oRSC?.sTitle || '',
        sDescription: data?.oRSC?.sDescription || '',
        aCard: normalizeArray(data?.oRSC?.aCard, getDefaultRelevantServiceCard, (card = {}) => ({
          oImg: normalizeImage(card?.oImg),
          sTitle: card?.sTitle || '',
          sRedirectUrl: card?.sRedirectUrl || '',
          eTarget: card?.eTarget || '_self',
          sSlug: card?.sSlug || ''
        }))
      },
      oCB: {
        sTitle: data?.oCB?.sTitle || '',
        sDescription: data?.oCB?.sDescription || '',
        oImg: normalizeImage(data?.oCB?.oImg),
        aCta: normalizeFixedArray(data?.oCB?.aCta, 1, getDefaultCta, normalizeCta)
      },
      oSU: {
        sTitle: data?.oSU?.sTitle || '',
        sDescription: data?.oSU?.sDescription || '',
        sPlaceholder: data?.oSU?.sPlaceholder || '',
        sButtonLabel: data?.oSU?.sButtonLabel || ''
      },
      oLSC: {
        sTitle: data?.oLSC?.sTitle || '',
        sDescription: data?.oLSC?.sDescription || '',
        aCard: normalizeArray(data?.oLSC?.aCard, getDefaultLeadershipCard, normalizeLeadershipCardForSubmit)
      },
      oEPO: {
        sTitle: data?.oEPO?.sTitle || '',
        aLogo: normalizeArray(data?.oEPO?.aLogo, getDefaultLogo, normalizeLogo)
      },
      oPEM: {
        sTitle: data?.oPEM?.sTitle || '',
        sDescription: data?.oPEM?.sDescription || '',
        aCard: normalizeArray(data?.oPEM?.aCard, getDefaultMetricCard, normalizeMetricCard),
        bIsMarquee: typeof data?.oPEM?.bIsMarquee === 'boolean' ? data.oPEM.bIsMarquee : true,
        aMarquee: normalizeArray(data?.oPEM?.aMarquee, getDefaultMarqueeLogo, normalizeMarqueeLogo)
      },
      oDLF: {
        eType: 'dlf',
        sTitle: data?.oDLF?.sTitle || '',
        sDescription: data?.oDLF?.sDescription || '',
        eFormType: getWebinarFormType(data?.oDLF, data?.oWebInar, data?.sThumbnailUrl, categoryType),
        oCta: normalizeCta(data?.oDLF?.oCta),
        sFooterNote: data?.oDLF?.sFooterNote || '',
        sThumbnailUrl: data?.oDLF?.sThumbnailUrl || '',
        sMediaUrl: data?.oDLF?.sMediaUrl || '',
        eMediaType: data?.oDLF?.eMediaType || '',
        sLink: data?.oDLF?.sLink || ''
      },
      oListingCopy: normalizeListingCopy(data?.oListingCopy),
      oCaseStudy: {
        sLink: data?.oCaseStudy?.sLink || ''
      },
      oVideo: normalizedVideo,
      aTopHighlights: (Array.isArray(data?.aTopHighlights) ? data.aTopHighlights : []).map((item) => normalizeTopHighlight(removeTypenameKey(item))),
      aSocialLinks: (Array.isArray(data?.aSocialLinks) ? data.aSocialLinks : []).map(normalizeArticleSocialLink),
      oSeo: {
        sTitle: data?.oSeo?.sTitle || '',
        sSlug: data?.oSeo?.sSlug || '',
        sDescription: data?.oSeo?.sDescription || '',
        aKeywords: data?.oSeo?.aKeywords ? data.oSeo.aKeywords.join(', ') : '',
        sCUrl: data?.oSeo?.sCUrl || '',
        sRobots: data?.oSeo?.sRobots || '',
        oFB: removeTypeName(data?.oSeo?.oFB || {}),
        oTwitter: removeTypeName(data?.oSeo?.oTwitter || {})
      }
    })
    markFormClean(reset, getValues)
  }

  function handlePostSaveRefresh() {
    isPostSaveRefreshRef.current = true
  }

  function handleDeleteImg(key) {
    if (!id || !articleData) return

    if (key === 'oImg') {
      setArticleData({
        ...articleData,
        sMediaUrl: '',
        oImg: { ...articleData?.oImg, sUrl: '' }
      })
      return
    }

    setArticleData({ ...articleData, [key]: { ...articleData[key], sUrl: '' } })
  }

  // function setCategoryUrl(e) {
  //   if (!articleData?.bOld && articleData?.eState !== 'pub') {
  //     setCatUrl(e)
  //   }
  // }

  function getEditPermission(data) {
    // if (data.eState === 'p' && data.iReviewerId === currentUser._id) return false
    // if ((data.eState === 'p' || data.eState === 'd' || data.eState === 'pub') && !data.iReviewerId && data.iAuthorId === currentUser._id) {
    //   return false
    // }
    // if (data.eState === 'cr' || (data.eState === 'd' && data.iAuthorId === currentUser._id)) return false
    // if (data.eState === 'cs' && data.iReviewerId === currentUser._id) return false
    // if (data.eState === 'pub' && data?.iReviewerId === currentUser?._id) return false
    if (data.eState === 'd' && data.iAuthorId === currentUser._id) return false
    if (data.eState === 'p' && data.iAuthorId === currentUser._id && !data?.iReviewerId) return false
    if (data.eState === 'p' && data?.iReviewerId === currentUser._id) return false
    if ((data.eState === 'pub' || data.eState === 'cs') && userPermission?.includes(publishPermission?.[categoryType])) return false
    return true
  }

  function handleTitleChange({ target: { value } }) {
    falsySlug.current = value
    !errors.sTitle && articleData?.eState !== 'pub' && setTitle(value)
    !getValues()?.oSeo?.sTitle && setValue('oSeo.sTitle', value)
  }

  function handleUpdateData(data) {
    setArticleData(data)
  }

  function resetFeaturedVideo() {
    const videoDataKey = getFeaturedVideoDataKey(categoryType)

    setValue('oImg.sUrl', '')
    setValue('oImg.sText', '')
    setValue('oImg.sCaption', '')
    setValue('oImg.sAttribute', '')
    setValue('sMediaUrl', '')
    setValue('sThumbnailUrl', '')
    setValue('eMediaType', '')
    setValue(`${videoDataKey}.sDurationLabel`, '')
    clearErrors('oImg.sUrl')
    clearErrors('sThumbnailUrl')
    clearErrors(`${videoDataKey}.sDurationLabel`)
  }

  function getDownloadLeadFormBasePaths() {
    const basePaths = new Set(['oDLF'])
    const selectedComponents = Array.isArray(getValues('aComponents')) ? getValues('aComponents') : []

    selectedComponents.forEach((component) => {
      if (getPageComponentDataKey(component) !== 'oDLF') return

      const storageKey = getPageComponentStorageKey(component)
      if (storageKey) basePaths.add(`oComponents.${storageKey}`)
    })

    return [...basePaths]
  }

  function getDownloadLeadFormFieldPaths(fields = []) {
    return getDownloadLeadFormBasePaths().flatMap((basePath) => fields.map((field) => `${basePath}.${field}`))
  }

  function setDownloadLeadFormFieldValue(field, value, options = { shouldDirty: true, shouldValidate: true }) {
    getDownloadLeadFormBasePaths().forEach((basePath) => {
      setValue(`${basePath}.${field}`, value, options)
    })
  }

  function clearDownloadLeadFormRecordingMedia(options = { shouldDirty: true, shouldValidate: true }) {
    setDownloadLeadFormFieldValue('sThumbnailUrl', '', options)
    setDownloadLeadFormFieldValue('sMediaUrl', '', options)
    setDownloadLeadFormFieldValue('eMediaType', '', { ...options, shouldValidate: false })
    setDownloadLeadFormFieldValue('sLink', '', options)
    setDownloadLeadFormFieldValue('videoSource', '', options)
    clearErrors(getDownloadLeadFormFieldPaths(['sThumbnailUrl', 'videoSource', 'sMediaUrl', 'sLink']))
  }

  function handleWebinarTypeChange(event) {
    const nextType = event.target.value

    setDownloadLeadFormFieldValue('eFormType', nextType, { shouldDirty: true, shouldValidate: true })

    if (nextType === DLF_FORM_TYPE.WEBINAR_RECORDING) {
      setValue('oWebInar.sLink', '')
      setValue('oWebInar.sDurationLabel', '')
      setFeaturedVideoSource('url')
      resetFeaturedVideo()
      clearErrors(['oWebInar.sLink', 'sThumbnailUrl', 'oWebInar.sDurationLabel', 'oImg.sUrl'])
      return
    }

    clearDownloadLeadFormRecordingMedia()
  }

  function handleFeaturedVideoSourceChange(nextSource) {
    const videoDataKey = getFeaturedVideoDataKey(categoryType)
    const videoLinkName = `${videoDataKey}.sLink`
    const durationLabelName = `${videoDataKey}.sDurationLabel`

    setFeaturedVideoSource(nextSource)

    if (nextSource === 'gallery') {
      setValue(videoLinkName, '')
      setValue('eMediaType', 'v')
      clearErrors(videoLinkName)
      return
    }

    const currentVideoUrl = String(getValues(videoLinkName) || '').trim()

    if (!YOUTUBE_URL_REG_EX.test(currentVideoUrl) || isVideoMedia(currentVideoUrl)) {
      setValue(videoLinkName, '')
    }

    setValue(durationLabelName, '')
    clearErrors(durationLabelName)
    resetFeaturedVideo()
  }

  return (
    <FormProvider {...methods}>
      <FormUnsavedChangesPrompt disabled={isDisable} />
      <Form className={`add-article ${showArticleStaticSections ? 'page-component-editor-form page-component-editor-form--has-sticky-picker' : ''}`}>
        <input type="hidden" {...register('sInsContent')} />
        {!ARTICLE_DESCRIPTION_ENABLED_TYPES.has(categoryType) && <input type="hidden" {...register('sDescription')} />}
        <input type="hidden" {...register('sMediaUrl')} />
        <input type="hidden" {...register('eMediaType')} />
        <input type="hidden" {...register('sThumbnailUrl')} />
        {showArticleStaticSections && (
          <PermissionProvider isAllowedTo={ARTICLE_FORM_PERMISSIONS} isArray>
            <AddPageComponents
              control={control}
              name="aComponents"
              error={errors?.aComponents}
              ePageComponentType={ARTICLE_COMPONENT_PAGE_TYPE}
              disabled={isDisable}
              includeAllWithoutPermission
              variant="sticky"
            />
          </PermissionProvider>
        )}
        <Row>
          <Col md="8">
            <CountInput
              label="H1*"
              name="sTitle"
              error={errors}
              register={register('sTitle', { required: validationErrors.required })}
              disabled={isDisable}
              onBlur={handleTitleChange}
            />
            {categoryType === 'b' && (
              <Form.Group className="form-group">
                <Form.Label>Read Duration (In minutes)</Form.Label>
                <Form.Control
                  type="text"
                  name="nDuration"
                  className={errors?.nDuration && 'error'}
                  autoComplete="off"
                  disabled={isDisable}
                  {...register('nDuration', {
                    pattern: { value: ONLY_NUMBER, message: validationErrors.number }
                  })}
                />
                {errors?.nDuration && <Form.Control.Feedback type="invalid">{errors.nDuration.message}</Form.Control.Feedback>}
              </Form.Group>
            )}
            {ARTICLE_DESCRIPTION_ENABLED_TYPES.has(categoryType) && (
              <CountInput
                placeholder="Short Description"
                type="textarea"
                textarea
                rows={4}
                register={register('sDescription')}
                error={errors}
                className={errors?.sDescription && 'error'}
                name="sDescription"
                label="Description"
                disabled={isDisable}
              />
            )}
            {categoryType === 'w' && (
              <PermissionProvider isAllowedTo={ARTICLE_FORM_PERMISSIONS} isArray>
                <WebinarTypeSelector value={webinarFormType} onChange={handleWebinarTypeChange} disabled={isDisable} />
              </PermissionProvider>
            )}
            {ARTICLE_FEATURED_VIDEO_ENABLED_TYPES.has(categoryType) && showWebinarFeaturedVideo && (
              <PermissionProvider isAllowedTo={ARTICLE_FORM_PERMISSIONS} isArray>
                {categoryType === 'w' ? (
                  <WebinarFields disabled={isDisable} videoSource={featuredVideoSource} onVideoSourceChange={handleFeaturedVideoSourceChange} />
                ) : (
                  <PodcastFields
                    disabled={isDisable}
                    videoSource={featuredVideoSource}
                    onVideoSourceChange={handleFeaturedVideoSourceChange}
                    showEpisodeNumber={categoryType === 'p'}
                    fieldNames={categoryType === 'vl' ? { link: 'oVideo.sLink', durationLabel: 'oVideo.sDurationLabel' } : undefined}
                    urlThumbnailLabel={categoryType === 'vl' ? 'Video Thumbnail' : undefined}
                  />
                )}
                {featuredVideoSource === 'gallery' && (
                  <FeaturedImage
                    title="Featured Video"
                    fixedMediaType="v"
                    register={register}
                    control={control}
                    setValue={setValue}
                    articleData={articleData}
                    onDelete={handleDeleteImg}
                    disabled={isDisable}
                    errors={errors}
                    clearErrors={clearErrors}
                    requireMediaSelection
                  />
                )}
              </PermissionProvider>
            )}
            <Permalink
              register={register}
              errors={errors}
              falsySlug={falsySlug.current}
              values={getValues()}
              setValue={setValue}
              setError={setError}
              clearErrors={clearErrors}
              unregister={unregister}
              sTitle={sTitle}
              categoryURL={catURL}
              slugType="nar"
              defaultSlug={articleData?.oSeo?.sSlug}
              disabled={isDisable}
            />
            <PermissionProvider isAllowedTo={ARTICLE_FORM_PERMISSIONS} isArray>
              <Form.Group className="form-group">
                <Form.Label>
                  <FormattedMessage id="content" />
                  {id && '*'}
                </Form.Label>
                <TinyEditor
                  className={'form-control'}
                  name="sContent"
                  control={control}
                  setValue={setValue}
                  values={getValues}
                  initialValue={articleData?.sContent}
                  disabled={isDisable}
                  categoryURL={catURL}
                  toolbarStickyOffset={showArticleStaticSections ? 156 : 65}
                  required={!!id}
                />
                {errors.sContent && <Form.Control.Feedback type="invalid">{errors.sContent.message}</Form.Control.Feedback>}
              </Form.Group>
              {showArticleStaticSections && <AddPageComponentsList name="aComponents" staticComponentGroup="articleDetail" />}
              {/* {showArticleStaticSections && <ArticleSocialLinksSection />} */}
              <CommonSEO
                register={register}
                errors={errors}
                values={getValues()}
                setError={setError}
                clearErrors={clearErrors}
                setValue={setValue}
                control={control}
                fbImg={articleData?.oSeo?.oFB?.sUrl || articleData?.oTImg?.sUrl || articleData?.oImg?.sUrl}
                twitterImg={articleData?.oSeo?.oTwitter?.sUrl || articleData?.oTImg?.sUrl || articleData?.oImg?.sUrl}
                previewURL={articleData?.oTImg?.sUrl || articleData?.oImg?.sUrl}
                // schemaType
                title
                // slugType={'nar'}
                extraSlug={'frontSlug'}
                disabled={isDisable}
                categoryURL={catURL}
                defaultData={articleData}
                onUpdateData={(e) => handleUpdateData(e)}
              />
            </PermissionProvider>
          </Col>
          <Col md="4">
            <div className="sticky-column">
              {/* {articleData?.eState === 'pub' && articleData?.nCommentCount !== 0 && (
                <UserComment type="ar" commentCount={articleData.nCommentCount} />
              )} */}
              <Publish
                register={register}
                handleSubmit={handleSubmit}
                reset={reset}
                onPostSaveSuccess={handlePostSaveRefresh}
                setValue={setValue}
                values={getValues}
                articleData={articleData}
                setArticleData={setArticleData}
                disabled={isDisable}
                getArticle={getArticleData}
                getLoading={loading}
                control={control}
                categoryURL={catURL}
              />
              <PermissionProvider isAllowedTo={ARTICLE_FORM_PERMISSIONS} isArray>
                {!ARTICLE_FEATURED_VIDEO_ENABLED_TYPES.has(categoryType) && (
                  <FeaturedImage
                    register={register}
                    control={control}
                    setValue={setValue}
                    articleData={articleData}
                    onDelete={handleDeleteImg}
                    disabled={isDisable}
                    errors={errors}
                    clearErrors={clearErrors}
                  />
                )}
                <TagYourContent
                  setValue={setValue}
                  control={control}
                  values={getValues()}
                  disabled={isDisable}
                  // addCategoryURL={setCategoryUrl}
                  errors={errors}
                  isCategoryDisabled={!!id}
                />
                <ArticleTags disabled={isDisable} />
                {ARTICLE_TOP_HIGHLIGHTS_ENABLED_TYPES.has(categoryType) && (
                  <CaseStudyFields
                    disabled={isDisable}
                    title={
                      categoryType === 'w' ? 'Webinar Details' : categoryType === 'wp' ? 'White Paper Details' : categoryType === 'rr' ? 'Research Report Details' : undefined
                    }
                    linkName={
                      categoryType === 'wp' ? 'oWhitePaper.sLink' : categoryType === 'cs' ? 'oCaseStudy.sLink' : undefined
                    }
                    linkLabel={categoryType === 'wp' ? 'White Paper Link' : 'Case Study Link'}
                  />
                )}
                <EditorNotes errors={errors} register={register} setValue={setValue} disabled={isDisable} />
              </PermissionProvider>
            </div>
          </Col>
        </Row>
      </Form>
    </FormProvider>
  )
}
AddEditArticle.propTypes = {
  userPermission: PropTypes.array
}
export default AddEditArticle
