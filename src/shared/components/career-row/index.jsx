import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { Button, Form } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

import { allRoutes } from 'shared/constants/AllRoutes'
import { getCareerLocationLabel } from 'shared/utils/career-location'
import ToolTip from 'shared/components/tooltip'

function CareerRow({ data, index, selected, locationOptions, onDelete, onStatusChange, onSelect }) {
  const tags = Array.isArray(data?.aTags) ? data.aTags.filter(Boolean) : []
  const locationLabel = data?.oLocation?.sName || getCareerLocationLabel(data?.iLocationId || data?.eLocation, locationOptions)

  return (
    <tr key={data?._id}>
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
      <td>
        <p className="title">{data?.sTitle}</p>
        {!!tags.length && <small>{tags.join(', ')}</small>}
      </td>
      <td>{locationLabel}</td>
      <td>{Number.isFinite(Number(data?.nExperienceYears)) ? `${data.nExperienceYears} years` : '-'}</td>
      <td>{data?.dCreated ? moment(data.dCreated).format('ddd MMM DD YYYY') : '-'}</td>
      <td>{data?.iSubmittedBy?.sUName || data?.iSubmittedBy?.sFName || '-'}</td>
      <td>
        <ToolTip toolTipMessage={<FormattedMessage id="toggle" />}>
          <Form.Check
            type="switch"
            name={data?._id}
            className="d-inline-block me-1"
            checked={data?.eStatus === 'a'}
            onChange={onStatusChange}
          />
        </ToolTip>
        <ToolTip toolTipMessage={<FormattedMessage id="edit" />}>
          <Button variant="link" className="square icon-btn" as={Link} to={allRoutes.editCareer(data?._id)}>
            <i className="icon-create d-block" />
          </Button>
        </ToolTip>
        {data?.sRedirectUrl && (
          <ToolTip toolTipMessage={<FormattedMessage id="openInNewTab" />}>
            <a className="link" href={data.sRedirectUrl} target="_blank" rel="noreferrer">
              <Button variant="link" className="square icon-btn">
                <i className="icon-language d-block" />
              </Button>
            </a>
          </ToolTip>
        )}
        <ToolTip toolTipMessage={<FormattedMessage id="delete" />}>
          <Button variant="link" className="square icon-btn" onClick={() => onDelete(data?._id)}>
            <i className="icon-delete d-block" />
          </Button>
        </ToolTip>
      </td>
    </tr>
  )
}

CareerRow.propTypes = {
  data: PropTypes.object,
  index: PropTypes.number,
  selected: PropTypes.array,
  locationOptions: PropTypes.array,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func,
  onSelect: PropTypes.func
}

export default CareerRow
