import React from 'react'
import PropTypes from 'prop-types'

import CareerBannerSection from '../home-page-static/career-banner-section'
import BrowseContentSection, { shouldShowBrowseContentSettings } from './browse-content-section'
import FeaturedArticleSection from './featured-article-section'
import RecommendedEditorialContentSection from './recommended-editorial-content-section'
import UpcomingWebinarsSection from './upcoming-webinars-section'

function HeaderCategoryCareerBannerSection({ basePath = 'oCB' }) {
  return <CareerBannerSection basePath={basePath} sectionLabel="Career Banner" />
}

function HeaderCategoryBrowseContentSection({ basePath, component }) {
  const componentType = component?.eType || component?.iId?.eType
  const resolvedBasePath = componentType === 'bmg' && !basePath ? '' : basePath || 'oListingCopy'

  return (
    <BrowseContentSection
      basePath={resolvedBasePath}
      sectionLabel={component?.iId?.sComponentTitle || component?.sComponentTitle || 'Browse Content'}
      showSettings={shouldShowBrowseContentSettings(componentType)}
    />
  )
}

HeaderCategoryBrowseContentSection.propTypes = {
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

HeaderCategoryCareerBannerSection.propTypes = {
  basePath: PropTypes.string
}

function HeaderCategoryRecommendedEditorialContentSection({ basePath = 'oREC', component }) {
  return (
    <RecommendedEditorialContentSection basePath={basePath} sectionLabel={component?.iId?.sComponentTitle || component?.sComponentTitle || 'Related Editorial Content'} />
  )
}

HeaderCategoryRecommendedEditorialContentSection.propTypes = {
  basePath: PropTypes.string,
  component: PropTypes.shape({
    eType: PropTypes.string,
    sComponentTitle: PropTypes.string,
    iId: PropTypes.shape({
      sComponentTitle: PropTypes.string
    })
  })
}

const componentMap = {
  fca: FeaturedArticleSection,
  rec: HeaderCategoryRecommendedEditorialContentSection,
  bba: HeaderCategoryBrowseContentSection,
  bcs: HeaderCategoryBrowseContentSection,
  bwe: HeaderCategoryBrowseContentSection,
  bpo: HeaderCategoryBrowseContentSection,
  bwp: HeaderCategoryBrowseContentSection,
  bcu: HeaderCategoryBrowseContentSection,
  bcy: HeaderCategoryBrowseContentSection,
  brr: HeaderCategoryBrowseContentSection,
  bvl: HeaderCategoryBrowseContentSection,
  bmg: HeaderCategoryBrowseContentSection,
  uwb: UpcomingWebinarsSection,
  cb: HeaderCategoryCareerBannerSection
}

export default function HeaderCategoryStaticComponent({ basePath, component }) {
  const componentType = component?.eType || component?.iId?.eType
  const Component = componentMap?.[componentType]

  if (!Component) return component?.iId?.sComponentTitle || component?.sComponentTitle || componentType || null

  return <Component basePath={basePath} component={component} />
}

HeaderCategoryStaticComponent.propTypes = {
  basePath: PropTypes.string,
  component: PropTypes.object
}
