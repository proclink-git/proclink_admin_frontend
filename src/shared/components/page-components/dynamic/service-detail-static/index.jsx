import React from 'react'
import PropTypes from 'prop-types'

import MultipleImageDescriptionSection from '../home-page-static/multiple-image-description-section'
import TrustedLogosSection from '../home-page-static/trusted-logos-section'
import CareerBannerSection from '../home-page-static/career-banner-section'
import AnimatedFeatureCardsSection from '../industry-detail-static/animated-feature-cards-section'
import ContentShowcaseSection from '../industry-detail-static/content-showcase-section'
import FaqSection from '../industry-detail-static/faq-section'
import IndustrialSectorsGridSection from '../industry-detail-static/industrial-sectors-grid-section'
import LeadershipShowcaseSection from '../industry-detail-static/leadership-showcase-section'
import PlatformEcosystemMetricsSection from '../industry-detail-static/platform-ecosystem-metrics-section'
import ProofStripSection from '../industry-detail-static/proof-strip-section'
import RelevantServicesCarouselSection from '../industry-detail-static/relevant-services-carousel-section'
import TransformationFocusAreasSection from '../industry-detail-static/transformation-focus-areas-section'
import ImplementationImpactSection from './implementation-impact-section'
import ServiceCapabilitiesSection from './service-capabilities-section'
import ServiceAnimatedScrollCardsSection from './service-animated-scroll-cards-section'
import ServiceGalleryPanelSection from './service-gallery-panel-section'
import ServiceImpactLinesSection from './service-impact-lines-section'
import ServiceImageCtaSection from './service-image-cta-section'
import ServicePageBannerSection from './service-page-banner-section'
import ServiceProcessSection from './service-process-section'
import ServiceUseCasesSection from './service-use-cases-section'
import ServiceVisualCardsSection from './service-visual-cards-section'
import SpecializedImplementationSolutionsSection from './specialized-implementation-solutions-section'
import WhenOrganizationsEngageSection from './when-organizations-engage-section'

function ServiceMultipleImageDescriptionSection({ basePath = 'oMID' }) {
  return <MultipleImageDescriptionSection basePath={basePath} sectionLabel="Multiple Image Description" imageWidth={1320} imageHeight={500} useRichTextDescription descriptionMinHeight={360} />
}

function ServiceImageDescriptionSection({ basePath = 'oIDS', component }) {
  return (
    <MultipleImageDescriptionSection
      basePath={basePath}
      sectionLabel={component?.iId?.sComponentTitle || component?.sComponentTitle || 'Image Description Section'}
      imageDimensionSubject="image description section image"
      imageWidth={824}
      imageHeight={648}
      useRichTextDescription
      descriptionMinHeight={360}
    />
  )
}

function ServiceDigitalSystemsEcosystemSection({ basePath = 'oDSE' }) {
  return <AnimatedFeatureCardsSection basePath={basePath} sectionLabel="Digital Systems Ecosystem" cardsLabel="System Cards" showSlug />
}

function ServicePlatformEcosystemMetricsSection({ basePath = 'oPEM' }) {
  return <PlatformEcosystemMetricsSection basePath={basePath} sectionLabel="Platform Ecosystem Metrics" cardsLabel="Metric Cards" marqueeLabel="Marquee Logos" />
}

function ServiceImplementationAcrossIndustriesSection({ basePath = 'oIAI' }) {
  return (
    <AnimatedFeatureCardsSection
      basePath={basePath}
      sectionLabel="Implementation Across Industries"
      cardsLabel="Industry Cards"
      showRedirectUrl
      showCardsDesignNote={false}
      imageWidth={260}
      imageHeight={260}
      imageDimensionSubject="implementation across industries image"
    />
  )
}

function ServiceLeadershipShowcaseSection({ basePath = 'oLSC' }) {
  return <LeadershipShowcaseSection basePath={basePath} sectionLabel="Leadership Showcase" cardsLabel="Leadership Cards" imageLabel="Portrait" />
}

function ServiceFaqSection({ basePath = 'oFAQ' }) {
  return <FaqSection basePath={basePath} sectionLabel="FAQ" itemsLabel="FAQ Items" />
}

function ServiceContentShowcaseSection({ basePath = 'oCSC' }) {
  return <ContentShowcaseSection basePath={basePath} sectionLabel="Content Showcase" cardsLabel="Content Cards" />
}

function ServiceRelevantServicesCarouselSection({ basePath = 'oRSC' }) {
  return <RelevantServicesCarouselSection basePath={basePath} sectionLabel="Relevant Services Carousel" cardsLabel="Service Cards" />
}

function ServiceCareerBannerSection({ basePath = 'oCB' }) {
  return <CareerBannerSection basePath={basePath} sectionLabel="Career Banner" />
}

function ServiceHomePageBannerSection({ basePath = 'oHPB' }) {
  return <ServicePageBannerSection basePath={basePath} showContentField={false} />
}

function ServiceTrustedLogosSection({ basePath = 'oTL' }) {
  return <TrustedLogosSection basePath={basePath} sectionLabel="Technology Logos" itemLabel="Logo" />
}

function ServiceIndustrySolutionsGridSection({ basePath = 'oISG' }) {
  return <IndustrialSectorsGridSection basePath={basePath} sectionLabel="Industry Solutions Grid" cardsLabel="Industry Cards" />
}

function ServiceInformationAreasSection({ basePath = 'oSIA' }) {
  return <TransformationFocusAreasSection basePath={basePath} sectionLabel="Service Information Areas" cardsLabel="Area Cards" />
}

const basePathPropTypes = {
  basePath: PropTypes.string
}

ServiceMultipleImageDescriptionSection.propTypes = basePathPropTypes
ServiceImageDescriptionSection.propTypes = {
  ...basePathPropTypes,
  component: PropTypes.object
}
ServiceDigitalSystemsEcosystemSection.propTypes = basePathPropTypes
ServicePlatformEcosystemMetricsSection.propTypes = basePathPropTypes
ServiceImplementationAcrossIndustriesSection.propTypes = basePathPropTypes
ServiceLeadershipShowcaseSection.propTypes = basePathPropTypes
ServiceFaqSection.propTypes = basePathPropTypes
ServiceContentShowcaseSection.propTypes = basePathPropTypes
ServiceRelevantServicesCarouselSection.propTypes = basePathPropTypes
ServiceCareerBannerSection.propTypes = basePathPropTypes
ServiceHomePageBannerSection.propTypes = basePathPropTypes
ServiceTrustedLogosSection.propTypes = basePathPropTypes
ServiceIndustrySolutionsGridSection.propTypes = basePathPropTypes
ServiceInformationAreasSection.propTypes = basePathPropTypes

const componentMap = {
  spb: ServicePageBannerSection,
  mid: ServiceMultipleImageDescriptionSection,
  ids: ServiceImageDescriptionSection,
  oids: ServiceImageDescriptionSection,
  oIDS: ServiceImageDescriptionSection,
  woe: WhenOrganizationsEngageSection,
  iip: ImplementationImpactSection,
  sac: ServiceAnimatedScrollCardsSection,
  dse: ServiceDigitalSystemsEcosystemSection,
  sic: ServiceImageCtaSection,
  ps: ProofStripSection,
  hip: ServiceProcessSection,
  sis: SpecializedImplementationSolutionsSection,
  pem: ServicePlatformEcosystemMetricsSection,
  iai: ServiceImplementationAcrossIndustriesSection,
  lsc: ServiceLeadershipShowcaseSection,
  faq: ServiceFaqSection,
  csc: ServiceContentShowcaseSection,
  rsc: ServiceRelevantServicesCarouselSection,
  cb: ServiceCareerBannerSection,
  hpb: ServiceHomePageBannerSection,
  sgp: ServiceGalleryPanelSection,
  svc: ServiceVisualCardsSection,
  sip: ServiceImpactLinesSection,
  suc: ServiceUseCasesSection,
  scp: ServiceCapabilitiesSection,
  sia: ServiceInformationAreasSection,
  tl: ServiceTrustedLogosSection,
  isg: ServiceIndustrySolutionsGridSection
}

export default function ServiceDetailStaticComponent({ basePath, component }) {
  const componentType = component?.eType || component?.iId?.eType
  const Component = componentMap?.[componentType]

  if (!Component) return component?.iId?.sComponentTitle || component?.sComponentTitle || componentType || null

  return <Component basePath={basePath} component={component} />
}

ServiceDetailStaticComponent.propTypes = {
  basePath: PropTypes.string,
  component: PropTypes.object
}
