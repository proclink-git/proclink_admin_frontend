import React from 'react'
import PropTypes from 'prop-types'

import { getS3Url } from 'shared/utils'

const SvgPreview = ({ src, className, alt = 'SVG preview' }) => {
  const previewUrl = getS3Url(src)

  return (
    <object className={`media-svg-preview ${className || ''}`} data={previewUrl} type="image/svg+xml" aria-label={alt}>
      <img className={className} src={previewUrl} alt={alt} />
    </object>
  )
}

SvgPreview.propTypes = {
  src: PropTypes.string,
  className: PropTypes.string,
  alt: PropTypes.string
}

export default SvgPreview
