import React from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import moment from 'moment'

import { Link } from 'react-router-dom'
import { allRoutes } from 'shared/constants/AllRoutes'
import { FormattedMessage } from 'react-intl'
import PermissionProvider from '../permission-provider'
import { URL_PREFIX } from 'shared/constants'
import ToolTip from 'shared/components/tooltip'

function TagItemRowActive({ tag, index, selectedTag, onDelete, onStatusChange, onSelect, bulkPermission, actionPermission }) {
  return (
    <tr key={tag?._id}>
      <PermissionProvider isAllowedTo={bulkPermission} isArray>
        <td>
          <Form.Check
            type="checkbox"
            id={selectedTag[index]?._id}
            name={selectedTag[index]?._id}
            checked={selectedTag[index]?.value}
            className="form-check m-0"
            onChange={onSelect}
            label="&nbsp;"
          />
        </td>
      </PermissionProvider>
      <td>
        <p className="title">{tag?.sName}</p>
        <p className="date">
          <span>
            <FormattedMessage id="d" />
          </span>
          {moment(Number(tag?.dCreated)).format('ddd MMM DD YYYY')}
          <span>
            <FormattedMessage id="lm" />
          </span>
          {moment(Number(tag?.dUpdated)).format('ddd MMM DD YYYY')}
        </p>
      </td>
      <td>{tag?.oSeo?.sSlug || '-'}</td>
      <td>{tag?.oSubAdmin?.sFName || '-'}</td>
      {/* <PermissionProvider isAllowedTo={actionPermission} isArray> */}
      <td>
        <PermissionProvider isAllowedTo="CHANGE_STATUS_ACTIVE_TAG">
          <ToolTip toolTipMessage={<FormattedMessage id="toggle" />}>
            <Form.Check
              type="switch"
              name={tag?._id}
              className="d-inline-block me-1"
              checked={tag?.eStatus === 'a'}
              onChange={onStatusChange}
            />
          </ToolTip>
        </PermissionProvider>
        <PermissionProvider isAllowedTo="EDIT_ACTIVE_TAG">
          <ToolTip toolTipMessage={<FormattedMessage id="edit" />}>
            <Button variant="link" className="square icon-btn" as={Link} to={allRoutes.editTag(tag?._id)}>
              <i className="icon-create d-block" />
            </Button>
          </ToolTip>
        </PermissionProvider>
        <ToolTip toolTipMessage={<FormattedMessage id="openInNewTab" />}>
          <a className="link" href={`${URL_PREFIX}${tag?.oSeo?.sSlug}`} target="_blank" rel="noreferrer">
            <Button variant="link" className="square icon-btn">
              <i className="icon-language d-block" />
            </Button>
          </a>
        </ToolTip>
        <PermissionProvider isAllowedTo="DELETE_ACTIVE_TAG">
          <ToolTip toolTipMessage={<FormattedMessage id="delete" />}>
            <Button variant="link" className="square icon-btn" onClick={() => onDelete(tag?._id)}>
              <i className="icon-delete d-block" />
            </Button>
          </ToolTip>
        </PermissionProvider>
      </td>
      {/* </PermissionProvider> */}
    </tr>
  )
}
TagItemRowActive.propTypes = {
  tag: PropTypes.object,
  index: PropTypes.number,
  selectedTag: PropTypes.array,
  bulkPermission: PropTypes.array,
  actionPermission: PropTypes.array,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func,
  onSelect: PropTypes.func
}
export default TagItemRowActive
