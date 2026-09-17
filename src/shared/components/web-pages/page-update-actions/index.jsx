import React from 'react'
import PropTypes from 'prop-types'
import { Button, Spinner } from 'react-bootstrap'

export default function PageUpdateActions({ loading }) {
  return (
    <div className="d-flex justify-content-end mb-4">
      <Button variant="primary" type="submit" className="m-0" disabled={loading}>
        Update
        {loading && <Spinner animation="border" size="sm" className="ms-2" />}
      </Button>
    </div>
  )
}

PageUpdateActions.propTypes = {
  loading: PropTypes.bool
}
