import React from 'react'
import { Spinner } from 'react-bootstrap'

function Loading() {
  return (
    <div className="loading d-flex align-items-center justify-content-center top-0 left-0 position-absolute h-100 w-100">
      <Spinner animation="border" />
    </div>
  )
}
export default Loading
