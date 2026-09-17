import React from 'react'
import PropTypes from 'prop-types'

import ProofStripSection from './proof-strip-section'

export default function IndustryTextCtaBannerSection({ basePath = 'oITB' }) {
  return <ProofStripSection basePath={basePath} sectionLabel="Industry Text CTA Banner" showBadge={false} titleLabel="Title" ctaField="oCta" ctaLabel="CTA Label" ctaUrlLabel="CTA Link" />
}

IndustryTextCtaBannerSection.propTypes = {
  basePath: PropTypes.string
}
