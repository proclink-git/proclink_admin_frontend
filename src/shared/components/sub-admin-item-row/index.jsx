import React from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import moment from 'moment'

import PermissionProvider from 'shared/components/permission-provider'
import { allRoutes } from 'shared/constants/AllRoutes'
import ToolTip from 'shared/components/tooltip'

function SubAdminItemRow({ user, index, selectedUser, onStatusChange, onDelete, onSelect, actionPermission, bulkPermission }) {
  return (
    <tr key={user._id}>
      <PermissionProvider isAllowedTo={bulkPermission} isArray>
        <td>
          <Form.Check
            type="checkbox"
            id={selectedUser[index]?._id}
            name={selectedUser[index]?._id}
            checked={selectedUser[index]?.value}
            className="form-check m-0"
            onChange={onSelect}
            label="&nbsp;"
          />
        </td>
      </PermissionProvider>
      <td>
        {user.sFName}
        {user.bIsVerified && <i className="icon-check verified-icon" />}
      </td>
      <td style={{ maxWidth: '400px' }}>
        <p className='mb-0'>
          {user.aRole.aRoleId.map((parent, index) => {
            return `${parent.sName}${user.aRole.aRoleId.length - 1 !== index ? ', ' : ''}`
          })}
        </p>
      </td>
      <td>{user.sEmail}</td>
      <td>{moment(Number(user?.dCreated)).format('ddd MMM DD YYYY')}</td>
      <PermissionProvider isAllowedTo={actionPermission} isArray>
        <td>
          <PermissionProvider isAllowedTo="CHANGE_STATUS_SUBADMIN">
            <ToolTip toolTipMessage={<FormattedMessage id="toggle" />}>
              <Form.Check
                type="switch"
                name={user._id}
                className="d-inline-block me-1"
                checked={user.eStatus === 'a'}
                onChange={onStatusChange}
              />
            </ToolTip>
          </PermissionProvider>
          <PermissionProvider isAllowedTo="EDIT_USER">
            <ToolTip toolTipMessage={<FormattedMessage id="edit" />}>
              <Button variant="link" className="square icon-btn" as={Link} to={allRoutes.editSubAdmin(user._id)}>
                <i className="icon-create d-block" />
              </Button>
            </ToolTip>
          </PermissionProvider>
          <PermissionProvider isAllowedTo="DELETE_USER">
            <ToolTip toolTipMessage={<FormattedMessage id="delete" />}>
              <Button variant="link" className="square icon-btn" onClick={() => onDelete(user._id)}>
                <i className="icon-delete d-block" />
              </Button>
            </ToolTip>
          </PermissionProvider>
        </td>
      </PermissionProvider>
    </tr>
  )
}
SubAdminItemRow.propTypes = {
  user: PropTypes.object,
  index: PropTypes.number,
  selectedUser: PropTypes.array,
  actionPermission: PropTypes.array,
  bulkPermission: PropTypes.array,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func,
  onSelect: PropTypes.func
}
export default SubAdminItemRow
