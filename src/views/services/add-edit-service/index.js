import React, { useContext, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap'
import { FormProvider, useForm } from 'react-hook-form'
import { useHistory, useParams } from 'react-router'

import AddPageComponents from 'shared/components/add-page-components'
import AddPageComponentsList from 'shared/components/add-page-components/list'
import CommonSEO from 'shared/components/common-seo'
import EditorSectionNavigator from 'shared/components/editor-section-navigator'
import useEditorSectionNavigation from 'shared/components/editor-section-navigator/use-editor-section-navigation'
import { buildEditorSections, getEditorStaticSectionId } from 'shared/components/editor-section-navigator/utils'
import { ToastrContext } from 'shared/components/toastr'
import PageUpdateActions from 'shared/components/web-pages/page-update-actions'
import { useAllowUnsavedChangesNavigation } from 'shared/components/unsaved-changes'
import { META_ROBOTS, TOAST_TYPE } from 'shared/constants'
import { CREATE_SERVICES, EDIT_SERVICES } from 'graph-ql/services/mutation'
import { GET_SERVICE } from 'graph-ql/services/query'
import { removeTypenameKey } from 'shared/utils'
import { allRoutes } from 'shared/constants/AllRoutes'
import CountInput from 'shared/components/count-input'
import { getDefaultHeroCta } from 'shared/components/page-components/home-banner/row'
import {
  getDefaultAnimatedFeatureCard,
  getDefaultLogo,
  getDefaultContentShowcaseCard,
  getDefaultCta,
  getDefaultFaqItem,
  getDefaultFocusAreaCard,
  getDefaultImage,
  getDefaultIndustrialSectorCard,
  getDefaultLeadershipCard,
  getDefaultMarqueeLogo,
  getDefaultMetricCard,
  getDefaultRelevantServiceCard,
  getDefaultServiceAnimatedScrollCard,
  getDefaultServiceCapabilityCard,
  getDefaultServiceFeatureCard,
  getDefaultServiceGalleryPanel,
  getDefaultServiceImpactCard,
  getDefaultServiceImpactLine,
  getDefaultServiceSolutionCard,
  getDefaultServiceUseCaseCard,
  getDefaultServiceVisualCard
} from 'shared/components/page-components/dynamic/service-detail-static/utils'
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

const SERVICE_URL_PREFIX = 'services/'
const editorSectionPrefix = 'service-editor'

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
    eType: 's'
  }
}

function getDefaultImageDescriptionSection() {
  return {
    sTitle: '',
    sDescription: '',
    oImg: getDefaultImage()
  }
}

function getDefaultServiceComponents() {
  return {
    oHPB: {
      sMediaUrl: '',
      eMediaType: 'v',
      oVideo: getDefaultImage(),
      sEyebrow: '',
      sTitle: '',
      sDescription: '',
      aCta: [getDefaultHeroCta(), getDefaultHeroCta()]
    },
    oSPB: {
      sMediaUrl: '',
      eMediaType: 'v',
      oVideo: getDefaultImage(),
      sEyebrow: '',
      sTitle: '',
      sDescription: '',
      aCta: [getDefaultHeroCta(), getDefaultHeroCta()],
      sContent: ''
    },
    oMID: getDefaultImageDescriptionSection(),
    oIDS: getDefaultImageDescriptionSection(),
    oWOE: {
      sTitle: '',
      sSubtitle: '',
      aFeature: [getDefaultServiceFeatureCard()]
    },
    oIIP: {
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultServiceImpactCard()]
    },
    oSAC: {
      sTitle: '',
      sSubtitle: '',
      aCard: [getDefaultServiceAnimatedScrollCard()]
    },
    oDSE: {
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultAnimatedFeatureCard()]
    },
    oSIC: {
      sTitle: '',
      sDescription: '',
      oImg: getDefaultImage(),
      oCta: getDefaultCta()
    },
    oHIP: {
      sTitle: '',
      sDescription: '',
      oImg: getDefaultImage(),
      aCard: [getDefaultFocusAreaCard()]
    },
    oPS: {
      sBadge: '',
      sTitle: '',
      sDescription: '',
      aCta: [getDefaultCta()]
    },
    oSIS: {
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultServiceSolutionCard()]
    },
    oPEM: {
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultMetricCard()],
      bIsMarquee: true,
      aMarquee: [getDefaultMarqueeLogo()]
    },
    oIAI: {
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultAnimatedFeatureCard()]
    },
    oLSC: {
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultLeadershipCard()]
    },
    oFAQ: {
      sTitle: '',
      sDescription: '',
      aFaq: [getDefaultFaqItem()]
    },
    oCSC: {
      sTitle: '',
      sDescription: '',
      oImg: getDefaultImage(),
      aCard: [getDefaultContentShowcaseCard()]
    },
    oRSC: {
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultRelevantServiceCard()]
    },
    oCB: {
      sTitle: '',
      sDescription: '',
      oImg: getDefaultImage(),
      aCta: [getDefaultCta()]
    },
    oSGP: getDefaultServiceGalleryPanel(),
    oSVC: {
      aCard: [getDefaultServiceVisualCard()]
    },
    oSIP: {
      sTitle: '',
      sDescription: '',
      aLine: [getDefaultServiceImpactLine()]
    },
    oSUC: {
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultServiceUseCaseCard()]
    },
    oSCP: {
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultServiceCapabilityCard()]
    },
    oSIA: {
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultFocusAreaCard()]
    },
    oTL: {
      sTitle: '',
      aLogo: [getDefaultLogo()]
    },
    oISG: {
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultIndustrialSectorCard()]
    }
  }
}

function getDefaultService() {
  return {
    sTitle: '',
    sDescription: '',
    oComponents: getDefaultServiceComponents(),
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

function normalizeImageDescriptionSection(value = {}) {
  return {
    sTitle: value?.sTitle || '',
    sDescription: value?.sDescription || '',
    oImg: normalizeImage(value?.oImg)
  }
}

function normalizeCta(value = {}) {
  return {
    sLabel: value?.sLabel || '',
    sUrl: value?.sUrl || ''
  }
}

function normalizeBannerSection(value = {}, defaultValue = {}) {
  const heroMediaUrl = value?.oVideo?.sUrl || value?.sMediaUrl || ''

  return {
    ...defaultValue,
    ...(value || {}),
    sMediaUrl: heroMediaUrl,
    eMediaType: normalizeBannerMediaType(value?.eMediaType),
    sEyebrow: value?.sEyebrow || '',
    sTitle: value?.sTitle || '',
    sDescription: value?.sDescription || '',
    oVideo: {
      ...(defaultValue?.oVideo || getDefaultImage()),
      ...(value?.oVideo || {}),
      sUrl: heroMediaUrl
    },
    aCta: normalizeFixedArray(value?.aCta, 2, getDefaultHeroCta, normalizeCta)
  }
}

function normalizeBannerSectionForSubmit(value = {}, { includeContent = false } = {}) {
  const nextValue = {
    sMediaUrl: value?.oVideo?.sUrl || value?.sMediaUrl || '',
    eMediaType: normalizeBannerMediaType(value?.eMediaType),
    sEyebrow: value?.sEyebrow || '',
    sTitle: value?.sTitle || '',
    sDescription: value?.sDescription || '',
    aCta: cleanCtas(value?.aCta, 2)
  }

  if (includeContent) nextValue.sContent = value?.sContent || ''

  return nextValue
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

function normalizeKeywordsForForm(value) {
  if (Array.isArray(value)) return value.join(', ')
  return value || ''
}

function normalizeServiceFormData(value = {}) {
  const data = removeTypenameKey(value) || {}
  const defaultData = getDefaultService()
  const sourceComponents = removeTypenameKey(data?.oComponents || {}) || {}
  const getComponentValue = (key) => {
    const fromComponents = sourceComponents?.[key]
    const fromRoot = data?.[key]

    if (fromComponents !== undefined && fromRoot !== undefined) {
      return { ...(fromRoot || {}), ...(fromComponents || {}) }
    }

    return fromComponents !== undefined ? fromComponents : fromRoot
  }
  const imageDescriptionValue = getComponentValue('oIDS') !== undefined ? getComponentValue('oIDS') : getComponentValue('oMID')
  const oComponents = {
    ...sourceComponents,
    oHPB: normalizeBannerSection(getComponentValue('oHPB'), defaultData.oComponents.oHPB),
    oSPB: {
      ...normalizeBannerSection(getComponentValue('oSPB'), defaultData.oComponents.oSPB),
      sContent: getComponentValue('oSPB')?.sContent || ''
    },
    oMID: normalizeImageDescriptionSection(getComponentValue('oMID')),
    oIDS: normalizeImageDescriptionSection(imageDescriptionValue),
    oWOE: {
      sTitle: getComponentValue('oWOE')?.sTitle || '',
      sSubtitle: getComponentValue('oWOE')?.sSubtitle || '',
      aFeature: normalizeArray(getComponentValue('oWOE')?.aFeature, getDefaultServiceFeatureCard, (item = {}) => ({
        sTitle: item?.sTitle || '',
        sDescription: item?.sDescription || '',
        oIcon: normalizeImage(item?.oIcon)
      }))
    },
    oIIP: {
      sTitle: getComponentValue('oIIP')?.sTitle || '',
      sDescription: getComponentValue('oIIP')?.sDescription || '',
      aCard: normalizeArray(getComponentValue('oIIP')?.aCard, getDefaultServiceImpactCard, (card = {}) => ({
        sValue: card?.sValue || '',
        sLabel: card?.sLabel || ''
      }))
    },
    oSAC: {
      sTitle: getComponentValue('oSAC')?.sTitle || '',
      sSubtitle: getComponentValue('oSAC')?.sSubtitle || '',
      aCard: normalizeArray(getComponentValue('oSAC')?.aCard, getDefaultServiceAnimatedScrollCard, (card = {}) => ({
        sTitle: card?.sTitle || '',
        sDescription: card?.sDescription || '',
        oLogo: normalizeImage(card?.oLogo),
        oCta: normalizeCta(card?.oCta)
      }))
    },
    oDSE: {
      sTitle: getComponentValue('oDSE')?.sTitle || '',
      sDescription: getComponentValue('oDSE')?.sDescription || '',
      aCard: normalizeArray(getComponentValue('oDSE')?.aCard, getDefaultAnimatedFeatureCard, (card = {}) => ({
        sTitle: card?.sTitle || '',
        sDescription: card?.sDescription || '',
        oImg: normalizeImage(card?.oImg),
        sSlug: card?.sSlug || ''
      }))
    },
    oSIC: {
      sTitle: getComponentValue('oSIC')?.sTitle || '',
      sDescription: getComponentValue('oSIC')?.sDescription || '',
      oImg: normalizeImage(getComponentValue('oSIC')?.oImg),
      oCta: normalizeCta(getComponentValue('oSIC')?.oCta)
    },
    oHIP: {
      sTitle: getComponentValue('oHIP')?.sTitle || '',
      sDescription: getComponentValue('oHIP')?.sDescription || '',
      oImg: normalizeImage(getComponentValue('oHIP')?.oImg),
      aCard: normalizeArray(getComponentValue('oHIP')?.aCard, getDefaultFocusAreaCard, (card = {}) => ({
        sTitle: card?.sTitle || '',
        sDescription: card?.sDescription || ''
      }))
    },
    oPS: {
      sBadge: getComponentValue('oPS')?.sBadge || '',
      sTitle: getComponentValue('oPS')?.sTitle || '',
      sDescription: getComponentValue('oPS')?.sDescription || '',
      aCta: normalizeFixedArray(getComponentValue('oPS')?.aCta, 1, getDefaultCta, normalizeCta)
    },
    oSIS: {
      sTitle: getComponentValue('oSIS')?.sTitle || '',
      sDescription: getComponentValue('oSIS')?.sDescription || '',
      aCard: normalizeArray(getComponentValue('oSIS')?.aCard, getDefaultServiceSolutionCard, (card = {}) => ({
        oImg: normalizeImage(card?.oImg),
        sTitle: card?.sTitle || '',
        sDescription: card?.sDescription || '',
        sLinkText: card?.sLinkText || '',
        sSlug: card?.sSlug || ''
      }))
    },
    oPEM: {
      sTitle: getComponentValue('oPEM')?.sTitle || '',
      sDescription: getComponentValue('oPEM')?.sDescription || '',
      aCard: normalizeArray(getComponentValue('oPEM')?.aCard, getDefaultMetricCard, (card = {}) => ({
        sLabel: card?.sLabel || '',
        sValue: card?.sValue || ''
      })),
      bIsMarquee: typeof getComponentValue('oPEM')?.bIsMarquee === 'boolean' ? getComponentValue('oPEM').bIsMarquee : true,
      aMarquee: normalizeArray(getComponentValue('oPEM')?.aMarquee, getDefaultMarqueeLogo, (item = {}) => ({
        oImg: normalizeImage(item?.oImg)
      }))
    },
    oIAI: {
      sTitle: getComponentValue('oIAI')?.sTitle || '',
      sDescription: getComponentValue('oIAI')?.sDescription || '',
      aCard: normalizeArray(getComponentValue('oIAI')?.aCard, getDefaultAnimatedFeatureCard, (card = {}) => ({
        sTitle: card?.sTitle || '',
        sDescription: card?.sDescription || '',
        oImg: normalizeImage(card?.oImg),
        sRedirectUrl: card?.sRedirectUrl || card?.sSlug || ''
      }))
    },
    oLSC: {
      sTitle: getComponentValue('oLSC')?.sTitle || '',
      sDescription: getComponentValue('oLSC')?.sDescription || '',
      aCard: normalizeArray(getComponentValue('oLSC')?.aCard, getDefaultLeadershipCard, (card = {}) => ({
        oImg: normalizeImage(card?.oImg),
        sName: card?.sName || '',
        sRole: card?.sRole || '',
        sRedirectUrl: card?.sRedirectUrl || '',
        eTarget: card?.eTarget || '_self'
      }))
    },
    oFAQ: {
      sTitle: getComponentValue('oFAQ')?.sTitle || '',
      sDescription: getComponentValue('oFAQ')?.sDescription || '',
      aFaq: normalizeArray(getComponentValue('oFAQ')?.aFaq, getDefaultFaqItem, (item = {}) => ({
        sQuestion: item?.sQuestion || '',
        sAnswer: item?.sAnswer || ''
      }))
    },
    oCSC: {
      sTitle: getComponentValue('oCSC')?.sTitle || '',
      sDescription: getComponentValue('oCSC')?.sDescription || '',
      oImg: normalizeImage(getComponentValue('oCSC')?.oImg),
      aCard: normalizeArray(getComponentValue('oCSC')?.aCard, getDefaultContentShowcaseCard, (card = {}) => ({
        sBadge: card?.sBadge || '',
        sMeta: card?.sMeta || '',
        sTitle: card?.sTitle || '',
        sDescription: card?.sDescription || '',
        sRedirectUrl: card?.sRedirectUrl || '',
        eTarget: card?.eTarget || '_self',
        sSlug: card?.sSlug || ''
      }))
    },
    oRSC: {
      sTitle: getComponentValue('oRSC')?.sTitle || '',
      sDescription: getComponentValue('oRSC')?.sDescription || '',
      aCard: normalizeArray(getComponentValue('oRSC')?.aCard, getDefaultRelevantServiceCard, (card = {}) => ({
        oImg: normalizeImage(card?.oImg),
        sTitle: card?.sTitle || '',
        sRedirectUrl: card?.sRedirectUrl || '',
        eTarget: card?.eTarget || '_self',
        sSlug: card?.sSlug || ''
      }))
    },
    oCB: {
      sTitle: getComponentValue('oCB')?.sTitle || '',
      sDescription: getComponentValue('oCB')?.sDescription || '',
      oImg: normalizeImage(getComponentValue('oCB')?.oImg),
      aCta: normalizeFixedArray(getComponentValue('oCB')?.aCta, 1, getDefaultCta, normalizeCta)
    },
    oSGP: {
      sTitle: getComponentValue('oSGP')?.sTitle || '',
      sContent: getComponentValue('oSGP')?.sContent || '',
      oImgTopLeft: normalizeImage(getComponentValue('oSGP')?.oImgTopLeft),
      oImgBottomLeft: normalizeImage(getComponentValue('oSGP')?.oImgBottomLeft),
      oImgTopRight: normalizeImage(getComponentValue('oSGP')?.oImgTopRight),
      oImgBottomRight: normalizeImage(getComponentValue('oSGP')?.oImgBottomRight)
    },
    oSVC: {
      aCard: normalizeArray(getComponentValue('oSVC')?.aCard, getDefaultServiceVisualCard, (card = {}) => ({
        sTag: card?.sTag || '',
        sTitle: card?.sTitle || '',
        sDescription: card?.sDescription || '',
        oImgTop: normalizeImage(card?.oImgTop),
        oImgBottomLeft: normalizeImage(card?.oImgBottomLeft),
        oImgBottomRight: normalizeImage(card?.oImgBottomRight)
      }))
    },
    oSIP: {
      sTitle: getComponentValue('oSIP')?.sTitle || '',
      sDescription: getComponentValue('oSIP')?.sDescription || '',
      aLine: normalizeArray(getComponentValue('oSIP')?.aLine, getDefaultServiceImpactLine, (line = {}) => ({
        sDescription: line?.sDescription || '',
        sValue: line?.sValue || '',
        sLabel: line?.sLabel || ''
      }))
    },
    oSUC: {
      sTitle: getComponentValue('oSUC')?.sTitle || '',
      sDescription: getComponentValue('oSUC')?.sDescription || '',
      aCard: normalizeArray(getComponentValue('oSUC')?.aCard, getDefaultServiceUseCaseCard, (card = {}) => ({
        sTag: card?.sTag || '',
        oImg: normalizeImage(card?.oImg),
        sTitle: card?.sTitle || '',
        sDescription: card?.sDescription || '',
        sSlug: card?.sSlug || ''
      }))
    },
    oSCP: {
      sTitle: getComponentValue('oSCP')?.sTitle || '',
      sDescription: getComponentValue('oSCP')?.sDescription || '',
      aCard: normalizeArray(getComponentValue('oSCP')?.aCard, getDefaultServiceCapabilityCard, (card = {}) => ({
        oLogo: normalizeImage(card?.oLogo),
        sTitle: card?.sTitle || '',
        sDescription: card?.sDescription || '',
        sSlug: card?.sSlug || ''
      }))
    },
    oSIA: {
      sTitle: getComponentValue('oSIA')?.sTitle || '',
      sDescription: getComponentValue('oSIA')?.sDescription || '',
      aCard: normalizeArray(getComponentValue('oSIA')?.aCard, getDefaultFocusAreaCard, (card = {}) => ({
        sTitle: card?.sTitle || '',
        sDescription: card?.sDescription || ''
      }))
    },
    oTL: {
      sTitle: getComponentValue('oTL')?.sTitle || '',
      aLogo: normalizeArray(getComponentValue('oTL')?.aLogo, getDefaultLogo, (item = {}) => ({
        oImg: normalizeImage(item?.oImg)
      }))
    },
    oISG: {
      sTitle: getComponentValue('oISG')?.sTitle || '',
      sDescription: getComponentValue('oISG')?.sDescription || '',
      aCard: normalizeArray(getComponentValue('oISG')?.aCard, getDefaultIndustrialSectorCard, (card = {}) => ({
        oIcon: normalizeImage(card?.oIcon),
        sTitle: card?.sTitle || '',
        sDescription: card?.sDescription || '',
        sUrl: card?.sUrl || ''
      }))
    }
  }

  return normalizePageNamespaceComponents({
    ...defaultData,
    ...data,
    sTitle: data?.sTitle || '',
    sDescription: data?.sDescription || '',
    aComponent: (Array.isArray(data?.aComponent) ? data.aComponent : []).map(normalizePageComponent),
    oComponents,
    oSeo: {
      ...defaultData.oSeo,
      ...(data?.oSeo || {}),
      eType: 's',
      sSlug: stripRepeatedPrefix(data?.oSeo?.sSlug, SERVICE_URL_PREFIX),
      sCUrl: stripRepeatedPrefix(data?.oSeo?.sCUrl, SERVICE_URL_PREFIX),
      sRobots: data?.oSeo?.sRobots || META_ROBOTS[0],
      aKeywords: normalizeKeywordsForForm(data?.oSeo?.aKeywords)
    }
  }, 's')
}

function cleanCtas(items = [], limit) {
  const nextItems = (Array.isArray(items) ? items : [])
    .map((item) => normalizeCta(item))
    .filter((item) => item.sLabel || item.sUrl)

  return typeof limit === 'number' ? nextItems.slice(0, limit) : nextItems
}

function normalizeServiceForSubmit(data = {}) {
  const rawValue = removeTypenameKey(data) || {}
  const componentValue = removeTypenameKey(rawValue?.oComponents || {}) || rawValue
  const value = {
    ...componentValue,
    sTitle: rawValue?.sTitle || '',
    sDescription: rawValue?.sDescription || '',
    aComponent: rawValue?.aComponent || [],
    oSeo: rawValue?.oSeo || {}
  }
  const imageDescriptionValue = value?.oIDS !== undefined ? value.oIDS : value?.oMID

  return {
    ...componentValue,
    sTitle: value?.sTitle || '',
    sDescription: value?.sDescription || '',
    oHPB: normalizeBannerSectionForSubmit(value?.oHPB),
    oSPB: normalizeBannerSectionForSubmit(value?.oSPB, { includeContent: true }),
    oMID: normalizeImageDescriptionSection(value?.oMID),
    oIDS: normalizeImageDescriptionSection(imageDescriptionValue),
    oWOE: {
      sTitle: value?.oWOE?.sTitle || '',
      sSubtitle: value?.oWOE?.sSubtitle || '',
      aFeature: (Array.isArray(value?.oWOE?.aFeature) ? value.oWOE.aFeature : [])
        .map((item = {}) => ({
          sTitle: item?.sTitle || '',
          sDescription: item?.sDescription || '',
          oIcon: normalizeImage(item?.oIcon)
        }))
        .filter((item) => item?.sTitle || item?.sDescription || item?.oIcon?.sUrl || item?.oIcon?.sText)
    },
    oIIP: {
      sTitle: value?.oIIP?.sTitle || '',
      sDescription: value?.oIIP?.sDescription || '',
      aCard: (Array.isArray(value?.oIIP?.aCard) ? value.oIIP.aCard : [])
        .map((card = {}) => ({
          sValue: card?.sValue || '',
          sLabel: card?.sLabel || ''
        }))
        .filter((card) => card?.sValue || card?.sLabel)
    },
    oSAC: {
      sTitle: value?.oSAC?.sTitle || '',
      sSubtitle: value?.oSAC?.sSubtitle || '',
      aCard: (Array.isArray(value?.oSAC?.aCard) ? value.oSAC.aCard : [])
        .map((card = {}) => ({
          sTitle: card?.sTitle || '',
          sDescription: card?.sDescription || '',
          oLogo: normalizeImage(card?.oLogo),
          oCta: normalizeCta(card?.oCta)
        }))
        .filter((card) => card?.sTitle || card?.sDescription || card?.oLogo?.sUrl || card?.oLogo?.sText || card?.oCta?.sLabel || card?.oCta?.sUrl)
    },
    oDSE: {
      sTitle: value?.oDSE?.sTitle || '',
      sDescription: value?.oDSE?.sDescription || '',
      aCard: (Array.isArray(value?.oDSE?.aCard) ? value.oDSE.aCard : [])
        .map((card = {}) => ({
          sTitle: card?.sTitle || '',
          sDescription: card?.sDescription || '',
          oImg: normalizeImage(card?.oImg),
          sSlug: card?.sSlug || ''
        }))
        .filter((card) => card?.sTitle || card?.sDescription || card?.sSlug || card?.oImg?.sUrl || card?.oImg?.sText)
    },
    oSIC: {
      sTitle: value?.oSIC?.sTitle || '',
      sDescription: value?.oSIC?.sDescription || '',
      oImg: normalizeImage(value?.oSIC?.oImg),
      oCta: normalizeCta(value?.oSIC?.oCta)
    },
    oHIP: {
      sTitle: value?.oHIP?.sTitle || '',
      sDescription: value?.oHIP?.sDescription || '',
      oImg: normalizeImage(value?.oHIP?.oImg),
      aCard: (Array.isArray(value?.oHIP?.aCard) ? value.oHIP.aCard : [])
        .map((card = {}) => ({
          sTitle: card?.sTitle || '',
          sDescription: card?.sDescription || ''
        }))
        .filter((card) => card?.sTitle || card?.sDescription)
    },
    oPS: {
      sBadge: value?.oPS?.sBadge || '',
      sTitle: value?.oPS?.sTitle || '',
      sDescription: value?.oPS?.sDescription || '',
      aCta: cleanCtas(value?.oPS?.aCta, 1)
    },
    oSIS: {
      sTitle: value?.oSIS?.sTitle || '',
      sDescription: value?.oSIS?.sDescription || '',
      aCard: (Array.isArray(value?.oSIS?.aCard) ? value.oSIS.aCard : [])
        .map((card = {}) => ({
          oImg: normalizeImage(card?.oImg),
          sTitle: card?.sTitle || '',
          sDescription: card?.sDescription || '',
          sLinkText: card?.sLinkText || '',
          sSlug: card?.sSlug || ''
        }))
        .filter((card) => card?.sTitle || card?.sDescription || card?.sLinkText || card?.sSlug || card?.oImg?.sUrl || card?.oImg?.sText)
    },
    oPEM: {
      sTitle: value?.oPEM?.sTitle || '',
      sDescription: value?.oPEM?.sDescription || '',
      aCard: (Array.isArray(value?.oPEM?.aCard) ? value.oPEM.aCard : [])
        .map((card = {}) => ({
          sLabel: card?.sLabel || '',
          sValue: card?.sValue || ''
        }))
        .filter((card) => card?.sLabel || card?.sValue),
      bIsMarquee: Boolean(value?.oPEM?.bIsMarquee),
      aMarquee: (Array.isArray(value?.oPEM?.aMarquee) ? value.oPEM.aMarquee : [])
        .map((item = {}) => ({
          oImg: normalizeImage(item?.oImg)
        }))
        .filter((item) => item?.oImg?.sUrl || item?.oImg?.sText)
    },
    oIAI: {
      sTitle: value?.oIAI?.sTitle || '',
      sDescription: value?.oIAI?.sDescription || '',
      aCard: (Array.isArray(value?.oIAI?.aCard) ? value.oIAI.aCard : [])
        .map((card = {}) => ({
          sTitle: card?.sTitle || '',
          sDescription: card?.sDescription || '',
          oImg: normalizeImage(card?.oImg),
          sRedirectUrl: card?.sRedirectUrl || ''
        }))
        .filter((card) => card?.sTitle || card?.sDescription || card?.sRedirectUrl || card?.oImg?.sUrl || card?.oImg?.sText)
    },
    oLSC: {
      sTitle: value?.oLSC?.sTitle || '',
      sDescription: value?.oLSC?.sDescription || '',
      aCard: (Array.isArray(value?.oLSC?.aCard) ? value.oLSC.aCard : [])
        .map((card = {}) => ({
          oImg: normalizeImage(card?.oImg),
          sName: card?.sName || '',
          sRole: card?.sRole || '',
          sRedirectUrl: card?.sRedirectUrl || '',
          eTarget: card?.eTarget || '_self'
        }))
        .filter((card) => card?.sName || card?.sRole || card?.sRedirectUrl || card?.oImg?.sUrl || card?.oImg?.sText)
    },
    oFAQ: {
      sTitle: value?.oFAQ?.sTitle || '',
      sDescription: value?.oFAQ?.sDescription || '',
      aFaq: (Array.isArray(value?.oFAQ?.aFaq) ? value.oFAQ.aFaq : [])
        .map((item = {}) => ({
          sQuestion: item?.sQuestion || '',
          sAnswer: item?.sAnswer || ''
        }))
        .filter((item) => item?.sQuestion || item?.sAnswer)
    },
    oCSC: {
      sTitle: value?.oCSC?.sTitle || '',
      sDescription: value?.oCSC?.sDescription || '',
      oImg: normalizeImage(value?.oCSC?.oImg),
      aCard: (Array.isArray(value?.oCSC?.aCard) ? value.oCSC.aCard : [])
        .map((card = {}) => ({
          sBadge: card?.sBadge || '',
          sMeta: card?.sMeta || '',
          sTitle: card?.sTitle || '',
          sDescription: card?.sDescription || '',
          sRedirectUrl: card?.sRedirectUrl || '',
          eTarget: card?.eTarget || '_self',
          sSlug: card?.sSlug || ''
        }))
        .filter((card) => card?.sBadge || card?.sMeta || card?.sTitle || card?.sDescription || card?.sRedirectUrl || card?.sSlug)
    },
    oRSC: {
      sTitle: value?.oRSC?.sTitle || '',
      sDescription: value?.oRSC?.sDescription || '',
      aCard: (Array.isArray(value?.oRSC?.aCard) ? value.oRSC.aCard : [])
        .map((card = {}) => ({
          oImg: normalizeImage(card?.oImg),
          sTitle: card?.sTitle || '',
          sRedirectUrl: card?.sRedirectUrl || '',
          eTarget: card?.eTarget || '_self',
          sSlug: card?.sSlug || ''
        }))
        .filter((card) => card?.sTitle || card?.sRedirectUrl || card?.sSlug || card?.oImg?.sUrl || card?.oImg?.sText)
    },
    oCB: {
      sTitle: value?.oCB?.sTitle || '',
      sDescription: value?.oCB?.sDescription || '',
      oImg: normalizeImage(value?.oCB?.oImg),
      aCta: cleanCtas(value?.oCB?.aCta, 1)
    },
    oSGP: {
      sTitle: value?.oSGP?.sTitle || '',
      sContent: value?.oSGP?.sContent || '',
      oImgTopLeft: normalizeImage(value?.oSGP?.oImgTopLeft),
      oImgBottomLeft: normalizeImage(value?.oSGP?.oImgBottomLeft),
      oImgTopRight: normalizeImage(value?.oSGP?.oImgTopRight),
      oImgBottomRight: normalizeImage(value?.oSGP?.oImgBottomRight)
    },
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
    oSIP: {
      sTitle: value?.oSIP?.sTitle || '',
      sDescription: value?.oSIP?.sDescription || '',
      aLine: (Array.isArray(value?.oSIP?.aLine) ? value.oSIP.aLine : [])
        .map((line = {}) => ({
          sDescription: line?.sDescription || '',
          sValue: line?.sValue || '',
          sLabel: line?.sLabel || ''
        }))
        .filter((line) => line?.sDescription || line?.sValue || line?.sLabel)
    },
    oSUC: {
      sTitle: value?.oSUC?.sTitle || '',
      sDescription: value?.oSUC?.sDescription || '',
      aCard: (Array.isArray(value?.oSUC?.aCard) ? value.oSUC.aCard : [])
        .map((card = {}) => ({
          sTag: card?.sTag || '',
          oImg: normalizeImage(card?.oImg),
          sTitle: card?.sTitle || '',
          sDescription: card?.sDescription || '',
          sSlug: card?.sSlug || ''
        }))
        .filter((card) => card?.sTag || card?.sTitle || card?.sDescription || card?.sSlug || card?.oImg?.sUrl || card?.oImg?.sText)
    },
    oSCP: {
      sTitle: value?.oSCP?.sTitle || '',
      sDescription: value?.oSCP?.sDescription || '',
      aCard: (Array.isArray(value?.oSCP?.aCard) ? value.oSCP.aCard : [])
        .map((card = {}) => ({
          oLogo: normalizeImage(card?.oLogo),
          sTitle: card?.sTitle || '',
          sDescription: card?.sDescription || '',
          sSlug: card?.sSlug || ''
        }))
        .filter((card) => card?.sTitle || card?.sDescription || card?.sSlug || card?.oLogo?.sUrl || card?.oLogo?.sText)
    },
    oSIA: {
      sTitle: value?.oSIA?.sTitle || '',
      sDescription: value?.oSIA?.sDescription || '',
      aCard: (Array.isArray(value?.oSIA?.aCard) ? value.oSIA.aCard : [])
        .map((card = {}) => ({
          sTitle: card?.sTitle || '',
          sDescription: card?.sDescription || ''
        }))
        .filter((card) => card?.sTitle || card?.sDescription)
    },
    oTL: {
      sTitle: value?.oTL?.sTitle || '',
      aLogo: (Array.isArray(value?.oTL?.aLogo) ? value.oTL.aLogo : [])
        .map((item = {}) => ({
          oImg: normalizeImage(item?.oImg)
        }))
        .filter((item) => item?.oImg?.sUrl || item?.oImg?.sText)
    },
    oISG: {
      sTitle: value?.oISG?.sTitle || '',
      sDescription: value?.oISG?.sDescription || '',
      aCard: (Array.isArray(value?.oISG?.aCard) ? value.oISG.aCard : [])
        .map((card = {}) => ({
          oIcon: normalizeImage(card?.oIcon),
          sTitle: card?.sTitle || '',
          sDescription: card?.sDescription || '',
          sUrl: card?.sUrl || ''
        }))
        .filter((card) => card?.sTitle || card?.sDescription || card?.sUrl || card?.oIcon?.sUrl || card?.oIcon?.sText)
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

function hasMeaningfulSeoValue(value = {}) {
  return hasMeaningfulValue({
    sTitle: value?.sTitle,
    sDescription: value?.sDescription,
    sSlug: value?.sSlug,
    aKeywords: value?.aKeywords,
    sCUrl: value?.sCUrl,
    oFB: value?.oFB,
    oTwitter: value?.oTwitter
  })
}

function getCleanSocialSeo(value = {}) {
  return {
    sTitle: value?.sTitle || '',
    sDescription: value?.sDescription || '',
    sUrl: value?.sUrl || ''
  }
}

function cleanSeoKeywords(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean)
  return String(value || '').split(',').map((item) => item.trim()).filter(Boolean)
}

function AddEditService() {
  const { id } = useParams()
  const history = useHistory()
  const allowUnsavedChangesNavigation = useAllowUnsavedChangesNavigation()
  const methods = useForm({ mode: 'all', defaultValues: getDefaultService() })
  const { dispatch } = useContext(ToastrContext)
  const defaultURL = SERVICE_URL_PREFIX

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

  const serviceTitle = watch('sTitle')
  const selectedComponents = watch('aComponent') || []
  const sections = buildEditorSections({
    basicsLabel: 'Service Basics',
    seoLabel: 'SEO',
    components: selectedComponents,
    anchorPrefix: editorSectionPrefix
  })
  const basicsSectionId = getEditorStaticSectionId(editorSectionPrefix, 'basics')
  const seoSectionId = getEditorStaticSectionId(editorSectionPrefix, 'seo')
  const { activeSectionId, handleJumpToSection } = useEditorSectionNavigation(sections)

  const { data: service } = useQuery(GET_SERVICE, {
    variables: { input: { _id: id } },
    skip: !id,
    onCompleted: (data) => {
      if (data?.getService) {
        setFormValue(data?.getService)
      }
    }
  })
  const serviceComponents = service?.getService?.oComponents || {}

  const previewFallbackImage =
    service?.getService?.oSeo?.oFB?.sUrl ||
    service?.getService?.oSeo?.oTwitter?.sUrl ||
    (serviceComponents?.oSPB?.eMediaType === 'i' && serviceComponents?.oSPB?.sMediaUrl) ||
    (serviceComponents?.oHPB?.eMediaType === 'i' && serviceComponents?.oHPB?.sMediaUrl) ||
    ''

  const [create, { loading }] = useMutation(CREATE_SERVICES, {
    onCompleted: (data) => {
      if (data?.createService) {
        allowUnsavedChangesNavigation()
        history.push(allRoutes.services)
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data?.createService?.sMessage, type: TOAST_TYPE.Success }
        })
      }
    }
  })

  const [edit, { loading: editLoading }] = useMutation(EDIT_SERVICES, {
    onCompleted: (data) => {
      if (data?.editService) {
        allowUnsavedChangesNavigation()
        history.push(allRoutes.services)
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data?.editService?.sMessage, type: TOAST_TYPE.Success }
        })
      }
    }
  })

  function setFormValue(value) {
    reset(normalizeServiceFormData(value))
  }

  useEffect(() => {
    selectedComponents.forEach((component) => {
      const componentBasePath = getPageComponentBasePath(component, '', 's')
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
    const spb = components?.oSPB || data?.oSPB
    const hpb = components?.oHPB || data?.oHPB
    const fallbackSeoImage =
      (spb?.eMediaType === 'i' ? spb?.oVideo?.sUrl || spb?.sMediaUrl || '' : '') ||
      (hpb?.eMediaType === 'i' ? hpb?.oVideo?.sUrl || hpb?.sMediaUrl || '' : '')
    const oSeo = {
      sTitle: currentSeo?.sTitle || '',
      sDescription: currentSeo?.sDescription || '',
      sSlug: currentSeo?.sSlug || '',
      aKeywords: currentSeo?.aKeywords || '',
      oFB: getCleanSocialSeo(currentSeo?.oFB),
      oTwitter: getCleanSocialSeo(currentSeo?.oTwitter),
      sCUrl: currentSeo?.sCUrl || '',
      sRobots: currentSeo?.sRobots || META_ROBOTS[0],
      eType: 's'
    }

    if (!hasMeaningfulSeoValue(oSeo)) return undefined

    ;['oFB', 'oTwitter'].forEach((platform) => {
      if (!oSeo?.[platform]) oSeo[platform] = {}
      if (!oSeo?.[platform]?.sUrl) oSeo[platform].sUrl = fallbackSeoImage
      if (!oSeo?.[platform]?.sTitle) oSeo[platform].sTitle = oSeo?.sTitle
      if (!oSeo?.[platform]?.sDescription) oSeo[platform].sDescription = oSeo?.sDescription
    })

    return oSeo
  }

  function onSubmit(value) {
    const duplicateDataKeys = findDuplicatePageComponentDataKeys(value?.aComponent, 's')
    if (duplicateDataKeys.length) {
      setError('aComponent', {
        type: 'validate',
        message: 'Selected components contain duplicate data sections. Remove duplicate component types before saving.'
      })
      return
    }

    clearErrors('aComponent')

    const normalizedData = normalizeServiceForSubmit(value)
    const componentPayload = buildPageNamespacePayload({
      aComponent: normalizedData?.aComponent,
      oComponents: normalizedData
    }, 's')
    const data = {
      sTitle: normalizedData?.sTitle || '',
      sDescription: normalizedData?.sDescription || '',
      ...componentPayload,
      oSeo: normalizedData?.oSeo
    }
    const seoData = prepareSeoData(data)

    if (seoData) {
      seoData.aKeywords = cleanSeoKeywords(seoData.aKeywords)
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
          ePageComponentType="s"
          includeAllWithoutPermission
          variant="sticky"
        />
        <Row>
          <Col lg="9">
            <div className="d-lg-none mb-3">
              <EditorSectionNavigator sections={sections} activeSectionId={activeSectionId} onJump={handleJumpToSection} mobileMode />
            </div>
            <div id={basicsSectionId} className="editor-section-target">
              <Form.Label className="text-uppercase small text-muted mb-3">Service Basics</Form.Label>
              <CountInput
                placeholder="Service Title"
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
            <AddPageComponentsList name="aComponent" namespace="" pageType="s" anchorPrefix={editorSectionPrefix} />
            <div id={seoSectionId} className="editor-section-target mt-4">
              <Form.Label className="text-uppercase small text-muted mb-3">SEO</Form.Label>
              <input type="hidden" value="s" {...register('oSeo.eType')} />
              <CommonSEO
                register={register}
                errors={errors}
                values={getValues()}
                setError={setError}
                clearErrors={clearErrors}
                previewURL={previewFallbackImage}
                fbImg={service?.getService?.oSeo?.oFB?.sUrl || previewFallbackImage}
                twitterImg={service?.getService?.oSeo?.oTwitter?.sUrl || previewFallbackImage}
                setValue={setValue}
                control={control}
                id={id}
                slugType={'s'}
                slug={serviceTitle && defaultURL ? `${defaultURL}${serviceTitle}` : serviceTitle || undefined}
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

export default AddEditService
