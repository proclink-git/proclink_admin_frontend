import React from 'react'
import PropTypes from 'prop-types'

import AnimatedFeatureCardsSection from './animated-feature-cards-section'

export default function OperationalValueGridSection({ basePath = 'oOVG' }) {
  return (
    <AnimatedFeatureCardsSection
      basePath={basePath}
      sectionLabel="Operational Value Grid"
      cardsLabel="Value Cards"
      showSectionDescription={false}
      imageWidth={1920}
      imageHeight={1000}
      imageDimensionSubject="operational value grid image"
    />
  )
}

OperationalValueGridSection.propTypes = {
  basePath: PropTypes.string
}
