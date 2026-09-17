import React from 'react'
import PropTypes from 'prop-types'

import TransformationFocusAreasSection from './transformation-focus-areas-section'

export default function KeyOperationalDomainsSection({ basePath = 'oKOD' }) {
  return <TransformationFocusAreasSection basePath={basePath} sectionLabel="Key Operational Domains" cardsLabel="Domain Cards" showSlug />
}

KeyOperationalDomainsSection.propTypes = {
  basePath: PropTypes.string
}
