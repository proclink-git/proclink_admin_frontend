import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { AccordionContext, useAccordionButton } from 'react-bootstrap'

function CustomToggle({ Tag, children, eventKey, callback, className }) {
  const { activeEventKey } = useContext(AccordionContext)

  const decoratedOnClick = useAccordionButton(eventKey, () => callback && callback(eventKey))
  return (
    <Tag onClick={decoratedOnClick} className={`${className} ${activeEventKey === eventKey ? 'active border-0' : ''}`}>
      {children}
    </Tag>
  )
}
CustomToggle.propTypes = {
  children: PropTypes.node,
  eventKey: PropTypes.any,
  Tag: PropTypes.elementType,
  className: PropTypes.string,
  callback: PropTypes.func
}
export default CustomToggle
