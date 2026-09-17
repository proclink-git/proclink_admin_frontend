import React from 'react'
import { Badge, Button } from 'react-bootstrap'
import { useQuery } from '@apollo/client'
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import moment from 'moment'

import { GET_INQUIRY_BY_ID } from 'graph-ql/help/inquiry'
import PermissionProvider from 'shared/components/permission-provider'
import { dateCheck } from 'shared/utils'
import { getInquiryFields, getInquiryTypeLabel, INQUIRY_STATUS_LABELS } from 'shared/constants/inquiry'

function DetailFeedback({ id, onDelete }) {
  const { data } = useQuery(GET_INQUIRY_BY_ID, {
    variables: { input: { _id: id } },
    skip: !id
  })
  const feedbackData = data?.getInquiryById
  if (!feedbackData) return null

  const inquiryTypeLabel = getInquiryTypeLabel(feedbackData?.eHeaderCategoryType)
  const statusLabel = INQUIRY_STATUS_LABELS[feedbackData?.eStatus] || feedbackData?.eStatus || '-'
  const createdDate = feedbackData?.dCreated ? moment(dateCheck(feedbackData.dCreated)).format('ddd MMM DD YYYY, hh:mm A') : '-'
  const formFields = getInquiryFields(feedbackData?.eHeaderCategoryType)
    .map((field) => ({ ...field, value: feedbackData?.[field.internalName] }))
    .filter((field) => field.value)

  function getUrlHref(value) {
    if (!value) return ''
    if (/^https?:\/\//i.test(value)) return value
    return value.startsWith('/') ? value : `/${value}`
  }

  return (
    <div className="inquiry-detail">
      <div className="inquiry-detail__summary">
        <div>
          <span>Inquiry Type</span>
          <strong>{inquiryTypeLabel}</strong>
        </div>
        <div>
          <span>Submitted</span>
          <strong>{createdDate}</strong>
        </div>
        <Badge bg={feedbackData?.eStatus === 'r' ? 'primary' : 'secondary'} className="inquiry-status-badge text-uppercase">
          {statusLabel}
        </Badge>
      </div>

      <h6 className="inquiry-detail__title">Submitted Information</h6>
      <div className="inquiry-detail__grid">
        {formFields.map((field) => (
          <div key={field.internalName} className="inquiry-detail__item">
            <span>{field.label}</span>
            {field.isEmail ? <a href={`mailto:${field.value}`}>{field.value}</a> : <strong>{field.value}</strong>}
          </div>
        ))}
      </div>

      {feedbackData?.sUrl && (
        <div className="inquiry-detail__source">
          <span>Source Page</span>
          <a href={getUrlHref(feedbackData.sUrl)} target="_blank" rel="noreferrer">
            {feedbackData.sUrl}
          </a>
        </div>
      )}

      {onDelete && (
        <PermissionProvider isAllowedTo="VIEW_INQUIRY">
          <div className="inquiry-detail__actions">
            <Button variant="outline-danger" onClick={onDelete}>
              <FormattedMessage id="delete" />
            </Button>
          </div>
        </PermissionProvider>
      )}
    </div>
  )
}
DetailFeedback.propTypes = {
  id: PropTypes.string.isRequired,
  onDelete: PropTypes.func
}
export default DetailFeedback
