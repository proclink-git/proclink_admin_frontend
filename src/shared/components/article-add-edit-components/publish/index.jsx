import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { confirmAlert } from 'react-confirm-alert'
import { useMutation } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'
import { useHistory, useParams } from 'react-router'

import ArticleTab from 'shared/components/article-tab'
import CustomAlert from 'shared/components/alert'
import Loading from 'shared/components/loading'
import ArticleButtons from '../article-buttons'
import { HEADER_CATEGORY_SLUG_ADMIN, TOAST_TYPE, YOUTUBE_URL_REG_EX } from 'shared/constants'
import { CREATE_ARTICLE, EDIT_ARTICLE, PICK_ARTICLE, UPDATE_ARTICLE_STATUS } from 'graph-ql/article/mutation'
import { ToastrContext } from 'shared/components/toastr'
import { allRoutes } from 'shared/constants/AllRoutes'
import ArticleStatus from '../article-status'
import RedirectionPopup from '../redirection-popup'
import useModal from 'shared/hooks/useModal'
import { wrapTable, isVideoMedia, normalizeDurationLabel, removeTypenameKey } from 'shared/utils'
import {
  ensurePageComponentInstanceId,
  getPageComponentDataKey,
  getPageComponentInstanceId,
  getPageComponentStorageKey,
  PAGE_COMPONENT_DATA_KEY_BY_TYPE,
  PAGE_COMPONENT_NAMESPACE_BY_PAGE_TYPE
} from 'shared/components/page-components/registry'
import { useAllowUnsavedChangesNavigation, useMarkFormClean } from 'shared/components/unsaved-changes'
import {
  buildDlfPayload,
  DLF_VIDEO_SOURCE,
  getDlfVideoSource,
  isOnDemandWebinar
} from 'shared/components/page-components/dynamic/article-static/download-lead-form.utils'

const ARTICLE_CASE_STUDY_FIELDS_ENABLED_TYPES = new Set(['cs'])
const ARTICLE_TOP_HIGHLIGHTS_ENABLED_TYPES = new Set(['cs', 'rr', 'w', 'wp'])
const ARTICLE_FEATURED_VIDEO_ENABLED_TYPES = new Set(['p', 'w', 'vl'])
const ARTICLE_LISTING_COPY_COMPONENT_TYPES = new Set(['bba', 'bpo', 'bcs', 'bcu', 'bcy', 'brr', 'bvl', 'bwe', 'bwp'])
const ARTICLE_LISTING_COPY_DATA_KEY = 'oListingCopy'
const ARTICLE_COMPONENT_DATA_KEYS = new Set(Object.values(PAGE_COMPONENT_DATA_KEY_BY_TYPE))
const ARTICLE_PAGE_NAMESPACE_KEYS = [...new Set(Object.values(PAGE_COMPONENT_NAMESPACE_BY_PAGE_TYPE))]
const PAGE_COMPONENT_INSTANCE_STORAGE_KEY = /^[a-f0-9]{24}$/i

function cleanArticleComponent(component = {}) {
  const componentId = component?.iId?._id || component?.iId || component?._id || ''
  const instanceId = getPageComponentInstanceId(component)
  if (!componentId || !component?.eType) return null

  return {
    iId: componentId,
    eType: component.eType,
    ...(instanceId ? { instanceId } : {})
  }
}

function cleanArticleSocialLink(item = {}) {
  return {
    eType: item?.eType || '',
    sUrl: item?.sUrl || ''
  }
}

function cleanArticleCta(item = {}) {
  return {
    sLabel: item?.sLabel || '',
    sUrl: item?.sUrl || ''
  }
}

function cleanListingCopy(value = {}) {
  return {
    sListingTitle: value?.sListingTitle || '',
    sListingDescription: value?.sListingDescription || ''
  }
}

function cleanFaqItems(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item = {}) => ({
      sQuestion: item?.sQuestion || '',
      sAnswer: item?.sAnswer || ''
    }))
    .filter((item) => item?.sQuestion || item?.sAnswer)
}

function cleanRelevantCards(cards = []) {
  return (Array.isArray(cards) ? cards : [])
    .map((card = {}) => ({
      oImg: {
        sText: card?.oImg?.sText || '',
        sCaption: card?.oImg?.sCaption || '',
        sAttribute: card?.oImg?.sAttribute || '',
        sUrl: card?.oImg?.sUrl || ''
      },
      sTitle: card?.sTitle || '',
      sRedirectUrl: card?.sRedirectUrl || '',
      eTarget: card?.eTarget || '_self',
      sSlug: card?.sSlug || ''
    }))
    .filter((card) => card?.sTitle || card?.sRedirectUrl || card?.sSlug || card?.oImg?.sUrl || card?.oImg?.sText)
}

function cleanLeadershipCards(cards = []) {
  return (Array.isArray(cards) ? cards : [])
    .map((card = {}) => ({
      oImg: {
        sText: card?.oImg?.sText || '',
        sCaption: card?.oImg?.sCaption || '',
        sAttribute: card?.oImg?.sAttribute || '',
        sUrl: card?.oImg?.sUrl || ''
      },
      sName: card?.sName || '',
      sRole: card?.sRole || '',
      sRedirectUrl: card?.sRedirectUrl || '',
      eTarget: card?.eTarget || '_self'
    }))
    .filter((card) => card?.sName || card?.sRole || card?.sRedirectUrl || card?.oImg?.sUrl || card?.oImg?.sText)
}

function cleanLogoItems(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item = {}) => ({
      oImg: {
        sText: item?.oImg?.sText || '',
        sCaption: item?.oImg?.sCaption || '',
        sAttribute: item?.oImg?.sAttribute || '',
        sUrl: item?.oImg?.sUrl || ''
      },
      sRedirectUrl: item?.sRedirectUrl || ''
    }))
    .filter((item) => item?.oImg?.sUrl || item?.oImg?.sText)
}

function cleanMetricCards(cards = []) {
  return (Array.isArray(cards) ? cards : [])
    .map((card = {}) => ({
      sLabel: card?.sLabel || '',
      sValue: card?.sValue || ''
    }))
    .filter((card) => card?.sLabel || card?.sValue)
}

function cleanMarqueeLogos(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item = {}) => ({
      oImg: {
        sText: item?.oImg?.sText || '',
        sCaption: item?.oImg?.sCaption || '',
        sAttribute: item?.oImg?.sAttribute || '',
        sUrl: item?.oImg?.sUrl || ''
      }
    }))
    .filter((item) => item?.oImg?.sUrl || item?.oImg?.sText)
}

function cleanArticleComponentPayloadValue(component = {}, value = {}, fallbackFormType = '') {
  switch (component?.eType) {
    case 'faq':
      return {
        sTitle: value?.sTitle || '',
        sDescription: value?.sDescription || '',
        aFaq: cleanFaqItems(value?.aFaq)
      }
    case 'rsc':
      return {
        sTitle: value?.sTitle || '',
        sDescription: value?.sDescription || '',
        aCard: cleanRelevantCards(value?.aCard)
      }
    case 'cb':
      return {
        sTitle: value?.sTitle || '',
        sDescription: value?.sDescription || '',
        oImg: {
          sText: value?.oImg?.sText || '',
          sCaption: value?.oImg?.sCaption || '',
          sAttribute: value?.oImg?.sAttribute || '',
          sUrl: value?.oImg?.sUrl || ''
        },
        aCta: (Array.isArray(value?.aCta) ? value.aCta : []).map(cleanArticleCta).filter((item) => item?.sLabel || item?.sUrl).slice(0, 1)
      }
    case 'su':
      return {
        sTitle: value?.sTitle || '',
        sDescription: value?.sDescription || '',
        sPlaceholder: value?.sPlaceholder || '',
        sButtonLabel: value?.sButtonLabel || ''
      }
    case 'lsc':
      return {
        sTitle: value?.sTitle || '',
        sDescription: value?.sDescription || '',
        aCard: cleanLeadershipCards(value?.aCard)
      }
    case 'epo':
      return {
        sTitle: value?.sTitle || '',
        aLogo: cleanLogoItems(value?.aLogo)
      }
    case 'pem':
      return {
        sTitle: value?.sTitle || '',
        sDescription: value?.sDescription || '',
        aCard: cleanMetricCards(value?.aCard),
        bIsMarquee: Boolean(value?.bIsMarquee),
        aMarquee: cleanMarqueeLogos(value?.aMarquee)
      }
    case 'dlf':
      return buildDlfPayload(value, fallbackFormType)
    default:
      if (ARTICLE_LISTING_COPY_COMPONENT_TYPES.has(component?.eType)) return cleanListingCopy(value)
      return removeTypenameKey(value)
  }
}

function cleanTopHighlights(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item = {}) => ({
      sLabel: item?.sLabel || '',
      sValue: item?.sValue || ''
    }))
    .filter((item) => item?.sLabel || item?.sValue)
}

function hasArticleListingCopyComponent(components = []) {
  return components.some((component) => ARTICLE_LISTING_COPY_COMPONENT_TYPES.has(component?.eType))
}

function deleteFlatArticleComponentData(data = {}, { includeListingCopy = false } = {}) {
  ARTICLE_COMPONENT_DATA_KEYS.forEach((dataKey) => {
    if (dataKey === ARTICLE_LISTING_COPY_DATA_KEY && !includeListingCopy) return
    delete data[dataKey]
  })
}

function deleteArticlePageNamespaceData(data = {}) {
  ARTICLE_PAGE_NAMESPACE_KEYS.forEach((namespaceKey) => {
    delete data[namespaceKey]
  })
}

function deleteSelectedArticleComponentStorageData(data = {}, components = []) {
  components.forEach((component) => {
    const dataKey = getPageComponentDataKey(component)
    const storageKey = getPageComponentStorageKey(component)

    if (storageKey && storageKey !== dataKey) delete data[storageKey]
  })
}

function deleteArticleComponentInstanceStorageData(data = {}) {
  Object.keys(data).forEach((key) => {
    if (PAGE_COMPONENT_INSTANCE_STORAGE_KEY.test(key)) delete data[key]
  })
}

function getArticleComponentValue(data = {}, componentOrKey = '') {
  const isKeyLookup = typeof componentOrKey === 'string'
  const dataKey = isKeyLookup ? componentOrKey : getPageComponentDataKey(componentOrKey)
  const storageKey = isKeyLookup ? componentOrKey : getPageComponentStorageKey(componentOrKey)
  const candidateKeys = [storageKey, dataKey].filter((key, index, keys) => key && keys.indexOf(key) === index)

  for (const key of candidateKeys) {
    if (data?.oComponents?.[key] !== undefined) return data.oComponents[key]
    if (data?.[key] !== undefined) return data[key]

    for (const namespaceKey of ARTICLE_PAGE_NAMESPACE_KEYS) {
      const namespaceData = data?.[namespaceKey]
      if (namespaceData?.oComponents?.[key] !== undefined) return namespaceData.oComponents[key]
      if (namespaceData?.[key] !== undefined) return namespaceData[key]
    }
  }

  return undefined
}

function appendSelectedArticleComponents(data = {}, oComponents = {}, fallbackFormType = '') {
  data.aComponents.forEach((component) => {
    const dataKey = getPageComponentDataKey(component)
    const storageKey = getPageComponentStorageKey(component)
    if (!dataKey || !storageKey || oComponents[storageKey] !== undefined) return

    const componentValue = getArticleComponentValue(data, component)
    oComponents[storageKey] = cleanArticleComponentPayloadValue(component, componentValue || {}, fallbackFormType)
  })
}

function getFirstArticleListingCopyValue(data = {}) {
  const listingCopyComponent = (Array.isArray(data?.aComponents) ? data.aComponents : []).find((component) =>
    ARTICLE_LISTING_COPY_COMPONENT_TYPES.has(component?.eType)
  )

  if (listingCopyComponent) {
    const componentValue = getArticleComponentValue(data, listingCopyComponent)
    if (componentValue !== undefined) return componentValue
  }

  return getArticleComponentValue(data, ARTICLE_LISTING_COPY_DATA_KEY)
}

function getFirstArticleDownloadLeadFormValue(data = {}) {
  const dlfComponent = (Array.isArray(data?.aComponents) ? data.aComponents : []).find((component) => getPageComponentDataKey(component) === 'oDLF')

  if (dlfComponent) {
    const componentValue = getArticleComponentValue(data, dlfComponent)
    if (componentValue !== undefined) return componentValue
  }

  return getArticleComponentValue(data, 'oDLF')
}

function getOnDemandWebinarRecordingMedia(data = {}) {
  const dlfValue = getFirstArticleDownloadLeadFormValue(data) || {}

  return {
    videoSource: getDlfVideoSource(dlfValue),
    sThumbnailUrl: String(dlfValue?.sThumbnailUrl || '').trim(),
    sMediaUrl: String(dlfValue?.sMediaUrl || '').trim(),
    sLink: String(dlfValue?.sLink || '').trim(),
    sDurationLabel: normalizeDurationLabel(data?.oWebInar?.sDurationLabel)
  }
}

function normalizeArticlePath(value = '') {
  return String(value || '')
    .trim()
    .replace(/^https?:\/\/[^/]+\//i, '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
}

function stripCategoryPrefix(value = '', prefix = '') {
  let nextValue = normalizeArticlePath(value)
  const normalizedPrefix = normalizeArticlePath(prefix)
  const categorySegment = normalizedPrefix.split('/').filter(Boolean).pop()

  if (!normalizedPrefix) return nextValue

  if (normalizedPrefix) {
    while (nextValue.startsWith(normalizedPrefix)) {
      nextValue = nextValue.slice(normalizedPrefix.length).replace(/^\/+/, '')
    }
  }

  if (categorySegment && nextValue.startsWith(`${categorySegment}/s/`)) {
    nextValue = nextValue.slice(`${categorySegment}/s/`.length)
  }

  return nextValue
}

function prefixArticlePath(value = '', prefix = '') {
  const normalizedPrefix = normalizeArticlePath(prefix)
  const slugValue = stripCategoryPrefix(value, normalizedPrefix)

  if (!normalizedPrefix) return slugValue
  if (!slugValue) return normalizedPrefix

  return `${normalizedPrefix}/${slugValue}`
}

function getCurrentArticleSlugPath(articleData = {}) {
  return normalizeArticlePath(articleData?.slug || articleData?.oSeo?.sSlug)
}

function normalizeArticleMediaType(value, hasMedia = false) {
  if (value === 'v' || value === 'video') return 'v'
  if (value === 'i' || value === 'image') return 'i'

  return hasMedia ? 'i' : undefined
}

function getFeaturedVideoDataKey(categoryType = '') {
  if (categoryType === 'w') return 'oWebInar'
  return categoryType === 'vl' ? 'oVideo' : 'oPodcast'
}

function Publish({
  register,
  handleSubmit,
  reset,
  onPostSaveSuccess,
  values,
  articleData,
  eventId,
  setValue,
  disabled,
  getArticle,
  getLoading,
  control,
  categoryURL,
  setArticleData
}) {
  const { id, categoryType } = useParams()
  const history = useHistory()
  const allowUnsavedChangesNavigation = useAllowUnsavedChangesNavigation()
  const markFormClean = useMarkFormClean()
  const { dispatch } = useContext(ToastrContext)
  const { isShowing, toggle } = useModal()
  const { closeModal } = useModal()
  const intl = useIntl()

  const permission = {
    publish: [
      'UPDATE_BLOG_STATUS',
      'UPDATE_WEBINAR_STATUS',
      'UPDATE_PODCAST_STATUS',
      'UPDATE_WHITEPAPER_STATUS',
      'UPDATE_RESEARCH_REPORT_STATUS',
      'UPDATE_VIDEO_LISTING_STATUS',
      'UPDATE_CASE_STUDY_STATUS',
      'UPDATE_NEWS_EVENTS_STATUS'
    ],
    pick: ['PICK_ARTICLE'],
    overtake: ['PICK_ARTICLE'],
    publishAfterSave: [
      'UPDATE_BLOG_STATUS',
      'UPDATE_WEBINAR_STATUS',
      'UPDATE_PODCAST_STATUS',
      'UPDATE_WHITEPAPER_STATUS',
      'UPDATE_RESEARCH_REPORT_STATUS',
      'UPDATE_VIDEO_LISTING_STATUS',
      'UPDATE_CASE_STUDY_STATUS',
      'UPDATE_NEWS_EVENTS_STATUS'
    ],
    delete: [
      'DELETE_BLOG',
      'DELETE_WEBINAR',
      'DELETE_PODCAST',
      'DELETE_WHITEPAPER',
      'DELETE_RESEARCH_REPORT',
      'DELETE_VIDEO_LISTING',
      'DELETE_CASE_STUDY',
      'DELETE_NEWS_EVENTS'
    ],
    deleteAfterPublish: [
      'UPDATE_BLOG_STATUS',
      'UPDATE_WEBINAR_STATUS',
      'UPDATE_PODCAST_STATUS',
      'UPDATE_WHITEPAPER_STATUS',
      'UPDATE_RESEARCH_REPORT_STATUS',
      'UPDATE_VIDEO_LISTING_STATUS',
      'UPDATE_CASE_STUDY_STATUS',
      'UPDATE_NEWS_EVENTS_STATUS'
    ],
    edit: [
      'EDIT_BLOG',
      'EDIT_WEBINAR',
      'EDIT_PODCAST',
      'EDIT_WHITEPAPER',
      'EDIT_RESEARCH_REPORT',
      'EDIT_VIDEO_LISTING',
      'EDIT_CASE_STUDY',
      'EDIT_NEWS_EVENTS'
    ]
  }

  const [createArticle, { loading }] = useMutation(CREATE_ARTICLE, {
    onCompleted: (data) => {
      allowUnsavedChangesNavigation()
      history.push(allRoutes.editPost(categoryType, data.createArticle.oData._id, HEADER_CATEGORY_SLUG_ADMIN[categoryType]))
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: data?.createArticle?.sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
      })
    }
  })

  const [editArticle, { loading: editLoading }] = useMutation(EDIT_ARTICLE, {
    onCompleted: (data) => {
      if (data?.editArticle) {
        markFormClean(reset, values)
        onPostSaveSuccess?.()
        getArticle(id)
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editArticle.sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
        })
      }
    }
  })

  // const [editPickArticle] = useMutation(UPDATE_PICK_ARTICLE)

  const [updateArticleStatus, { loading: statusLoading }] = useMutation(UPDATE_ARTICLE_STATUS, {
    onCompleted: (data) => {
      if (data?.updateArticleStatus) {
        markFormClean(reset, values)
        onPostSaveSuccess?.()
        getArticle(id)
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.updateArticleStatus.sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
        })
      }
    }
  })

  const [pickArticle, { loading: pickLoading }] = useMutation(PICK_ARTICLE, {
    onCompleted: (data) => {
      if (data?.pickArticle) {
        markFormClean(reset, values)
        onPostSaveSuccess?.()
        getArticle(id)
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.pickArticle.sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
        })
      }
    }
  })

  const currentSlugPath = getCurrentArticleSlugPath(articleData)
  const nextSlugPath = prefixArticlePath(values()?.oSeo?.sSlug, categoryURL)

  async function onSubmit(formValue, eState) {
    const nextFormSlugPath = prefixArticlePath(formValue?.oSeo?.sSlug, categoryURL)
    const hasSlugChanged = stripCategoryPrefix(currentSlugPath, categoryURL) !== stripCategoryPrefix(formValue?.oSeo?.sSlug, categoryURL)

    setValue('eState', eState)

    if (articleData?.eState === 'pub' && currentSlugPath && nextFormSlugPath && hasSlugChanged) {
      toggle()
    } else {
      await prepareArticleData({ ...formValue, eState })
    }
  }

  async function prepareArticleData(value) {
    const data = await mapArticleDataAsPerApi(value)
    data.oSeo = prepareSeoData({
      ...data,
      oSeo: {
        ...values().oSeo,
        eType: 'ar',
        sSlug: stripCategoryPrefix(values()?.oSeo?.sSlug, categoryURL),
        sCUrl: values()?.oSeo?.sCUrl ? stripCategoryPrefix(values().oSeo.sCUrl, categoryURL) : ''
      }
    })
    data.oSeo.sSlug = prefixArticlePath(data?.oSeo?.sSlug, categoryURL)
    if (data.oSeo.sCUrl) data.oSeo.sCUrl = prefixArticlePath(data.oSeo.sCUrl, categoryURL)
    // if (id && !isArticleTakeOver?.articleTakeOver) {
    //   editArticle({ variables: { input: { ...data, _id: id } } })
    // } else if (id && isArticleTakeOver?.articleTakeOver) {
    //   editPickArticle({ variables: { input: { ...data, _id: id } } })
    // } else {
    //   createArticle({ variables: { input: data } })
    // }
    if (id) {
      editArticle({ variables: { input: { ...data, _id: id } } })
    } else {
      createArticle({ variables: { input: data } })
    }
  }

  function prepareSeoData(d) {
    const platforms = ['oFB', 'oTwitter']
    const fallbackSeoImage = normalizeArticleMediaType(d?.eMediaType, !!d?.sMediaUrl) === 'i' ? d?.sMediaUrl || d?.oImg?.sUrl || '' : ''

    platforms.forEach((platform) => {
      if (!d?.oSeo?.[platform]) d.oSeo[platform] = {}
      if (!d?.oSeo?.[platform]?.sUrl) d.oSeo[platform].sUrl = fallbackSeoImage
      if (!d?.oSeo?.[platform]?.sTitle) d.oSeo[platform].sTitle = d?.oSeo?.sTitle
      if (!d?.oSeo?.[platform]?.sDescription) {
        d.oSeo[platform].sDescription = d?.oSeo?.sDescription
      }
    })
    return d?.oSeo
  }

  function onRedirectionSuccess() {
    prepareArticleData({ ...values() })
    toggle()
  }

  function handlePickArticle(type) {
    confirmAlert({
      title: intl.formatMessage({ id: 'confirmation' }),
      message: 'Are you sure you want to pick this article?',
      customUI: CustomAlert,
      buttons: [
        {
          label: intl.formatMessage({ id: 'confirm' }),
          onClick: async () => {
            await pickArticle({ variables: { input: { iArticleId: id, eType: type, eHeaderCategoryType: categoryType } } })
            closeModal() // Close takeover information popup
          }
        },
        {
          label: intl.formatMessage({ id: 'cancel' })
        }
      ]
    })
  }

  function handleArticleStatusChange(eState) {
    return updateArticleStatus({
      variables: {
        input: {
          _id: id,
          eState,
          eHeaderCategoryType: categoryType
        }
      }
    })
  }

  async function mapArticleDataAsPerApi(value) {
    const data = {
      ...value,
      oSeo: { ...value?.oSeo },
      oImg: { ...value?.oImg }
    }
    value?.eState !== 'pub' && delete data.oSticky
    // delete data.oSeo
    delete data.frontSlug
    delete data.oImg.fSUrl
    data.oTImg && delete data.oTImg.fSUrl
    data.iAuthorDId = data?.iAuthorDId?._id
    data.iAssignedTo = data?.iAssignedTo?._id
    data.iHeaderCategoryId = data?.iHeaderCategoryId?._id
    data.iCategoryId = data?.iCategoryId?._id
    data.sContent = wrapTable(data?.sContent)
    data.sMediaUrl = data?.oImg?.sUrl || data?.sMediaUrl || ''
    data.eMediaType = normalizeArticleMediaType(data?.eMediaType, !!data?.sMediaUrl)
    if (!data.sMediaUrl) {
      delete data.sMediaUrl
      delete data.eMediaType
    }
    const featuredVideoDataKey = getFeaturedVideoDataKey(categoryType)
    const isWebinarOnDemand = categoryType === 'w' && isOnDemandWebinar(data?.oDLF?.eFormType)
    const isFeaturedYoutubeVideo =
      !isWebinarOnDemand &&
      ARTICLE_FEATURED_VIDEO_ENABLED_TYPES.has(categoryType) &&
      YOUTUBE_URL_REG_EX.test(String(data?.[featuredVideoDataKey]?.sLink || '').trim())
    if (data.eMediaType !== 'v' && !isFeaturedYoutubeVideo) {
      delete data.sThumbnailUrl
    } else {
      data.sThumbnailUrl = data?.sThumbnailUrl || ''
    }
    if (!data.sInsContent) delete data.sInsContent
    if (categoryType === 'b') {
      const blogReadDuration = String(data?.nDuration ?? '').trim()
      if (blogReadDuration) data.nDuration = Number(blogReadDuration)
      else delete data.nDuration
    } else {
      delete data.nDuration
    }
    data.aSecCategories = data?.aSecCategories ? data.aSecCategories?.map((cat) => cat?._id) : []
    data.aTags = (Array.isArray(data?.aTags) ? data.aTags : []).map((tag) => String(tag || '').trim()).filter(Boolean)
    if (!data.aTags.length) delete data.aTags
    data.eHeaderCategoryType = categoryType
    data.oSeo.sSlug = stripCategoryPrefix(data?.oSeo?.sSlug, categoryURL)
    data.oSeo.sCUrl = data?.oSeo?.sCUrl ? stripCategoryPrefix(data.oSeo.sCUrl, categoryURL) : ''
    delete data.oImg
    delete data.sDescription
    delete data.slug
    const selectedComponents = (Array.isArray(data?.aComponents) ? data.aComponents : []).map(ensurePageComponentInstanceId)
    const selectedComponentData = {
      ...data,
      aComponents: selectedComponents
    }
    const onDemandWebinarRecordingMedia = isWebinarOnDemand ? getOnDemandWebinarRecordingMedia(selectedComponentData) : {}

    data.aComponents = selectedComponents.map(cleanArticleComponent).filter(Boolean)

    if (selectedComponents.length) {
      const oComponents = {}

      appendSelectedArticleComponents(selectedComponentData, oComponents, categoryType)

      if (hasArticleListingCopyComponent(selectedComponents)) {
        data.oListingCopy = cleanListingCopy(getFirstArticleListingCopyValue(selectedComponentData))
      } else {
        delete data.oListingCopy
      }

      if (Object.keys(oComponents).length) {
        data.oComponents = oComponents
      } else {
        delete data.oComponents
      }

      deleteFlatArticleComponentData(data)
      deleteSelectedArticleComponentStorageData(data, selectedComponents)
    } else {
      delete data.aComponents
      delete data.oComponents
      deleteFlatArticleComponentData(data, { includeListingCopy: true })
    }

    deleteArticleComponentInstanceStorageData(data)
    deleteArticlePageNamespaceData(data)

    data.aSocialLinks = (Array.isArray(data?.aSocialLinks) ? data.aSocialLinks : [])
      .map(cleanArticleSocialLink)
      .filter((item) => item?.eType && item?.sUrl)

    if (!data.aSocialLinks.length) delete data.aSocialLinks

    if (ARTICLE_TOP_HIGHLIGHTS_ENABLED_TYPES.has(categoryType)) {
      data.aTopHighlights = cleanTopHighlights(data?.aTopHighlights)
      if (!data.aTopHighlights.length) delete data.aTopHighlights
    } else {
      delete data.aTopHighlights
    }

    if (ARTICLE_CASE_STUDY_FIELDS_ENABLED_TYPES.has(categoryType)) {
      data.oCaseStudy = {
        sLink: data?.oCaseStudy?.sLink || ''
      }

      if (!data.oCaseStudy.sLink) delete data.oCaseStudy
    } else {
      delete data.oCaseStudy
    }

    if (!data.iAssignedTo) delete data.iAssignedTo

    if (data?.oPodcast && categoryType === 'p') {
      const podcastLink = String(data?.oPodcast?.sLink || '').trim()
      const galleryVideoUrl = String(data?.sMediaUrl || '').trim()
      const isYoutubeVideo = YOUTUBE_URL_REG_EX.test(podcastLink)
      const isGalleryVideo = galleryVideoUrl && isVideoMedia(galleryVideoUrl) && !isYoutubeVideo

      if (!galleryVideoUrl) {
        delete data.sMediaUrl
        if (data.eMediaType === 'v') delete data.eMediaType
      }

      if (isYoutubeVideo) {
        data.oPodcast.sLink = podcastLink
      } else if (galleryVideoUrl && isVideoMedia(galleryVideoUrl)) {
        data.oPodcast.sLink = galleryVideoUrl
      } else {
        data.oPodcast.sLink = podcastLink
      }

      if (isGalleryVideo) {
        data.oPodcast.sDurationLabel = normalizeDurationLabel(data?.oPodcast?.sDurationLabel)
        if (!data.oPodcast.sDurationLabel) delete data.oPodcast.sDurationLabel
      } else {
        delete data.oPodcast.sDurationLabel
      }

      data.oPodcast.nEpisodeNumber = Number(data?.oPodcast?.nEpisodeNumber || 0)
      delete data.oPodcast.aSpeaker
      delete data.oPodcast.nDuration
      delete data.oPodcast.aPlatform
    } else delete data.oPodcast
    if (data?.oVideo && categoryType === 'vl') {
      const videoLink = String(data?.oVideo?.sLink || '').trim()
      const galleryVideoUrl = String(data?.sMediaUrl || '').trim()
      const isYoutubeVideo = YOUTUBE_URL_REG_EX.test(videoLink)
      const isGalleryVideo = galleryVideoUrl && isVideoMedia(galleryVideoUrl) && !isYoutubeVideo

      if (isYoutubeVideo) {
        data.oVideo.sLink = videoLink
        delete data.oVideo.sDurationLabel
        data.sMediaUrl = ''
        delete data.eMediaType
      } else if (isGalleryVideo) {
        data.oVideo.sLink = ''
        data.oVideo.sDurationLabel = normalizeDurationLabel(data?.oVideo?.sDurationLabel)
        if (!data.oVideo.sDurationLabel) delete data.oVideo.sDurationLabel
      } else {
        data.oVideo.sLink = videoLink
        data.sMediaUrl = ''
        delete data.eMediaType
        delete data.oVideo.sDurationLabel
      }

      if (!data.oVideo.sLink && !data.oVideo.sDurationLabel && !data.sMediaUrl) delete data.oVideo
    } else delete data.oVideo
    if (categoryType === 'wp') {
      data.oWhitePaper = {
        sLink: String(data?.oWhitePaper?.sLink || '').trim()
      }
    } else {
      delete data.oWhitePaper
    }
    if (categoryType === 'w') {
      if (isWebinarOnDemand) {
        if (onDemandWebinarRecordingMedia.videoSource === DLF_VIDEO_SOURCE.EXTERNAL && onDemandWebinarRecordingMedia.sLink) {
          data.oWebInar = { sLink: onDemandWebinarRecordingMedia.sLink }
        } else if (onDemandWebinarRecordingMedia.videoSource === DLF_VIDEO_SOURCE.UPLOAD && onDemandWebinarRecordingMedia.sMediaUrl) {
          data.oWebInar = {
            sLink: '',
            sDurationLabel: onDemandWebinarRecordingMedia.sDurationLabel
          }
        } else {
          delete data.oWebInar
        }

        if (onDemandWebinarRecordingMedia.sThumbnailUrl) data.sThumbnailUrl = onDemandWebinarRecordingMedia.sThumbnailUrl
        else delete data.sThumbnailUrl
        delete data.sMediaUrl
        delete data.eMediaType
      } else {
        data.oWebInar = data.oWebInar || {}

        const webinarLink = String(data?.oWebInar?.sLink || '').trim()
        const galleryVideoUrl = String(data?.sMediaUrl || '').trim()
        const isYoutubeVideo = YOUTUBE_URL_REG_EX.test(webinarLink)
        const isGalleryVideo = galleryVideoUrl && isVideoMedia(galleryVideoUrl) && !isYoutubeVideo

        if (isYoutubeVideo) {
          data.oWebInar.sLink = webinarLink
          delete data.oWebInar.sDurationLabel
          data.sMediaUrl = ''
          delete data.eMediaType
        } else if (isGalleryVideo) {
          data.oWebInar.sLink = ''
          data.oWebInar.sDurationLabel = normalizeDurationLabel(data?.oWebInar?.sDurationLabel)
          if (!data.oWebInar.sDurationLabel) delete data.oWebInar.sDurationLabel
        } else {
          data.oWebInar.sLink = webinarLink
          data.sMediaUrl = ''
          delete data.eMediaType
          delete data.oWebInar.sDurationLabel
        }

        delete data.oWebInar.aSpeaker
        delete data.oWebInar.nDuration
        if (!data.oWebInar.sLink && !data.oWebInar.sDurationLabel && !data.sMediaUrl) delete data.oWebInar
      }
    } else delete data.oWebInar
    return data
  }

  // const [autoSaveArticle] = useMutation(AUTO_SAVE_ARTICLE, {
  //   onCompleted: (data) => {
  //     if (data && data.autoSaveArticle) {
  //       if (location.pathname === allRoutes.addArticle && data?.autoSaveArticle?.oData?._id) {
  //         history.push(allRoutes.editArticle(data?.autoSaveArticle?.oData?._id))
  //       }
  //     }
  //   }
  // })

  // const autoSave = () => {
  //   const inputValues = values()
  //   const data = mapArticleDataAsPerApi(inputValues)
  //   data.oSeo = { ...values().oSeo, eType: 'ar' }
  //   data.oSeo.sSlug = categoryURL + data.oSeo.sSlug
  //   delete data.eState
  //   if (id) {
  //     autoSaveArticle({ variables: { input: { ...data, _id: id } } })
  //   } else {
  //     autoSaveArticle({ variables: { input: { ...data } } })
  //   }
  // }

  // useEffect(() => {
  //   let interval = null
  //   if (!disabled && values()?.sTitle?.trim()?.length >= 10 && articleData?.eState !== 'pub' && articleData?.eState !== 't') {
  //     handleVisibilityChange()

  //     function handleVisibilityChange() {
  //       if (document.visibilityState === 'visible') {
  //         interval = setInterval(autoSave, 15000)
  //       } else {
  //         clearInterval(interval)
  //       }
  //     }

  //     document.addEventListener('visibilitychange', handleVisibilityChange)
  //     return () => {
  //       clearInterval(interval)
  //       document.removeEventListener('visibilitychange', handleVisibilityChange)
  //     }
  //   } else {
  //     interval && clearInterval(interval)
  //   }
  // }, [values().sTitle, disabled])

  return (
    <ArticleTab title="Publish" event={0}>
      {id && <input type="hidden" name="dPublishDate" {...register('dPublishDate')} />}
      {(!id || (id && articleData)) && (
        <>
          <ArticleStatus
            articleData={articleData}
            disabled={disabled}
            register={register}
            control={control}
            handleSubmit={handleSubmit}
            submitHandler={onSubmit}
            displayAuthorType={'a'}
            type="ar"
          />
          <div className="footer d-flex justify-content-between">
            <ArticleButtons
              submitHandler={onSubmit}
              articleData={articleData}
              handleSubmit={handleSubmit}
              setValue={setValue}
              values={values}
              pickHandler={handlePickArticle}
              statusHandler={handleArticleStatusChange}
              permission={permission}
              tokenType="ga"
            />
          </div>
        </>
      )}
      {(pickLoading || editLoading || statusLoading || loading || getLoading) && <Loading />}
      <RedirectionPopup
        sNewUrl={nextSlugPath}
        sOldUrl={currentSlugPath}
        show={isShowing}
        onSuccess={onRedirectionSuccess}
        onClose={toggle}
      />
    </ArticleTab>
  )
}
Publish.propTypes = {
  register: PropTypes.func,
  handleSubmit: PropTypes.func,
  reset: PropTypes.func,
  onPostSaveSuccess: PropTypes.func,
  values: PropTypes.func,
  articleData: PropTypes.object,
  setValue: PropTypes.func,
  openComment: PropTypes.func,
  disabled: PropTypes.bool,
  getArticle: PropTypes.func,
  getLoading: PropTypes.bool,
  control: PropTypes.object,
  categoryURL: PropTypes.string,
  eventId: PropTypes.string,
  setArticleData: PropTypes.func
}
export default Publish
