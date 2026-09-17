import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

import { allRoutes } from 'shared/constants/AllRoutes'
import ToolTip from 'shared/components/tooltip'
import PermissionProvider from 'shared/components/permission-provider'
import { URL_PREFIX } from 'shared/constants'

function PageRow({ data }) {
  return (
    <tr>
      <td>
        <p className="title">{data?.sTitle}</p>
      </td>
      <td>{data?.oSeo?.sSlug || '-'}</td>
      <td>
        <ToolTip toolTipMessage={<FormattedMessage id="openInNewTab" />}>
          <a className="link" href={`${URL_PREFIX}${data?.oSeo?.sSlug}`} target="_blank" rel="noreferrer">
            <Button variant="link" className="square icon-btn">
              <i className="icon-language d-block" />
            </Button>
          </a>
        </ToolTip>
        <PermissionProvider isAllowedTo="EDIT_PAGE">
          <ToolTip toolTipMessage={<FormattedMessage id="edit" />}>
            <Button variant="link" className="square icon-btn" as={Link} to={allRoutes.editPage(data?._id, data?.ePageType || data?.sTitle?.replaceAll(' ', '-'))}>
              <i className="icon-create d-block" />
            </Button>
          </ToolTip>
        </PermissionProvider>
        {/* <PermissionProvider isAllowedTo="DELETE_ACTIVE_TAG">
          <ToolTip toolTipMessage={<FormattedMessage id="delete" />}>
            <Button variant="link" className="square icon-btn">
              <i className="icon-delete d-block" />
            </Button>
          </ToolTip>
        </PermissionProvider> */}
      </td>
    </tr>
  )
}

PageRow.propTypes = {
  data: PropTypes.object
}

export default PageRow
