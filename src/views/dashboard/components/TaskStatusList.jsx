import React from 'react'
import PropTypes from 'prop-types'
import { HEADER_CATEGORY_SLUG_ADMIN } from 'shared/constants'
import moment from 'moment'
import ToolTip from 'shared/components/tooltip'
import { FormattedMessage } from 'react-intl'

function TaskStatusList({ title = '', tasks = [], color = '', isAdmin, toolTipText = '' }) {
  return (
    <div className="d-flex flex-column">
      <div className={`d-flex justify-content-between align-items-end pt-3 pb-2 status ${color}`}>
        <div className="status-title">{title}</div>
        {isAdmin && <div className="status-count">{tasks?.length}</div>}
        {toolTipText && (
            <ToolTip toolTipMessage={<FormattedMessage id={toolTipText} />}>
              <i className="icon-info" />
            </ToolTip>
        )}
      </div>
      <div className="d-flex flex-column gap-3 list">
        {tasks?.map((task, index) => (
          <TaskCard
            key={index}
            type={title}
            time={task?.dModifiedDate || task?.dPublishDate}
            title={HEADER_CATEGORY_SLUG_ADMIN?.[task?.eHeaderCategoryType]}
            subtitle={task?.sTitle}
            color={color}
            sAuthorizedPerson={task?.oAssignedTo?.sFName || task?.oReviewer?.sFName || task?.oAuthor?.sFName}
            isAdmin={isAdmin}
          />
        ))}
      </div>
    </div>
  )
}

export default TaskStatusList

TaskStatusList.propTypes = {
  title: PropTypes.string.isRequired,
  tasks: PropTypes.array,
  color: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool,
  toolTipText: PropTypes.string
}

// eslint-disable-next-line react/prop-types
const TaskCard = ({ type = '', time = '', title = '', subtitle = '', color = '', sAuthorizedPerson = '', isAdmin = '' }) => {
  return (
    <div className={`px-2 py-3 task-card ${color}`}>
      <div className="d-flex justify-content-between">
        <div className={`fs-2 text-capitalize task-title ${color}`}>{title}</div>
        <div className="text-end task-time">{type !== 'Published' ? 'Modified' : 'Live'} {time && moment(time).format('MMM DD')}</div>
      </div>
      <div className="text-start task-subtitle text-truncate">{subtitle}</div>
      { (isAdmin && sAuthorizedPerson) && (
        <div className="text-end task-assignee">
          {color === 'yellow' ? 'Assigned to ' : color === 'purple' ? 'Reviewed by ' : 'Created by '}
          {sAuthorizedPerson}
        </div>
      )}
    </div>
  )
}
