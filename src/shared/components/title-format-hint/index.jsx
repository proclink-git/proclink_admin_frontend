import React from 'react'
import PropTypes from 'prop-types'

import EditorNote from 'shared/components/editor-note'

function getSubjectLabel(subject = 'title') {
  return String(subject)
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function TitleFormatHint({ subject = 'title', className = 'mb-3' }) {
  const subjectLabel = getSubjectLabel(subject)

  return (
    <EditorNote title={`${subjectLabel} Format`} className={className}>
      Use <span style={{ color: 'var(--primary-300)', fontWeight: 700 }}>|</span> to split the {subject} into multiple lines.
    </EditorNote>
  )
}

TitleFormatHint.propTypes = {
  subject: PropTypes.string,
  className: PropTypes.string
}
