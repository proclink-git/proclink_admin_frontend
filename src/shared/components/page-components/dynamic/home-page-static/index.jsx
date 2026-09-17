import React from 'react'
import PropTypes from 'prop-types'

import HomeBannerSection from './home-banner-section'
import ImpactCardsSection from './impact-cards-section'
import InsightsGridSection from './insights-grid-section'
import MultipleImageDescriptionSection from './multiple-image-description-section'
import ProductsComponentSection from './products-component-section'
import ProofStripSection from './proof-strip-section'
import SectorScrollSection from './sector-scroll-section'
import ServiceComponentSection from './service-component-section'
import TestimonialsSection from './testimonials-section'
import TrustedLogosSection from './trusted-logos-section'
import WhyProclinkSection from './why-proclink-section'
import CareerBannerSection from './career-banner-section'

const componentMap = {
  hpb: HomeBannerSection,
  mid: MultipleImageDescriptionSection,
  icd: ImpactCardsSection,
  ssc: SectorScrollSection,
  sc: ServiceComponentSection,
  pc: ProductsComponentSection,
  ps: ProofStripSection,
  tl: TrustedLogosSection,
  ts: TestimonialsSection,
  ins: InsightsGridSection,
  wp: WhyProclinkSection,
  cb: CareerBannerSection
}

export default function HomePageStaticComponent({ basePath, component }) {
  const componentType = component?.eType || component?.iId?.eType
  const Component = componentMap?.[componentType]

  if (!Component) return component?.sComponentTitle || component?.iId?.sComponentTitle || componentType || null

  return <Component basePath={basePath} component={component} />
}

HomePageStaticComponent.propTypes = {
  basePath: PropTypes.string,
  component: PropTypes.object
}
