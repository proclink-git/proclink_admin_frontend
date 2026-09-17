import React from 'react'
import { GET_SOCIAL_MEDIA_DASHBOARD } from 'graph-ql/social-dashboard/query'
import { useQuery } from '@apollo/client'
import { Row, Col, Button } from 'react-bootstrap'
import moment from 'moment'
import { REST_API_URL } from 'shared/constants'
import Loading from '../loading'

function TwitterCard() {
  const [loading, setLoading] = React.useState(false)
  async function refetchData() {
    setLoading(true)
    await fetch(`${REST_API_URL}social-media/twitter`)
    setLoading(false)
    refetch()
  }
  const { data, refetch } = useQuery(GET_SOCIAL_MEDIA_DASHBOARD, {
    variables: { input: { eType: 't' } }
  })

  const oData = data?.getSocialMediaDashboardData?.oData?.oTwitter
  const dUpdated = data?.getSocialMediaDashboardData?.dUpdated

  return (
    <>
      <div className="d-flex flex-column gap-2 px-3 py-2 count-card-wrapper position-relative">
        {loading && <Loading />}
        <div className="d-flex justify-content-between align-items-center mb-1">
          <h1>Twitter</h1>
          <Button variant="link" className="square icon-btn p-2" onClick={() => refetchData()} disabled={loading}>
            <i className="icon-refresh d-block" />
          </Button>
        </div>
        <p className='mb-2'>{oData?.sName}</p>
        <Row className='gx-2'>
          <Col sm="4">
            <label>Followers</label>
            <h1>{oData?.nFollowersCount}</h1>
          </Col>
          <Col sm="4">
            <label>Following</label>
            <h1>{oData?.nFollowingCount}</h1>
          </Col>
          <Col sm="4">
            <label>Tweet Count</label>
            <h1>{oData?.nTweetCount}</h1>
          </Col>
        </Row>
        <p className="text-end mt-auto">
          <small>Last Updated on: {moment(dUpdated).format('ddd MMM DD YYYY')}</small>
        </p>
      </div>
    </>
  )
}

export default TwitterCard
