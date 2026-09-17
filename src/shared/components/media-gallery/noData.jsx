import React from 'react'
import { Container } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'

export const NoData = () => {
  return (
    <Container>
      <div className="middle-div text-center">
        <FormattedMessage id="noDataFound" />
      </div>
    </Container>
  )
}
