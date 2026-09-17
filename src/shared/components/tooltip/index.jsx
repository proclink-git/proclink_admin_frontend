import React from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import PropTypes from 'prop-types'

const ToolTip = ({ children, toolTipMessage, position }) => {
  const renderTooltip = (message) => <Tooltip id="button-tooltip">{message}</Tooltip>
  return (
    <>
      <OverlayTrigger placement={position || 'top'} overlay={renderTooltip(toolTipMessage)}>
        {children}
      </OverlayTrigger>
    </>
  )
}
ToolTip.propTypes = {
  children: PropTypes.node.isRequired,
  toolTipMessage: PropTypes.any,
  position: PropTypes.string
}
export default ToolTip
