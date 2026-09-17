import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import moment from 'moment'
import { Link } from 'react-router-dom'

import CustomToggle from '../custom-toggle'
import RolePermissionDropdown from '../role-permission-dropdown'
import PermissionProvider from '../permission-provider'
import ToolTip from 'shared/components/tooltip'
import { allRoutes } from 'shared/constants/AllRoutes'

function RoleItemRow({ event, dataModal, editRole, deleteRole, actionPermission }) {
  return (
    <>
      <tr>
        <td>
          <div className="title-b">
            <CustomToggle Tag="i" className="icon-arrow-drop-down" eventKey={event} />
            <span>{dataModal.sName}</span>
          </div>
        </td>
        <td>{moment(Number(dataModal?.dUpdated)).format('ddd MMM DD YYYY')}</td>
        <PermissionProvider isAllowedTo={actionPermission} isArray>
          <td>
            <PermissionProvider isAllowedTo="EDIT_ROLE">
              <ToolTip toolTipMessage={<FormattedMessage id="edit" />}>
                <Link to={allRoutes.roleEdit(dataModal._id)} className="square icon-btn btn btn-link">
                  <i className="icon-create d-block" />
                </Link>
              </ToolTip>
            </PermissionProvider>
            <PermissionProvider isAllowedTo="DELETE_ROLE">
              <ToolTip toolTipMessage={<FormattedMessage id="delete" />}>
                <Button onClick={() => deleteRole(dataModal._id)} variant="link" className="square icon-btn">
                  <i className="icon-delete d-block" />
                </Button>
              </ToolTip>
            </PermissionProvider>
          </td>
        </PermissionProvider>
      </tr>
      <RolePermissionDropdown title="Permission" data={dataModal.aPermissions} eventKey={event} colSpan={4} />
    </>
  )
}
RoleItemRow.propTypes = {
  event: PropTypes.any,
  dataModal: PropTypes.object,
  editRole: PropTypes.func,
  deleteRole: PropTypes.func,
  actionPermission: PropTypes.array
}
export default RoleItemRow
