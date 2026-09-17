import React from 'react'
import { useParams } from 'react-router-dom'

const HomeBanner = React.lazy(() => import('shared/components/page-components/home-banner'))
const ProductsComponent = React.lazy(() => import('shared/components/page-components/products-component'))
const MultipleImageDescription = React.lazy(() => import('shared/components/page-components/multiple-image-description'))
const ImpactCards = React.lazy(() => import('shared/components/page-components/impact-cards'))
const SectorScroll = React.lazy(() => import('shared/components/page-components/sector-scroll'))
const ServiceComponent = React.lazy(() => import('shared/components/page-components/service-component'))
const ProofStrip = React.lazy(() => import('shared/components/page-components/proof-strip'))
const TrustedLogos = React.lazy(() => import('shared/components/page-components/trusted-logos'))
const TestimonialsSection = React.lazy(() => import('shared/components/page-components/testimonials-section'))
const WhyProclink = React.lazy(() => import('shared/components/page-components/why-proclink'))
const InsightsGrid = React.lazy(() => import('shared/components/page-components/insights-grid'))
const IndustryHeroComponent = React.lazy(() => import('shared/components/page-components/industry-hero-component'))
const IndustryStackComponent = React.lazy(() => import('shared/components/page-components/industry-stack-component'))
const CareerBanner = React.lazy(() => import('shared/components/page-components/career-banner'))
const ServiceListingAccordion = React.lazy(() => import('shared/components/page-components/service-listing-accordion'))
// const InformativeContentOne = React.lazy(() => import('shared/components/page-components/dynamic/informative-content-one'))
// const InformativeContentTwo = React.lazy(() => import('shared/components/page-components/dynamic/informative-content-two'))
// const InformativeContentThree = React.lazy(() => import('shared/components/page-components/dynamic/informative-content-three'))
// const InformativeContentFour = React.lazy(() => import('shared/components/page-components/dynamic/informative-content-four'))

export default function PageComponentEdit() {
  const { eType } = useParams()
  if (eType) {
    const component = {
      hpb: HomeBanner,
      mid: MultipleImageDescription,
      ids: MultipleImageDescription,
      oids: MultipleImageDescription,
      oIDS: MultipleImageDescription,
      icd: ImpactCards,
      ssc: SectorScroll,
      pc: ProductsComponent,
      sc: ServiceComponent,
      ps: ProofStrip,
      tl: TrustedLogos,
      ts: TestimonialsSection,
      wp: WhyProclink,
      ins: InsightsGrid,
      ihc: IndustryHeroComponent,
      ist: IndustryStackComponent,
      cb: CareerBanner,
      sla: ServiceListingAccordion
      // ICType1: InformativeContentOne,
      // ICType2: InformativeContentTwo
      // ICType3: InformativeContentThree,
      // ICType4: InformativeContentFour
    }
    const Render = component?.[eType]
    return component?.[eType] ? <Render /> : null
  }
  return null
}
