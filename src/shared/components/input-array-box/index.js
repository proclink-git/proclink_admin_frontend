import React from 'react'
import PropTypes from 'prop-types'

export default function InputArrayBox({ children, actions, className = '' }) {
  return (
    <div className={`input-array-box position-relative ${className}`}>
      {children}
      {actions && <div className="right-btn position-absolute">{actions}</div>}
    </div>
  )
}
InputArrayBox.propTypes = {
  children: PropTypes.node.isRequired,
  actions: PropTypes.node,
  className: PropTypes.string
}
