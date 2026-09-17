import React from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import moment from 'moment'

import { allRoutes } from 'shared/constants/AllRoutes'
import PermissionProvider from '../permission-provider'
import { URL_PREFIX } from 'shared/constants'
import ToolTip from 'shared/components/tooltip'

function CmsItemRow({ cms, index, selectedCms, onDelete, onSelect, bulkPermission, actionPermission }) {
  return (
    <tr key={cms._id}>
      <td>
        <PermissionProvider isAllowedTo={bulkPermission} isArray>
          <Form.Check
            type="checkbox"
            id={selectedCms[index]?._id}
            name={selectedCms[index]?._id}
            checked={selectedCms[index]?.value}
            className="form-check m-0"
            onChange={onSelect}
            label="&nbsp;"
          />
        </PermissionProvider>
      </td>
      <td>
        <p className="title">{cms.sTitle ? cms.sTitle : '-'}</p>
        <p className="date">
          <span>
            <FormattedMessage id="d" />
          </span>
          {moment(Number(cms?.dCreated)).format('ddd MMM DD YYYY')}
          <span>
            <FormattedMessage id="lm" />
          </span>
          {moment(Number(cms?.dUpdated)).format('ddd MMM DD YYYY')}
        </p>
      </td>
      <td>{cms.oSeo.sSlug ? cms.oSeo.sSlug : '-'}</td>
      <td>
        <PermissionProvider isAllowedTo="EDIT_CMS_PAGE">
          <ToolTip toolTipMessage={<FormattedMessage id='edit' />}>
            <Button variant="link" className="square icon-btn" as={Link} to={allRoutes.editCms(cms._id)}>
              <i className="icon-create d-block" />
            </Button>
          </ToolTip>
        </PermissionProvider>
        <ToolTip toolTipMessage={<FormattedMessage id='openInNewTab' />}>
          <a className="link" href={`${URL_PREFIX}${cms?.oSeo?.sSlug}`} target="_blank" rel="noreferrer">
            <Button variant="link" className="square icon-btn">
              <i className="icon-language d-block" />
            </Button>
          </a>
        </ToolTip>
        <PermissionProvider isAllowedTo="DELETE_CMS_PAGE">
          <ToolTip toolTipMessage={<FormattedMessage id='delete' />}>
            <Button variant="link" className="square icon-btn" onClick={() => onDelete(cms._id)}>
              <i className="icon-delete d-block" />
            </Button>
          </ToolTip>
        </PermissionProvider>
      </td>
    </tr>
  )
}
CmsItemRow.propTypes = {
  cms: PropTypes.object,
  index: PropTypes.number,
  selectedCms: PropTypes.array,
  bulkPermission: PropTypes.array,
  actionPermission: PropTypes.array,
  onDelete: PropTypes.func,
  onSelect: PropTypes.func
}
export default CmsItemRow
