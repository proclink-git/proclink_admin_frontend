import React, { useContext, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap'
import { FormProvider, useForm } from 'react-hook-form'
import { useHistory, useParams } from 'react-router'

import AddPageComponents from 'shared/components/add-page-components'
import AddPageComponentsList from 'shared/components/add-page-components/list'
import CommonSEO from 'shared/components/common-seo'
import CountInput from 'shared/components/count-input'
import EditorSectionNavigator from 'shared/components/editor-section-navigator'
import useEditorSectionNavigation from 'shared/components/editor-section-navigator/use-editor-section-navigation'
import { buildEditorSections, getEditorStaticSectionId } from 'shared/components/editor-section-navigator/utils'
import { ToastrContext } from 'shared/components/toastr'
import PageUpdateActions from 'shared/components/web-pages/page-update-actions'
import { useAllowUnsavedChangesNavigation } from 'shared/components/unsaved-changes'
import { META_ROBOTS, TOAST_TYPE } from 'shared/constants'
import { CREATE_PRODUCT, EDIT_PRODUCT } from 'graph-ql/products/mutation'
import { GET_PRODUCT } from 'graph-ql/products/query'
import { removeTypenameKey } from 'shared/utils'
import { allRoutes } from 'shared/constants/AllRoutes'
import { getDefaultHeroCta } from 'shared/components/page-components/home-banner/row'
import {
  getDefaultBenefitItem,
  getDefaultComparisonItem,
  getDefaultCta,
  getDefaultDualMedia,
  getDefaultFaqItem,
  getDefaultImage,
  getDefaultImageCard,
  getDefaultImageTitleItem,
  getDefaultMediaImageCard,
  getDefaultProductInterfaceItem,
  getDefaultIndustrialSectorCard,
  getDefaultRelevantServiceCard,
  getDefaultTitleDescriptionItem,
  getDefaultTextItem
} from 'shared/components/page-components/dynamic/product-detail-static/utils'
import {
  buildPageNamespacePayload,
  findDuplicatePageComponentDataKeys,
  getPageComponentBasePath,
  getPageComponentDefaultValue,
  mergeDefaultFormValue,
  normalizeComponentSelectionForPayload,
  normalizePageComponentForForm,
  normalizePageNamespaceComponents
} from 'shared/components/page-components/registry'

const PRODUCT_URL_PREFIX = 'products/'
const editorSectionPrefix = 'product-editor'

function getDefaultSeo() {
  return {
    sTitle: '',
    sDescription: '',
    sSlug: '',
    aKeywords: '',
    oFB: {
      sTitle: '',
      sDescription: '',
      sUrl: ''
    },
    oTwitter: {
      sTitle: '',
      sDescription: '',
      sUrl: ''
    },
    sCUrl: '',
    sRobots: META_ROBOTS[0],
    eType: 'p'
  }
}

function getDefaultProduct() {
  const productComponents = {
    oHPB: {
      sMediaUrl: '',
      eMediaType: 'v',
      oVideo: getDefaultImage(),
      sEyebrow: '',
      sTitle: '',
      sDescription: '',
      aCta: [getDefaultHeroCta(), getDefaultHeroCta()]
    },
    oPDM: getDefaultDualMedia(),
    oCCE: {
      sTitle: '',
      sDescription: '',
      aItem: [getDefaultTextItem()]
    },
    oWDW: {
      sTitle: '',
      sDescription: '',
      aItem: [getDefaultComparisonItem()]
    },
    oWAW: {
      sTitle: '',
      aDescription: [getDefaultTextItem()]
    },
    oWSH: {
      sTitle: '',
      sDescription: '',
      oImg: getDefaultImage(),
      aCard: [getDefaultImageCard()]
    },
    oWMF: {
      sTitle: '',
      sDescription: '',
      oImg: getDefaultImage(),
      aCard: [getDefaultImageCard()]
    },
    oOBW: {
      sTitle: '',
      sDescription: '',
      aItem: [getDefaultBenefitItem()]
    },
    oPLT: {
      sTitle: '',
      sDescription: '',
      aItem: [getDefaultTextItem()]
    },
    oPIF: {
      sTitle: '',
      aItem: [getDefaultProductInterfaceItem()]
    },
    oWPI: {
      sTitle: '',
      sDescription: '',
      aItem: [getDefaultTitleDescriptionItem()]
    },
    oRSC: {
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultRelevantServiceCard()]
    },
    oPWA: {
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultMediaImageCard()]
    },
    oOIW: {
      sTitle: '',
      sDescription: '',
      aItem: [getDefaultTextItem()]
    },
    oPIA: {
      sTitle: '',
      sDescription: '',
      oCta: getDefaultCta(),
      aCard: [getDefaultImageTitleItem()]
    },
    oISG: {
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultIndustrialSectorCard()]
    },
    oISF: {
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultImageTitleItem()]
    },
    oFAQ: {
      sTitle: '',
      sDescription: '',
      aFaq: [getDefaultFaqItem()]
    },
    oPS: {
      sTitle: '',
      sDescription: '',
      aCta: [getDefaultCta()]
    },
    oCB: {
      sTitle: '',
      sDescription: '',
      oImg: getDefaultImage(),
      aCta: [getDefaultCta()]
    }
  }

  return {
    sTitle: '',
    sDescription: '',
    ...productComponents,
    oComponents: productComponents,
    aComponent: [],
    oSeo: getDefaultSeo()
  }
}

function normalizeBannerMediaType(value) {
  if (value === 'i' || value === 'image') return 'i'
  if (value === 'v' || value === 'video') return 'v'
  return 'v'
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

function normalizeImage(value = {}) {
  return {
    ...getDefaultImage(),
    ...(removeTypenameKey(value) || {})
  }
}

function normalizeCta(value = {}) {
  return {
    sLabel: value?.sLabel || '',
    sUrl: value?.sUrl || ''
  }
}

function normalizeTextItems(items = []) {
  const nextItems = (Array.isArray(items) ? items : []).map((item) => {
    if (typeof item === 'string') return { sValue: item }
    return {
      sValue: item?.sValue || ''
    }
  })

  return nextItems.length ? nextItems : [getDefaultTextItem()]
}

function normalizePageComponent(component = {}) {
  return normalizePageComponentForForm(component)
}

function normalizeComponentSelection(component = {}) {
  return normalizeComponentSelectionForPayload(component)
}

function stripRepeatedPrefix(value = '', prefix = '') {
  let nextValue = String(value || '').trim()
  const normalizedPrefix = String(prefix || '')

  nextValue = nextValue.replace(/^\/+/, '')

  if (!normalizedPrefix) return nextValue

  while (nextValue.startsWith(normalizedPrefix)) {
    nextValue = nextValue.slice(normalizedPrefix.length)
  }

  return nextValue
}

function normalizeBannerSection(value = {}, defaultValue = {}) {
  const heroMediaUrl = value?.oVideo?.sUrl || value?.sMediaUrl || ''

  return {
    ...defaultValue,
    ...(value || {}),
    sMediaUrl: heroMediaUrl,
    eMediaType: normalizeBannerMediaType(value?.eMediaType),
    oVideo: {
      ...(defaultValue?.oVideo || getDefaultImage()),
      sUrl: heroMediaUrl
    },
    aCta: normalizeFixedArray(value?.aCta, 2, getDefaultHeroCta, normalizeCta)
  }
}

function normalizeBannerSectionForSubmit(value = {}) {
  return {
    sMediaUrl: value?.oVideo?.sUrl || value?.sMediaUrl || '',
    eMediaType: normalizeBannerMediaType(value?.eMediaType),
    sEyebrow: value?.sEyebrow || '',
    sTitle: value?.sTitle || '',
    sDescription: value?.sDescription || '',
    aCta: cleanCtas(value?.aCta, 2)
  }
}

function normalizeDualMedia(value = {}) {
  const data = removeTypenameKey(value) || {}
  const mediaUrl = data?.oMedia?.sUrl || data?.sMediaUrl || ''
  const thumbnailUrl = data?.oThumbnail?.sUrl || data?.sThumbnailUrl || ''

  return {
    ...getDefaultDualMedia(),
    ...data,
    sMediaUrl: mediaUrl,
    eMediaType: normalizeBannerMediaType(data?.eMediaType),
    oMedia: {
      ...getDefaultImage(),
      sUrl: mediaUrl
    },
    sThumbnailUrl: thumbnailUrl,
    oThumbnail: {
      ...getDefaultImage(),
      sUrl: thumbnailUrl
    },
    sTopLeftContent: data?.sTopLeftContent || '',
    sBottomRightContent: data?.sBottomRightContent || ''
  }
}

function normalizeDualMediaForSubmit(value = {}) {
  const mediaType = normalizeBannerMediaType(value?.eMediaType)
  const hasMediaObject = Object.prototype.hasOwnProperty.call(value, 'oMedia')
  const hasThumbnailObject = Object.prototype.hasOwnProperty.call(value, 'oThumbnail')
  const mediaUrl = hasMediaObject ? value?.oMedia?.sUrl || '' : value?.sMediaUrl || ''
  const thumbnailUrl = mediaType === 'v' ? (hasThumbnailObject ? value?.oThumbnail?.sUrl || '' : value?.sThumbnailUrl || '') : ''
  return {
    sMediaUrl: mediaUrl,
    eMediaType: mediaType,
    sTopLeftContent: value?.sTopLeftContent || '',
    sBottomRightContent: value?.sBottomRightContent || '',
    ...(mediaType === 'v' ? { sThumbnailUrl: thumbnailUrl } : {})
  }
}

function normalizeImageCardsSection(value = {}, { includeSectionImage = true } = {}) {
  return {
    sTitle: value?.sTitle || '',
    sDescription: value?.sDescription || '',
    ...(includeSectionImage ? { oImg: normalizeImage(value?.oImg) } : {}),
    aCard: normalizeArray(value?.aCard, getDefaultImageCard, (card = {}) => ({
      sTitle: card?.sTitle || '',
      sDescription: card?.sDescription || '',
      oImg: normalizeImage(card?.oImg)
    }))
  }
}

function normalizeImageCardsSectionForSubmit(value = {}, { includeSectionImage = true } = {}) {
  return {
    sTitle: value?.sTitle || '',
    sDescription: value?.sDescription || '',
    ...(includeSectionImage ? { oImg: normalizeImage(value?.oImg) } : {}),
    aCard: (Array.isArray(value?.aCard) ? value.aCard : [])
      .map((card = {}) => ({
        sTitle: card?.sTitle || '',
        sDescription: card?.sDescription || '',
        oImg: normalizeImage(card?.oImg)
      }))
      .filter((card) => card?.sTitle || card?.sDescription || card?.oImg?.sUrl || card?.oImg?.sText)
  }
}

function normalizeTitleDescriptionItems(items = []) {
  return normalizeArray(items, getDefaultTitleDescriptionItem, (item = {}) => ({
    sTitle: item?.sTitle || '',
    sDescription: item?.sDescription || ''
  }))
}

function normalizeImageTitleItems(items = []) {
  return normalizeArray(items, getDefaultImageTitleItem, (item = {}) => ({
    sTitle: item?.sTitle || '',
    oImg: normalizeImage(item?.oImg)
  }))
}

function normalizeProductInterfaceMediaType(value = '') {
  if (value === 'v' || value === 'video') return 'v'
  return 'i'
}

function normalizeMediaImageCards(items = []) {
  return normalizeArray(items, getDefaultMediaImageCard, (item = {}) => {
    const data = removeTypenameKey(item) || {}
    const mediaSource = data?.oImg || data?.oMedia || {}
    const mediaUrl = data?.sMediaUrl || data?.oImg?.sUrl || data?.oMedia?.sUrl || data?.sUrl || ''

    return {
      sTitle: data?.sTitle || '',
      sDescription: data?.sDescription || '',
      oImg: {
        ...normalizeImage(mediaSource),
        sUrl: mediaUrl
      },
      eMediaType: normalizeProductInterfaceMediaType(data?.eMediaType),
      sMediaUrl: mediaUrl
    }
  })
}

function normalizeProductInterfaceItems(items = []) {
  return normalizeArray(items, getDefaultProductInterfaceItem, (item = {}) => {
    const data = removeTypenameKey(item) || {}
    const mediaSource = data?.oImg || data?.oMedia || {}
    const mediaUrl = data?.sMediaUrl || data?.oImg?.sUrl || data?.oMedia?.sUrl || data?.sUrl || ''

    return {
      sTitle: data?.sTitle || '',
      oImg: {
        ...normalizeImage(mediaSource),
        sUrl: mediaUrl
      },
      eMediaType: normalizeProductInterfaceMediaType(data?.eMediaType),
      sMediaUrl: mediaUrl
    }
  })
}

function normalizeRelevantServicesSection(value = {}) {
  return {
    sTitle: value?.sTitle || '',
    sDescription: value?.sDescription || '',
    aCard: normalizeArray(value?.aCard, getDefaultRelevantServiceCard, (card = {}) => ({
      oImg: normalizeImage(card?.oImg),
      sTitle: card?.sTitle || '',
      sRedirectUrl: card?.sRedirectUrl || '',
      eTarget: card?.eTarget || '_self',
      sSlug: card?.sSlug || ''
    }))
  }
}

function normalizeIndustrialSectorsSection(value = {}) {
  return {
    sTitle: value?.sTitle || '',
    sDescription: value?.sDescription || '',
    aCard: normalizeArray(value?.aCard, getDefaultIndustrialSectorCard, (card = {}) => ({
      oIcon: normalizeImage(card?.oIcon),
      sTitle: card?.sTitle || '',
      sDescription: card?.sDescription || '',
      sUrl: card?.sUrl || ''
    }))
  }
}

function normalizeFaqSection(value = {}) {
  return {
    sTitle: value?.sTitle || '',
    sDescription: value?.sDescription || '',
    aFaq: normalizeArray(value?.aFaq, getDefaultFaqItem, (item = {}) => ({
      sQuestion: item?.sQuestion || '',
      sAnswer: item?.sAnswer || ''
    }))
  }
}

function normalizeCareerBannerSection(value = {}) {
  return {
    sTitle: value?.sTitle || '',
    sDescription: value?.sDescription || '',
    oImg: normalizeImage(value?.oImg),
    aCta: normalizeFixedArray(value?.aCta, 1, getDefaultCta, normalizeCta)
  }
}

function normalizeProductFormData(value = {}) {
  const data = removeTypenameKey(value) || {}
  const defaultData = getDefaultProduct()
  const sourceComponents = removeTypenameKey(data?.oComponents || {}) || {}
  const getComponentValue = (key) => (sourceComponents?.[key] !== undefined ? sourceComponents[key] : data?.[key])

  return normalizePageNamespaceComponents({
    ...defaultData,
    ...data,
    sTitle: data?.sTitle || '',
    sDescription: data?.sDescription || '',
    oComponents: {
      ...sourceComponents,
      oHPB: normalizeBannerSection(getComponentValue('oHPB'), defaultData.oComponents.oHPB),
      oPDM: normalizeDualMedia(getComponentValue('oPDM')),
      oCCE: {
        sTitle: getComponentValue('oCCE')?.sTitle || '',
        sDescription: getComponentValue('oCCE')?.sDescription || '',
        aItem: normalizeTextItems(getComponentValue('oCCE')?.aItem)
      },
      oWDW: {
        sTitle: getComponentValue('oWDW')?.sTitle || '',
        sDescription: getComponentValue('oWDW')?.sDescription || '',
        aItem: normalizeArray(getComponentValue('oWDW')?.aItem, getDefaultComparisonItem, (item = {}) => ({
          sTitle: item?.sTitle || '',
          sDescription: item?.sDescription || ''
        }))
      },
      oWAW: {
        sTitle: getComponentValue('oWAW')?.sTitle || '',
        aDescription: normalizeTextItems(getComponentValue('oWAW')?.aDescription)
      },
      oWSH: normalizeImageCardsSection(getComponentValue('oWSH')),
      oWMF: normalizeImageCardsSection(getComponentValue('oWMF'), { includeSectionImage: false }),
      oOBW: {
        sTitle: getComponentValue('oOBW')?.sTitle || '',
        sDescription: getComponentValue('oOBW')?.sDescription || '',
        aItem: normalizeArray(getComponentValue('oOBW')?.aItem, getDefaultBenefitItem, (item = {}) => ({
          sTitle: item?.sTitle || '',
          oImg: normalizeImage(item?.oImg)
        }))
      },
      oPLT: {
        sTitle: getComponentValue('oPLT')?.sTitle || '',
        sDescription: getComponentValue('oPLT')?.sDescription || '',
        aItem: normalizeTextItems(getComponentValue('oPLT')?.aItem)
      },
      oPIF: {
        sTitle: getComponentValue('oPIF')?.sTitle || '',
        aItem: normalizeProductInterfaceItems(getComponentValue('oPIF')?.aItem)
      },
      oWPI: {
        sTitle: getComponentValue('oWPI')?.sTitle || '',
        sDescription: getComponentValue('oWPI')?.sDescription || '',
        aItem: normalizeTitleDescriptionItems(getComponentValue('oWPI')?.aItem)
      },
      oRSC: normalizeRelevantServicesSection(getComponentValue('oRSC')),
      oPWA: {
        sTitle: getComponentValue('oPWA')?.sTitle || '',
        sDescription: getComponentValue('oPWA')?.sDescription || '',
        aCard: normalizeMediaImageCards(getComponentValue('oPWA')?.aCard)
      },
      oOIW: {
        sTitle: getComponentValue('oOIW')?.sTitle || '',
        sDescription: getComponentValue('oOIW')?.sDescription || '',
        aItem: normalizeTextItems(getComponentValue('oOIW')?.aItem)
      },
      oPIA: {
        sTitle: getComponentValue('oPIA')?.sTitle || '',
        sDescription: getComponentValue('oPIA')?.sDescription || '',
        oCta: normalizeCta(getComponentValue('oPIA')?.oCta),
        aCard: normalizeImageTitleItems(getComponentValue('oPIA')?.aCard)
      },
      oISG: normalizeIndustrialSectorsSection(getComponentValue('oISG')),
      oISF: {
        sTitle: getComponentValue('oISF')?.sTitle || '',
        sDescription: getComponentValue('oISF')?.sDescription || '',
        aCard: normalizeImageTitleItems(getComponentValue('oISF')?.aCard)
      },
      oFAQ: normalizeFaqSection(getComponentValue('oFAQ')),
      oPS: {
        sTitle: getComponentValue('oPS')?.sTitle || '',
        sDescription: getComponentValue('oPS')?.sDescription || '',
        aCta: normalizeFixedArray(getComponentValue('oPS')?.aCta, 1, getDefaultCta, normalizeCta)
      },
      oCB: normalizeCareerBannerSection(getComponentValue('oCB'))
    },
    aComponent: (Array.isArray(data?.aComponent) ? data.aComponent : []).map(normalizePageComponent),
    oSeo: {
      ...defaultData.oSeo,
      ...(data?.oSeo || {}),
      eType: 'p',
      sSlug: stripRepeatedPrefix(data?.oSeo?.sSlug, PRODUCT_URL_PREFIX),
      sCUrl: stripRepeatedPrefix(data?.oSeo?.sCUrl, PRODUCT_URL_PREFIX),
      sRobots: data?.oSeo?.sRobots || META_ROBOTS[0],
      aKeywords: Array.isArray(data?.oSeo?.aKeywords) ? data.oSeo.aKeywords.join(', ') : data?.oSeo?.aKeywords || ''
    }
  }, 'p')
}

function mapTextItems(items = []) {
  return (Array.isArray(items) ? items : []).map((item = {}) => item?.sValue || '').filter(Boolean)
}

function cleanCtas(items = [], limit) {
  const nextItems = (Array.isArray(items) ? items : [])
    .map((item) => normalizeCta(item))
    .filter((item) => item.sLabel || item.sUrl)

  return typeof limit === 'number' ? nextItems.slice(0, limit) : nextItems
}

function mapTitleDescriptionItems(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item = {}) => ({
      sTitle: item?.sTitle || '',
      sDescription: item?.sDescription || ''
    }))
    .filter((item) => item?.sTitle || item?.sDescription)
}

function mapImageTitleItems(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item = {}) => ({
      sTitle: item?.sTitle || '',
      oImg: normalizeImage(item?.oImg)
    }))
    .filter((item) => item?.sTitle || item?.oImg?.sUrl || item?.oImg?.sText)
}

function mapProductInterfaceItems(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item = {}) => {
      const mediaSource = item?.oImg || item?.oMedia || {}
      const mediaUrl = item?.sMediaUrl || item?.oImg?.sUrl || item?.oMedia?.sUrl || item?.sUrl || ''

      return {
        sTitle: item?.sTitle || '',
        oImg: {
          ...normalizeImage(mediaSource),
          sUrl: mediaUrl
        },
        eMediaType: normalizeProductInterfaceMediaType(item?.eMediaType),
        sMediaUrl: mediaUrl
      }
    })
    .filter((item) => item?.sTitle || item?.sMediaUrl || item?.oImg?.sText)
}

function mapMediaImageCards(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item = {}) => {
      const mediaSource = item?.oImg || item?.oMedia || {}
      const mediaUrl = item?.sMediaUrl || item?.oImg?.sUrl || item?.oMedia?.sUrl || item?.sUrl || ''

      return {
        sTitle: item?.sTitle || '',
        sDescription: item?.sDescription || '',
        oImg: {
          ...normalizeImage(mediaSource),
          sUrl: mediaUrl
        },
        eMediaType: normalizeProductInterfaceMediaType(item?.eMediaType),
        sMediaUrl: mediaUrl
      }
    })
    .filter((item) => item?.sTitle || item?.sDescription || item?.sMediaUrl || item?.oImg?.sText)
}

function normalizeRelevantServicesSectionForSubmit(value = {}) {
  return {
    sTitle: value?.sTitle || '',
    sDescription: value?.sDescription || '',
    aCard: (Array.isArray(value?.aCard) ? value.aCard : [])
      .map((card = {}) => ({
        oImg: normalizeImage(card?.oImg),
        sTitle: card?.sTitle || '',
        sRedirectUrl: card?.sRedirectUrl || '',
        eTarget: card?.eTarget || '_self',
        sSlug: card?.sSlug || ''
      }))
      .filter((card) => card?.sTitle || card?.sRedirectUrl || card?.sSlug || card?.oImg?.sUrl || card?.oImg?.sText)
  }
}

function normalizeIndustrialSectorsSectionForSubmit(value = {}) {
  return {
    sTitle: value?.sTitle || '',
    sDescription: value?.sDescription || '',
    aCard: (Array.isArray(value?.aCard) ? value.aCard : [])
      .map((card = {}) => ({
        oIcon: normalizeImage(card?.oIcon),
        sTitle: card?.sTitle || '',
        sDescription: card?.sDescription || '',
        sUrl: card?.sUrl || ''
      }))
      .filter((card) => card?.sTitle || card?.sDescription || card?.sUrl || card?.oIcon?.sUrl || card?.oIcon?.sText)
  }
}

function normalizeFaqSectionForSubmit(value = {}) {
  return {
    sTitle: value?.sTitle || '',
    sDescription: value?.sDescription || '',
    aFaq: (Array.isArray(value?.aFaq) ? value.aFaq : [])
      .map((item = {}) => ({
        sQuestion: item?.sQuestion || '',
        sAnswer: item?.sAnswer || ''
      }))
      .filter((item) => item?.sQuestion || item?.sAnswer)
  }
}

function normalizeCareerBannerSectionForSubmit(value = {}) {
  return {
    sTitle: value?.sTitle || '',
    sDescription: value?.sDescription || '',
    oImg: normalizeImage(value?.oImg),
    aCta: cleanCtas(value?.aCta, 1)
  }
}

function normalizeProductForSubmit(data = {}) {
  const rawValue = removeTypenameKey(data) || {}
  const componentValue = removeTypenameKey(rawValue?.oComponents || {}) || rawValue
  const value = {
    ...componentValue,
    sTitle: rawValue?.sTitle || '',
    sDescription: rawValue?.sDescription || '',
    aComponent: rawValue?.aComponent || [],
    oSeo: rawValue?.oSeo || {}
  }

  return {
    ...componentValue,
    sTitle: value?.sTitle || '',
    sDescription: value?.sDescription || '',
    oHPB: normalizeBannerSectionForSubmit(value?.oHPB),
    oSPB: {
      ...normalizeBannerSectionForSubmit(value?.oSPB),
      sContent: value?.oSPB?.sContent || ''
    },
    oMID: {
      sTitle: value?.oMID?.sTitle || '',
      sDescription: value?.oMID?.sDescription || '',
      oImg: normalizeImage(value?.oMID?.oImg)
    },
    oPDM: normalizeDualMediaForSubmit(value?.oPDM),
    oCCE: {
      sTitle: value?.oCCE?.sTitle || '',
      sDescription: value?.oCCE?.sDescription || '',
      aItem: mapTextItems(value?.oCCE?.aItem)
    },
    oWDW: {
      sTitle: value?.oWDW?.sTitle || '',
      sDescription: value?.oWDW?.sDescription || '',
      aItem: (Array.isArray(value?.oWDW?.aItem) ? value.oWDW.aItem : [])
        .map((item = {}) => ({
          sTitle: item?.sTitle || '',
          sDescription: item?.sDescription || ''
        }))
        .filter((item) => item?.sTitle || item?.sDescription)
    },
    oWAW: {
      sTitle: value?.oWAW?.sTitle || '',
      aDescription: mapTextItems(value?.oWAW?.aDescription)
    },
    oWSH: normalizeImageCardsSectionForSubmit(value?.oWSH),
    oWMF: normalizeImageCardsSectionForSubmit(value?.oWMF, { includeSectionImage: false }),
    oOBW: {
      sTitle: value?.oOBW?.sTitle || '',
      sDescription: value?.oOBW?.sDescription || '',
      aItem: (Array.isArray(value?.oOBW?.aItem) ? value.oOBW.aItem : [])
        .map((item = {}) => ({
          sTitle: item?.sTitle || '',
          oImg: normalizeImage(item?.oImg)
        }))
        .filter((item) => item?.sTitle || item?.oImg?.sUrl || item?.oImg?.sText)
    },
    oPLT: {
      sTitle: value?.oPLT?.sTitle || '',
      sDescription: value?.oPLT?.sDescription || '',
      aItem: mapTextItems(value?.oPLT?.aItem)
    },
    oPIF: {
      sTitle: value?.oPIF?.sTitle || '',
      aItem: mapProductInterfaceItems(value?.oPIF?.aItem)
    },
    oWPI: {
      sTitle: value?.oWPI?.sTitle || '',
      sDescription: value?.oWPI?.sDescription || '',
      aItem: mapTitleDescriptionItems(value?.oWPI?.aItem)
    },
    oRSC: normalizeRelevantServicesSectionForSubmit(value?.oRSC),
    oPWA: {
      sTitle: value?.oPWA?.sTitle || '',
      sDescription: value?.oPWA?.sDescription || '',
      aCard: mapMediaImageCards(value?.oPWA?.aCard)
    },
    oOIW: {
      sTitle: value?.oOIW?.sTitle || '',
      sDescription: value?.oOIW?.sDescription || '',
      aItem: mapTextItems(value?.oOIW?.aItem)
    },
    oPIA: {
      sTitle: value?.oPIA?.sTitle || '',
      sDescription: value?.oPIA?.sDescription || '',
      oCta: normalizeCta(value?.oPIA?.oCta),
      aCard: mapImageTitleItems(value?.oPIA?.aCard)
    },
    oISG: normalizeIndustrialSectorsSectionForSubmit(value?.oISG),
    oISF: {
      sTitle: value?.oISF?.sTitle || '',
      sDescription: value?.oISF?.sDescription || '',
      aCard: mapImageTitleItems(value?.oISF?.aCard)
    },
    oFAQ: normalizeFaqSectionForSubmit(value?.oFAQ),
    oPS: {
      sTitle: value?.oPS?.sTitle || '',
      sDescription: value?.oPS?.sDescription || '',
      aCta: cleanCtas(value?.oPS?.aCta, 1)
    },
    oCB: normalizeCareerBannerSectionForSubmit(value?.oCB),
    oSVC: {
      aCard: (Array.isArray(value?.oSVC?.aCard) ? value.oSVC.aCard : [])
        .map((card = {}) => ({
          sTag: card?.sTag || '',
          sTitle: card?.sTitle || '',
          sDescription: card?.sDescription || '',
          oImgTop: normalizeImage(card?.oImgTop),
          oImgBottomLeft: normalizeImage(card?.oImgBottomLeft),
          oImgBottomRight: normalizeImage(card?.oImgBottomRight)
        }))
        .filter((card) => card?.sTag || card?.sTitle || card?.sDescription || card?.oImgTop?.sUrl || card?.oImgTop?.sText || card?.oImgBottomLeft?.sUrl || card?.oImgBottomLeft?.sText || card?.oImgBottomRight?.sUrl || card?.oImgBottomRight?.sText)
    },
    aComponent: (Array.isArray(value?.aComponent) ? value.aComponent : []).map(normalizeComponentSelection).filter(Boolean),
    oSeo: removeTypenameKey(value?.oSeo || {})
  }
}

function hasMeaningfulValue(value) {
  if (Array.isArray(value)) return value.some(hasMeaningfulValue)
  if (value && typeof value === 'object') return Object.values(value).some(hasMeaningfulValue)
  return Boolean(value)
}

function hasFormValueChanged(currentValue, nextValue) {
  return JSON.stringify(currentValue || null) !== JSON.stringify(nextValue || null)
}

function getCleanSocialSeo(value = {}) {
  return {
    sTitle: value?.sTitle || '',
    sDescription: value?.sDescription || '',
    sUrl: value?.sUrl || ''
  }
}

function AddEditProduct() {
  const { id } = useParams()
  const history = useHistory()
  const allowUnsavedChangesNavigation = useAllowUnsavedChangesNavigation()
  const methods = useForm({ mode: 'all', defaultValues: getDefaultProduct() })
  const { dispatch } = useContext(ToastrContext)
  const defaultURL = PRODUCT_URL_PREFIX

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
    clearErrors,
    setValue,
    control,
    getValues,
    watch
  } = methods

  const productTitle = watch('sTitle') || watch('oComponents.oHPB.sTitle') || watch('oComponents.oSPB.sTitle')
  const selectedComponents = watch('aComponent') || []
  const sections = buildEditorSections({
    basicsLabel: 'Product Basics',
    seoLabel: 'SEO',
    components: selectedComponents,
    anchorPrefix: editorSectionPrefix
  })
  const basicsSectionId = getEditorStaticSectionId(editorSectionPrefix, 'basics')
  const seoSectionId = getEditorStaticSectionId(editorSectionPrefix, 'seo')
  const { activeSectionId, handleJumpToSection } = useEditorSectionNavigation(sections)

  const { data: product } = useQuery(GET_PRODUCT, {
    variables: { input: { _id: id } },
    skip: !id,
    onCompleted: (data) => {
      if (data?.getProduct) {
        setFormValue(data?.getProduct)
      }
    }
  })

  const productComponents = product?.getProduct?.oComponents || {}
  const previewFallbackImage =
    product?.getProduct?.oSeo?.oFB?.sUrl ||
    product?.getProduct?.oSeo?.oTwitter?.sUrl ||
    productComponents?.oPDM?.sThumbnailUrl ||
    (productComponents?.oPDM?.eMediaType === 'i' ? productComponents?.oPDM?.sMediaUrl : '') ||
    (productComponents?.oHPB?.eMediaType === 'i' ? productComponents?.oHPB?.sMediaUrl : '') ||
    (productComponents?.oSPB?.eMediaType === 'i' ? productComponents?.oSPB?.sMediaUrl : '') ||
    ''

  const [create, { loading }] = useMutation(CREATE_PRODUCT, {
    onCompleted: (data) => {
      if (data?.createProduct) {
        allowUnsavedChangesNavigation()
        history.push(allRoutes.products)
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data?.createProduct?.sMessage, type: TOAST_TYPE.Success }
        })
      }
    }
  })

  const [edit, { loading: editLoading }] = useMutation(EDIT_PRODUCT, {
    onCompleted: (data) => {
      if (data?.editProduct) {
        allowUnsavedChangesNavigation()
        history.push(allRoutes.products)
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data?.editProduct?.sMessage, type: TOAST_TYPE.Success }
        })
      }
    }
  })

  function setFormValue(value) {
    reset(normalizeProductFormData(value))
  }

  useEffect(() => {
    selectedComponents.forEach((component) => {
      const componentBasePath = getPageComponentBasePath(component, '', 'p')
      if (!componentBasePath) return

      const currentValue = getValues(componentBasePath)
      const nextValue = mergeDefaultFormValue(currentValue, getPageComponentDefaultValue(component))

      if (hasFormValueChanged(currentValue, nextValue)) {
        setValue(componentBasePath, nextValue, { shouldDirty: false, shouldValidate: false })
      }
    })
  }, [selectedComponents, getValues, setValue])

  function prepareSeoData(data) {
    const currentSeo = removeTypenameKey(data?.oSeo || {})
    const components = data?.oComponents || {}
    const pdm = components?.oPDM || data?.oPDM
    const hpb = components?.oHPB || data?.oHPB
    const spb = components?.oSPB || data?.oSPB
    const fallbackSeoImage =
      pdm?.sThumbnailUrl ||
      (pdm?.eMediaType === 'i' ? pdm?.sMediaUrl || '' : '') ||
      (hpb?.eMediaType === 'i' ? hpb?.sMediaUrl || '' : '') ||
      (spb?.eMediaType === 'i' ? spb?.sMediaUrl || '' : '')
    const oSeo = {
      sTitle: currentSeo?.sTitle || '',
      sDescription: currentSeo?.sDescription || '',
      sSlug: currentSeo?.sSlug || '',
      aKeywords: currentSeo?.aKeywords || '',
      oFB: getCleanSocialSeo(currentSeo?.oFB),
      oTwitter: getCleanSocialSeo(currentSeo?.oTwitter),
      sCUrl: currentSeo?.sCUrl || '',
      sRobots: currentSeo?.sRobots || META_ROBOTS[0],
      eType: 'p'
    }

    if (!hasMeaningfulValue(oSeo)) return undefined

    ;['oFB', 'oTwitter'].forEach((platform) => {
      if (!oSeo?.[platform]) oSeo[platform] = {}
      if (!oSeo?.[platform]?.sUrl) oSeo[platform].sUrl = fallbackSeoImage
      if (!oSeo?.[platform]?.sTitle) oSeo[platform].sTitle = oSeo?.sTitle
      if (!oSeo?.[platform]?.sDescription) oSeo[platform].sDescription = oSeo?.sDescription
    })

    return oSeo
  }

  function onSubmit(value) {
    const duplicateDataKeys = findDuplicatePageComponentDataKeys(value?.aComponent, 'p')
    if (duplicateDataKeys.length) {
      setError('aComponent', {
        type: 'validate',
        message: 'Selected components contain duplicate data sections. Remove duplicate component types before saving.'
      })
      return
    }

    clearErrors('aComponent')

    const normalizedData = normalizeProductForSubmit(value)
    const componentPayload = buildPageNamespacePayload({
      aComponent: normalizedData?.aComponent,
      oComponents: normalizedData
    }, 'p')
    const data = {
      sTitle: normalizedData?.sTitle || '',
      sDescription: normalizedData?.sDescription || '',
      ...componentPayload,
      oSeo: normalizedData?.oSeo
    }
    const seoData = prepareSeoData(data)

    if (seoData) {
      seoData.aKeywords = String(seoData.aKeywords || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
      seoData.sSlug = stripRepeatedPrefix(seoData.sSlug, defaultURL)
      seoData.sSlug = seoData.sSlug ? `${defaultURL}${seoData.sSlug}` : ''
      seoData.sCUrl = stripRepeatedPrefix(seoData.sCUrl, defaultURL)
      if (seoData.sCUrl) seoData.sCUrl = `${defaultURL}${seoData.sCUrl}`
      data.oSeo = seoData
    } else {
      delete data.oSeo
    }

    if (id) {
      edit({ variables: { input: { _id: id, oEditInput: data } } })
    } else {
      create({ variables: { input: data } })
    }
  }

  return (
    <FormProvider {...methods}>
      <Form className="page-component-editor-form page-component-editor-form--has-sticky-picker" onSubmit={handleSubmit(onSubmit)}>
        <AddPageComponents
          control={control}
          error={errors?.aComponent}
          name="aComponent"
          ePageComponentType="p"
          includeAllWithoutPermission
          variant="sticky"
        />
        <Row>
          <Col lg="9">
            <div className="d-lg-none mb-3">
              <EditorSectionNavigator sections={sections} activeSectionId={activeSectionId} onJump={handleJumpToSection} mobileMode />
            </div>
            <div id={basicsSectionId} className="editor-section-target">
              <Form.Label className="text-uppercase small text-muted mb-3">Product Basics</Form.Label>
              <CountInput
                placeholder="Product Title"
                type="text"
                register={register('sTitle')}
                error={errors}
                className={errors.sTitle && 'error'}
                name="sTitle"
                label="Title"
              />
              <CountInput
                placeholder="Short Description"
                type="textarea"
                textarea
                rows={5}
                register={register('sDescription')}
                error={errors}
                className={errors.sDescription && 'error'}
                name="sDescription"
                label="Description"
              />
            </div>
            <AddPageComponentsList name="aComponent" namespace="" pageType="p" anchorPrefix={editorSectionPrefix} />
            <div id={seoSectionId} className="editor-section-target mt-4">
              <Form.Label className="text-uppercase small text-muted mb-3">SEO</Form.Label>
              <input type="hidden" value="p" {...register('oSeo.eType')} />
              <CommonSEO
                register={register}
                errors={errors}
                values={getValues()}
                setError={setError}
                clearErrors={clearErrors}
                previewURL={previewFallbackImage}
                fbImg={product?.getProduct?.oSeo?.oFB?.sUrl || previewFallbackImage}
                twitterImg={product?.getProduct?.oSeo?.oTwitter?.sUrl || previewFallbackImage}
                setValue={setValue}
                control={control}
                id={id}
                slugType={'p'}
                slug={productTitle && defaultURL ? `${defaultURL}${productTitle}` : productTitle || undefined}
                hidden
                categoryURL={defaultURL}
              />
            </div>
            <Button variant="primary" type="submit" className="m-2" disabled={loading || editLoading}>
              {id ? 'Update' : 'Add'}
              {(loading || editLoading) && <Spinner animation="border" size="sm" />}
            </Button>
          </Col>
          <Col lg="3" className="add-article">
            <div className="sticky-column">
              <div className="d-none d-lg-block">
                <EditorSectionNavigator sections={sections} activeSectionId={activeSectionId} onJump={handleJumpToSection} />
              </div>
              {id && (
                <div className="mt-3">
                  <PageUpdateActions loading={loading || editLoading} />
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Form>
    </FormProvider>
  )
}

export default AddEditProduct
