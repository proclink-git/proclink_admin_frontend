import React from 'react'
import PropTypes from 'prop-types'
import { Accordion } from 'react-bootstrap'
// import { useIntl } from 'react-intl'

// import { PERMISSION_CATEGORY } from 'shared/constants'
import PermissionsText from '../permissions-text'

function RolePermissionDropdown({ data, eventKey, title, colSpan }) {
  const permission = data?.reduce((acc, obj) => {
    const key = obj.ePerType
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(obj)
    return acc
  }, {})

  return (
    <tr className="border-0">
      <td colSpan={colSpan} className="py-0 text-start">
        <Accordion.Collapse className="permissions" eventKey={eventKey}>
          <>
            {title && <h4 className="title-txt">{title}</h4>}
            {Object.keys(permission).map((key) => (
              <div key={key} className="border border-secondary mb-3 rounded-2">
                <div className="border-bottom border-secondary p-2 bg-secondary bg-opacity-25">
                  <h5 className="mb-0">{key}</h5>
                </div>
                <div className="d-flex flex-wrap py-3 px-2 gap-3">
                  <PermissionsText item={permission[key]} />
                </div>
              </div>
            ))}
            {/* <div className="p-cat d-flex">
              <h5 className="cat-title">{PERMISSION_CATEGORY.content} :</h5>
              {permission[PERMISSION_CATEGORY.content]?.length > 0 ? (
                <PermissionsText item={permission[PERMISSION_CATEGORY.content]} />
              ) : (
                permissionNotFound
              )}
            </div>
            <div className="p-cat d-flex">
              <h5 className="cat-title">{PERMISSION_CATEGORY.admin} :</h5>
              {permission[PERMISSION_CATEGORY.admin]?.length > 0 ? (
                <PermissionsText item={permission[PERMISSION_CATEGORY.admin]} />
              ) : (
                permissionNotFound
              )}
            </div>
            <div className="p-cat d-flex">
              <h5 className="cat-title">{PERMISSION_CATEGORY.analytics} :</h5>
              {permission[PERMISSION_CATEGORY.analytics]?.length > 0 ? (
                <PermissionsText item={permission[PERMISSION_CATEGORY.analytics]} />
              ) : (
                permissionNotFound
              )}
            </div> */}
          </>
        </Accordion.Collapse>
      </td>
    </tr>
  )
}
RolePermissionDropdown.propTypes = {
  eventKey: PropTypes.any,
  title: PropTypes.string,
  data: PropTypes.array,
  colSpan: PropTypes.number
}
export default RolePermissionDropdown
