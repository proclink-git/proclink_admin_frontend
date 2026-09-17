import React from 'react'
import PropTypes from 'prop-types'

function CountCard({ title = '', count = '' }) {
  return (
    <div className="d-flex flex-column gap-2 px-3 py-2 count-card-wrapper flex-grow-1">
      <div className="text-start title">{title}</div>
      <div className="text-end count">{count}</div>
    </div>
  )
}

export default CountCard

CountCard.propTypes = {
  title: PropTypes.string,
  count: PropTypes.number
}
