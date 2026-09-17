import React, { forwardRef } from 'react'
import DatePicker from 'react-datepicker'
import CalendarIcon from 'assets/images/calendar.svg'
import ResetIcon from 'assets/images/reset.svg'
import PropTypes from 'prop-types'
import moment from 'moment'

function DateRangeFilter(props) {
  const { fromDate, toDate, handleFromDate, handleResetDates: resetDates, handleToDate, isByDate } = props

  // eslint-disable-next-line react/prop-types
  const CustomDatePickerInput = forwardRef(({ dateText, value, onClick }, ref) => (
    <div className="d-flex flex-row align-items-center cursor-pointer" ref={ref} onClick={onClick}>
      <img className="pe-1" src={CalendarIcon} alt="calendar-icon" width={44} height={42} />
     {isByDate && <div>
        <div className="date-txt">{dateText}</div>
        <div className="date-val">{value}</div>
      </div>}
    </div>
  ))
  CustomDatePickerInput.displayName = CustomDatePickerInput

  return (
      <div className="sDashFilter mb-2">
        <div className="d-flex gap-1 align-items-center">
          <div className="d-flex gap-2 px-1 py-1 date-range-wrapper flex-grow-1">
            <div className="pe-2 from-date-wrapper flex-grow-1">
            <div>From</div>
              <DatePicker
                selected={fromDate}
                dateFormat="dd MMM yyyy"
                onChange={handleFromDate}
                customInput={<CustomDatePickerInput />}
                maxDate={toDate || moment().endOf('day').toDate()}
                minDate={moment('2024-07-01').subtract(1, 'month').toDate()}
              />
            </div>
            <div className="to-date-wrapper flex-grow-1">
              <div>Till</div>
              <DatePicker
                selected={toDate}
                dateFormat="dd MMM yyyy"
                minDate={fromDate || moment('2024-07-01').subtract(1, 'month').toDate()}
                onChange={handleToDate}
                customInput={<CustomDatePickerInput />}
                maxDate={moment().endOf('day').toDate()}
              />
            </div>
          </div>
          <img src={ResetIcon} alt="reset-icon" onClick={resetDates} className="cursor-pointer reset-icon" width={52} height={52} />
        </div>
      </div>
  )
}

export default DateRangeFilter

DateRangeFilter.propTypes = {
  fromDate: PropTypes.instanceOf(Date).isRequired,
  setFromDate: PropTypes.func.isRequired,
  toDate: PropTypes.instanceOf(Date).isRequired,
  setToDate: PropTypes.func.isRequired,
  handleFromDate: PropTypes.func.isRequired,
  handleToDate: PropTypes.func.isRequired,
  handleResetDates: PropTypes.func.isRequired,
  isByDate: PropTypes.bool.isRequired
}
