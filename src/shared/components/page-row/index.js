import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import { useQuery } from '@apollo/client'

import { allRoutes } from 'shared/constants/AllRoutes'
import ToolTip from 'shared/components/tooltip'
import PermissionProvider from 'shared/components/permission-provider'
import { URL_PREFIX } from 'shared/constants'
import { GET_CURRENT_USER } from 'graph-ql/profile/query'

const CUSTOM_PAGE_TYPE = 'cp'
const SYSTEM_PAGE_TYPES = new Set(['h', 'au', 'cu', 'i', 'ip', 's', 'p', 'pa', 'kc', 'la', 'as'])

function isCustomPage(ePageType) {
  const type = String(ePageType || '').trim().toLowerCase()
  if (type === CUSTOM_PAGE_TYPE) return true
  return !SYSTEM_PAGE_TYPES.has(type)
}

function PageRow({ data, onDelete }) {
  const { data: profileData } = useQuery(GET_CURRENT_USER)
  const canDeletePage = isCustomPage(data?.ePageType)
  const isSuperAdmin = !!profileData?.getProfile?.bSuperAdmin

  const deleteButton = (
    <ToolTip toolTipMessage={<FormattedMessage id="delete" />}>
      <Button variant="link" className="square icon-btn" onClick={() => onDelete(data?._id)}>
        <i className="icon-delete d-block" />
      </Button>
    </ToolTip>
  )

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
        {canDeletePage && (isSuperAdmin ? deleteButton : (
          <PermissionProvider isAllowedTo="DELETE_PAGE">
            {deleteButton}
          </PermissionProvider>
        ))}
      </td>
    </tr>
  )
}

PageRow.propTypes = {
  data: PropTypes.object,
  onDelete: PropTypes.func
}

export default PageRow
