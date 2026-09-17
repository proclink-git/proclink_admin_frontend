import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap'
import { useMutation } from '@apollo/client'
import { FormProvider, useForm } from 'react-hook-form'
import { useHistory, useParams } from 'react-router-dom'
import { useIntl } from 'react-intl'

import AddPageComponents from 'shared/components/add-page-components'
import AddPageComponentsList from 'shared/components/add-page-components/list'
import CommonSEO from 'shared/components/common-seo'
import CountInput from 'shared/components/count-input'
import EditorSectionNavigator from 'shared/components/editor-section-navigator'
import useEditorSectionNavigation from 'shared/components/editor-section-navigator/use-editor-section-navigation'
import { buildEditorSections, getEditorStaticSectionId } from 'shared/components/editor-section-navigator/utils'
import PageUpdateActions from 'shared/components/web-pages/page-update-actions'
import { useAllowUnsavedChangesNavigation } from 'shared/components/unsaved-changes'
import { CREATE_PAGE, EDIT_PAGE } from 'graph-ql/pages/mutation'
import { META_ROBOTS, TOAST_TYPE } from 'shared/constants'
import { allRoutes } from 'shared/constants/AllRoutes'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { ToastrContext } from 'shared/components/toastr'
import { removeTypeName, removeTypenameKey } from 'shared/utils'
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
  getDefaultMetricCard,
  getDefaultRelevantServiceCard,
  getDefaultTransformationImpactCard,
  getDefaultTransformationStat
} from 'shared/components/page-components/dynamic/industry-detail-static/utils'
import {
  getDefaultCareerBanner,
  getDefaultImpactCards as getDefaultHomeImpactCards,
  getDefaultInsightCard as getDefaultHomeInsightCard,
  getDefaultLinkCard as getDefaultHomeLinkCard,
  getDefaultLogo as getDefaultHomeLogo,
  getDefaultProductCard as getDefaultHomeProductCard,
  getDefaultSector as getDefaultHomeSector,
  getDefaultTestimonial as getDefaultHomeTestimonial,
  getDefaultWhyProclinkCard as getDefaultHomeWhyProclinkCard
} from 'shared/components/page-components/dynamic/home-page-static/utils'
import {
  getDefaultIndustryHeroCard,
  getDefaultIndustryStackCard
} from 'shared/components/page-components/dynamic/industry-page-static/utils'
import {
  getDefaultBeliefItem,
  getDefaultCredibilityCard as getDefaultAboutCredibilityCard,
  getDefaultLeadershipCard as getDefaultAboutLeadershipCard,
  getDefaultMissionVisionItem,
  getDefaultOperationalInsightItem,
  getDefaultPictureFutureLines,
  getDefaultWhoWeAreItem
} from 'shared/components/page-components/dynamic/about-page-static/utils'
import {
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
  getDefaultBenefitItem,
  getDefaultComparisonItem,
  getDefaultDualMedia,
  getDefaultImageCard,
  getDefaultImageTitleItem,
  getDefaultMediaImageCard,
  getDefaultProductInterfaceItem,
  getDefaultTextItem,
  getDefaultTitleDescriptionItem
} from 'shared/components/page-components/dynamic/product-detail-static/utils'
import { getDefaultUpcomingWebinarCard } from 'shared/components/page-components/dynamic/header-category-static/utils'
import { getDefaultServiceListingSection } from 'shared/components/page-components/service-listing-accordion/utils'
import { getDefaultContactField, getDefaultContactSocialLink } from 'shared/components/page-components/dynamic/contact-page-static/contact-us-form-section'
import { getDefaultProductListingCard } from 'shared/components/page-components/dynamic/product-page-static'
import { getDefaultHomeBannerHero } from 'shared/components/page-components/home-banner/row'
import { getDefaultDlfValue } from 'shared/components/page-components/dynamic/article-static/download-lead-form.utils'
import {
  buildPageNamespacePayload,
  findDuplicatePageComponentDataKeys,
  getPageComponentBasePath,
  getPageComponentDefaultValue,
  normalizePageComponentForForm,
  normalizePageNamespaceComponents,
  CUSTOM_PAGE_LISTING_COPY_DATA_KEY_BY_TYPE,
  PAGE_COMPONENT_DATA_KEY_BY_TYPE
} from 'shared/components/page-components/registry'

const editorSectionPrefix = 'custom-page-editor'
const CUSTOM_PAGE_TYPE = 'cp'
const PAGE_SEO_TYPE = 'p'
const PAGE_FORM_KEYS = new Set(['sTitle', 'sPageTitle', 'sPageDescription', 'ePageType', 'oSeo', 'aComponent'])
const COMPONENT_DATA_KEYS = new Set([
  ...Object.values(PAGE_COMPONENT_DATA_KEY_BY_TYPE),
  ...Object.values(CUSTOM_PAGE_LISTING_COPY_DATA_KEY_BY_TYPE)
])
const CUSTOM_PAGE_LISTING_COPY_DATA_KEYS = new Set(Object.values(CUSTOM_PAGE_LISTING_COPY_DATA_KEY_BY_TYPE))
const DYNAMIC_COMPONENT_TYPES = new Set(['b', 'b2', 'wwb', 't', 'mid', 'ICType1', 'ICType2', 'ICType3', 'ICType4', 'ig', 'is', 'faq', 'ltdiri', 'ltirs', 'sc', 'ssc'])
const CUSTOM_PAGE_NAMESPACE_KEYS = new Set([
  'oHomePage',
  'oIndustryPage',
  'oProductPage',
  'oServicePage',
  'oContactUsPage',
  'oAboutUs',
  'oPartnershipsAlliancesPage'
])

function getDefaultSocialSeo() {
  return {
    sTitle: '',
    sDescription: '',
    sUrl: ''
  }
}

function getDefaultSeo() {
  return {
    sTitle: '',
    sDescription: '',
    sSlug: '',
    aKeywords: '',
    oFB: getDefaultSocialSeo(),
    oTwitter: getDefaultSocialSeo(),
    sCUrl: '',
    sRobots: META_ROBOTS[0],
    eType: PAGE_SEO_TYPE
  }
}

function getDefaultHeroBanner() {
  return {
    ...getDefaultHomeBannerHero(),
    aCta: [getDefaultCta(), getDefaultCta()]
  }
}

function getDefaultListingCopy() {
  return {
    sListingTitle: '',
    sListingDescription: ''
  }
}

function getComponentType(component = {}) {
  return component?.eType || component?.iId?.eType || ''
}

function getComponentSearchText(component = {}) {
  return [
    getComponentType(component),
    component?.sComponentTitle,
    component?.iId?.sComponentTitle
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function hasText(text = '', terms = []) {
  return terms.some((term) => text.includes(term))
}

function isImageDescriptionSectionComponentType(componentType = '') {
  return ['ids', 'oids'].includes(String(componentType || '').toLowerCase())
}

function isDynamicPageComponent(component = {}) {
  return (component?.eComponentType || component?.iId?.eComponentType || '').toLowerCase() === 'd'
}

function getDefaultImageDescriptionSection() {
  return { sTitle: '', sDescription: '', oImg: getDefaultImage() }
}

const CUSTOM_PAGE_COMPONENT_DEFAULTS = {
  hpb: (component) => {
    const componentText = getComponentSearchText(component)

    if (hasText(componentText, ['contact'])) {
      return { path: 'oContactUsPage.oHPB', getValue: getDefaultHeroBanner }
    }
    if (hasText(componentText, ['home'])) {
      return { path: 'oHomePage.oHPB', getValue: getDefaultHeroBanner }
    }
    if (hasText(componentText, ['service']) && hasText(componentText, ['hub', 'listing', 'page'])) {
      return { path: 'oServicePage.oHPB', getValue: getDefaultHeroBanner }
    }

    return { path: 'oHPB', getValue: getDefaultHeroBanner }
  },
  spb: {
    path: 'oSPB',
    getValue: () => ({ ...getDefaultHeroBanner(), sContent: '' })
  },
  mid: {
    path: 'oMID',
    getValue: getDefaultImageDescriptionSection
  },
  ids: {
    path: 'oIDS',
    getValue: getDefaultImageDescriptionSection
  },
  oids: {
    path: 'oIDS',
    getValue: getDefaultImageDescriptionSection
  },
  oIDS: {
    path: 'oIDS',
    getValue: getDefaultImageDescriptionSection
  },
  icd: {
    path: 'oHomePage.oICD',
    getValue: () => ({ aCard: getDefaultHomeImpactCards() })
  },
  ssc: (component) => {
    if (isDynamicPageComponent(component)) return null

    return {
      path: 'oHomePage.oSSC',
      getValue: () => ({ sMainDescription: '', aSector: [getDefaultHomeSector()] })
    }
  },
  sc: (component) => {
    if (isDynamicPageComponent(component)) return null

    return {
      path: 'oHomePage.oSC',
      getValue: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultHomeLinkCard()] })
    }
  },
  pc: {
    path: 'oHomePage.oPC',
    getValue: () => ({ sTitle: '', sDescription: '', sImageTitle: '', eMediaType: 'i', oImg: getDefaultImage(), aCard: [getDefaultHomeProductCard()] })
  },
  tl: {
    path: 'oTL',
    getValue: () => ({ sTitle: '', aLogo: [getDefaultHomeLogo()] })
  },
  ts: (component) => {
    const componentText = getComponentSearchText(component)

    return {
      path: hasText(componentText, ['industry']) ? 'oIndustryPage.oTS' : 'oHomePage.oTS',
      getValue: () => ({ sTitle: '', sDescription: '', aTestimonial: [getDefaultHomeTestimonial()] })
    }
  },
  ins: {
    path: 'oHomePage.oINS',
    getValue: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultHomeInsightCard()] })
  },
  wp: {
    path: 'oHomePage.oWP',
    getValue: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultHomeWhyProclinkCard()] })
  },
  ihc: {
    path: 'oIndustryPage.oIHC',
    getValue: () => ({ sTitle: '', sDescription: '', sImageTitle: '', oImg: getDefaultImage(), aCard: [getDefaultIndustryHeroCard()] })
  },
  ist: {
    path: 'oIndustryPage.oIST',
    getValue: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultIndustryStackCard()] })
  },
  sla: {
    path: 'oServicePage.oSLA',
    getValue: getDefaultServiceListingSection
  },
  plp: {
    path: 'oProductPage.oPLP',
    getValue: () => ({ sTitle: '', sDescription: '', sImageTitle: '', eMediaType: 'i', oImg: getDefaultImage(), aCard: [getDefaultProductListingCard()] })
  },
  cuf: {
    path: 'oContactUsPage.oCUF',
    getValue: () => ({
      sTitle: '',
      sDescription: '',
      sPhoneNumber: '',
      sEmail: '',
      sDropdownLabel: '',
      aDropdownOptions: [''],
      aField: [getDefaultContactField()],
      aSocialLinks: [getDefaultContactSocialLink()],
      oCta: getDefaultCta()
    })
  },
  ccc: {
    path: 'oContactUsPage.oCCC',
    getValue: () => ({ aContact: [{ sTitle: '', sContact: '', sEmail: '' }] })
  },
  paa: {
    path: 'oPartnershipsAlliancesPage.oPAA',
    getValue: () => ({ sTitle: '', sDescription: '', oImg: getDefaultImage() })
  },
  pal: {
    path: 'oPartnershipsAlliancesPage.oPAL',
    getValue: () => ({ aLogo: [{ sName: '', oImg: getDefaultImage() }] })
  },
  iov: {
    path: 'oIOV',
    getValue: () => ({ sTitle: '', sContent: '' })
  },
  kod: {
    path: 'oKOD',
    getValue: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultFocusAreaCard()] })
  },
  dse: {
    path: 'oDSE',
    getValue: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultAnimatedFeatureCard()] })
  },
  tis: {
    path: 'oTIS',
    getValue: () => ({ sTitle: '', sDescription: '', aStat: [getDefaultTransformationStat()] })
  },
  ovg: {
    path: 'oOVG',
    getValue: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultMetricCard()] })
  },
  mti: {
    path: 'oMTI',
    getValue: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultTransformationImpactCard()] })
  },
  dmm: {
    path: 'oDMM',
    getValue: () => ({ sMainDescription: '', sDescription: '', oImgLeft: getDefaultImage(), oImgRight: getDefaultImage() })
  },
  isg: {
    path: 'oISG',
    getValue: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultIndustrialSectorCard()] })
  },
  pem: {
    path: 'oPEM',
    getValue: () => ({
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultMetricCard()],
      bIsMarquee: true,
      aMarquee: [getDefaultMarqueeLogo()]
    })
  },
  afc: {
    path: 'oAFC',
    getValue: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultAnimatedFeatureCard()] })
  },
  lsc: {
    path: 'oLSC',
    getValue: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultLeadershipCard()] })
  },
  csc: {
    path: 'oCSC',
    getValue: () => ({ sTitle: '', sDescription: '', oImg: getDefaultImage(), aCard: [getDefaultContentShowcaseCard()] })
  },
  rsc: {
    path: 'oRSC',
    getValue: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultRelevantServiceCard()] })
  },
  faq: {
    path: 'oFAQ',
    getValue: () => ({ sTitle: '', sDescription: '', aFaq: [getDefaultFaqItem()] })
  },
  ps: {
    path: 'oPS',
    getValue: () => ({ sBadge: '', sTitle: '', sDescription: '', aCta: [getDefaultCta()] })
  },
  tfa: {
    path: 'oTFA',
    getValue: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultFocusAreaCard()] })
  },
  itb: {
    path: 'oITB',
    getValue: () => ({ sTitle: '', sDescription: '', oCta: getDefaultCta() })
  },
  woe: {
    path: 'oWOE',
    getValue: () => ({ sTitle: '', sSubtitle: '', aFeature: [getDefaultServiceFeatureCard()] })
  },
  iip: {
    path: 'oIIP',
    getValue: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultServiceImpactCard()] })
  },
  sac: {
    path: 'oSAC',
    getValue: () => ({ sTitle: '', sSubtitle: '', aCard: [getDefaultServiceAnimatedScrollCard()] })
  },
  sic: {
    path: 'oSIC',
    getValue: () => ({ sTitle: '', sDescription: '', oImg: getDefaultImage(), oCta: getDefaultCta() })
  },
  hip: {
    path: 'oHIP',
    getValue: () => ({ sTitle: '', sDescription: '', oImg: getDefaultImage(), aCard: [getDefaultFocusAreaCard()] })
  },
  sis: {
    path: 'oSIS',
    getValue: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultServiceSolutionCard()] })
  },
  iai: {
    path: 'oIAI',
    getValue: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultAnimatedFeatureCard()] })
  },
  sgp: {
    path: 'oSGP',
    getValue: getDefaultServiceGalleryPanel
  },
  svc: {
    path: 'oSVC',
    getValue: () => ({ aCard: [getDefaultServiceVisualCard()] })
  },
  sip: {
    path: 'oSIP',
    getValue: () => ({ sTitle: '', sDescription: '', aLine: [getDefaultServiceImpactLine()] })
  },
  suc: {
    path: 'oSUC',
    getValue: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultServiceUseCaseCard()] })
  },
  scp: {
    path: 'oSCP',
    getValue: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultServiceCapabilityCard()] })
  },
  sia: {
    path: 'oSIA',
    getValue: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultFocusAreaCard()] })
  },
  auh: {
    path: 'oAboutUs.oAUH',
    getValue: () => ({ sTitle: '', aStatement: [{ sTitle: '', sDescription: '' }] })
  },
  wwa: {
    path: 'oAboutUs.oWWA',
    getValue: () => ({ sTitle: '', sDescription: '', aItem: [getDefaultWhoWeAreItem()] })
  },
  cap: {
    path: 'oAboutUs.oCAP',
    getValue: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultAboutCredibilityCard()] })
  },
  wyp: {
    path: 'oAboutUs.oWYP',
    getValue: () => ({
      sTitle: '',
      sContent: '',
      eMediaType: 'v',
      oMedia: getDefaultImage(),
      oThumbnail: getDefaultImage()
    })
  },
  oia: {
    path: 'oAboutUs.oOIA',
    getValue: () => ({ sTitle: '', sDescription: '', aItem: [getDefaultOperationalInsightItem()] })
  },
  wbe: {
    path: 'oAboutUs.oWBE',
    getValue: () => ({ sTitle: '', sDescription: '', oCta: getDefaultCta(), aItem: [getDefaultBeliefItem()] })
  },
  alp: {
    path: 'oAboutUs.oALP',
    getValue: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultAboutLeadershipCard()] })
  },
  hwc: {
    path: 'oAboutUs.oHWC',
    getValue: () => ({ sTitle: '', sDescription: '', sLeftContent: '', sRightContent: '', oImg: getDefaultImage() })
  },
  omv: {
    path: 'oAboutUs.oOMV',
    getValue: () => ({ sTitle: '', sDescription: '', aItem: [getDefaultMissionVisionItem()] })
  },
  ptf: {
    path: 'oAboutUs.oPTF',
    getValue: () => ({ sTitle: '', aLine: getDefaultPictureFutureLines() })
  },
  pdm: {
    path: 'oPDM',
    getValue: getDefaultDualMedia
  },
  cce: {
    path: 'oCCE',
    getValue: () => ({ sTitle: '', sDescription: '', aItem: [getDefaultTextItem()] })
  },
  wdw: {
    path: 'oWDW',
    getValue: () => ({ sTitle: '', sDescription: '', aItem: [getDefaultComparisonItem()] })
  },
  waw: {
    path: 'oWAW',
    getValue: () => ({ sTitle: '', aDescription: [getDefaultTextItem()] })
  },
  wsh: {
    path: 'oWSH',
    getValue: () => ({ sTitle: '', sDescription: '', oImg: getDefaultImage(), aCard: [getDefaultImageCard()] })
  },
  wmf: {
    path: 'oWMF',
    getValue: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultImageCard()] })
  },
  obw: {
    path: 'oOBW',
    getValue: () => ({ sTitle: '', sDescription: '', aItem: [getDefaultBenefitItem()] })
  },
  wpi: {
    path: 'oWPI',
    getValue: () => ({ sTitle: '', sDescription: '', aItem: [getDefaultTitleDescriptionItem()] })
  },
  pif: {
    path: 'oPIF',
    getValue: () => ({ sTitle: '', sDescription: '', aItem: [getDefaultProductInterfaceItem()] })
  },
  plt: {
    path: 'oPLT',
    getValue: () => ({ sTitle: '', sDescription: '', aItem: [getDefaultTextItem()] })
  },
  pwa: {
    path: 'oPWA',
    getValue: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultMediaImageCard()] })
  },
  isf: {
    path: 'oISF',
    getValue: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultImageTitleItem()] })
  },
  pia: {
    path: 'oPIA',
    getValue: () => ({ sTitle: '', sDescription: '', oCta: getDefaultCta(), aCard: [getDefaultImageTitleItem()] })
  },
  oiw: {
    path: 'oOIW',
    getValue: () => ({ sTitle: '', sDescription: '', aItem: [getDefaultTextItem()] })
  },
  su: {
    path: 'oSU',
    getValue: () => ({ sTitle: '', sDescription: '', sPlaceholder: '', sButtonLabel: '' })
  },
  dlf: {
    path: 'oDLF',
    getValue: getDefaultDlfValue
  },
  epo: {
    path: 'oEPO',
    getValue: () => ({ sTitle: '', aLogo: [{ oImg: getDefaultImage(), sRedirectUrl: '' }] })
  },
  fca: {
    path: 'oFCA',
    getValue: () => ({ sSectionTitle: '', sHeadline: '', sDescription: '', oCta: getDefaultCta(), oImg: getDefaultImage(), aTags: [''] })
  },
  uwb: {
    path: 'oUWB',
    getValue: () => ({ sSectionTitle: '', aCard: [getDefaultUpcomingWebinarCard()] })
  },
  bba: {
    path: 'oBBA',
    getValue: getDefaultListingCopy
  },
  bcs: {
    path: 'oBCS',
    getValue: getDefaultListingCopy
  },
  bwe: {
    path: 'oBWE',
    getValue: getDefaultListingCopy
  },
  bpo: {
    path: 'oBPO',
    getValue: getDefaultListingCopy
  },
  bwp: {
    path: 'oBWP',
    getValue: getDefaultListingCopy
  },
  bcu: {
    path: 'oBCU',
    getValue: getDefaultListingCopy
  },
  bcy: {
    path: 'oBCR',
    getValue: getDefaultListingCopy
  },
  brr: {
    path: 'oBRR',
    getValue: getDefaultListingCopy
  },
  bvl: {
    path: 'oBVL',
    getValue: getDefaultListingCopy
  },
  bmg: {
    path: 'oBMG',
    getValue: getDefaultListingCopy
  },
  cb: (component) => {
    const componentText = getComponentSearchText(component)
    let path = 'oCB'

    if (hasText(componentText, ['about'])) path = 'oAboutUs.oCB'
    if (hasText(componentText, ['contact'])) path = 'oContactUsPage.oCB'
    if (hasText(componentText, ['partnership', 'alliance'])) path = 'oPartnershipsAlliancesPage.oCB'
    if (hasText(componentText, ['product']) && hasText(componentText, ['hub', 'listing', 'page'])) path = 'oProductPage.oCB'
    if (hasText(componentText, ['industry']) && hasText(componentText, ['hub', 'listing', 'page'])) path = 'oIndustryPage.oCB'
    if (hasText(componentText, ['service']) && hasText(componentText, ['hub', 'listing', 'page'])) path = 'oServicePage.oCB'

    return { path, getValue: getDefaultCareerBanner }
  }
}

function parseCustomPage(value) {
  if (!value) return {}
  if (typeof value === 'string') {
    try {
      const parsedValue = JSON.parse(value)
      return parsedValue && typeof parsedValue === 'object' ? parsedValue : {}
    } catch {
      return {}
    }
  }

  return typeof value === 'object' ? removeTypenameKey(value) || {} : {}
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function mergeDefaultFormValue(currentValue, defaultValue) {
  if (Array.isArray(defaultValue)) {
    if (!Array.isArray(currentValue) || currentValue.length === 0) return defaultValue
    if (!isPlainObject(defaultValue[0])) return currentValue

    return currentValue.map((item) => mergeDefaultFormValue(item, defaultValue[0]))
  }

  if (isPlainObject(defaultValue)) {
    const nextValue = isPlainObject(currentValue) ? { ...currentValue } : {}

    Object.keys(defaultValue).forEach((key) => {
      nextValue[key] = mergeDefaultFormValue(nextValue[key], defaultValue[key])
    })

    return nextValue
  }

  return currentValue === undefined || currentValue === null ? defaultValue : currentValue
}

function hasFormValueChanged(currentValue, nextValue) {
  return JSON.stringify(currentValue ?? null) !== JSON.stringify(nextValue ?? null)
}

function getPathParts(path = '') {
  return String(path || '')
    .split('.')
    .filter(Boolean)
}

function setValueAtPath(data = {}, path = '', value) {
  const pathParts = getPathParts(path)
  if (!pathParts.length) return data

  let currentValue = data

  pathParts.forEach((pathPart, index) => {
    if (index === pathParts.length - 1) {
      currentValue[pathPart] = value
      return
    }

    if (!isPlainObject(currentValue[pathPart])) currentValue[pathPart] = {}
    currentValue = currentValue[pathPart]
  })

  return data
}

function hydrateCustomPageNamespaces(customPage = {}) {
  const hydratedCustomPage = { ...customPage }
  const components = Array.isArray(customPage?.aComponent) ? customPage.aComponent : []

  components.forEach((component) => {
    getComponentDefaultConfigs(component).forEach((componentDefaults) => {
      const pathParts = getPathParts(componentDefaults?.path)
      const payloadKey = pathParts[pathParts.length - 1]

      const shouldHydrateNamespace =
        pathParts.length > 1 &&
        CUSTOM_PAGE_NAMESPACE_KEYS.has(pathParts[0]) &&
        hydratedCustomPage[payloadKey] !== undefined

      if (shouldHydrateNamespace) {
        setValueAtPath(hydratedCustomPage, componentDefaults.path, hydratedCustomPage[payloadKey])
      }
    })
  })

  return hydratedCustomPage
}

function hydrateCustomPageListingCopyAliases(customPage = {}) {
  const components = Array.isArray(customPage?.aComponent) ? customPage.aComponent : []
  if (!components.length) return customPage

  const hydratedCustomPage = {
    ...customPage,
    oComponents: isPlainObject(customPage?.oComponents) ? { ...customPage.oComponents } : {}
  }
  let legacyListingCopy = hydratedCustomPage.oListingCopy
  if (hydratedCustomPage.oComponents.oListingCopy !== undefined) {
    legacyListingCopy = hydratedCustomPage.oComponents.oListingCopy
  }

  components.forEach((component) => {
    const dataKey = CUSTOM_PAGE_LISTING_COPY_DATA_KEY_BY_TYPE[getComponentType(component)]
    if (!dataKey) return

    let componentValue = hydratedCustomPage[dataKey]
    if (hydratedCustomPage.oComponents[dataKey] !== undefined) {
      componentValue = hydratedCustomPage.oComponents[dataKey]
    }
    if (componentValue !== undefined) {
      hydratedCustomPage.oComponents[dataKey] = componentValue
      return
    }

    if (legacyListingCopy !== undefined) {
      hydratedCustomPage.oComponents[dataKey] = legacyListingCopy
    }
  })

  return hydratedCustomPage
}

function normalizePageComponent(component = {}) {
  return normalizePageComponentForForm(component)
}

function normalizeKeywords(value) {
  if (Array.isArray(value)) return value.join(', ')
  return value || ''
}

function cleanKeywords(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean)
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function cleanSocialSeo(value = {}) {
  return {
    sTitle: value?.sTitle || '',
    sDescription: value?.sDescription || '',
    sUrl: value?.sUrl || ''
  }
}

function getFormValue(pageData = {}) {
  const customPage = normalizePageNamespaceComponents(
    hydrateCustomPageListingCopyAliases(hydrateCustomPageNamespaces(parseCustomPage(pageData?.oCustomPage))),
    CUSTOM_PAGE_TYPE
  )
  const seo = pageData?.oSeo ? removeTypeName(pageData.oSeo) : {}

  return {
    ...customPage,
    sTitle: pageData?.sTitle || customPage?.sTitle || '',
    sPageTitle: pageData?.sPageTitle || customPage?.sPageTitle || pageData?.sTitle || '',
    sPageDescription: pageData?.sPageDescription || '',
    ePageType: CUSTOM_PAGE_TYPE,
    aComponent: (Array.isArray(customPage?.aComponent) ? customPage.aComponent : []).map(normalizePageComponent),
    oSeo: {
      ...getDefaultSeo(),
      ...seo,
      eType: PAGE_SEO_TYPE,
      sRobots: pageData?.oSeo?.sRobots || META_ROBOTS[0],
      aKeywords: normalizeKeywords(pageData?.oSeo?.aKeywords),
      oFB: pageData?.oSeo?.oFB ? removeTypeName(pageData.oSeo.oFB) : getDefaultSocialSeo(),
      oTwitter: pageData?.oSeo?.oTwitter ? removeTypeName(pageData.oSeo.oTwitter) : getDefaultSocialSeo()
    }
  }
}

function buildSeoPayload(value = {}) {
  const currentSeo = removeTypenameKey(value?.oSeo || {})

  return {
    sTitle: currentSeo?.sTitle || '',
    sDescription: currentSeo?.sDescription || '',
    sSlug: currentSeo?.sSlug || '',
    aKeywords: cleanKeywords(currentSeo?.aKeywords),
    oFB: cleanSocialSeo(currentSeo?.oFB),
    oTwitter: cleanSocialSeo(currentSeo?.oTwitter),
    sCUrl: currentSeo?.sCUrl || '',
    sRobots: currentSeo?.sRobots || META_ROBOTS[0],
    eType: PAGE_SEO_TYPE
  }
}

function buildCustomPagePayload(value = {}) {
  const data = removeTypenameKey(value) || {}
  const customPage = {}
  const componentPayload = buildPageNamespacePayload(data, CUSTOM_PAGE_TYPE)

  Object.keys(data).forEach((key) => {
    if (PAGE_FORM_KEYS.has(key) || CUSTOM_PAGE_NAMESPACE_KEYS.has(key) || COMPONENT_DATA_KEYS.has(key) || key === 'oComponents') return

    customPage[key] = data[key]
  })

  customPage.aComponent = componentPayload.aComponent
  customPage.oComponents = componentPayload.oComponents
  CUSTOM_PAGE_LISTING_COPY_DATA_KEYS.forEach((dataKey) => {
    if (customPage.oComponents[dataKey] !== undefined) customPage.oComponents[dataKey] = {}
  })

  return {
    sTitle: data?.sTitle || '',
    sPageTitle: data?.sPageTitle || data?.sTitle || '',
    sPageDescription: data?.sPageDescription || '',
    ePageType: CUSTOM_PAGE_TYPE,
    oSeo: buildSeoPayload(data),
    oCustomPage: customPage
  }
}

function getComponentDefaultConfigs(component = {}) {
  const componentType = getComponentType(component)
  if (isDynamicPageComponent(component) && DYNAMIC_COMPONENT_TYPES.has(componentType)) return []

  const componentDefaults = isImageDescriptionSectionComponentType(componentType) ? CUSTOM_PAGE_COMPONENT_DEFAULTS.ids : CUSTOM_PAGE_COMPONENT_DEFAULTS[componentType]
  const resolvedDefaults = typeof componentDefaults === 'function' ? componentDefaults(component) : componentDefaults

  if (!resolvedDefaults && hasText(getComponentSearchText(component), ['browse'])) {
    return [{ path: 'oListingCopy', getValue: getDefaultListingCopy }]
  }

  if (!resolvedDefaults) return []
  return Array.isArray(resolvedDefaults) ? resolvedDefaults : [resolvedDefaults]
}

function CustomPage({ pageData = {} }) {
  const history = useHistory()
  const allowUnsavedChangesNavigation = useAllowUnsavedChangesNavigation()
  const { id } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const close = useIntl().formatMessage({ id: 'close' })
  const [cmsData, setCmsData] = useState(pageData)
  const [hydratedComponentTypes, setHydratedComponentTypes] = useState('')

  const methods = useForm({
    mode: 'all',
    defaultValues: getFormValue(pageData)
  })
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    setValue,
    control,
    getValues,
    watch
  } = methods

  const pageTitle = watch('sTitle')
  const selectedComponents = watch('aComponent') || []
  const selectedComponentTypes = selectedComponents
    .map((component) => [component?.instanceId, component?.iId?._id || component?.iId || component?._id, getComponentType(component), component?.eComponentType || component?.iId?.eComponentType, component?.sComponentTitle || component?.iId?.sComponentTitle].filter(Boolean).join(':'))
    .filter(Boolean)
    .join('|')
  const componentDefaultsReady = hydratedComponentTypes === selectedComponentTypes
  const sections = buildEditorSections({
    basicsLabel: 'Page Basics',
    seoLabel: 'SEO',
    components: selectedComponents,
    anchorPrefix: editorSectionPrefix
  })
  const basicsSectionId = getEditorStaticSectionId(editorSectionPrefix, 'basics')
  const seoSectionId = getEditorStaticSectionId(editorSectionPrefix, 'seo')
  const { activeSectionId, handleJumpToSection } = useEditorSectionNavigation(sections)

  function handleSuccess(message) {
    dispatch({
      type: 'SHOW_TOAST',
      payload: { message, type: TOAST_TYPE.Success, btnTxt: close }
    })
    allowUnsavedChangesNavigation()
    history.push(allRoutes.listPage)
  }

  const [CreateMutation, { loading: createLoading }] = useMutation(CREATE_PAGE, {
    onCompleted: (data) => {
      if (data?.createPage) handleSuccess(data.createPage.sMessage)
    }
  })

  const [EditMutation, { loading: editLoading }] = useMutation(EDIT_PAGE, {
    onCompleted: (data) => {
      if (data?.editPage) handleSuccess(data.editPage.sMessage)
    }
  })

  const isSaving = createLoading || editLoading

  useEffect(() => {
    const activeComponents = getValues('aComponent') || []

    activeComponents.forEach((component) => {
      const componentBasePath = getPageComponentBasePath(component, '', CUSTOM_PAGE_TYPE)
      if (!componentBasePath) return

      const currentValue = getValues(componentBasePath)
      const nextValue = mergeDefaultFormValue(currentValue, getPageComponentDefaultValue(component, CUSTOM_PAGE_TYPE))

      if (hasFormValueChanged(currentValue, nextValue)) {
        setValue(componentBasePath, nextValue, { shouldDirty: false })
      }
    })

    setHydratedComponentTypes(selectedComponentTypes)
  }, [selectedComponentTypes, getValues, setValue])

  function handleUpdateData(data) {
    setCmsData(data)
  }

  function onSubmit(data) {
    const duplicateDataKeys = findDuplicatePageComponentDataKeys(data?.aComponent, CUSTOM_PAGE_TYPE)
    if (duplicateDataKeys.length) {
      setError('aComponent', {
        type: 'validate',
        message: 'Selected components contain duplicate data sections. Remove duplicate component types before saving.'
      })
      return
    }

    const input = buildCustomPagePayload(data)

    if (id) {
      EditMutation({ variables: { input: { ...input, _id: id } } })
      return
    }

    CreateMutation({ variables: { input } })
  }

  return (
    <FormProvider {...methods}>
      <Form className="page-component-editor-form page-component-editor-form--has-sticky-picker" onSubmit={handleSubmit(onSubmit)}>
        <AddPageComponents
          control={control}
          error={errors?.aComponent}
          name="aComponent"
          ePageComponentType={CUSTOM_PAGE_TYPE}
          includeAllComponentTypes
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
                placeholder="Page Title"
                type="text"
                register={register('sTitle', { required: validationErrors.required })}
                error={errors}
                className={errors?.sTitle && 'error'}
                name="sTitle"
                label="Title"
              />
              <CountInput
                placeholder="Short Description"
                textarea
                rows={5}
                register={register('sPageDescription', { maxLength: { value: 200, message: validationErrors.maxLength(200) } })}
                maxWord={200}
                currentLength={getValues()?.sPageDescription?.length || 0}
                error={errors}
                className={errors?.sPageDescription && 'error'}
                name="sPageDescription"
                label="Description"
              />
            </div>
            {componentDefaultsReady && (
              <AddPageComponentsList
                key={hydratedComponentTypes || 'empty-components'}
                name="aComponent"
                staticComponentGroup="customPage"
                namespace=""
                pageType={CUSTOM_PAGE_TYPE}
                anchorPrefix={editorSectionPrefix}
              />
            )}
            <div id={seoSectionId} className="editor-section-target mt-4">
              <Form.Label className="text-uppercase small text-muted mb-3">SEO</Form.Label>
              <input type="hidden" value={CUSTOM_PAGE_TYPE} {...register('ePageType')} />
              <input type="hidden" value={PAGE_SEO_TYPE} {...register('oSeo.eType')} />
              <CommonSEO
                register={register}
                errors={errors}
                values={getValues()}
                setError={setError}
                clearErrors={clearErrors}
                previewURL={cmsData?.oSeo?.oFB?.sUrl || cmsData?.oSeo?.oTwitter?.sUrl}
                fbImg={cmsData?.oSeo?.oFB?.sUrl}
                twitterImg={cmsData?.oSeo?.oTwitter?.sUrl}
                setValue={setValue}
                control={control}
                id={id}
                slugType="p"
                slug={pageTitle || undefined}
                hidden
                defaultData={cmsData}
                onUpdateData={(e) => handleUpdateData(e)}
              />
            </div>
            <Button variant="primary" type="submit" className="m-2" disabled={isSaving}>
              {id ? 'Update' : 'Add'}
              {isSaving && <Spinner animation="border" size="sm" />}
            </Button>
          </Col>
          <Col lg="3" className="add-article">
            <div className="sticky-column">
              <div className="d-none d-lg-block">
                <EditorSectionNavigator sections={sections} activeSectionId={activeSectionId} onJump={handleJumpToSection} />
              </div>
              {id && (
                <div className="mt-3">
                  <PageUpdateActions loading={isSaving} />
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Form>
    </FormProvider>
  )
}

CustomPage.propTypes = {
  pageData: PropTypes.object
}

export default CustomPage
