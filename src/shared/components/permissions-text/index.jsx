import React from 'react'
import PropTypes from 'prop-types'

function PermissionsText({ item }) {
  return (
    <ul className="permissions-txt d-flex flex-wrap p-0">
      {item.map((permission) => (
        <li key={permission._id}>{permission.sTitle}</li>
      ))}
    </ul>
  )
}
PermissionsText.propTypes = {
  item: PropTypes.array
}
export default PermissionsText
