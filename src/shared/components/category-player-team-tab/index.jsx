import React from 'react'
import PropTypes from 'prop-types'

function CategoryPlayerTeamImage({ children, event, title }) {
  return (
    <>
      <div className="accordion">
        <div className="accordion-item">
          <div className="accordion-header">{title}</div>
          <div className="accordion-body">{children}</div>
        </div>
      </div>
    </>
  )
}
CategoryPlayerTeamImage.propTypes = {
  children: PropTypes.node,
  event: PropTypes.number,
  title: PropTypes.string
}
export default CategoryPlayerTeamImage
