import React from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FormattedMessage, useIntl } from 'react-intl'
import moment from 'moment'

import { allRoutes } from 'shared/constants/AllRoutes'
import PermissionProvider from '../permission-provider'
import Verified from 'assets/images/blue-tick.svg'
import ToolTip from 'shared/components/tooltip'

function EndUserItemRow({ user, index, selectedUser, onDelete, onStatusChange, onSelect, bulkPermission, actionPermission }) {
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
        {user?.sFullName}
        {user?.bIsMobVerified && (
          <span>
            <img className="ms-2" src={Verified} alt={useIntl().formatMessage({ id: 'verifiedUser' })} />
          </span>
        )}
      </td>
      <td>{user?.sEmail}</td>
      <td>{moment(Number(user?.dCreated)).format('ddd MMM DD YYYY')}</td>
      <td>
        <PermissionProvider isAllowedTo={actionPermission} isArray>
          <PermissionProvider isAllowedTo="UPDATE_USER_STATUS">
            <ToolTip toolTipMessage={<FormattedMessage id='toggle' />}>
              <Form.Check
                type="switch"
                name={user._id}
                className="d-inline-block me-1"
                checked={user.eStatus === 'a'}
                onChange={onStatusChange}
              />
            </ToolTip>
          </PermissionProvider>
          <PermissionProvider isAllowedTo="VIEW_USER">
            <ToolTip toolTipMessage={<FormattedMessage id='view' />}>
              <Button variant="link" className="square icon-btn" as={Link} to={allRoutes.detailEndUser(user?._id)}>
                <i className="icon-visibility d-block" />
              </Button>
            </ToolTip>
          </PermissionProvider>
          <PermissionProvider isAllowedTo="DELETE_USER">
            <ToolTip toolTipMessage={<FormattedMessage id='delete' />}>
              <Button variant="link" className="square icon-btn" onClick={() => onDelete(user._id)}>
                <i className="icon-delete d-block" />
              </Button>
            </ToolTip>
          </PermissionProvider>
        </PermissionProvider>
      </td>
    </tr>
  )
}
EndUserItemRow.propTypes = {
  user: PropTypes.object,
  index: PropTypes.number,
  selectedUser: PropTypes.array,
  bulkPermission: PropTypes.array,
  actionPermission: PropTypes.array,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func,
  onSelect: PropTypes.func
}
export default EndUserItemRow
