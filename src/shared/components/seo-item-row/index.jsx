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

function SeoItemRow({ seo, index, selectedSeo, onDelete, onStatusChange, onSelect, bulkPermission, actionPermission }) {
  return (
    <tr key={seo._id}>
      <PermissionProvider isAllowedTo={bulkPermission} isArray>
        <td>
          <Form.Check
            type="checkbox"
            id={selectedSeo[index]?._id}
            name={selectedSeo[index]?._id}
            checked={selectedSeo[index]?.value}
            className="form-check m-0"
            onChange={onSelect}
            label="&nbsp;"
          />
        </td>
      </PermissionProvider>
      <td>
        <p className="title">{seo.sTitle ? seo.sTitle : '-'}</p>
        <p className="date">
          <span>
            <FormattedMessage id="d" />
          </span>
          {moment(Number(seo?.dCreated)).format('ddd MMM DD YYYY')}
          <span>
            <FormattedMessage id="lm" />
          </span>
          {moment(Number(seo.dUpdated)).format('ddd MMM DD YYYY')}
        </p>
      </td>
      <td>{seo.aKeywords.length ? seo.aKeywords?.join(', ') : '-'}</td>
      <td>{seo?.oSubAdmin?.sFName ? seo?.oSubAdmin?.sFName : '-'}</td>
      <PermissionProvider isAllowedTo={actionPermission} isArray>
        <td>
          <PermissionProvider isAllowedTo="UPDATE_SEO_STATUS">
            <ToolTip toolTipMessage={<FormattedMessage id="toggle"/>}>
              <Form.Check
                type="switch"
                name={seo._id}
                className="d-inline-block me-1"
                checked={seo.eStatus === 'a'}
                onChange={onStatusChange}
              />
            </ToolTip>
          </PermissionProvider>
          <PermissionProvider isAllowedTo="EDIT_SEO">
            <ToolTip toolTipMessage={<FormattedMessage id="view"/>}>
              <Button variant="link" className="square icon-btn" as={Link} to={allRoutes.editSeo('detail-seo', seo._id)}>
                <i className="icon-visibility d-block" />
              </Button>
            </ToolTip>
          </PermissionProvider>
          <PermissionProvider isAllowedTo="EDIT_SEO">
            <ToolTip toolTipMessage={<FormattedMessage id='edit'/>}>
              <Button variant="link" className="square icon-btn" as={Link} to={allRoutes.editSeo('edit-seo', seo._id)}>
                <i className="icon-create d-block" />
              </Button>
            </ToolTip>
          </PermissionProvider>
          <ToolTip toolTipMessage={<FormattedMessage id="openInNewTab"/>}>
            <a className="link" href={`${URL_PREFIX}${seo?.sSlug}`} target="_blank" rel="noreferrer">
              <Button variant="link" className="square icon-btn">
                <i className="icon-language d-block" />
              </Button>
            </a>
          </ToolTip>
          <PermissionProvider isAllowedTo="DELETE_SEO">
            <ToolTip toolTipMessage={<FormattedMessage id="delete"/>}>
              <Button variant="link" className="square icon-btn" onClick={() => onDelete(seo._id)}>
                <i className="icon-delete d-block" />
              </Button>
            </ToolTip>
          </PermissionProvider>
        </td>
      </PermissionProvider>
    </tr>
  )
}
SeoItemRow.propTypes = {
  seo: PropTypes.object,
  index: PropTypes.number,
  selectedSeo: PropTypes.array,
  bulkPermission: PropTypes.array,
  actionPermission: PropTypes.array,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func,
  onSelect: PropTypes.func
}
export default SeoItemRow
