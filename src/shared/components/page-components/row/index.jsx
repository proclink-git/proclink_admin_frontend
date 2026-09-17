import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

import { allRoutes } from 'shared/constants/AllRoutes'
import ToolTip from 'shared/components/tooltip'
import PermissionProvider from 'shared/components/permission-provider'
import { getS3Url } from 'shared/utils'

function PageComponentsRow({ data }) {
  return (
    <div className="col-sm-4">
      <div
        className="component-card position-relative p-3 d-flex flex-column justify-content-end overflow-hidden"
        style={{ backgroundImage: data?.sPreviewUrl ? `url("${getS3Url(data?.sPreviewUrl)}")` : '' }}
      >
        <p className="title position-relative">{data?.sComponentTitle}</p>
        {(data?.eComponentType === 's' || data?.eComponentType === 'd') && (
          <PermissionProvider isAllowedTo="EDIT_COMPONENT">
            <ToolTip toolTipMessage={<FormattedMessage id="edit" />}>
              <Button
                className="icon-btn position-absolute p-0 rounded-circle d-inline-flex justify-content-center align-items-center"
                as={Link}
                to={allRoutes.pageComponentsEdit(data?.eType)}
              >
                <i className="icon-create d-block" />
              </Button>
            </ToolTip>
          </PermissionProvider>
        )}
      </div>
    </div>
  )
}
PageComponentsRow.propTypes = {
  data: PropTypes.object
}
export default PageComponentsRow
