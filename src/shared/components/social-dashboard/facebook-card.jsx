import React, { useState } from 'react'
import { GET_SOCIAL_MEDIA_DASHBOARD, GET_SOCIAL_MEDIA_DASHBOARD_V2 } from 'graph-ql/social-dashboard/query'
import { useQuery } from '@apollo/client'
import { Row, Col, Button } from 'react-bootstrap'
import moment from 'moment'
import { REST_API_URL } from 'shared/constants'
import Loading from '../loading'
import DateRangeFilter from './date-picker'

function FacebookCard() {
  const [loading, setLoading] = useState(false)
  const [isByDate, setIsByDate] = useState(false)

  const [fromDate, setFromDate] = useState()
  const [toDate, setToDate] = useState()

  const handleFromDate = (fromDate) => {
    if (toDate && fromDate > toDate) {
      setToDate(moment(fromDate).startOf('day').toDate())
    }
    setFromDate(moment(fromDate).startOf('day').toDate())
    if (!toDate) setToDate(moment().endOf('day').toDate())
    setIsByDate(true)
  }

  const handleToDate = (toDate) => {
    if (fromDate && toDate < fromDate) {
      setFromDate(moment(toDate).endOf('day').toDate())
    }
    setToDate(moment(toDate).endOf('day').toDate())
    if (!fromDate) setFromDate(moment(toDate).startOf('day').toDate())
    setIsByDate(true)
  }

  const handleResetDates = () => {
    // setFromDate(moment().startOf('month').toDate())
    // setToDate(moment().toDate())
    setIsByDate(false)
  }

  async function refetchData() {
    setLoading(true)
    await fetch(`${REST_API_URL}social-media/facebook-data`)
    setLoading(false)
    refetch()
    setIsByDate(false)
  }

  const { data, refetch } = useQuery(isByDate ? GET_SOCIAL_MEDIA_DASHBOARD_V2 : GET_SOCIAL_MEDIA_DASHBOARD, {
    variables: { input: isByDate ? { eType: 'f', dStartDate: fromDate, dEndDate: toDate } : { eType: 'f' } }
  })

  const dUpdated = data?.getSocialMediaDashboardData?.dUpdated
  const oData = isByDate ? data?.getSocialDashboardCountV2?.oData?.oFacebookCount : data?.getSocialMediaDashboardData?.oData?.oFacebook?.aPages[0]

  return (
    <>
      <div className="d-flex flex-column gap-2 px-3 py-2 count-card-wrapper position-relative">
        {loading && <Loading />}
        <div className="d-flex justify-content-between align-items-center mb-1">
          <h1 className="mb-0">Facebook</h1>
          <Button variant="link" className="square icon-btn p-2" onClick={() => refetchData()} disabled={loading}>
            <i className="icon-refresh d-block" />
          </Button>
        </div>
        <p className='mb-2'>{oData?.sName || oData?.sUserName}</p>
        <DateRangeFilter fromDate={fromDate} setFromDate={setFromDate} toDate={toDate} setToDate={setToDate} handleFromDate={handleFromDate} handleResetDates={handleResetDates} handleToDate={handleToDate} isByDate={isByDate} />

        <Row className='gx-2'>
          <Col sm="4">
            <label>Followers</label>
            <h1 className='mb-0'>{oData?.nFollowersCount}</h1>
          </Col>
          <Col sm="4">
            <label>Likes</label>
            <h1 className='mb-0'>{oData?.nFanCount}</h1>
          </Col>
          <Col sm="4">
            <label>Impression</label>
            <h1 className='mb-0'>{isByDate ? oData?.nPageImpressions : oData?.aPageImpressions[1]?.value}</h1>
            <p className='mb-0'>
              <small>As on {isByDate ? moment().format('MMM DD YYYY') : moment(oData?.aPageImpressions[1]?.end_time).format('MMM DD YYYY')}</small>
            </p>
          </Col>
        </Row>
        <p className="text-end mt-auto">
          <small>Last Updated on: {moment(dUpdated).format('ddd MMM DD YYYY')}</small>
        </p>
      </div>
    </>
  )
}

export default FacebookCard
