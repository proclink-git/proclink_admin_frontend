import React from 'react'
import PropTypes from 'prop-types'

import { HomeBannerRow } from 'shared/components/page-components/home-banner/row'

export default function HomeBannerSection({ basePath = 'oHPB' }) {
  return (
    <div className="p-3">
      <HomeBannerRow basePath={basePath} registerTypeField={false} showCtaControls={false} />
    </div>
  )
}

HomeBannerSection.propTypes = {
  basePath: PropTypes.string
}
