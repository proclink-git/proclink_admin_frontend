import React from 'react'
import { Card } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'

function DashboardCard({ title, count }) {
  return (
    <div className="custom-card mb-4">
        <Card >
          <Card.Body>
            <Card.Title><FormattedMessage id={title} /></Card.Title>
            <Card.Text as="h3">
              {count}
            </Card.Text>
          </Card.Body>
        </Card>
      </div>
  )
}

DashboardCard.propTypes = {
  title: PropTypes.string,
  count: PropTypes.number
}

export default DashboardCard
