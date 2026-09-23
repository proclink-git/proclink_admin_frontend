import { generateUniqueId, removeTypenameKey } from 'shared/utils'
import { getDefaultHomeBannerHero } from 'shared/components/page-components/home-banner/row'
import {
  getDefaultCareerBanner,
  getDefaultCta,
  getDefaultImpactCards,
  getDefaultImage,
  getDefaultInsightCard,
  getDefaultLinkCard,
  getDefaultLogo,
  getDefaultProductCard,
  getDefaultSector,
  getDefaultTestimonial,
  getDefaultWhyProclinkCard
} from 'shared/components/page-components/dynamic/home-page-static/utils'
import {
  getDefaultAnimatedFeatureCard,
  getDefaultContentShowcaseCard,
  getDefaultFaqItem,
  getDefaultFocusAreaCard,
  getDefaultIndustrialSectorCard,
  getDefaultLeadershipCard,
  getDefaultMarqueeLogo,
  getDefaultMediaReference,
  getDefaultMetricCard,
  getDefaultRelevantServiceCard,
  getDefaultTransformationImpactCard,
  getDefaultTransformationStat
} from 'shared/components/page-components/dynamic/industry-detail-static/utils'
import {
  getDefaultAboutStatement,
  getDefaultBeliefItem,
  getDefaultCredibilityCard,
  getDefaultLeadershipCard as getDefaultAboutLeadershipCard,
  getDefaultMissionVisionItem,
  getDefaultOperationalInsightItem,
  getDefaultPictureFutureLines,
  getDefaultWhoWeAreItem
} from 'shared/components/page-components/dynamic/about-page-static/utils'
import {
  getDefaultComparisonItem,
  getDefaultDualMedia,
  getDefaultImageCard,
  getDefaultImageTitleItem,
  getDefaultMediaImageCard,
  getDefaultProductInterfaceItem,
  getDefaultTextItem,
  getDefaultTitleDescriptionItem,
  getDefaultBenefitItem
} from 'shared/components/page-components/dynamic/product-detail-static/utils'
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
import { getDefaultServiceListingSection } from 'shared/components/page-components/service-listing-accordion/utils'
import { getDefaultContactField, getDefaultContactSocialLink } from 'shared/components/page-components/dynamic/contact-page-static/contact-us-form-section'
import { getDefaultUpcomingWebinarCard } from 'shared/components/page-components/dynamic/header-category-static/utils'
import { buildDlfPayload, getDefaultDlfValue } from 'shared/components/page-components/dynamic/article-static/download-lead-form.utils'

export const PAGE_COMPONENT_NAMESPACE_BY_PAGE_TYPE = {
  h: 'oHomePage',
  i: 'oIndustryPage',
  ip: 'oIndustryPage',
  s: 'oServicePage',
  p: 'oProductPage',
  cu: 'oContactUsPage',
  au: 'oAboutUs',
  pa: 'oPartnershipsAlliancesPage',
  hc: 'oHeaderCategory'
}

const PAGE_FAMILY_BY_PAGE_TYPE = {
  h: 'homePage',
  i: 'industryPage',
  ip: 'industryPage',
  s: 'servicePage',
  p: 'productPage',
  cu: 'contactPage',
  au: 'aboutPage',
  pa: 'partnershipsAlliancesPage',
  hc: 'headerCategory',
  cp: 'customPage'
}

const DYNAMIC_COMPONENT_TYPES = new Set(['b', 'b2', 'wwb', 't', 'mid', 'ICType1', 'ICType2', 'ICType3', 'ICType4', 'ig', 'is', 'faq', 'ltdiri', 'ltirs', 'sc', 'ssc'])
const ARTICLE_LISTING_COMPONENT_TYPES = new Set(['bba', 'bcs', 'bwe', 'bpo', 'bwp', 'bcu', 'bcy', 'brr', 'bvl'])
const IMAGE_DESCRIPTION_SECTION_COMPONENT_TYPES = new Set(['ids', 'oids'])

const STATIC_COMPONENT_FAMILY_BY_TYPE = {
  fca: 'headerCategory',
  rec: 'headerCategory',
  uwb: 'headerCategory',
  su: 'articleDetail',
  epo: 'articleDetail',
  dlf: 'articleDetail',
  auh: 'aboutPage',
  wwa: 'aboutPage',
  cap: 'aboutPage',
  wyp: 'aboutPage',
  oia: 'aboutPage',
  wbe: 'aboutPage',
  alp: 'aboutPage',
  hwc: 'aboutPage',
  omv: 'aboutPage',
  ptf: 'aboutPage',
  ihc: 'industryPage',
  ist: 'industryPage',
  sla: 'servicePage',
  plp: 'productPage',
  cuf: 'contactPage',
  ccc: 'contactPage',
  paa: 'partnershipsAlliancesPage',
  pal: 'partnershipsAlliancesPage',
  iov: 'industryDetail',
  kod: 'industryDetail',
  tis: 'industryDetail',
  ovg: 'industryDetail',
  mti: 'industryDetail',
  dmm: 'industryDetail',
  afc: 'industryDetail',
  tfa: 'industryDetail',
  itb: 'industryDetail',
  ids: 'serviceDetail',
  oids: 'serviceDetail',
  oIDS: 'serviceDetail',
  spb: 'serviceDetail',
  woe: 'serviceDetail',
  iip: 'serviceDetail',
  sac: 'serviceDetail',
  sic: 'serviceDetail',
  hip: 'serviceDetail',
  sis: 'serviceDetail',
  iai: 'serviceDetail',
  sgp: 'serviceDetail',
  svc: 'serviceDetail',
  sip: 'serviceDetail',
  suc: 'serviceDetail',
  scp: 'serviceDetail',
  sia: 'serviceDetail',
  pdm: 'productDetail',
  cce: 'productDetail',
  wdw: 'productDetail',
  waw: 'productDetail',
  wsh: 'productDetail',
  wmf: 'productDetail',
  obw: 'productDetail',
  wpi: 'productDetail',
  pif: 'productDetail',
  plt: 'productDetail',
  pwa: 'productDetail',
  isf: 'productDetail',
  pia: 'productDetail',
  oiw: 'productDetail'
}

export const PAGE_COMPONENT_DATA_KEY_BY_TYPE = {
  hpb: 'oHPB',
  mid: 'oMID',
  ids: 'oIDS',
  oids: 'oIDS',
  oIDS: 'oIDS',
  icd: 'oICD',
  ssc: 'oSSC',
  sc: 'oSC',
  pc: 'oPC',
  ps: 'oPS',
  tl: 'oTL',
  ts: 'oTS',
  wp: 'oWP',
  ins: 'oINS',
  cb: 'oCB',
  ihc: 'oIHC',
  ist: 'oIST',
  sla: 'oSLA',
  plp: 'oPLP',
  cuf: 'oCUF',
  ccc: 'oCCC',
  paa: 'oPAA',
  pal: 'oPAL',
  auh: 'oAUH',
  wwa: 'oWWA',
  cap: 'oCAP',
  wyp: 'oWYP',
  oia: 'oOIA',
  wbe: 'oWBE',
  alp: 'oALP',
  hwc: 'oHWC',
  omv: 'oOMV',
  ptf: 'oPTF',
  fca: 'oFCA',
  rec: 'oREC',
  uwb: 'oUWB',
  bba: 'oListingCopy',
  bcs: 'oListingCopy',
  bwe: 'oListingCopy',
  bpo: 'oListingCopy',
  bwp: 'oListingCopy',
  bcu: 'oListingCopy',
  bcy: 'oListingCopy',
  brr: 'oListingCopy',
  bvl: 'oListingCopy',
  su: 'oSU',
  epo: 'oEPO',
  dlf: 'oDLF',
  iov: 'oIOV',
  kod: 'oKOD',
  dse: 'oDSE',
  tis: 'oTIS',
  ovg: 'oOVG',
  mti: 'oMTI',
  dmm: 'oDMM',
  isg: 'oISG',
  pem: 'oPEM',
  afc: 'oAFC',
  lsc: 'oLSC',
  csc: 'oCSC',
  rsc: 'oRSC',
  faq: 'oFAQ',
  tfa: 'oTFA',
  itb: 'oITB',
  spb: 'oSPB',
  woe: 'oWOE',
  iip: 'oIIP',
  sac: 'oSAC',
  sic: 'oSIC',
  hip: 'oHIP',
  sis: 'oSIS',
  iai: 'oIAI',
  sgp: 'oSGP',
  svc: 'oSVC',
  sip: 'oSIP',
  suc: 'oSUC',
  scp: 'oSCP',
  sia: 'oSIA',
  pdm: 'oPDM',
  cce: 'oCCE',
  wdw: 'oWDW',
  waw: 'oWAW',
  wsh: 'oWSH',
  wmf: 'oWMF',
  obw: 'oOBW',
  wpi: 'oWPI',
  pif: 'oPIF',
  plt: 'oPLT',
  pwa: 'oPWA',
  isf: 'oISF',
  pia: 'oPIA',
  oiw: 'oOIW',
  b: 'aBenefit',
  b2: 'aBenefit2',
  wwb: 'oWWB',
  t: 'aTestimonial',
  ICType1: 'oICType1',
  ICType2: 'oICType2',
  ICType3: 'oICType3',
  ICType4: 'oICType4',
  ig: 'oIndustryGrid',
  is: 'oIndustrySlider',
  ltdiri: 'oLtdiri',
  ltirs: 'oLtirs'
}

export const CUSTOM_PAGE_LISTING_COPY_DATA_KEY_BY_TYPE = {
  bba: 'oBBA',
  bcs: 'oBCS',
  bwe: 'oBWE',
  bpo: 'oBPO',
  bwp: 'oBWP',
  bcu: 'oBCU',
  bcy: 'oBCR',
  brr: 'oBRR',
  bvl: 'oBVL',
  bmg: 'oBMG'
}

function getDefaultHeroBanner() {
  return {
    ...getDefaultHomeBannerHero(),
    aCta: [getDefaultCta(), getDefaultCta()]
  }
}

function getDefaultVideo() {
  return {
    sUrl: '',
    sText: '',
    sCaption: '',
    sAttribute: ''
  }
}

function getDefaultImageDescriptionSection() {
  return {
    sTitle: '',
    sDescription: '',
    oImg: getDefaultImage(),
    oVideo: getDefaultVideo()
  }
}

function getDefaultProductListingCard() {
  return {
    sProductName: '',
    sDescription: '',
    sRedirectUrl: '',
    eTarget: '_self'
  }
}

function getDefaultIndustryHeroCard() {
  return {
    sTitle: '',
    sDescription: '',
    sRedirectUrl: '',
    eTarget: '_self',
    oImg: getDefaultImage()
  }
}

function getDefaultIndustryStackCard() {
  return {
    sTitle: '',
    sDescription: '',
    sRedirectUrl: '',
    sButtonText: '',
    eTarget: '_self',
    oImg: getDefaultImage()
  }
}

function getDefaultContactInfo() {
  return {
    sTitle: '',
    sContact: '',
    sEmail: ''
  }
}

function getDefaultPartnershipLogo() {
  return {
    sName: '',
    oImg: getDefaultImage()
  }
}

function getDefaultListingCopy() {
  return {
    sListingTitle: '',
    sListingDescription: ''
  }
}

const DEFAULT_VALUE_BY_TYPE = {
  hpb: getDefaultHeroBanner,
  spb: () => ({ ...getDefaultHeroBanner(), sContent: '' }),
  mid: getDefaultImageDescriptionSection,
  ids: getDefaultImageDescriptionSection,
  oids: getDefaultImageDescriptionSection,
  oIDS: getDefaultImageDescriptionSection,
  icd: () => ({ aCard: getDefaultImpactCards() }),
  ssc: () => ({ sMainDescription: '', aSector: [getDefaultSector()] }),
  sc: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultLinkCard()] }),
  pc: () => ({ sTitle: '', sDescription: '', sProductName: '', sImageTitle: '', eMediaType: 'i', oImg: getDefaultImage(), aCard: [getDefaultProductCard()] }),
  ps: () => ({ sBadge: '', sTitle: '', sDescription: '', aCta: [getDefaultCta()] }),
  tl: () => ({ sTitle: '', aLogo: [getDefaultLogo()] }),
  ts: () => ({ sTitle: '', sDescription: '', aTestimonial: [getDefaultTestimonial()] }),
  ins: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultInsightCard()] }),
  wp: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultWhyProclinkCard()] }),
  cb: getDefaultCareerBanner,
  ihc: () => ({ sTitle: '', sDescription: '', sImageTitle: '', oImg: getDefaultImage(), aCard: [getDefaultIndustryHeroCard()] }),
  ist: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultIndustryStackCard()] }),
  sla: getDefaultServiceListingSection,
  plp: () => ({ sTitle: '', sDescription: '', sImageTitle: '', eMediaType: 'i', oImg: getDefaultImage(), aCard: [getDefaultProductListingCard()] }),
  cuf: () => ({
    sTitle: '',
    sDescription: '',
    sPhoneNumber: '',
    sEmail: '',
    sDropdownLabel: '',
    aDropdownOptions: [''],
    aField: [getDefaultContactField()],
    aSocialLinks: [getDefaultContactSocialLink()],
    oCta: getDefaultCta()
  }),
  ccc: () => ({ aContact: [getDefaultContactInfo()] }),
  paa: () => ({ sTitle: '', sDescription: '', oImg: getDefaultImage() }),
  pal: () => ({ aLogo: [getDefaultPartnershipLogo()] }),
  auh: () => ({ sTitle: '', aStatement: [getDefaultAboutStatement()] }),
  wwa: () => ({ sTitle: '', sDescription: '', aItem: [getDefaultWhoWeAreItem()] }),
  cap: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultCredibilityCard()] }),
  wyp: () => ({ sTitle: '', sContent: '', eMediaType: 'v', oMedia: getDefaultImage(), oThumbnail: getDefaultImage() }),
  oia: () => ({ sTitle: '', sDescription: '', aItem: [getDefaultOperationalInsightItem()] }),
  wbe: () => ({ sTitle: '', sDescription: '', oCta: getDefaultCta(), aItem: [getDefaultBeliefItem()] }),
  alp: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultAboutLeadershipCard()] }),
  hwc: () => ({ sTitle: '', sDescription: '', sLeftContent: '', sRightContent: '', oImg: getDefaultImage() }),
  omv: () => ({ sTitle: '', sDescription: '', aItem: [getDefaultMissionVisionItem()] }),
  ptf: () => ({ sTitle: '', aLine: getDefaultPictureFutureLines() }),
  iov: () => ({ sTitle: '', sContent: '' }),
  kod: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultFocusAreaCard()] }),
  dse: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultAnimatedFeatureCard()] }),
  tis: () => ({ sTitle: '', sDescription: '', aStat: [getDefaultTransformationStat()] }),
  ovg: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultMetricCard()] }),
  mti: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultTransformationImpactCard()], oTopLeft: getDefaultMediaReference(), oBottomRight: getDefaultMediaReference() }),
  dmm: () => ({ sMainDescription: '', sDescription: '', oImgLeft: getDefaultImage(), oImgRight: getDefaultImage() }),
  isg: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultIndustrialSectorCard()] }),
  pem: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultMetricCard()], bIsMarquee: true, aMarquee: [getDefaultMarqueeLogo()] }),
  afc: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultAnimatedFeatureCard()] }),
  lsc: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultLeadershipCard()] }),
  csc: () => ({ sTitle: '', sDescription: '', oImg: getDefaultImage(), aCard: [getDefaultContentShowcaseCard()] }),
  rsc: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultRelevantServiceCard()] }),
  faq: () => ({ sTitle: '', sDescription: '', aFaq: [getDefaultFaqItem()] }),
  tfa: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultFocusAreaCard()] }),
  itb: () => ({ sTitle: '', sDescription: '', oCta: getDefaultCta() }),
  woe: () => ({ sTitle: '', sSubtitle: '', aFeature: [getDefaultServiceFeatureCard()] }),
  iip: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultServiceImpactCard()] }),
  sac: () => ({ sTitle: '', sSubtitle: '', aCard: [getDefaultServiceAnimatedScrollCard()] }),
  sic: () => ({ sTitle: '', sDescription: '', oImg: getDefaultImage(), oCta: getDefaultCta() }),
  hip: () => ({ sTitle: '', sDescription: '', oImg: getDefaultImage(), aCard: [getDefaultFocusAreaCard()] }),
  sis: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultServiceSolutionCard()] }),
  iai: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultAnimatedFeatureCard()] }),
  sgp: getDefaultServiceGalleryPanel,
  svc: () => ({ aCard: [getDefaultServiceVisualCard()] }),
  sip: () => ({ sTitle: '', sDescription: '', aLine: [getDefaultServiceImpactLine()] }),
  suc: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultServiceUseCaseCard()] }),
  scp: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultServiceCapabilityCard()] }),
  sia: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultFocusAreaCard()] }),
  pdm: getDefaultDualMedia,
  cce: () => ({ sTitle: '', sDescription: '', aItem: [getDefaultTextItem()] }),
  wdw: () => ({ sTitle: '', sDescription: '', aItem: [getDefaultComparisonItem()] }),
  waw: () => ({ sTitle: '', aDescription: [getDefaultTextItem()] }),
  wsh: () => ({ sTitle: '', sDescription: '', oImg: getDefaultImage(), aCard: [getDefaultImageCard()] }),
  wmf: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultImageCard()] }),
  obw: () => ({ sTitle: '', sDescription: '', aItem: [getDefaultBenefitItem()] }),
  wpi: () => ({ sTitle: '', sDescription: '', aItem: [getDefaultTitleDescriptionItem()] }),
  pif: () => ({ sTitle: '', sDescription: '', aItem: [getDefaultProductInterfaceItem()] }),
  plt: () => ({ sTitle: '', sDescription: '', aItem: [getDefaultTextItem()] }),
  pwa: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultMediaImageCard()] }),
  isf: () => ({ sTitle: '', sDescription: '', aCard: [getDefaultImageTitleItem()] }),
  pia: () => ({ sTitle: '', sDescription: '', oCta: getDefaultCta(), aCard: [getDefaultImageTitleItem()] }),
  oiw: () => ({ sTitle: '', sDescription: '', aItem: [getDefaultTextItem()] }),
  su: () => ({ sTitle: '', sDescription: '', sPlaceholder: '', sButtonLabel: '' }),
  dlf: getDefaultDlfValue,
  epo: () => ({ sTitle: '', aLogo: [{ oImg: getDefaultImage(), sRedirectUrl: '' }] }),
  fca: () => ({ sSectionTitle: '', sHeadline: '', sDescription: '', oCta: getDefaultCta(), oImg: getDefaultImage(), aTags: [''] }),
  uwb: () => ({ sSectionTitle: '', aCard: [getDefaultUpcomingWebinarCard()] }),
  bba: getDefaultListingCopy,
  bcs: getDefaultListingCopy,
  bwe: getDefaultListingCopy,
  bpo: getDefaultListingCopy,
  bwp: getDefaultListingCopy,
  bcu: getDefaultListingCopy,
  bcy: getDefaultListingCopy,
  brr: getDefaultListingCopy,
  bvl: getDefaultListingCopy,
  bmg: getDefaultListingCopy
}

export function getComponentType(component = {}) {
  return component?.eType || component?.iId?.eType || ''
}

export function getComponentSearchText(component = {}) {
  return [
    getComponentType(component),
    component?.sComponentTitle,
    component?.iId?.sComponentTitle
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function generatePageComponentInstanceId() {
  return generateUniqueId()
}

export function getPageComponentInstanceId(component = {}) {
  const instanceId = component?.instanceId || component?.iId?.instanceId || component?.__componentInstanceId || ''

  return String(instanceId || '').trim()
}

export function ensurePageComponentInstanceId(component = {}) {
  if (!component || typeof component !== 'object') return component

  const instanceId = getPageComponentInstanceId(component) || generatePageComponentInstanceId(component)

  return {
    ...component,
    instanceId
  }
}

function hasText(text = '', terms = []) {
  return terms.some((term) => text.includes(term))
}

function isImageDescriptionSectionComponentType(componentType = '') {
  return IMAGE_DESCRIPTION_SECTION_COMPONENT_TYPES.has(String(componentType || '').toLowerCase())
}

export function isDynamicPageComponent(component = {}) {
  return (component?.eComponentType || component?.iId?.eComponentType || '').toLowerCase() === 'd'
}

export function getPageComponentEditorFamily(component = {}, pageType = '') {
  const componentType = getComponentType(component)
  const componentText = getComponentSearchText(component)
  const pageFamily = PAGE_FAMILY_BY_PAGE_TYPE[pageType]

  if (isDynamicPageComponent(component) && DYNAMIC_COMPONENT_TYPES.has(componentType)) return 'dynamic'
  if (ARTICLE_LISTING_COMPONENT_TYPES.has(componentType)) return pageFamily === 'headerCategory' ? 'headerCategory' : 'articleDetail'
  if (STATIC_COMPONENT_FAMILY_BY_TYPE[componentType]) return STATIC_COMPONENT_FAMILY_BY_TYPE[componentType]

  if (componentType === 'hpb') {
    if (hasText(componentText, ['contact'])) return 'contactPage'
    if (hasText(componentText, ['product'])) return 'productDetail'
    if (hasText(componentText, ['service']) && hasText(componentText, ['hub', 'listing', 'page'])) return 'servicePage'
    if (hasText(componentText, ['service'])) return 'serviceDetail'
    if (hasText(componentText, ['home'])) return 'homePage'
    return pageFamily === 'contactPage' || pageFamily === 'servicePage' || pageFamily === 'homePage' ? pageFamily : 'industryDetail'
  }

  if (componentType === 'cb') {
    if (hasText(componentText, ['about'])) return 'aboutPage'
    if (hasText(componentText, ['contact'])) return 'contactPage'
    if (hasText(componentText, ['partnership', 'alliance'])) return 'partnershipsAlliancesPage'
    if (hasText(componentText, ['product']) && hasText(componentText, ['hub', 'listing', 'page'])) return 'productPage'
    if (hasText(componentText, ['industry']) && hasText(componentText, ['hub', 'listing', 'page'])) return 'industryPage'
    if (hasText(componentText, ['service']) && hasText(componentText, ['hub', 'listing', 'page'])) return 'servicePage'
    return pageFamily && pageFamily !== 'customPage' ? pageFamily : 'serviceDetail'
  }

  if (componentType === 'faq' && hasText(componentText, ['partnership', 'alliance'])) return 'partnershipsAlliancesPage'
  if (componentType === 'ts') return hasText(componentText, ['industry']) || pageFamily === 'industryPage' ? 'industryPage' : 'homePage'
  if (['icd', 'pc', 'ins', 'wp'].includes(componentType)) return 'homePage'
  if (['sc', 'ssc'].includes(componentType)) return 'homePage'
  if (isImageDescriptionSectionComponentType(componentType)) return 'serviceDetail'
  if (componentType === 'mid') return pageFamily === 'homePage' || hasText(componentText, ['home']) ? 'homePage' : 'serviceDetail'
  if (componentType === 'tl') return pageFamily === 'homePage' || hasText(componentText, ['trusted']) ? 'homePage' : 'serviceDetail'
  if (componentType === 'dse') return 'industryDetail'
  if (componentType === 'isg') return hasText(componentText, ['solution']) ? 'serviceDetail' : 'industryDetail'
  if (['faq', 'rsc', 'lsc', 'pem', 'csc', 'ps'].includes(componentType)) return 'serviceDetail'

  return pageFamily || null
}

export function getPageComponentDataKey(component = {}, pageType = '') {
  const componentType = getComponentType(component)

  if (pageType === 'cp' && CUSTOM_PAGE_LISTING_COPY_DATA_KEY_BY_TYPE[componentType]) {
    return CUSTOM_PAGE_LISTING_COPY_DATA_KEY_BY_TYPE[componentType]
  }

  if (isImageDescriptionSectionComponentType(componentType)) return 'oIDS'

  return PAGE_COMPONENT_DATA_KEY_BY_TYPE[componentType] || ''
}

export function getPageComponentStorageKey(component = {}, pageType = '') {
  return getPageComponentInstanceId(component) || getPageComponentDataKey(component, pageType)
}

export function getPageComponentBasePath(component = {}, namespace = '', pageType = '') {
  const dataKey = getPageComponentStorageKey(component, pageType)
  if (!dataKey) return ''

  return [namespace, 'oComponents', dataKey].filter(Boolean).join('.')
}

export function getPageComponentDefaultValue(component = {}) {
  const componentType = getComponentType(component)
  const defaultFactory = isImageDescriptionSectionComponentType(componentType) ? getDefaultImageDescriptionSection : DEFAULT_VALUE_BY_TYPE[componentType]
  return defaultFactory ? defaultFactory(component) : {}
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value || {}, key)
}

function syncNestedMediaUrl(value = {}, mediaKey = '', urlKey = '') {
  const nestedMedia = isPlainObject(value?.[mediaKey]) ? value[mediaKey] : {}
  const legacyMedia = isPlainObject(value?.oImg) ? value.oImg : {}
  const mediaUrl = nestedMedia?.sUrl || value?.[urlKey] || legacyMedia?.sUrl || value?.sUrl || ''

  if (!mediaUrl) return value

  return {
    ...value,
    [urlKey]: mediaUrl,
    [mediaKey]: {
      ...nestedMedia,
      sUrl: mediaUrl
    }
  }
}

function hydrateMediaFormValue(value = {}, defaultValue = {}) {
  let nextValue = value

  if (hasOwn(defaultValue, 'sMediaUrl') && isPlainObject(defaultValue?.oVideo)) {
    nextValue = syncNestedMediaUrl(nextValue, 'oVideo', 'sMediaUrl')
  }

  if (hasOwn(defaultValue, 'sMediaUrl') && isPlainObject(defaultValue?.oMedia)) {
    nextValue = syncNestedMediaUrl(nextValue, 'oMedia', 'sMediaUrl')
  }

  if (hasOwn(defaultValue, 'sMediaUrl') && isPlainObject(defaultValue?.oImg)) {
    nextValue = syncNestedMediaUrl(nextValue, 'oImg', 'sMediaUrl')
  }

  if (hasOwn(defaultValue, 'sThumbnailUrl') && isPlainObject(defaultValue?.oThumbnail)) {
    nextValue = syncNestedMediaUrl(nextValue, 'oThumbnail', 'sThumbnailUrl')
  }

  if (hasOwn(defaultValue, 'sUrl') && hasOwn(defaultValue, 'sMediaUrl')) {
    const mediaUrl = nextValue?.sUrl || nextValue?.sMediaUrl || ''

    if (mediaUrl) {
      nextValue = {
        ...nextValue,
        sUrl: mediaUrl,
        sMediaUrl: mediaUrl
      }
    }
  }

  return nextValue
}

export function mergeDefaultFormValue(currentValue, defaultValue) {
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

    return hydrateMediaFormValue(nextValue, defaultValue)
  }

  return currentValue === undefined || currentValue === null ? defaultValue : currentValue
}

function normalizeMediaType(value = '', fallback = 'i') {
  if (value === 'i' || value === 'image') return 'i'
  if (value === 'v' || value === 'video') return 'v'

  return fallback
}

function normalizeSectorScrollSectorPayload(sector = {}) {
  const mediaUrl = sector?.sMediaUrl || sector?.oMedia?.sUrl || sector?.oImg?.sUrl || sector?.sUrl || ''

  return {
    sTitle: sector?.sTitle || '',
    sSlug: sector?.sSlug || '',
    sDescription: sector?.sDescription || '',
    sMediaUrl: mediaUrl,
    eMediaType: normalizeMediaType(sector?.eMediaType, 'i')
  }
}

export function normalizeSectorScrollPayload(value = {}) {
  return {
    ...value,
    sMainDescription: value?.sMainDescription || '',
    aSector: (Array.isArray(value?.aSector) ? value.aSector : []).map(normalizeSectorScrollSectorPayload)
  }
}

function normalizeMediaReferencePayload(value = {}) {
  return {
    sMediaUrl: value?.sMediaUrl || value?.sUrl || '',
    eMediaType: normalizeMediaType(value?.eMediaType, 'i')
  }
}

function normalizeManufacturingTransformationImpactPayload(value = {}) {
  return {
    ...value,
    oTopLeft: normalizeMediaReferencePayload(value?.oTopLeft),
    oBottomRight: normalizeMediaReferencePayload(value?.oBottomRight)
  }
}

function normalizeProductCardPayload(card = {}) {
  const { oImg, oMedia, sUrl, ...rest } = card || {}
  const mediaUrl = card?.sMediaUrl || oImg?.sUrl || oMedia?.sUrl || sUrl || ''

  return {
    ...rest,
    sProductName: card?.sProductName || '',
    sTitle: card?.sTitle || '',
    sDescription: card?.sDescription || '',
    sRedirectUrl: card?.sRedirectUrl || '',
    eTarget: card?.eTarget || '_self',
    eMediaType: normalizeMediaType(card?.eMediaType, 'i'),
    sMediaUrl: mediaUrl
  }
}

export function normalizeProductsComponentPayload(value = {}) {
  return {
    ...value,
    eMediaType: normalizeMediaType(value?.eMediaType, 'i'),
    aCard: (Array.isArray(value?.aCard) ? value.aCard : []).map(normalizeProductCardPayload)
  }
}

function normalizeWhyProclinkCardPayload(card = {}) {
  const { oMedia, sUrl, ...rest } = card || {}
  const oImg = isPlainObject(card?.oImg) ? card.oImg : {}
  const mediaUrl = card?.sMediaUrl || oImg?.sUrl || oMedia?.sUrl || sUrl || ''

  return {
    ...rest,
    sTitle: card?.sTitle || '',
    sDescription: card?.sDescription || '',
    sRedirectUrl: card?.sRedirectUrl || '',
    eTarget: card?.eTarget || '_self',
    oImg: {
      ...oImg,
      sUrl: mediaUrl
    },
    eMediaType: normalizeMediaType(card?.eMediaType, 'i'),
    sMediaUrl: mediaUrl
  }
}

export function normalizeWhyProclinkPayload(value = {}) {
  return {
    ...value,
    aCard: (Array.isArray(value?.aCard) ? value.aCard : []).map(normalizeWhyProclinkCardPayload)
  }
}

function normalizeProductInterfaceItemPayload(item = {}) {
  const { oMedia, sUrl, ...rest } = item || {}
  const oImg = isPlainObject(item?.oImg) ? item.oImg : {}
  const mediaUrl = item?.sMediaUrl || oImg?.sUrl || oMedia?.sUrl || sUrl || ''

  return {
    ...rest,
    sTitle: item?.sTitle || '',
    oImg: {
      ...oImg,
      sUrl: mediaUrl
    },
    eMediaType: normalizeMediaType(item?.eMediaType, 'i'),
    sMediaUrl: mediaUrl
  }
}

export function normalizeProductInterfacePayload(value = {}) {
  return {
    ...value,
    aItem: (Array.isArray(value?.aItem) ? value.aItem : []).map(normalizeProductInterfaceItemPayload)
  }
}

function normalizeProductWorkflowCardPayload(card = {}) {
  const { oMedia, sUrl, ...rest } = card || {}
  const oImg = isPlainObject(card?.oImg) ? card.oImg : {}
  const mediaUrl = card?.sMediaUrl || oImg?.sUrl || oMedia?.sUrl || sUrl || ''

  return {
    ...rest,
    sTitle: card?.sTitle || '',
    sDescription: card?.sDescription || '',
    oImg: {
      ...oImg,
      sUrl: mediaUrl
    },
    eMediaType: normalizeMediaType(card?.eMediaType, 'i'),
    sMediaUrl: mediaUrl
  }
}

export function normalizeProductWorkflowPayload(value = {}) {
  return {
    ...value,
    aCard: (Array.isArray(value?.aCard) ? value.aCard : []).map(normalizeProductWorkflowCardPayload)
  }
}

function normalizeLeadershipCardsForPayload(cards = []) {
  return (Array.isArray(cards) ? cards : []).map((card = {}) => ({
    ...card,
    sDescription: card?.sDescription || '',
    oPopupImg: card?.oPopupImg?.sUrl ? card.oPopupImg : null
  }))
}

function normalizeComponentValueForPayload(dataKey = '', value = {}) {
  if (dataKey === 'oDLF') return buildDlfPayload(value)
  if (dataKey === 'oSSC') return normalizeSectorScrollPayload(value)
  if (dataKey === 'oPC') return normalizeProductsComponentPayload(value)
  if (dataKey === 'oWP') return normalizeWhyProclinkPayload(value)
  if (dataKey === 'oMTI') return normalizeManufacturingTransformationImpactPayload(value)
  if (dataKey === 'oPIF') return normalizeProductInterfacePayload(value)
  if (dataKey === 'oPWA') return normalizeProductWorkflowPayload(value)
  if (dataKey === 'oLSC' || dataKey === 'oALP') {
    return {
      ...value,
      aCard: normalizeLeadershipCardsForPayload(value?.aCard)
    }
  }

  return value
}

export function normalizePageNamespaceComponents(namespaceData = {}, pageType = '') {
  const data = removeTypenameKey(namespaceData) || {}
  const selectedComponents = (Array.isArray(data?.aComponent) ? data.aComponent : []).map(ensurePageComponentInstanceId)
  const existingComponents = isPlainObject(data?.oComponents) ? removeTypenameKey(data.oComponents) || {} : {}
  const oComponents = { ...existingComponents }

  selectedComponents.forEach((component) => {
    const dataKey = getPageComponentDataKey(component, pageType)
    const storageKey = getPageComponentStorageKey(component, pageType)
    if (!dataKey) return

    let currentValue = data[dataKey]
    if (data[storageKey] !== undefined) currentValue = data[storageKey]
    if (existingComponents[dataKey] !== undefined) currentValue = existingComponents[dataKey]
    if (existingComponents[storageKey] !== undefined) currentValue = existingComponents[storageKey]

    oComponents[storageKey] = mergeDefaultFormValue(removeTypenameKey(currentValue), getPageComponentDefaultValue(component, pageType))
  })

  return {
    ...data,
    aComponent: selectedComponents,
    oComponents
  }
}

export function getPageComponentId(component = {}) {
  const rawId = component?.iId
  if (typeof rawId === 'string' && String(rawId).trim()) return String(rawId).trim()
  if (rawId && typeof rawId === 'object' && rawId._id != null && rawId._id !== '') {
    return String(rawId._id).trim()
  }
  if (component?._id != null && component._id !== '') return String(component._id).trim()
  return ''
}

export function normalizePageComponentForForm(component = {}) {
  const componentId = getPageComponentId(component)
  const sComponentTitle = component?.iId?.sComponentTitle || component?.sComponentTitle || ''
  const eComponentType = component?.eComponentType || component?.iId?.eComponentType || ''
  const eType = getComponentType(component)
  const instanceId = getPageComponentInstanceId(component) || generatePageComponentInstanceId(component)

  return {
    _id: componentId,
    iId: componentId ? { _id: componentId, sComponentTitle, eComponentType, eType } : component?.iId,
    eType,
    eComponentType,
    instanceId,
    sComponentTitle,
    sPreviewUrl: component?.sPreviewUrl || component?.iId?.sPreviewUrl || '',
    bIsStatic: component?.bIsStatic
  }
}

export function normalizeComponentSelectionForPayload(component = {}) {
  const componentId = getPageComponentId(component)
  const eType = getComponentType(component)
  if (!componentId || !eType) return null

  return {
    iId: componentId,
    eType,
    instanceId: getPageComponentInstanceId(component) || generatePageComponentInstanceId(component)
  }
}

export function buildPageNamespacePayload(namespaceData = {}, pageType = '') {
  const data = removeTypenameKey(namespaceData) || {}
  const selectedComponents = (Array.isArray(data?.aComponent) ? data.aComponent : []).map(ensurePageComponentInstanceId)
  const cleanComponents = selectedComponents.map(normalizeComponentSelectionForPayload).filter(Boolean)
  const oComponents = {}

  selectedComponents.forEach((component) => {
    const dataKey = getPageComponentDataKey(component, pageType)
    const storageKey = getPageComponentStorageKey(component, pageType)
    if (!dataKey) return

    if (data?.oComponents?.[storageKey] !== undefined) {
      oComponents[storageKey] = normalizeComponentValueForPayload(dataKey, data.oComponents[storageKey])
      return
    }

    if (data?.oComponents?.[dataKey] !== undefined) {
      oComponents[storageKey] = normalizeComponentValueForPayload(dataKey, data.oComponents[dataKey])
      return
    }

    if (data?.[storageKey] !== undefined) {
      oComponents[storageKey] = normalizeComponentValueForPayload(dataKey, data[storageKey])
      return
    }

    if (data?.[dataKey] !== undefined) {
      oComponents[storageKey] = normalizeComponentValueForPayload(dataKey, data[dataKey])
    }
  })

  return {
    aComponent: cleanComponents,
    oComponents
  }
}

export function findDuplicatePageComponentDataKeys(components = [], pageType = '') {
  const keysByDataKey = components.reduce((dataKeys, component) => {
    const dataKey = getPageComponentDataKey(component, pageType)
    if (!dataKey) return dataKeys

    dataKeys[dataKey] = dataKeys[dataKey] || []
    dataKeys[dataKey].push(component)

    return dataKeys
  }, {})

  return Object.keys(keysByDataKey)
    .filter((dataKey) => {
      const componentTypes = new Set(keysByDataKey[dataKey].map(getComponentType).filter(Boolean))

      return componentTypes.size > 1
    })
    .map((dataKey) => ({
      dataKey,
      components: keysByDataKey[dataKey]
    }))
}
