import React from 'react'
import PropTypes from 'prop-types'

import CareerBannerSection from '../home-page-static/career-banner-section'
import TestimonialsSection from '../home-page-static/testimonials-section'
import IndustryHeroSection from './industry-hero-section'
import IndustryStackSection from './industry-stack-section'

function IndustryCareerBannerSection({ basePath = 'oIndustryPage.oCB' }) {
  return <CareerBannerSection basePath={basePath} />
}

function IndustryTestimonialsSection({ basePath = 'oIndustryPage.oTS' }) {
  return <TestimonialsSection basePath={basePath} />
}

IndustryCareerBannerSection.propTypes = {
  basePath: PropTypes.string
}

IndustryTestimonialsSection.propTypes = {
  basePath: PropTypes.string
}

const componentMap = {
  ihc: IndustryHeroSection,
  ist: IndustryStackSection,
  cb: IndustryCareerBannerSection,
  ts: IndustryTestimonialsSection
}

export default function IndustryPageStaticComponent({ basePath, component }) {
  const componentType = component?.eType || component?.iId?.eType
  const Component = componentMap?.[componentType]

  if (!Component) return component?.sComponentTitle || component?.iId?.sComponentTitle || componentType || null

  return <Component basePath={basePath} component={component} />
}

IndustryPageStaticComponent.propTypes = {
  basePath: PropTypes.string,
  component: PropTypes.object
}
