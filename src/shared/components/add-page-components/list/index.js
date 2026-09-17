import React, { Suspense, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'
import { useFormContext } from 'react-hook-form'

import InputArrayBox from 'shared/components/input-array-box'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { getEditorComponentSectionId, getEditorComponentSectionLabel } from 'shared/components/editor-section-navigator/utils'
import BrowseContentSection from 'shared/components/page-components/dynamic/header-category-static/browse-content-section'
import {
  getPageComponentBasePath,
  getPageComponentEditorFamily,
  getPageComponentInstanceId
} from 'shared/components/page-components/registry'

const HomePageStaticComponent = React.lazy(() => import('shared/components/page-components/dynamic/home-page-static'))
const ArticleStaticComponent = React.lazy(() => import('shared/components/page-components/dynamic/article-static'))
const HeaderCategoryStaticComponent = React.lazy(() => import('shared/components/page-components/dynamic/header-category-static'))
const IndustryDetailStaticComponent = React.lazy(() => import('shared/components/page-components/dynamic/industry-detail-static'))
const IndustryPageStaticComponent = React.lazy(() => import('shared/components/page-components/dynamic/industry-page-static'))
const ProductDetailStaticComponent = React.lazy(() => import('shared/components/page-components/dynamic/product-detail-static'))
const ProductPageStaticComponent = React.lazy(() => import('shared/components/page-components/dynamic/product-page-static'))
const ServiceDetailStaticComponent = React.lazy(() => import('shared/components/page-components/dynamic/service-detail-static'))
const ServicePageStaticComponent = React.lazy(() => import('shared/components/page-components/dynamic/service-page-static'))
const ContactPageStaticComponent = React.lazy(() => import('shared/components/page-components/dynamic/contact-page-static'))
const AboutPageStaticComponent = React.lazy(() => import('shared/components/page-components/dynamic/about-page-static'))
const PartnershipsAlliancesPageStaticComponent = React.lazy(() => import('shared/components/page-components/dynamic/partnerships-alliances-page-static'))
const Benefit = React.lazy(() => import('shared/components/page-components/dynamic/benefit'))
const Benefit2 = React.lazy(() => import('shared/components/page-components/dynamic/benefit2'))
const WhatWeBelieve = React.lazy(() => import('shared/components/page-components/dynamic/what-we-believe'))
const TestimonialsComponent = React.lazy(() => import('shared/components/page-components/dynamic/testimonials'))
const ServicesMultiImg = React.lazy(() => import('shared/components/page-components/dynamic/services-multiImg'))
const InformativeContentThree = React.lazy(() => import('shared/components/page-components/dynamic/informative-content-three'))
const IndustriesGrid = React.lazy(() => import('shared/components/page-components/dynamic/industries-grid'))
const InformativeContentFour = React.lazy(() => import('shared/components/page-components/dynamic/informative-content-four'))
const InformativeContentOne = React.lazy(() => import('shared/components/page-components/dynamic/informative-content-one'))
const IndustriesSlider = React.lazy(() => import('shared/components/page-components/dynamic/industries-slider'))
const InformativeContentTwo = React.lazy(() => import('shared/components/page-components/dynamic/informative-content-two'))
const Faq = React.lazy(() => import('shared/components/page-components/dynamic/faq'))
const LTDiri = React.lazy(() => import('shared/components/page-components/dynamic/ltdiri'))
const Ltirs = React.lazy(() => import('shared/components/page-components/dynamic/ltirs'))
const ServiceComponent = React.lazy(() => import('shared/components/page-components/dynamic/service-component'))
const SubServiceComponent = React.lazy(() => import('shared/components/page-components/dynamic/sub-service-component'))

function getComponentType(component = {}) {
  return component?.eType || component?.iId?.eType || ''
}

function getComponentCollapseKey(component = {}, index = 0) {
  const componentType = getComponentType(component) || 'component'
  const componentId = component?._id || component?.iId?._id || component?.iId || componentType
  const componentInstanceId = getPageComponentInstanceId(component)

  return `${componentInstanceId || `${componentId}-${index}`}-${componentType}`
}

function getComponentPanelId(component = {}, index = 0) {
  return `editor-component-panel-${getComponentCollapseKey(component, index).replace(/[^a-zA-Z0-9_-]+/g, '-')}`
}

function buildCollapsedComponentState(components = [], previousState = {}) {
  return components.reduce((nextState, component, index) => {
    const componentKey = getComponentCollapseKey(component, index)

    nextState[componentKey] = previousState[componentKey] || false

    return nextState
  }, {})
}

function hasSameCollapseState(nextState = {}, previousState = {}) {
  const nextKeys = Object.keys(nextState)
  const previousKeys = Object.keys(previousState)

  if (nextKeys.length !== previousKeys.length) return false

  return nextKeys.every((key) => nextState[key] === previousState[key])
}

function buildBulkCollapseState(components = [], isCollapsed = false) {
  return components.reduce((nextState, component, index) => {
    nextState[getComponentCollapseKey(component, index)] = isCollapsed

    return nextState
  }, {})
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

const ARTICLE_LISTING_COMPONENT_TYPES = new Set(['bba', 'bcs', 'bwe', 'bpo', 'bwp', 'bcu', 'bcy', 'brr', 'bvl'])
const MEDIA_GALLERY_BROWSE_COMPONENT_TYPE = 'bmg'
const CUSTOM_PAGE_DISPLAY_ONLY_BROWSE_COMPONENT_TYPES = new Set([...ARTICLE_LISTING_COMPONENT_TYPES, MEDIA_GALLERY_BROWSE_COMPONENT_TYPE])

function CustomPageBrowseContentComponent({ component }) {
  return (
    <BrowseContentSection
      basePath=""
      sectionLabel={component?.iId?.sComponentTitle || component?.sComponentTitle || 'Browse Content'}
    />
  )
}

CustomPageBrowseContentComponent.propTypes = {
  basePath: PropTypes.string,
  component: PropTypes.object
}

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

function getCustomPageComponentFamily(component = {}) {
  const componentType = getComponentType(component)
  const componentText = getComponentSearchText(component)

  if (ARTICLE_LISTING_COMPONENT_TYPES.has(componentType)) return 'articleDetail'
  if (isImageDescriptionSectionComponentType(componentType)) return 'serviceDetail'
  if (STATIC_COMPONENT_FAMILY_BY_TYPE[componentType]) return STATIC_COMPONENT_FAMILY_BY_TYPE[componentType]

  if (componentType === 'hpb') {
    if (hasText(componentText, ['contact'])) return 'contactPage'
    if (hasText(componentText, ['product'])) return 'productDetail'
    if (hasText(componentText, ['service']) && hasText(componentText, ['hub', 'listing', 'page'])) return 'servicePage'
    if (hasText(componentText, ['service'])) return 'serviceDetail'
    if (hasText(componentText, ['home'])) return 'homePage'
    return 'industryDetail'
  }

  if (componentType === 'cb') {
    if (hasText(componentText, ['about'])) return 'aboutPage'
    if (hasText(componentText, ['contact'])) return 'contactPage'
    if (hasText(componentText, ['partnership', 'alliance'])) return 'partnershipsAlliancesPage'
    if (hasText(componentText, ['product']) && hasText(componentText, ['hub', 'listing', 'page'])) return 'productPage'
    if (hasText(componentText, ['industry']) && hasText(componentText, ['hub', 'listing', 'page'])) return 'industryPage'
    if (hasText(componentText, ['service']) && hasText(componentText, ['hub', 'listing', 'page'])) return 'servicePage'
    return 'serviceDetail'
  }

  if (componentType === 'faq' && hasText(componentText, ['partnership', 'alliance'])) return 'partnershipsAlliancesPage'
  if (componentType === 'ts') return hasText(componentText, ['industry']) ? 'industryPage' : 'homePage'
  if (['icd', 'pc', 'ins', 'wp'].includes(componentType)) return 'homePage'
  if (['sc', 'ssc'].includes(componentType)) return 'homePage'
  if (isImageDescriptionSectionComponentType(componentType)) return 'serviceDetail'
  if (componentType === 'mid') return 'serviceDetail'
  if (componentType === 'tl') return 'serviceDetail'
  if (componentType === 'dse') return 'industryDetail'
  if (componentType === 'isg') return hasText(componentText, ['solution']) ? 'serviceDetail' : 'industryDetail'
  if (['faq', 'rsc', 'lsc', 'pem', 'csc', 'ps'].includes(componentType)) return 'serviceDetail'

  return null
}

function AddPageComponentsList({
  name,
  testimonialsName,
  industriesName,
  benefitName,
  wwbName,
  benefitComponentTitle,
  testimonialComponentDescription,
  testimonialComponentTitle,
  faqName,
  ltdiriName,
  ltirsName,
  industryGridName,
  serviceComponent,
  subServiceComponent,
  staticComponentGroup,
  namespace,
  pageType,
  anchorPrefix
}) {
  const { watch, setValue } = useFormContext()
  const componentsList = watch(name) || []
  const componentKeys = componentsList.map((component, index) => getComponentCollapseKey(component, index)).join('|')
  const isHomePageFlow = name === 'oHomePage.aComponent'
  const isIndustryPageFlow = name === 'oIndustryPage.aComponent'
  const isProductPageFlow = name === 'oProductPage.aComponent'
  const isServicePageFlow = name === 'oServicePage.aComponent'
  const isContactPageFlow = name === 'oContactUsPage.aComponent'
  const isAboutPageFlow = name === 'oAboutUs.aComponent'
  const isPartnershipsAlliancesPageFlow = name === 'oPartnershipsAlliancesPage.aComponent'
  const isHeaderCategoryFlow = staticComponentGroup === 'headerCategory'
  const isArticleDetailFlow = staticComponentGroup === 'articleDetail'
  const isIndustryDetailFlow = staticComponentGroup === 'industryDetail'
  const isProductDetailFlow = staticComponentGroup === 'productDetail'
  const isServiceDetailFlow = staticComponentGroup === 'serviceDetail'
  const isCustomPageFlow = staticComponentGroup === 'customPage'
  const isOComponentsFlow = pageType && namespace !== undefined
  const [collapsedComponents, setCollapsedComponents] = useState(() => buildCollapsedComponentState(componentsList))

  useEffect(() => {
    setCollapsedComponents((currentState) => {
      const nextState = buildCollapsedComponentState(componentsList, currentState)

      return hasSameCollapseState(nextState, currentState) ? currentState : nextState
    })
  }, [componentKeys])

  const handleDragEnd = (result) => {
    const { source, destination } = result
    if (!destination) return

    const reorder = (list, startIndex, endIndex) => {
      const result = Array.from(list)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      return result
    }

    const updatedCategories = reorder(componentsList, source.index, destination.index)
    setValue(name, updatedCategories, { shouldDirty: true, shouldValidate: true })
  }

  const dynamicComponent = {
    b: Benefit,
    b2: Benefit2,
    wwb: WhatWeBelieve,
    t: TestimonialsComponent,
    mid: ServicesMultiImg,
    ICType1: InformativeContentOne,
    ICType2: InformativeContentTwo,
    ICType3: InformativeContentThree,
    ICType4: InformativeContentFour,
    ig: IndustriesGrid,
    is: IndustriesSlider,
    faq: Faq,
    ltdiri: LTDiri,
    ltirs: Ltirs,
    sc: ServiceComponent,
    ssc: SubServiceComponent
  }

  const homePageDynamicComponent = {
    hpb: HomePageStaticComponent,
    mid: HomePageStaticComponent,
    icd: HomePageStaticComponent,
    ssc: HomePageStaticComponent,
    sc: HomePageStaticComponent,
    pc: HomePageStaticComponent,
    ps: HomePageStaticComponent,
    tl: HomePageStaticComponent,
    ts: HomePageStaticComponent,
    ins: HomePageStaticComponent,
    wp: HomePageStaticComponent,
    cb: HomePageStaticComponent
  }

  const headerCategoryDynamicComponent = {
    fca: HeaderCategoryStaticComponent,
    rec: HeaderCategoryStaticComponent,
    bba: HeaderCategoryStaticComponent,
    bcs: HeaderCategoryStaticComponent,
    bwe: HeaderCategoryStaticComponent,
    bpo: HeaderCategoryStaticComponent,
    bwp: HeaderCategoryStaticComponent,
    bcu: HeaderCategoryStaticComponent,
    bcy: HeaderCategoryStaticComponent,
    brr: HeaderCategoryStaticComponent,
    bvl: HeaderCategoryStaticComponent,
    bmg: HeaderCategoryStaticComponent,
    uwb: HeaderCategoryStaticComponent,
    cb: HeaderCategoryStaticComponent
  }

  const articleDetailDynamicComponent = {
    faq: ArticleStaticComponent,
    rsc: ArticleStaticComponent,
    cb: ArticleStaticComponent,
    su: ArticleStaticComponent,
    lsc: ArticleStaticComponent,
    epo: ArticleStaticComponent,
    pem: ArticleStaticComponent,
    dlf: ArticleStaticComponent,
    bba: ArticleStaticComponent,
    bpo: ArticleStaticComponent,
    bcs: ArticleStaticComponent,
    bcu: ArticleStaticComponent,
    bcy: ArticleStaticComponent,
    brr: ArticleStaticComponent,
    bvl: ArticleStaticComponent,
    bwe: ArticleStaticComponent,
    bwp: ArticleStaticComponent
  }

  const industryPageDynamicComponent = {
    ihc: IndustryPageStaticComponent,
    ist: IndustryPageStaticComponent,
    ts: IndustryPageStaticComponent,
    cb: IndustryPageStaticComponent
  }

  const servicePageDynamicComponent = {
    hpb: ServicePageStaticComponent,
    sla: ServicePageStaticComponent,
    cb: ServicePageStaticComponent
  }

  const productPageDynamicComponent = {
    plp: ProductPageStaticComponent,
    cb: ProductPageStaticComponent
  }

  const contactPageDynamicComponent = {
    hpb: ContactPageStaticComponent,
    cuf: ContactPageStaticComponent,
    ccc: ContactPageStaticComponent,
    cb: ContactPageStaticComponent
  }

  const aboutPageDynamicComponent = {
    auh: AboutPageStaticComponent,
    wwa: AboutPageStaticComponent,
    cap: AboutPageStaticComponent,
    wyp: AboutPageStaticComponent,
    oia: AboutPageStaticComponent,
    wbe: AboutPageStaticComponent,
    alp: AboutPageStaticComponent,
    hwc: AboutPageStaticComponent,
    omv: AboutPageStaticComponent,
    ptf: AboutPageStaticComponent,
    cb: AboutPageStaticComponent
  }

  const partnershipsAlliancesPageDynamicComponent = {
    paa: PartnershipsAlliancesPageStaticComponent,
    pal: PartnershipsAlliancesPageStaticComponent,
    faq: PartnershipsAlliancesPageStaticComponent,
    cb: PartnershipsAlliancesPageStaticComponent
  }

  const industryDetailDynamicComponent = {
    hpb: IndustryDetailStaticComponent,
    iov: IndustryDetailStaticComponent,
    kod: IndustryDetailStaticComponent,
    dse: IndustryDetailStaticComponent,
    tis: IndustryDetailStaticComponent,
    ovg: IndustryDetailStaticComponent,
    mti: IndustryDetailStaticComponent,
    dmm: IndustryDetailStaticComponent,
    isg: IndustryDetailStaticComponent,
    pem: IndustryDetailStaticComponent,
    afc: IndustryDetailStaticComponent,
    lsc: IndustryDetailStaticComponent,
    csc: IndustryDetailStaticComponent,
    rsc: IndustryDetailStaticComponent,
    faq: IndustryDetailStaticComponent,
    ps: IndustryDetailStaticComponent,
    tfa: IndustryDetailStaticComponent,
    itb: IndustryDetailStaticComponent,
    cb: IndustryDetailStaticComponent
  }

  const serviceDetailDynamicComponent = {
    spb: ServiceDetailStaticComponent,
    mid: ServiceDetailStaticComponent,
    ids: ServiceDetailStaticComponent,
    oids: ServiceDetailStaticComponent,
    oIDS: ServiceDetailStaticComponent,
    woe: ServiceDetailStaticComponent,
    iip: ServiceDetailStaticComponent,
    sac: ServiceDetailStaticComponent,
    dse: ServiceDetailStaticComponent,
    sic: ServiceDetailStaticComponent,
    ps: ServiceDetailStaticComponent,
    hip: ServiceDetailStaticComponent,
    sis: ServiceDetailStaticComponent,
    pem: ServiceDetailStaticComponent,
    iai: ServiceDetailStaticComponent,
    lsc: ServiceDetailStaticComponent,
    faq: ServiceDetailStaticComponent,
    csc: ServiceDetailStaticComponent,
    rsc: ServiceDetailStaticComponent,
    cb: ServiceDetailStaticComponent,
    hpb: ServiceDetailStaticComponent,
    sgp: ServiceDetailStaticComponent,
    svc: ServiceDetailStaticComponent,
    sip: ServiceDetailStaticComponent,
    suc: ServiceDetailStaticComponent,
    scp: ServiceDetailStaticComponent,
    sia: ServiceDetailStaticComponent,
    tl: ServiceDetailStaticComponent,
    isg: ServiceDetailStaticComponent
  }

  const productDetailDynamicComponent = {
    hpb: ProductDetailStaticComponent,
    pdm: ProductDetailStaticComponent,
    cce: ProductDetailStaticComponent,
    wdw: ProductDetailStaticComponent,
    waw: ProductDetailStaticComponent,
    wsh: ProductDetailStaticComponent,
    wmf: ProductDetailStaticComponent,
    obw: ProductDetailStaticComponent,
    wpi: ProductDetailStaticComponent,
    pif: ProductDetailStaticComponent,
    plt: ProductDetailStaticComponent,
    pwa: ProductDetailStaticComponent,
    isf: ProductDetailStaticComponent,
    isg: ProductDetailStaticComponent,
    pia: ProductDetailStaticComponent,
    oiw: ProductDetailStaticComponent,
    ps: ProductDetailStaticComponent,
    faq: ProductDetailStaticComponent,
    rsc: ProductDetailStaticComponent,
    cb: ProductDetailStaticComponent
  }

  const componentMapsByFamily = {
    dynamic: dynamicComponent,
    homePage: homePageDynamicComponent,
    headerCategory: headerCategoryDynamicComponent,
    articleDetail: articleDetailDynamicComponent,
    industryPage: industryPageDynamicComponent,
    servicePage: servicePageDynamicComponent,
    productPage: productPageDynamicComponent,
    contactPage: contactPageDynamicComponent,
    aboutPage: aboutPageDynamicComponent,
    partnershipsAlliancesPage: partnershipsAlliancesPageDynamicComponent,
    industryDetail: industryDetailDynamicComponent,
    serviceDetail: serviceDetailDynamicComponent,
    productDetail: productDetailDynamicComponent
  }
  const customPageFallbackComponentMaps = [
    articleDetailDynamicComponent,
    serviceDetailDynamicComponent,
    industryDetailDynamicComponent,
    productDetailDynamicComponent,
    aboutPageDynamicComponent,
    partnershipsAlliancesPageDynamicComponent,
    contactPageDynamicComponent,
    productPageDynamicComponent,
    servicePageDynamicComponent,
    industryPageDynamicComponent,
    homePageDynamicComponent,
    headerCategoryDynamicComponent,
    dynamicComponent
  ]

  let componentMap = dynamicComponent

  if (isHeaderCategoryFlow) {
    componentMap = headerCategoryDynamicComponent
  } else if (isArticleDetailFlow) {
    componentMap = articleDetailDynamicComponent
  } else if (isIndustryDetailFlow) {
    componentMap = industryDetailDynamicComponent
  } else if (isProductDetailFlow) {
    componentMap = productDetailDynamicComponent
  } else if (isServiceDetailFlow) {
    componentMap = serviceDetailDynamicComponent
  } else if (isHomePageFlow) {
    componentMap = homePageDynamicComponent
  } else if (isIndustryPageFlow) {
    componentMap = industryPageDynamicComponent
  } else if (isProductPageFlow) {
    componentMap = productPageDynamicComponent
  } else if (isServicePageFlow) {
    componentMap = servicePageDynamicComponent
  } else if (isContactPageFlow) {
    componentMap = contactPageDynamicComponent
  } else if (isAboutPageFlow) {
    componentMap = aboutPageDynamicComponent
  } else if (isPartnershipsAlliancesPageFlow) {
    componentMap = partnershipsAlliancesPageDynamicComponent
  }

  if (!componentsList.length) return null

  const collapsedCount = componentsList.reduce(
    (count, component, index) => count + (collapsedComponents[getComponentCollapseKey(component, index)] ? 1 : 0),
    0
  )
  const allCollapsed = collapsedCount === componentsList.length
  const allExpanded = collapsedCount === 0

  function handleToggleComponent(componentKey) {
    setCollapsedComponents((currentState) => ({
      ...currentState,
      [componentKey]: !currentState[componentKey]
    }))
  }

  function handleToggleAll(isCollapsed) {
    setCollapsedComponents(buildBulkCollapseState(componentsList, isCollapsed))
  }

  function getCustomPageComponent(component = {}) {
    const componentType = getComponentType(component)

    if (!componentType) return null
    if (isDynamicPageComponent(component) && dynamicComponent[componentType]) return dynamicComponent[componentType]

    const componentFamily = getCustomPageComponentFamily(component)
    if (componentFamily && componentMapsByFamily[componentFamily]?.[componentType]) {
      return componentMapsByFamily[componentFamily][componentType]
    }

    const fallbackComponent = customPageFallbackComponentMaps.find((map) => map?.[componentType])?.[componentType]
    if (fallbackComponent) return fallbackComponent

    return hasText(getComponentSearchText(component), ['browse']) ? CustomPageBrowseContentComponent : null
  }

  function getComponentFromFamily(component = {}, componentFamily) {
    const componentType = getComponentType(component)
    if (!componentType) return null

    if (componentFamily === 'dynamic' && dynamicComponent[componentType]) return dynamicComponent[componentType]
    if (componentFamily && componentMapsByFamily[componentFamily]?.[componentType]) {
      return componentMapsByFamily[componentFamily][componentType]
    }

    const fallbackComponent = customPageFallbackComponentMaps.find((map) => map?.[componentType])?.[componentType]
    if (fallbackComponent) return fallbackComponent

    return hasText(getComponentSearchText(component), ['browse']) ? CustomPageBrowseContentComponent : null
  }

  return (
    <div className="editor-component-list">
      <div className="editor-component-list__toolbar">
        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          className="editor-component-list__toolbar-btn"
          onClick={() => handleToggleAll(true)}
          disabled={allCollapsed}
        >
          Collapse All
        </Button>
        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          className="editor-component-list__toolbar-btn"
          onClick={() => handleToggleAll(false)}
          disabled={allExpanded}
        >
          Expand All
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="droppable" type="droppable-component">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {componentsList.map((component, index) => {
                const componentType = getComponentType(component)
                const componentFamily = isOComponentsFlow ? getPageComponentEditorFamily(component, pageType) : null
                let Com = componentMap?.[componentType]
                if (isOComponentsFlow) Com = getComponentFromFamily(component, componentFamily)
                else if (isCustomPageFlow) Com = getCustomPageComponent(component)
                else if (isArticleDetailFlow) Com = getComponentFromFamily(component, 'articleDetail')
                let basePath
                if (isOComponentsFlow) basePath = getPageComponentBasePath(component, namespace, pageType)
                else if (isArticleDetailFlow) basePath = getPageComponentBasePath(component) || undefined
                if (isCustomPageFlow && CUSTOM_PAGE_DISPLAY_ONLY_BROWSE_COMPONENT_TYPES.has(componentType)) basePath = ''
                const componentKey = getComponentCollapseKey(component, index)
                const componentLabel = getEditorComponentSectionLabel(component, index)
                const isCollapsed = collapsedComponents[componentKey] || false
                const panelId = getComponentPanelId(component, index)
                const sectionId = anchorPrefix ? getEditorComponentSectionId(anchorPrefix, component, index) : undefined

                return (
                  <Draggable key={componentKey} draggableId={componentKey} index={index}>
                    {(providedDraggable) => (
                      <div
                        ref={providedDraggable.innerRef}
                        {...providedDraggable.draggableProps}
                        id={sectionId}
                        className={`mb-3 ${anchorPrefix ? 'editor-section-target' : ''}`}
                      >
                        <InputArrayBox
                          className="editor-component-card"
                          actions={
                            <div className="editor-component-card__actions">
                              <div
                                className="editor-component-card__drag-handle square icon-btn btn btn-link btn-sm"
                                {...providedDraggable.dragHandleProps}
                              >
                                <i className="icon-drag-indicator d-block" />
                              </div>
                              <Button
                                type="button"
                                variant="link"
                                size="sm"
                                className="square icon-btn editor-component-card__toggle"
                                onClick={() => handleToggleComponent(componentKey)}
                                aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${componentLabel}`}
                                aria-expanded={!isCollapsed}
                                aria-controls={panelId}
                              >
                                <i className={`${isCollapsed ? 'icon-chevron-down' : 'icon-chevron-up'} d-block`} />
                              </Button>
                            </div>
                          }
                        >
                          {isCollapsed && (
                            <button
                              type="button"
                              className="editor-component-card__summary"
                              onClick={() => handleToggleComponent(componentKey)}
                              aria-expanded={!isCollapsed}
                              aria-controls={panelId}
                            >
                              <span className="editor-component-card__summary-content">
                                <span className="editor-component-card__summary-label">{componentLabel}</span>
                              </span>
                              <span className="editor-component-card__summary-icon" aria-hidden="true">
                                <i className="icon-chevron-down d-block" />
                              </span>
                            </button>
                          )}

                          <div id={panelId} className="editor-component-card__panel" hidden={isCollapsed}>
                            {!isCollapsed && (
                              <Suspense fallback={null}>
                                {Com ? (
                                  <Com
                                    basePath={basePath}
                                    testimonialsName={testimonialsName}
                                    industriesName={industriesName}
                                    benefitName={benefitName}
                                    wwbName={wwbName}
                                    benefitComponentTitle={benefitComponentTitle}
                                    testimonialComponentTitle={testimonialComponentTitle}
                                    testimonialComponentDescription={testimonialComponentDescription}
                                    faqName={faqName}
                                    ltdiriName={ltdiriName}
                                    ltirsName={ltirsName}
                                    industryGridName={industryGridName}
                                    serviceComponent={serviceComponent}
                                    subServiceComponent={subServiceComponent}
                                    component={component}
                                  />
                                ) : (
                                  <div className="editor-component-card__fallback">{componentLabel}</div>
                                )}
                              </Suspense>
                            )}
                          </div>
                        </InputArrayBox>
                      </div>
                    )}
                  </Draggable>
                )
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
export default AddPageComponentsList

AddPageComponentsList.propTypes = {
  name: PropTypes.string,
  testimonialsName: PropTypes.string,
  industriesName: PropTypes.string,
  benefitName: PropTypes.string,
  wwbName: PropTypes.string,
  benefitComponentTitle: PropTypes.string,
  testimonialComponentTitle: PropTypes.string,
  testimonialComponentDescription: PropTypes.string,
  faqName: PropTypes.string,
  ltdiriName: PropTypes.string,
  ltirsName: PropTypes.string,
  industryGridName: PropTypes.string,
  serviceComponent: PropTypes.string,
  subServiceComponent: PropTypes.string,
  staticComponentGroup: PropTypes.string,
  namespace: PropTypes.string,
  pageType: PropTypes.string,
  anchorPrefix: PropTypes.string
}
