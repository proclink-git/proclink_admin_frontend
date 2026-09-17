import React from 'react'
import PropTypes from 'prop-types'

import CareerBannerSection from '../home-page-static/career-banner-section'
import AnimatedFeatureCardsSection from './animated-feature-cards-section'
import ContentShowcaseSection from './content-showcase-section'
import DigitalSystemsEcosystemSection from './digital-systems-ecosystem-section'
import DigitalModernManufacturingSection from './digital-modern-manufacturing-section'
import FaqSection from './faq-section'
import HomeBannerSection from './home-banner-section'
import IndustrialSectorsGridSection from './industrial-sectors-grid-section'
import IndustryOverviewSection from './industry-overview-section'
import IndustryTextCtaBannerSection from './industry-text-cta-banner-section'
import KeyOperationalDomainsSection from './key-operational-domains-section'
import LeadershipShowcaseSection from './leadership-showcase-section'
import ManufacturingTransformationImpactSection from './manufacturing-transformation-impact-section'
import OperationalValueGridSection from './operational-value-grid-section'
import PlatformEcosystemMetricsSection from './platform-ecosystem-metrics-section'
import ProofStripSection from './proof-strip-section'
import RelevantServicesCarouselSection from './relevant-services-carousel-section'
import TransformationImpactStatsSection from './transformation-impact-stats-section'
import TransformationFocusAreasSection from './transformation-focus-areas-section'

function IndustryDetailCareerBannerSection({ basePath = 'oCB' }) {
  return <CareerBannerSection basePath={basePath} />
}

function IndustryTransformationFocusAreasSection({ basePath = 'oTFA' }) {
  return <TransformationFocusAreasSection basePath={basePath} showSlug />
}

IndustryDetailCareerBannerSection.propTypes = {
  basePath: PropTypes.string
}

IndustryTransformationFocusAreasSection.propTypes = {
  basePath: PropTypes.string
}

const componentMap = {
  hpb: HomeBannerSection,
  iov: IndustryOverviewSection,
  kod: KeyOperationalDomainsSection,
  dse: DigitalSystemsEcosystemSection,
  tis: TransformationImpactStatsSection,
  ovg: OperationalValueGridSection,
  mti: ManufacturingTransformationImpactSection,
  dmm: DigitalModernManufacturingSection,
  isg: IndustrialSectorsGridSection,
  pem: PlatformEcosystemMetricsSection,
  afc: AnimatedFeatureCardsSection,
  lsc: LeadershipShowcaseSection,
  csc: ContentShowcaseSection,
  rsc: RelevantServicesCarouselSection,
  faq: FaqSection,
  ps: ProofStripSection,
  tfa: IndustryTransformationFocusAreasSection,
  itb: IndustryTextCtaBannerSection,
  cb: IndustryDetailCareerBannerSection
}

export default function IndustryDetailStaticComponent({ basePath, component }) {
  const componentType = component?.eType || component?.iId?.eType
  const Component = componentMap?.[componentType]

  if (!Component) return component?.iId?.sComponentTitle || component?.sComponentTitle || componentType || null

  return <Component basePath={basePath} component={component} />
}

IndustryDetailStaticComponent.propTypes = {
  basePath: PropTypes.string,
  component: PropTypes.object
}
