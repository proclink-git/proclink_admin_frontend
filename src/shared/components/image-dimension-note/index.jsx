import React from 'react'
import PropTypes from 'prop-types'

import EditorNote from 'shared/components/editor-note'

const highlightedTextStyle = {
  color: 'var(--primary-300)',
  fontWeight: 700
}

function formatDimensionValue(value) {
  if (value === undefined || value === null) return ''

  const dimension = String(value).trim()

  if (!dimension) return ''
  if (/^-?\d+(\.\d+)?$/.test(dimension)) return `${dimension}px`

  return dimension
}

function getDimensionText({ dimensions, width, height }) {
  const dimensionText = String(dimensions || '').trim()
  const formattedWidth = formatDimensionValue(width)
  const formattedHeight = formatDimensionValue(height)

  if (dimensionText) return dimensionText
  if (formattedWidth && formattedHeight) return `${formattedWidth} x ${formattedHeight} (width x height)`
  if (formattedWidth) return `${formattedWidth} width`
  if (formattedHeight) return `${formattedHeight} height`

  return ''
}

export default function ImageDimensionNote({
  children,
  className = 'mb-3',
  dimensions,
  height,
  subject = 'image',
  title = 'Image Dimension',
  width
}) {
  const dimensionText = getDimensionText({ dimensions, width, height })

  if (!children && !dimensionText) return null

  return (
    <EditorNote title={title} className={className}>
      {children || (
        <>
          For better design, upload or use the {subject} with the recommended dimension:{' '}
          <span style={highlightedTextStyle}>{dimensionText}</span>.
        </>
      )}
    </EditorNote>
  )
}

ImageDimensionNote.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  dimensions: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  subject: PropTypes.string,
  title: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
}
