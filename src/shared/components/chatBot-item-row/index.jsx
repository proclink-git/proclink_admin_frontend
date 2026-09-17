import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import moment from 'moment'

function ChatBotResponseItemRow({ feedback, index, selectedFeedback, onDelete, onStatusChange, onSelect, bulkPermission, actionPermission }) {
  return (
    <>
      <tr key={feedback._id}>
        <td>
          <p className="titleName">{feedback?.sName || '-'}</p>
          <div className="d-flex align-items-center gap-2">
            <p className="date mt-2">
              <span>
                <FormattedMessage id="d" />
              </span>
              {moment(feedback?.dCreated).format('ddd MMM DD YYYY')}
            </p>
          </div>
        </td>
        <td>{feedback?.sEmail || '-'}</td>
        <td>{feedback?.sPhoneNumber || '-'}</td>
        <td>{feedback?.sIndustry || '-'}</td>
        <td>{feedback?.sService || '-'}</td>
      </tr>
    </>
  )
}
ChatBotResponseItemRow.propTypes = {
  feedback: PropTypes.object,
  index: PropTypes.number,
  selectedFeedback: PropTypes.array,
  bulkPermission: PropTypes.array,
  actionPermission: PropTypes.array,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func,
  onSelect: PropTypes.func,
  refetch: PropTypes.func
}
export default ChatBotResponseItemRow
