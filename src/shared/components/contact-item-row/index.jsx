import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Badge, Button } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import moment from 'moment'

import PermissionProvider from '../permission-provider'
import ToolTip from 'shared/components/tooltip'
import PopUpModal from '../pop-up-modal'
import DetailContact from 'views/help/detail-contact'
import { dateCheck } from 'shared/utils'

function ContactItemRow({ contact }) {
  const [view, setView] = useState(false)
  const [eStatus, setEStatus] = useState('ur')

  const getStatusBadge = (state) => {
    if (state === 'r') {
      return (
        <Badge bg="primary" className="mt-2 text-uppercase">
          <FormattedMessage id="read" />
        </Badge>
      )
    } else {
      return (
        <Badge bg="secondary" className="mt-2 text-uppercase">
          <FormattedMessage id="unread" />
        </Badge>
      )
    }
  }
  return (
    <>
      <tr key={contact._id}>
        <td>
          <p className="titleName">{contact.sFullName || '-'}</p>
          <div className="d-flex align-items-center gap-2">
            {getStatusBadge(contact?.eStatus === 'ur' ? eStatus : contact?.eStatus)}
            <p className="date mt-2">
              <span>
                <FormattedMessage id="d" />
              </span>
              {moment(dateCheck(contact?.dCreated)).format('ddd MMM DD YYYY')}
            </p>
          </div>
        </td>
        <td>{contact.sCompanyName || '-'}</td>
        <td>{contact.sPhoneNumber || '-'}</td>
        <td>{contact.sDiscussionTopic || '-'}</td>
        <td>{contact.sEmail || '-'}</td>
        <td>{contact.sUrl || '-'}</td>
        <td>
          <PermissionProvider isAllowedTo="GET_CONTACT">
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
      </tr>
      <PopUpModal
        title="Details"
        isOpen={view}
        onClose={() => {
          setView(false)
        }}
        isCentered
      >
        <DetailContact id={contact._id} />
      </PopUpModal>
    </>
  )
}
ContactItemRow.propTypes = {
  contact: PropTypes.object,
  index: PropTypes.number,
  selectedContact: PropTypes.array,
  bulkPermission: PropTypes.array,
  actionPermission: PropTypes.array,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func,
  onSelect: PropTypes.func
}
export default ContactItemRow
