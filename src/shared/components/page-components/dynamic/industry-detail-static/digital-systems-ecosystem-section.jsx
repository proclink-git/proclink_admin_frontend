import React from 'react'
import PropTypes from 'prop-types'

import AnimatedFeatureCardsSection from './animated-feature-cards-section'

export default function DigitalSystemsEcosystemSection({ basePath = 'oDSE' }) {
  return (
    <AnimatedFeatureCardsSection
      basePath={basePath}
      sectionLabel="Digital Systems Ecosystem"
      cardsLabel="System Cards"
      showSlug
      imageWidth={412}
      imageHeight={540}
      imageDimensionSubject="digital systems ecosystem image"
    />
  )
}

DigitalSystemsEcosystemSection.propTypes = {
  basePath: PropTypes.string
}
