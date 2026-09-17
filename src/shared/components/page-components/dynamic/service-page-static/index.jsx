import React from 'react'
import PropTypes from 'prop-types'

import HomeBannerSection from '../home-page-static/home-banner-section'
import CareerBannerSection from '../home-page-static/career-banner-section'
import ServiceListingAccordionSection from '../../service-listing-accordion/section'

function ServicePageHomeBannerSection({ basePath = 'oServicePage.oHPB' }) {
  return <HomeBannerSection basePath={basePath} showEyebrow={false} />
}

function ServicePageCareerBannerSection({ basePath = 'oServicePage.oCB' }) {
  return <CareerBannerSection basePath={basePath} />
}

function ServicePageListingAccordionSection({ basePath = 'oServicePage.oSLA' }) {
  return <ServiceListingAccordionSection basePath={basePath} />
}

ServicePageHomeBannerSection.propTypes = {
  basePath: PropTypes.string
}

ServicePageCareerBannerSection.propTypes = {
  basePath: PropTypes.string
}

ServicePageListingAccordionSection.propTypes = {
  basePath: PropTypes.string
}

const componentMap = {
  hpb: ServicePageHomeBannerSection,
  sla: ServicePageListingAccordionSection,
  cb: ServicePageCareerBannerSection
}

export default function ServicePageStaticComponent({ basePath, component }) {
  const componentType = component?.eType || component?.iId?.eType
  const Component = componentMap?.[componentType]

  if (!Component) return component?.sComponentTitle || component?.iId?.sComponentTitle || componentType || null

  return <Component basePath={basePath} component={component} />
}

ServicePageStaticComponent.propTypes = {
  basePath: PropTypes.string,
  component: PropTypes.object
}
