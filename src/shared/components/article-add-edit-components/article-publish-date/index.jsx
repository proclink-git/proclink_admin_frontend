import React, { forwardRef } from 'react'
import { Controller } from 'react-hook-form'
import DatePicker from 'react-datepicker'
import PropTypes from 'prop-types'

import { dateCheck, filterFutureTime } from 'shared/utils'
import { Button } from 'react-bootstrap'

function ArticlePublishDate({ control, disabled }) {
  return (
    <Controller
      name="dPublishDisplayDate"
      control={control}
      render={({ field: { onChange, value = new Date() } }) => (
        <>
          <DatePicker
            selected={dateCheck(value) || new Date()}
            dateFormat="dd MMMM yyyy h:mm aa"
            maxDate={new Date()}
            disabled={disabled}
            filterTime={filterFutureTime}
            onChange={(date) => {
              onChange(date)
            }}
            showTimeSelect
            timeIntervals={15}
            customInput={<PublishDateInput disabled={disabled} />}
          />
        </>
      )}
    />
  )
}

ArticlePublishDate.propTypes = {
  control: PropTypes.object,
  disabled: PropTypes.bool
}
export default ArticlePublishDate

// eslint-disable-next-line react/prop-types
const PublishDateInput = forwardRef(({ value, onClick, disabled }, ref) => (
  <>
    <span className="margin">{value}</span>
    <Button ref={ref} onClick={onClick} disabled={disabled} variant="outline-secondary square" size="sm">
      <i className="icon-calendar" />
    </Button>
  </>
))
PublishDateInput.displayName = PublishDateInput
