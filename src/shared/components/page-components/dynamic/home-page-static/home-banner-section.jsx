import React from 'react'
import PropTypes from 'prop-types'
import { HomeBannerRow } from 'shared/components/page-components/home-banner/row'

export default function HomeBannerSection({ basePath = 'oHomePage.oHPB', showEyebrow = true, showCtaControls = false, showCtaSection = true }) {
  return (
    <div className="p-3">
      <HomeBannerRow
        basePath={basePath}
        registerTypeField={false}
        showCtaControls={showCtaControls}
        showCtaSection={showCtaSection}
        showEyebrow={showEyebrow}
      />
    </div>
  )
}

HomeBannerSection.propTypes = {
  basePath: PropTypes.string,
  showCtaControls: PropTypes.bool,
  showCtaSection: PropTypes.bool,
  showEyebrow: PropTypes.bool,
  sectionLabel: PropTypes.string
}
