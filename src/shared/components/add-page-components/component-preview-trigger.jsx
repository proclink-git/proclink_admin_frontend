import React from 'react'
import PropTypes from 'prop-types'
import { OverlayTrigger, Popover } from 'react-bootstrap'

import Img from 'shared/components/image'
import { getS3Url } from 'shared/utils'
import { getPageComponentInstanceId } from 'shared/components/page-components/registry'

function getComponentKey(component = {}) {
  return getPageComponentInstanceId(component) || component?.iId?._id || component?.iId || component?._id || component?.eType || 'component-preview'
}

function getComponentTitle(component = {}) {
  return component?.iId?.sComponentTitle || component?.sComponentTitle || component?.eType || 'Component'
}

function stopEventPropagation(event) {
  event.stopPropagation()
}

function stopSelectionEvent(event) {
  event.preventDefault()
  event.stopPropagation()
}

function handleKeyDown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
  }

  event.stopPropagation()
}

export default function ComponentPreviewTrigger({ component }) {
  const previewUrl = component?.sPreviewUrl
  const componentKey = getComponentKey(component)
  const title = getComponentTitle(component)
  const overlayContainer = typeof document !== 'undefined' ? document.body : undefined

  if (!title && !component?.eType && !componentKey) return null

  return (
    <OverlayTrigger
      trigger={['hover', 'focus']}
      placement="left"
      container={overlayContainer}
      overlay={
        <Popover id={`component-preview-${String(componentKey).replace(/[^a-zA-Z0-9_-]+/g, '-')}`} className="component-preview-popover">
          <Popover.Header as="div">{title}</Popover.Header>
          <Popover.Body>
            {previewUrl ? (
              <Img src={getS3Url(previewUrl)} alt={`${title} preview`} className="component-preview-popover__image" />
            ) : (
              <div className="component-preview-popover__empty">Preview is not available for this component yet.</div>
            )}
          </Popover.Body>
        </Popover>
      }
    >
      <button
        type="button"
        className="component-preview-trigger"
        aria-label={`Preview ${title}`}
        onMouseDown={stopSelectionEvent}
        onClick={stopSelectionEvent}
        onTouchStart={stopEventPropagation}
        onKeyDown={handleKeyDown}
      >
        <i className="icon-info" aria-hidden="true" />
      </button>
    </OverlayTrigger>
  )
}

ComponentPreviewTrigger.propTypes = {
  component: PropTypes.object
}
