import React, { forwardRef, useState } from 'react'
import ResetIcon from 'assets/images/reset.svg'
import CalendarIcon from 'assets/images/calendar.svg'
import DatePicker from 'react-datepicker'
import { getCurrentUser } from 'shared/utils'
import { useQuery } from '@apollo/client'
import { DASHBOARD_ARTICLE, SUB_ADMINS_LIST } from 'graph-ql/dashboard/query'
import moment from 'moment'
import useReactSelect from 'shared/hooks/useReactSelect'

const useDashboard = () => {
  const currentUser = getCurrentUser()
  const isAdmin = currentUser?.bSuperAdmin ?? false
  const userName = currentUser?.sFName ?? ''
  const [fromDate, setFromDate] = useState(moment().startOf('month').toDate())
  const [toDate, setToDate] = useState(moment().endOf('month').toDate())
  const [currentSubAdmin, setCurrentSubAdmin] = useState(null)

  // dashboard data params
  const requestParams = {
    dFromDate: moment(fromDate).format('YYYY-MM-DD'),
    dToDate: moment(toDate).format('YYYY-MM-DD'),
    sSearch: '',
    iAdminId: currentSubAdmin?._id || currentUser?._id
  }

  // fetch dashboard data
  const { data: dashboardData, loading } = useQuery(DASHBOARD_ARTICLE, {
    notifyOnNetworkStatusChange: true,
    variables: { input: requestParams }
  })

  const handleFromDate = (fromDate) => {
    if (toDate && fromDate > toDate) {
      setToDate(fromDate)
    }
    setFromDate(fromDate)
  }

  const resetDates = () => {
    setFromDate(moment().startOf('month').toDate())
    setToDate(moment().endOf('month').toDate())
  }

  // eslint-disable-next-line react/prop-types
  const CustomDatePickerInput = forwardRef(({ dateText, value, onClick }, ref) => (
    <div className="d-flex flex-row align-items-center cursor-pointer dashboard-date-input" ref={ref} onClick={onClick}>
      <span className="dashboard-date-input__icon">
        <img src={CalendarIcon} alt="calendar-icon" width={24} height={24} />
      </span>
      <div>
        <div className="date-txt">{dateText}</div>
        <div className="date-val">{value}</div>
      </div>
    </div>
  ))
  CustomDatePickerInput.displayName = CustomDatePickerInput

  // date range filter component
  // eslint-disable-next-line react/prop-types
  const DateRangeFilter = () => {
    return (
      <div className="d-flex align-items-start dashboard-date-filter">
        <div className="d-flex gap-3 align-items-center dashboard-date-filter__content">
          <div className="d-flex gap-3 px-3 py-1 date-range-wrapper">
            <div className="pe-3 from-date-wrapper">
              <DatePicker
                selected={fromDate}
                dateFormat="dd MMM yyyy"
                onChange={handleFromDate}
                customInput={<CustomDatePickerInput dateText="From" />}
              />
            </div>
            <div className="to-date-wrapper">
              <DatePicker
                selected={toDate}
                dateFormat="dd MMM yyyy"
                minDate={fromDate}
                onChange={(date) => setToDate(date)}
                customInput={<CustomDatePickerInput dateText="Till" />}
              />
            </div>
          </div>
          <button type="button" onClick={resetDates} className="reset-date-btn" aria-label="Reset date range">
            <img src={ResetIcon} alt="" width={22} height={22} />
          </button>
        </div>
      </div>
    )
  }

  const {
    onApiResponce,
    handleScroll,
    handleSearch,
    // loading,
    items: subAdmin
  } = useReactSelect({
    skip: !isAdmin,
    query: SUB_ADMINS_LIST,
    requestParams: {
      aFilters: [],
      nLimit: 10,
      nOrder: -1,
      nSkip: 1,
      sSearch: '',
      sSortBy: 'dCreated'
    },
    responceCallBack: (data) => {
      !currentSubAdmin?._id && setCurrentSubAdmin({ sFName: 'All', _id: 'all' })
      onApiResponce([{ sFName: 'All', _id: 'all' }, ...data?.listSubAdmins?.aResults])
    }
  })
  return {
    isAdmin,
    userName,
    dashboardData,
    loading,
    DateRangeFilter,
    currentSubAdmin,
    setCurrentSubAdmin,
    handleScroll,
    handleSearch,
    subAdmin
  }
}

export default useDashboard
