import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Toast } from 'react-bootstrap'
import { ToastrContext } from '.'

function Toastr({ type, msg, btnTxt }) {
  const [show, setShow] = useState(true)
  const [isHover, setIsHover] = useState(true)
  const { dispatch } = React.useContext(ToastrContext)

  function handleHover({ type }) {
    type === 'mouseenter' ? setIsHover(false) : setIsHover(true)
  }

  function onClose() {
    setShow(false)
    dispatch({
      type: 'SHOW_TOAST',
      payload: { message: '', type: '', btnTxt: '' }
    })
  }

  return (
    <Toast onClose={onClose} show={show} autohide={isHover} onMouseEnter={handleHover} onMouseLeave={handleHover} className={type}>
      <div className="d-flex align-items-center">
        <Toast.Body>{msg}</Toast.Body>
        <Button onClick={onClose} variant="link" className="me-2 m-auto p-0">
          {btnTxt || 'Close'}
        </Button>
      </div>
    </Toast>
  )
}

Toastr.propTypes = {
  type: PropTypes.string,
  msg: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  btnTxt: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
}
export default Toastr
