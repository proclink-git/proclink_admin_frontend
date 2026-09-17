import React from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'

import { Link } from 'react-router-dom'
import { allRoutes } from 'shared/constants/AllRoutes'
import { FormattedMessage } from 'react-intl'
import { URL_PREFIX } from 'shared/constants'
import ToolTip from 'shared/components/tooltip'
import PermissionProvider from 'shared/components/permission-provider'

function IndustriesRow({ data, index, selected, onDelete, onStatusChange, onSelect, bulkPermission, eStatus }) {
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
      <td>{data?.oSeo?.sSlug || '-'}</td>
      {/* <PermissionProvider isAllowedTo={actionPermission} isArray> */}
      <td>
        <PermissionProvider isAllowedTo="UPDATE_INDUSTRY_STATUS">
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
        <PermissionProvider isAllowedTo="EDIT_INDUSTRY">
          <ToolTip toolTipMessage={<FormattedMessage id="edit" />}>
            <Button variant="link" className="square icon-btn" as={Link} to={allRoutes.editIndustries(data?._id)}>
              <i className="icon-create d-block" />
            </Button>
          </ToolTip>
        </PermissionProvider>
        <ToolTip toolTipMessage={<FormattedMessage id="openInNewTab" />}>
          <a className="link" href={`${URL_PREFIX}${data?.oSeo?.sSlug}`} target="_blank" rel="noreferrer">
            <Button variant="link" className="square icon-btn">
              <i className="icon-language d-block" />
            </Button>
          </a>
        </ToolTip>
        <PermissionProvider isAllowedTo="UPDATE_INDUSTRY_STATUS">
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
IndustriesRow.propTypes = {
  data: PropTypes.object,
  index: PropTypes.number,
  selected: PropTypes.array,
  bulkPermission: PropTypes.array,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func,
  onSelect: PropTypes.func,
  eStatus: PropTypes.string
}
export default IndustriesRow
