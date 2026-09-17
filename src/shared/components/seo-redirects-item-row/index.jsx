import React from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'

import PermissionProvider from '../permission-provider'
import { URL_PREFIX } from 'shared/constants'
import ToolTip from 'shared/components/tooltip'

function SeoRedirectsItemRow({ seoRedirect, index, selectedSeoRedirect, onDelete, onSelect, bulkPermission, actionPermission, onEdit }) {
  return (
    <tr key={seoRedirect._id}>
      <PermissionProvider isAllowedTo={bulkPermission} isArray>
        <td>
          <Form.Check
            type="checkbox"
            id={selectedSeoRedirect[index]?._id}
            name={selectedSeoRedirect[index]?._id}
            checked={selectedSeoRedirect[index]?.value || false}
            className="form-check m-0"
            onChange={onSelect}
            label="&nbsp;"
          />
        </td>
      </PermissionProvider>
      <td>{seoRedirect.eCode ? seoRedirect.eCode : '-'}</td>
      <td>{seoRedirect.sOldUrl ? seoRedirect.sOldUrl : '-'}</td>
      <td>{seoRedirect.sNewUrl ? seoRedirect.sNewUrl : '-'}</td>
      <PermissionProvider isAllowedTo={actionPermission} isArray>
        <td>
          <div className='d-flex'>
          <ToolTip toolTipMessage={<FormattedMessage id="openInNewTab"/>}>
            <a className="link ps-2" href={`${URL_PREFIX}${seoRedirect?.sOldUrl}`} target="_blank" rel="noreferrer">
              <Button variant="link" className="square icon-btn">
                <i className="icon-language d-block" />
              </Button>
            </a>
          </ToolTip>
          <PermissionProvider isAllowedTo="EDIT_SEO_REDIRECT">
            <ToolTip toolTipMessage={<FormattedMessage id='edit'/>}>
              <Button variant="link" className="square icon-btn" onClick={() => onEdit(seoRedirect._id)}>
                <i className="icon-create d-block" />
              </Button>
            </ToolTip>
          </PermissionProvider>
          <PermissionProvider isAllowedTo="DELETE_SEO_REDIRECT">
            <ToolTip toolTipMessage={<FormattedMessage id="delete"/>}>
              <Button variant="link" className="square icon-btn" onClick={() => onDelete(seoRedirect._id)}>
                <i className="icon-delete d-block" />
              </Button>
            </ToolTip>
          </PermissionProvider>
          </div>
        </td>
      </PermissionProvider>
    </tr>
  )
}
SeoRedirectsItemRow.propTypes = {
  seoRedirect: PropTypes.object,
  index: PropTypes.number,
  selectedSeoRedirect: PropTypes.array,
  bulkPermission: PropTypes.array,
  actionPermission: PropTypes.array,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func,
  onSelect: PropTypes.func,
  onEdit: PropTypes.func
}
export default SeoRedirectsItemRow
