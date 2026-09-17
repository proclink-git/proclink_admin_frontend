import React from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import moment from 'moment'
import { Link, useParams } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

import { allRoutes } from 'shared/constants/AllRoutes'
import PermissionProvider from '../../permission-provider'
import ToolTip from 'shared/components/tooltip'

const AUTHOR_EDIT_PERMISSIONS = ['EDIT_BLOG_AUTHOR']
const AUTHOR_DELETE_PERMISSIONS = ['UPDATE_AUTHOR_STATUS', ...AUTHOR_EDIT_PERMISSIONS]

function AuthorRow({ data, index, selected, onDelete, onStatusChange, onSelect, bulkPermission }) {
  const { categoryType } = useParams()
  return (
    <tr key={data?._id}>
      <PermissionProvider isAllowedTo={bulkPermission} isArray>
        <td>
          <Form.Check
            type="checkbox"
            id={selected[index]?._id}
            name={selected[index]?._id}
            checked={selected[index]?.value}
            className="form-check m-0"
            onChange={onSelect}
            label="&nbsp;"
          />
        </td>
      </PermissionProvider>
      <td>
        <p className="title">{data?.sFName}</p>
        <p className="date">
          <span>
            <FormattedMessage id="d" />
          </span>
          {moment(data?.dCreated).format('ddd MMM DD YYYY')}
          <span>
            <FormattedMessage id="lm" />
          </span>
          {moment(data?.dUpdated).format('ddd MMM DD YYYY')}
        </p>
      </td>
      <td>{data?.sEmail || '-'}</td>
      {/* <PermissionProvider isAllowedTo={actionPermission} isArray> */}
      <td>
        <PermissionProvider isAllowedTo="UPDATE_AUTHOR_STATUS">
          <ToolTip toolTipMessage={<FormattedMessage id="toggle" />}>
            <Form.Check
              type="switch"
              name={data?._id}
              className="d-inline-block me-1"
              checked={data?.eStatus === 'a'}
              onChange={onStatusChange}
            />
          </ToolTip>
        </PermissionProvider>
        <PermissionProvider isAllowedTo={AUTHOR_EDIT_PERMISSIONS} isArray>
          <ToolTip toolTipMessage={<FormattedMessage id="edit" />}>
            <Button
              variant="link"
              className="square icon-btn"
              as={Link}
              to={allRoutes.authorsEdit(categoryType, data?._id)}
            >
              <i className="icon-create d-block" />
            </Button>
          </ToolTip>
        </PermissionProvider>
        <PermissionProvider isAllowedTo={AUTHOR_DELETE_PERMISSIONS} isArray>
          <ToolTip toolTipMessage={<FormattedMessage id="delete" />}>
            <Button variant="link" className="square icon-btn" onClick={() => onDelete(data?._id)}>
              <i className="icon-delete d-block" />
            </Button>
          </ToolTip>
        </PermissionProvider>
      </td>
      {/* </PermissionProvider> */}
    </tr>
  )
}
AuthorRow.propTypes = {
  data: PropTypes.object,
  index: PropTypes.number,
  selected: PropTypes.array,
  bulkPermission: PropTypes.array,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func,
  onSelect: PropTypes.func
}
export default AuthorRow
