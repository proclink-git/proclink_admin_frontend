import React from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

import { allRoutes } from 'shared/constants/AllRoutes'
import ToolTip from 'shared/components/tooltip'
import PermissionProvider from 'shared/components/permission-provider'
import moment from 'moment'

function TestimonialRow({ data, selected, index, onSelect, bulkPermission, eStatus, onStatusChange, onDelete }) {
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
        <p className="title">{data?.sTitle}</p>
      </td>
      <td>{moment(data?.dCreated).format('ddd MMM DD YYYY')}</td>
      <td>
        {data?.sClientName}
      </td>
      <td>
          <PermissionProvider isAllowedTo="UPDATE_TESTIMONIAL_STATUS">
          <ToolTip toolTipMessage={<FormattedMessage id="toggle" />}>
            <Form.Check
              type="switch"
              name={data?._id}
              className="d-inline-block me-1"
              defaultChecked={eStatus === 'a'}
              onChange={onStatusChange}
            />
          </ToolTip>
        </PermissionProvider>
        <PermissionProvider isAllowedTo="EDIT_TESTIMONIAL">
          <ToolTip toolTipMessage={<FormattedMessage id="edit" />}>
            <Button variant="link" className="square icon-btn" as={Link} to={allRoutes.editTestimonial(data?._id)}>
              <i className="icon-create d-block" />
            </Button>
          </ToolTip>
        </PermissionProvider>
        <PermissionProvider isAllowedTo="UPDATE_TESTIMONIAL_STATUS">
          <ToolTip toolTipMessage={<FormattedMessage id="delete" />}>
            <Button variant="link" className="square icon-btn" onClick={() => onDelete(data?._id)}>
              <i className="icon-delete d-block" />
            </Button>
          </ToolTip>
        </PermissionProvider>
      </td>
    </tr>
  )
}

TestimonialRow.propTypes = {
  data: PropTypes.object,
  index: PropTypes.number,
  selected: PropTypes.array,
  onSelect: PropTypes.func,
  bulkPermission: PropTypes.array,
  eStatus: PropTypes.string,
  onStatusChange: PropTypes.func,
  onDelete: PropTypes.func
}

export default TestimonialRow
