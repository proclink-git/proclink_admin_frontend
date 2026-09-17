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
import { removeTypenameKey } from 'shared/utils'
import { allRoutes } from 'shared/constants/AllRoutes'
import { GET_INDUSTRY } from 'graph-ql/Industries/query'
import { ADD_INDUSTRY, EDIT_INDUSTRY } from 'graph-ql/Industries/mutation'
import CountInput from 'shared/components/count-input'
import { getDefaultHeroCta } from 'shared/components/page-components/home-banner/row'
import {
  getDefaultAnimatedFeatureCard,
  getDefaultContentShowcaseCard,
  getDefaultCta,
  getDefaultFaqItem,
  getDefaultFocusAreaCard,
  getDefaultImage,
  getDefaultIndustrialSectorCard,
  getDefaultLeadershipCard,
  getDefaultMarqueeLogo,
  getDefaultMediaReference,
  getDefaultMetricCard,
  getDefaultRelevantServiceCard,
  getDefaultTransformationStat,
  getDefaultTransformationImpactCard
} from 'shared/components/page-components/dynamic/industry-detail-static/utils'
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

const INDUSTRY_URL_PREFIX = 'industries/'

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
    eType: 'i'
  }
}

function getDefaultIndustryComponents() {
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
    oMTI: {
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultTransformationImpactCard()],
      oTopLeft: getDefaultMediaReference(),
      oBottomRight: getDefaultMediaReference()
    },
    oTIS: {
      sTitle: '',
      sDescription: '',
      sContent: '',
      aStat: [getDefaultTransformationStat()]
    },
    oIOV: {
      sTitle: '',
      sContent: ''
    },
    oKOD: {
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultFocusAreaCard()]
    },
    oDSE: {
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultAnimatedFeatureCard()]
    },
    oDMM: {
      sMainDescription: '',
      sDescription: '',
      oImgLeft: getDefaultImage(),
      oImgRight: getDefaultImage()
    },
    oISG: {
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultIndustrialSectorCard()]
    },
    oPS: {
      sBadge: '',
      sTitle: '',
      sDescription: '',
      aCta: [getDefaultCta()]
    },
    oTFA: {
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultFocusAreaCard()]
    },
    oPEM: {
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultMetricCard()],
      bIsMarquee: true,
      aMarquee: [getDefaultMarqueeLogo()]
    },
    oAFC: {
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
    oITB: {
      sTitle: '',
      sDescription: '',
      oCta: getDefaultCta()
    },
    oOVG: {
      sTitle: '',
      aCard: [getDefaultAnimatedFeatureCard()]
    }
  }
}

function getDefaultIndustry() {
  return {
    sTitle: '',
    sDescription: '',
    oComponents: getDefaultIndustryComponents(),
    aComponent: [],
    oImg: getDefaultImage(),
    oIcon: getDefaultImage(),
    sIconDescription: '',
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

function normalizeMediaReference(value = {}) {
  const data = removeTypenameKey(value) || {}
  return {
    ...getDefaultMediaReference(),
    sUrl: data?.sUrl || data?.sMediaUrl || '',
    sMediaUrl: data?.sMediaUrl || '',
    eMediaType: normalizeBannerMediaType(data?.eMediaType)
  }
}

function buildMediaReferencePayload(value = {}) {
  return {
    sMediaUrl: value?.sUrl || value?.sMediaUrl || '',
    eMediaType: normalizeBannerMediaType(value?.eMediaType)
  }
}

function normalizeCta(value = {}) {
  return {
    sLabel: value?.sLabel || '',
    sUrl: value?.sUrl || ''
  }
}

function normalizePageComponent(component = {}) {
  return normalizePageComponentForForm(component)
}

function normalizeComponentSelection(component = {}) {
  return normalizeComponentSelectionForPayload(component)
}

function stripRepeatedPrefix(value = '', prefix = '') {
  let nextValue = String(value || '')
  const normalizedPrefix = String(prefix || '')

  if (!normalizedPrefix) return nextValue

  while (nextValue.startsWith(normalizedPrefix)) {
    nextValue = nextValue.slice(normalizedPrefix.length)
  }

  return nextValue
}

function normalizeIndustryFormData(value = {}) {
  const rawData = removeTypenameKey(value) || {}
  const sourceComponents = removeTypenameKey(rawData?.oComponents || {}) || {}
  const data = { ...rawData, ...sourceComponents }
  const defaultData = getDefaultIndustry()
  const defaultComponents = defaultData.oComponents
  const heroMediaUrl = data?.oHPB?.oVideo?.sUrl || data?.oHPB?.sMediaUrl || ''

  return normalizePageNamespaceComponents({
    ...defaultData,
    ...rawData,
    sTitle: rawData?.sTitle || '',
    sDescription: rawData?.sDescription || '',
    oComponents: {
      ...sourceComponents,
      oHPB: {
        ...defaultComponents.oHPB,
        ...(data?.oHPB || {}),
        sMediaUrl: heroMediaUrl,
        eMediaType: normalizeBannerMediaType(data?.oHPB?.eMediaType),
        oVideo: {
          ...defaultComponents.oHPB.oVideo,
          sUrl: heroMediaUrl
        },
        aCta: normalizeFixedArray(data?.oHPB?.aCta, 2, getDefaultHeroCta, (cta = {}) => ({
          sLabel: cta?.sLabel || '',
          sUrl: cta?.sUrl || ''
        }))
      },
      oMTI: {
        sTitle: data?.oMTI?.sTitle || '',
        sDescription: data?.oMTI?.sDescription || '',
        aCard: normalizeArray(data?.oMTI?.aCard, getDefaultTransformationImpactCard, (card = {}) => ({
          sNumber: card?.sNumber || '',
          sTitle: card?.sTitle || ''
        })),
        oTopLeft: normalizeMediaReference(data?.oMTI?.oTopLeft),
        oBottomRight: normalizeMediaReference(data?.oMTI?.oBottomRight)
      },
      oTIS: {
        sTitle: data?.oTIS?.sTitle || '',
        sDescription: data?.oTIS?.sDescription || '',
        sContent: data?.oTIS?.sContent || '',
        aStat: normalizeArray(data?.oTIS?.aStat, getDefaultTransformationStat, (stat = {}) => ({
          sValue: stat?.sValue || '',
          sLabel: stat?.sLabel || '',
          sDescription: stat?.sDescription || ''
        }))
      },
      oIOV: {
        sTitle: data?.oIOV?.sTitle || '',
        sContent: data?.oIOV?.sContent || ''
      },
      oKOD: {
        sTitle: data?.oKOD?.sTitle || '',
        sDescription: data?.oKOD?.sDescription || '',
        aCard: normalizeArray(data?.oKOD?.aCard, getDefaultFocusAreaCard, (card = {}) => ({
          sTitle: card?.sTitle || '',
          sDescription: card?.sDescription || '',
          sSlug: card?.sSlug || ''
        }))
      },
      oDSE: {
        sTitle: data?.oDSE?.sTitle || '',
        sDescription: data?.oDSE?.sDescription || '',
        aCard: normalizeArray(data?.oDSE?.aCard, getDefaultAnimatedFeatureCard, (card = {}) => ({
          sTitle: card?.sTitle || '',
          sDescription: card?.sDescription || '',
          oImg: normalizeImage(card?.oImg),
          sSlug: card?.sSlug || ''
        }))
      },
      oDMM: {
        sMainDescription: data?.oDMM?.sMainDescription || '',
        sDescription: data?.oDMM?.sDescription || '',
        oImgLeft: normalizeImage(data?.oDMM?.oImgLeft),
        oImgRight: normalizeImage(data?.oDMM?.oImgRight)
      },
      oISG: {
        sTitle: data?.oISG?.sTitle || '',
        sDescription: data?.oISG?.sDescription || '',
        aCard: normalizeArray(data?.oISG?.aCard, getDefaultIndustrialSectorCard, (card = {}) => ({
          oIcon: normalizeImage(card?.oIcon),
          sTitle: card?.sTitle || '',
          sDescription: card?.sDescription || '',
          sUrl: card?.sUrl || ''
        }))
      },
      oPS: {
        sBadge: data?.oPS?.sBadge || '',
        sTitle: data?.oPS?.sTitle || '',
        sDescription: data?.oPS?.sDescription || '',
        aCta: normalizeFixedArray(data?.oPS?.aCta, 1, getDefaultCta, (cta = {}) => ({
          sLabel: cta?.sLabel || '',
          sUrl: cta?.sUrl || ''
        }))
      },
      oTFA: {
        sTitle: data?.oTFA?.sTitle || '',
        sDescription: data?.oTFA?.sDescription || '',
        aCard: normalizeArray(data?.oTFA?.aCard, getDefaultFocusAreaCard, (card = {}) => ({
          sTitle: card?.sTitle || '',
          sDescription: card?.sDescription || '',
          sSlug: card?.sSlug || ''
        }))
      },
      oPEM: {
        sTitle: data?.oPEM?.sTitle || '',
        sDescription: data?.oPEM?.sDescription || '',
        aCard: normalizeArray(data?.oPEM?.aCard, getDefaultMetricCard, (card = {}) => ({
          sLabel: card?.sLabel || '',
          sValue: card?.sValue || ''
        })),
        bIsMarquee: typeof data?.oPEM?.bIsMarquee === 'boolean' ? data.oPEM.bIsMarquee : true,
        aMarquee: normalizeArray(data?.oPEM?.aMarquee, getDefaultMarqueeLogo, (item = {}) => ({
          oImg: normalizeImage(item?.oImg)
        }))
      },
      oAFC: {
        sTitle: data?.oAFC?.sTitle || '',
        sDescription: data?.oAFC?.sDescription || '',
        aCard: normalizeArray(data?.oAFC?.aCard, getDefaultAnimatedFeatureCard, (card = {}) => ({
          sTitle: card?.sTitle || '',
          sDescription: card?.sDescription || '',
          oImg: normalizeImage(card?.oImg)
        }))
      },
      oLSC: {
        sTitle: data?.oLSC?.sTitle || '',
        sDescription: data?.oLSC?.sDescription || '',
        aCard: normalizeArray(data?.oLSC?.aCard, getDefaultLeadershipCard, (card = {}) => ({
          oImg: normalizeImage(card?.oImg),
          sName: card?.sName || '',
          sRole: card?.sRole || '',
          sRedirectUrl: card?.sRedirectUrl || '',
          eTarget: card?.eTarget || '_self'
        }))
      },
      oFAQ: {
        sTitle: data?.oFAQ?.sTitle || '',
        sDescription: data?.oFAQ?.sDescription || '',
        aFaq: normalizeArray(data?.oFAQ?.aFaq, getDefaultFaqItem, (item = {}) => ({
          sQuestion: item?.sQuestion || '',
          sAnswer: item?.sAnswer || ''
        }))
      },
      oCSC: {
        sTitle: data?.oCSC?.sTitle || '',
        sDescription: data?.oCSC?.sDescription || '',
        oImg: normalizeImage(data?.oCSC?.oImg),
        aCard: normalizeArray(data?.oCSC?.aCard, getDefaultContentShowcaseCard, (card = {}) => ({
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
        aCta: normalizeFixedArray(data?.oCB?.aCta, 1, getDefaultCta, (cta = {}) => ({
          sLabel: cta?.sLabel || '',
          sUrl: cta?.sUrl || ''
        }))
      },
      oITB: {
        sTitle: data?.oITB?.sTitle || '',
        sDescription: data?.oITB?.sDescription || '',
        oCta: normalizeCta(data?.oITB?.oCta)
      },
      oOVG: {
        sTitle: data?.oOVG?.sTitle || '',
        aCard: normalizeArray(data?.oOVG?.aCard, getDefaultAnimatedFeatureCard, (card = {}) => ({
          sTitle: card?.sTitle || '',
          sDescription: card?.sDescription || '',
          oImg: normalizeImage(card?.oImg)
        }))
      }
    },
    aComponent: (Array.isArray(rawData?.aComponent) ? rawData.aComponent : []).map(normalizePageComponent),
    oImg: normalizeImage(rawData?.oImg),
    oIcon: normalizeImage(rawData?.oIcon),
    sIconDescription: rawData?.sIconDescription || '',
    oSeo: {
      ...defaultData.oSeo,
      ...(rawData?.oSeo || {}),
      eType: 'i',
      sSlug: stripRepeatedPrefix(rawData?.oSeo?.sSlug, INDUSTRY_URL_PREFIX),
      sCUrl: stripRepeatedPrefix(rawData?.oSeo?.sCUrl, INDUSTRY_URL_PREFIX),
      sRobots: rawData?.oSeo?.sRobots || META_ROBOTS[0],
      aKeywords: Array.isArray(rawData?.oSeo?.aKeywords) ? rawData.oSeo.aKeywords.join(', ') : rawData?.oSeo?.aKeywords || ''
    }
  }, 'i')
}

function cleanCtas(items = [], limit) {
  const nextItems = (Array.isArray(items) ? items : [])
    .map((item) => normalizeCta(item))
    .filter((item) => item.sLabel || item.sUrl)

  return typeof limit === 'number' ? nextItems.slice(0, limit) : nextItems
}

function normalizeIndustryForSubmit(data = {}) {
  const rawValue = removeTypenameKey(data) || {}
  const componentValue = removeTypenameKey(rawValue?.oComponents || {}) || rawValue
  const value = {
    ...componentValue,
    sTitle: rawValue?.sTitle || '',
    sDescription: rawValue?.sDescription || '',
    aComponent: rawValue?.aComponent || [],
    oImg: rawValue?.oImg,
    oIcon: rawValue?.oIcon,
    sIconDescription: rawValue?.sIconDescription,
    oSeo: rawValue?.oSeo || {}
  }

  return {
    ...componentValue,
    sTitle: value?.sTitle || '',
    sDescription: value?.sDescription || '',
    oHPB: {
      sMediaUrl: value?.oHPB?.oVideo?.sUrl || value?.oHPB?.sMediaUrl || '',
      eMediaType: normalizeBannerMediaType(value?.oHPB?.eMediaType),
      sEyebrow: value?.oHPB?.sEyebrow || '',
      sTitle: value?.oHPB?.sTitle || '',
      sDescription: value?.oHPB?.sDescription || '',
      aCta: cleanCtas(value?.oHPB?.aCta, 2)
    },
    oSPB: {
      sMediaUrl: value?.oSPB?.oVideo?.sUrl || value?.oSPB?.sMediaUrl || '',
      eMediaType: normalizeBannerMediaType(value?.oSPB?.eMediaType),
      sEyebrow: value?.oSPB?.sEyebrow || '',
      sTitle: value?.oSPB?.sTitle || '',
      sDescription: value?.oSPB?.sDescription || '',
      sContent: value?.oSPB?.sContent || '',
      aCta: cleanCtas(value?.oSPB?.aCta, 2)
    },
    oMID: {
      sTitle: value?.oMID?.sTitle || '',
      sDescription: value?.oMID?.sDescription || '',
      oImg: normalizeImage(value?.oMID?.oImg)
    },
    oMTI: {
      sTitle: value?.oMTI?.sTitle || '',
      sDescription: value?.oMTI?.sDescription || '',
      aCard: (Array.isArray(value?.oMTI?.aCard) ? value.oMTI.aCard : [])
        .map((card = {}) => ({
          sNumber: card?.sNumber || '',
          sTitle: card?.sTitle || ''
        }))
        .filter((card) => card?.sNumber || card?.sTitle),
      oTopLeft: buildMediaReferencePayload(value?.oMTI?.oTopLeft),
      oBottomRight: buildMediaReferencePayload(value?.oMTI?.oBottomRight)
    },
    oTIS: {
      sTitle: value?.oTIS?.sTitle || '',
      sDescription: value?.oTIS?.sDescription || '',
      sContent: value?.oTIS?.sContent || '',
      aStat: (Array.isArray(value?.oTIS?.aStat) ? value.oTIS.aStat : [])
        .map((stat = {}) => ({
          sValue: stat?.sValue || '',
          sLabel: stat?.sLabel || '',
          sDescription: stat?.sDescription || ''
        }))
        .filter((stat) => stat?.sValue || stat?.sLabel || stat?.sDescription)
    },
    oIOV: {
      sTitle: value?.oIOV?.sTitle || '',
      sContent: value?.oIOV?.sContent || ''
    },
    oKOD: {
      sTitle: value?.oKOD?.sTitle || '',
      sDescription: value?.oKOD?.sDescription || '',
      aCard: (Array.isArray(value?.oKOD?.aCard) ? value.oKOD.aCard : [])
        .map((card = {}) => ({
          sTitle: card?.sTitle || '',
          sDescription: card?.sDescription || '',
          sSlug: card?.sSlug || ''
        }))
        .filter((card) => card?.sTitle || card?.sDescription || card?.sSlug)
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
        .filter((card) => card?.sTitle || card?.sDescription || card?.sSlug || card?.oImg?.sUrl)
    },
    oDMM: {
      sMainDescription: value?.oDMM?.sMainDescription || '',
      sDescription: value?.oDMM?.sDescription || '',
      oImgLeft: normalizeImage(value?.oDMM?.oImgLeft),
      oImgRight: normalizeImage(value?.oDMM?.oImgRight)
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
        .filter((card) => card?.sTitle || card?.sDescription || card?.sUrl || card?.oIcon?.sUrl)
    },
    oPS: {
      sBadge: value?.oPS?.sBadge || '',
      sTitle: value?.oPS?.sTitle || '',
      sDescription: value?.oPS?.sDescription || '',
      aCta: cleanCtas(value?.oPS?.aCta, 1)
    },
    oTFA: {
      sTitle: value?.oTFA?.sTitle || '',
      sDescription: value?.oTFA?.sDescription || '',
      aCard: (Array.isArray(value?.oTFA?.aCard) ? value.oTFA.aCard : [])
        .map((card = {}) => ({
          sTitle: card?.sTitle || '',
          sDescription: card?.sDescription || '',
          sSlug: card?.sSlug || ''
        }))
        .filter((card) => card?.sTitle || card?.sDescription || card?.sSlug)
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
    oAFC: {
      sTitle: value?.oAFC?.sTitle || '',
      sDescription: value?.oAFC?.sDescription || '',
      aCard: (Array.isArray(value?.oAFC?.aCard) ? value.oAFC.aCard : [])
        .map((card = {}) => ({
          sTitle: card?.sTitle || '',
          sDescription: card?.sDescription || '',
          oImg: normalizeImage(card?.oImg)
        }))
        .filter((card) => card?.sTitle || card?.sDescription || card?.oImg?.sUrl)
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
    oITB: {
      sTitle: value?.oITB?.sTitle || '',
      sDescription: value?.oITB?.sDescription || '',
      oCta: normalizeCta(value?.oITB?.oCta)
    },
    oOVG: {
      sTitle: value?.oOVG?.sTitle || '',
      aCard: (Array.isArray(value?.oOVG?.aCard) ? value.oOVG.aCard : [])
        .map((card = {}) => ({
          sTitle: card?.sTitle || '',
          sDescription: card?.sDescription || '',
          oImg: normalizeImage(card?.oImg)
        }))
        .filter((card) => card?.sTitle || card?.sDescription || card?.oImg?.sUrl)
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
    aComponent: (Array.isArray(value?.aComponent) ? value.aComponent : []).map(normalizeComponentSelection).filter(Boolean),
    oImg: normalizeImage(value?.oImg),
    oIcon: normalizeImage(value?.oIcon),
    sIconDescription: value?.sIconDescription || '',
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
    oTwitter: value?.oTwitter,
    eSubType: value?.eSubType,
    eStatus: value?.eStatus,
    bIsDeletable: value?.bIsDeletable,
    sContent: value?.sContent,
    sDTitle: value?.sDTitle
  })
}

function stripEmptyField(target, key) {
  if (!hasMeaningfulValue(target?.[key])) delete target[key]
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

const editorSectionPrefix = 'industry-editor'

function AddEditIndustries() {
  const { id } = useParams()
  const history = useHistory()
  const allowUnsavedChangesNavigation = useAllowUnsavedChangesNavigation()
  const methods = useForm({ mode: 'all', defaultValues: getDefaultIndustry() })
  const { dispatch } = useContext(ToastrContext)
  const defaultURL = INDUSTRY_URL_PREFIX

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
    // watch
  } = methods

  const heroTitle = watch('sTitle') || watch('oComponents.oHPB.sTitle') || watch('oComponents.oSPB.sTitle')
  const { data: industries } = useQuery(GET_INDUSTRY, {
    variables: { input: { _id: id } },
    skip: !id,
    onCompleted: (data) => {
      if (data?.getIndustry?.oData) {
        setFormValue(data?.getIndustry?.oData)
      }
    }
  })
  const industryComponents = industries?.getIndustry?.oData?.oComponents || {}
  const previewFallbackImage =
    industries?.getIndustry?.oData?.oSeo?.oFB?.sUrl ||
    industries?.getIndustry?.oData?.oSeo?.oTwitter?.sUrl ||
    industries?.getIndustry?.oData?.oImg?.sUrl ||
    (industryComponents?.oHPB?.eMediaType === 'i' ? industryComponents?.oHPB?.sMediaUrl : '') ||
    (industryComponents?.oSPB?.eMediaType === 'i' ? industryComponents?.oSPB?.sMediaUrl : '')
  const selectedComponents = watch('aComponent') || []
  const sections = buildEditorSections({
    basicsLabel: 'Page Basics',
    seoLabel: 'SEO',
    components: selectedComponents,
    anchorPrefix: editorSectionPrefix
  })
  const basicsSectionId = getEditorStaticSectionId(editorSectionPrefix, 'basics')
  const seoSectionId = getEditorStaticSectionId(editorSectionPrefix, 'seo')
  const { activeSectionId, handleJumpToSection } = useEditorSectionNavigation(sections)

  const [create, { loading }] = useMutation(ADD_INDUSTRY, {
    onCompleted: (data) => {
      if (data?.addIndustry) {
        allowUnsavedChangesNavigation()
        history.push(allRoutes.industries)
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data?.addIndustry?.sMessage, type: TOAST_TYPE.Success }
        })
      }
    }
  })

  const [edit, { loading: editLoading }] = useMutation(EDIT_INDUSTRY, {
    onCompleted: (data) => {
      if (data?.editIndustry) {
        allowUnsavedChangesNavigation()
        history.push(allRoutes.industries)
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data?.editIndustry?.sMessage, type: TOAST_TYPE.Success }
        })
      }
    }
  })

  function setFormValue(d) {
    const data = normalizeIndustryFormData(d)
    reset(data)
  }

  useEffect(() => {
    selectedComponents.forEach((component) => {
      const componentBasePath = getPageComponentBasePath(component, '', 'i')
      if (!componentBasePath) return

      const currentValue = getValues(componentBasePath)
      const nextValue = mergeDefaultFormValue(currentValue, getPageComponentDefaultValue(component))

      if (hasFormValueChanged(currentValue, nextValue)) {
        setValue(componentBasePath, nextValue, { shouldDirty: false, shouldValidate: false })
      }
    })
  }, [selectedComponents, getValues, setValue])

  function onSubmit(data) {
    const duplicateDataKeys = findDuplicatePageComponentDataKeys(data?.aComponent, 'i')
    if (duplicateDataKeys.length) {
      setError('aComponent', {
        type: 'validate',
        message: 'Selected components contain duplicate data sections. Remove duplicate component types before saving.'
      })
      return
    }

    clearErrors('aComponent')

    const normalizedData = normalizeIndustryForSubmit(data)
    const componentPayload = buildPageNamespacePayload({
      aComponent: normalizedData?.aComponent,
      oComponents: normalizedData
    }, 'i')
    const d = {
      sTitle: normalizedData?.sTitle || '',
      sDescription: normalizedData?.sDescription || '',
      ...componentPayload,
      oImg: normalizedData?.oImg,
      oIcon: normalizedData?.oIcon,
      sIconDescription: normalizedData?.sIconDescription,
      oSeo: normalizedData?.oSeo
    }
    const seoData = prepareSeoData(d)

    if (seoData) {
      seoData.aKeywords = cleanSeoKeywords(seoData.aKeywords)
      seoData.sSlug = stripRepeatedPrefix(seoData.sSlug, defaultURL)
      seoData.sSlug = seoData.sSlug ? `${defaultURL}${seoData.sSlug}` : ''
      seoData.sCUrl = stripRepeatedPrefix(seoData.sCUrl, defaultURL)
      if (seoData.sCUrl) seoData.sCUrl = `${defaultURL}${seoData.sCUrl}`
      d.oSeo = seoData
    } else {
      delete d.oSeo
    }

    stripEmptyField(d, 'oImg')
    stripEmptyField(d, 'oIcon')
    stripEmptyField(d, 'sIconDescription')

    if (id) {
      d.eStatus = 'a'
      d._id = id
      edit({ variables: { input: d } })
    } else {
      create({ variables: { input: { ...d, eStatus: 'a' } } })
    }
  }
  function prepareSeoData(d) {
    const currentSeo = removeTypenameKey(d?.oSeo || {})
    const components = d?.oComponents || {}
    const hpb = components?.oHPB || d?.oHPB
    const spb = components?.oSPB || d?.oSPB
    const fallbackSeoImage =
      d?.oImg?.sUrl ||
      (hpb?.eMediaType === 'i' ? hpb?.oVideo?.sUrl || hpb?.sMediaUrl || '' : '') ||
      (spb?.eMediaType === 'i' ? spb?.oVideo?.sUrl || spb?.sMediaUrl || '' : '')
    const oSeo = {
      sTitle: currentSeo?.sTitle || '',
      sDescription: currentSeo?.sDescription || '',
      sSlug: currentSeo?.sSlug || '',
      aKeywords: currentSeo?.aKeywords || '',
      oFB: getCleanSocialSeo(currentSeo?.oFB),
      oTwitter: getCleanSocialSeo(currentSeo?.oTwitter),
      sCUrl: currentSeo?.sCUrl || '',
      sRobots: currentSeo?.sRobots || META_ROBOTS[0],
      eType: 'i',
      eSubType: currentSeo?.eSubType,
      eStatus: currentSeo?.eStatus,
      bIsDeletable: currentSeo?.bIsDeletable,
      sContent: currentSeo?.sContent || '',
      sDTitle: currentSeo?.sDTitle || ''
    }

    if (!hasMeaningfulSeoValue(oSeo)) return undefined

    const platforms = ['oFB', 'oTwitter']

    platforms.forEach((platform) => {
      if (!oSeo?.[platform]) oSeo[platform] = {}
      if (!oSeo?.[platform]?.sUrl) oSeo[platform].sUrl = fallbackSeoImage
      if (!oSeo?.[platform]?.sTitle) oSeo[platform].sTitle = oSeo?.sTitle
      if (!oSeo?.[platform]?.sDescription) {
        oSeo[platform].sDescription = oSeo?.sDescription
      }
    })

    return oSeo
  }

  return (
    <FormProvider {...methods}>
      <Form className="page-component-editor-form page-component-editor-form--has-sticky-picker" onSubmit={handleSubmit(onSubmit)}>
        <AddPageComponents
          control={control}
          error={errors?.aComponent}
          name="aComponent"
          ePageComponentType="i"
          includeAllWithoutPermission
          variant="sticky"
        />
        <Row>
          <Col lg="9">
            <div className="d-lg-none mb-3">
              <EditorSectionNavigator sections={sections} activeSectionId={activeSectionId} onJump={handleJumpToSection} mobileMode />
            </div>
            <div id={basicsSectionId} className="editor-section-target">
              <Form.Label className="text-uppercase small text-muted mb-3">Page Basics</Form.Label>
              <CountInput
                placeholder="H1"
                type="text"
                register={register('sDescription')}
                error={errors}
                className={errors.sDescription && 'error'}
                name="sDescription"
                label="H1"
              />
              <CountInput
                placeholder="Paragraph"
                type="text"
                register={register('sTitle')}
                error={errors}
                className={errors.sTitle && 'error'}
                name="sTitle"
                label="Paragraph"
              />
            </div>
            <AddPageComponentsList name="aComponent" namespace="" pageType="i" anchorPrefix={editorSectionPrefix} />
            <div id={seoSectionId} className="editor-section-target mt-4">
              <Form.Label className="text-uppercase small text-muted mb-3">SEO</Form.Label>
              <input type="hidden" value="i" {...register('oSeo.eType')} />
              <CommonSEO
                register={register}
                errors={errors}
                values={getValues()}
                setError={setError}
                clearErrors={clearErrors}
                previewURL={previewFallbackImage}
                fbImg={industries?.getIndustry?.oData?.oSeo?.oFB?.sUrl || previewFallbackImage}
                twitterImg={industries?.getIndustry?.oData?.oSeo?.oTwitter?.sUrl || previewFallbackImage}
                setValue={setValue}
                control={control}
                id={id}
                slugType={'i'}
                slug={heroTitle && defaultURL ? `${defaultURL}${heroTitle}` : heroTitle || undefined}
                hidden
                // defaultData={categoryData}
                categoryURL={defaultURL}
                // onUpdateData={(e) => handleUpdateData(e)}
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
export default AddEditIndustries
