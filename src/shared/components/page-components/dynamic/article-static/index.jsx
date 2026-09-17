import React from 'react'
import PropTypes from 'prop-types'
import { useParams } from 'react-router'

import CareerBannerSection from '../home-page-static/career-banner-section'
import TrustedLogosSection from '../home-page-static/trusted-logos-section'
import FaqSection from '../industry-detail-static/faq-section'
import LeadershipShowcaseSection from '../industry-detail-static/leadership-showcase-section'
import PlatformEcosystemMetricsSection from '../industry-detail-static/platform-ecosystem-metrics-section'
import RelevantServicesCarouselSection from '../industry-detail-static/relevant-services-carousel-section'
import BrowseContentSection, { shouldShowBrowseContentSettings } from '../header-category-static/browse-content-section'
import DownloadLeadFormSection from './download-lead-form-section'
import SubscribeSection from './subscribe-section'

const ARTICLE_LISTING_COPY_COMPONENT_TYPES = ['bba', 'bcs', 'bcu', 'bcy', 'brr', 'bvl', 'bwe', 'bwp', 'bpo']

function ArticleFaqSection({ basePath = 'oFAQ' }) {
  return <FaqSection basePath={basePath} sectionLabel="FAQ" itemsLabel="FAQ Items" />
}

function ArticleRelevantServicesCarouselSection({ basePath = 'oRSC' }) {
  return <RelevantServicesCarouselSection basePath={basePath} sectionLabel="Relevant Services Carousel" cardsLabel="Service Cards" />
}

function ArticleCareerBannerSection({ basePath = 'oCB' }) {
  return <CareerBannerSection basePath={basePath} sectionLabel="Career Banner" />
}

function ArticleSubscribeSection({ basePath = 'oSU' }) {
  return <SubscribeSection basePath={basePath} sectionLabel="Subscribe Section" />
}

function ArticleLeadershipShowcaseSection({ basePath = 'oLSC' }) {
  return <LeadershipShowcaseSection basePath={basePath} sectionLabel="Leadership Showcase" cardsLabel="Leadership Cards" imageLabel="Portrait" />
}

function ArticleExclusivePodcastPlatformsSection({ basePath = 'oEPO' }) {
  return <TrustedLogosSection basePath={basePath} sectionLabel="Exclusive Podcast Platforms" itemLabel="Logo" showRedirectUrl />
}

function ArticlePlatformEcosystemMetricsSection({ basePath = 'oPEM' }) {
  return <PlatformEcosystemMetricsSection basePath={basePath} sectionLabel="Platform Ecosystem Metrics" cardsLabel="Metric Cards" marqueeLabel="Marquee Logos" />
}

function ArticleDownloadLeadFormSection({ basePath = 'oDLF' }) {
  const { categoryType } = useParams()

  return (
    <DownloadLeadFormSection
      basePath={basePath}
      sectionLabel="Download Lead Form"
      formType={categoryType}
      hideFormPurpose={categoryType === 'w'}
      linkedFormTypeName={categoryType === 'w' ? 'oDLF.eFormType' : ''}
      durationLabelName={categoryType === 'w' ? 'oWebInar.sDurationLabel' : ''}
    />
  )
}

function ArticleBrowseContentSection({ basePath = 'oListingCopy', component }) {
  const componentType = component?.eType || component?.iId?.eType

  return (
    <BrowseContentSection
      basePath={basePath}
      sectionLabel={component?.iId?.sComponentTitle || component?.sComponentTitle || 'Browse Content'}
      showSettings={shouldShowBrowseContentSettings(componentType)}
    />
  )
}

ArticleBrowseContentSection.propTypes = {
  basePath: PropTypes.string,
  component: PropTypes.shape({
    eType: PropTypes.string,
    sComponentTitle: PropTypes.string,
    iId: PropTypes.shape({
      eType: PropTypes.string,
      sComponentTitle: PropTypes.string
    })
  })
}

const basePathPropTypes = {
  basePath: PropTypes.string
}

ArticleFaqSection.propTypes = basePathPropTypes
ArticleRelevantServicesCarouselSection.propTypes = basePathPropTypes
ArticleCareerBannerSection.propTypes = basePathPropTypes
ArticleSubscribeSection.propTypes = basePathPropTypes
ArticleLeadershipShowcaseSection.propTypes = basePathPropTypes
ArticleExclusivePodcastPlatformsSection.propTypes = basePathPropTypes
ArticlePlatformEcosystemMetricsSection.propTypes = basePathPropTypes
ArticleDownloadLeadFormSection.propTypes = basePathPropTypes

const componentMap = {
  faq: ArticleFaqSection,
  rsc: ArticleRelevantServicesCarouselSection,
  cb: ArticleCareerBannerSection,
  su: ArticleSubscribeSection,
  lsc: ArticleLeadershipShowcaseSection,
  epo: ArticleExclusivePodcastPlatformsSection,
  pem: ArticlePlatformEcosystemMetricsSection,
  dlf: ArticleDownloadLeadFormSection,
  ...ARTICLE_LISTING_COPY_COMPONENT_TYPES.reduce((components, type) => ({ ...components, [type]: ArticleBrowseContentSection }), {})
}

export default function ArticleStaticComponent({ basePath, component }) {
  const componentType = component?.eType || component?.iId?.eType
  const Component = componentMap?.[componentType]

  if (!Component) return component?.iId?.sComponentTitle || component?.sComponentTitle || componentType || null

  return <Component basePath={basePath} component={component} />
}

ArticleStaticComponent.propTypes = {
  basePath: PropTypes.string,
  component: PropTypes.object
}
