import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Badge, Button } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import moment from 'moment'

import PermissionProvider from '../permission-provider'
import ToolTip from 'shared/components/tooltip'
import PopUpModal from '../pop-up-modal'
import DetailFeedback from 'views/help/detail-feedback'
import { dateCheck } from 'shared/utils'

function FeedbackItemRow({ feedback, columns = [] }) {
  const [view, setView] = useState(false)
  const [eStatus, setEStatus] = useState('ur')

  const getStatusBadge = (state) => {
    if (state === 'r') {
      return (
        <Badge bg="primary" className="inquiry-status-badge mt-2 text-uppercase">
          <FormattedMessage id="read" />
        </Badge>
      )
    } else {
      return (
        <Badge bg="secondary" className="inquiry-status-badge mt-2 text-uppercase">
          <FormattedMessage id="unread" />
        </Badge>
      )
    }
  }

  function getFieldValue(field) {
    const value = feedback?.[field.internalName]
    return value || '-'
  }

  function getUrlHref(value) {
    if (!value) return ''
    if (/^https?:\/\//i.test(value)) return value
    return value.startsWith('/') ? value : `/${value}`
  }

  function renderSimpleValue(field) {
    const value = getFieldValue(field)
    if (value === '-') return <span className="inquiry-empty">-</span>

    if (field.isEmail) {
      return (
        <a className="inquiry-field-value inquiry-field-value--link" href={`mailto:${value}`}>
          {value}
        </a>
      )
    }

    if (field.isUrl) {
      return (
        <a className="inquiry-field-value inquiry-field-value--link" href={getUrlHref(value)} target="_blank" rel="noreferrer">
          {value}
        </a>
      )
    }

    return <span className="inquiry-field-value">{value}</span>
  }

  function renderPrimaryCell(field) {
    const primaryValue = getFieldValue(field)
    return (
      <td key={field.internalName} className="inquiry-lead-cell">
        <p className="titleName">
          {field.isEmail && primaryValue !== '-' ? (
            <a className="inquiry-field-value inquiry-field-value--link" href={`mailto:${primaryValue}`}>
              {primaryValue}
            </a>
          ) : (
            primaryValue
          )}
        </p>
        <div className="inquiry-row-meta">
          {getStatusBadge(feedback?.eStatus === 'ur' ? eStatus : feedback?.eStatus)}
          <p className="date mt-2">
            <span>
              <FormattedMessage id="d" />
            </span>
            {feedback?.dCreated ? moment(dateCheck(feedback.dCreated)).format('ddd MMM DD YYYY') : '-'}
          </p>
        </div>
      </td>
    )
  }

  const renderAction = () => (
    <td className="text-end">
      <PermissionProvider isAllowedTo="VIEW_INQUIRY">
        <ToolTip toolTipMessage={<FormattedMessage id="view" />}>
          <Button
            variant="link"
            className="square icon-btn"
            onClick={() => {
              setEStatus('r')
              setView(true)
            }}
          >
            <i className="icon-visibility d-block" />
          </Button>
        </ToolTip>
      </PermissionProvider>
    </td>
  )

  return (
    <>
      <tr key={feedback._id}>
        {columns.map((field) => {
          if (field.isPrimary) return renderPrimaryCell(field)
          return <td key={field.internalName}>{renderSimpleValue(field)}</td>
        })}
        {renderAction()}
      </tr>

      <PopUpModal
        title="Details"
        isOpen={view}
        onClose={() => {
          setView(false)
        }}
        isCentered
      >
        <DetailFeedback id={feedback._id} />
      </PopUpModal>
    </>
  )
}
FeedbackItemRow.propTypes = {
  feedback: PropTypes.object,
  columns: PropTypes.array,
  index: PropTypes.number,
  selectedFeedback: PropTypes.array,
  bulkPermission: PropTypes.array,
  actionPermission: PropTypes.array,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func,
  onSelect: PropTypes.func,
  refetch: PropTypes.func
}
export default FeedbackItemRow
