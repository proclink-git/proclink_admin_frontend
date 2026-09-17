import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'

function CustomAlert({ title, message, buttons, onClose }) {
  return (
    <>
      <h2 className="m-0">{title}</h2>
      <p>{message}</p>
      <div>
        {buttons.map((btn, index) => (
          <Button
            variant={index === 1 ? 'outline-secondary' : 'primary'}
            key={btn.label}
            onClick={() => {
              btn.onClick && btn.onClick()
              onClose()
            }}
          >
            {btn.label}
          </Button>
        ))}
      </div>
    </>
  )
}
CustomAlert.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  buttons: PropTypes.array,
  onClose: PropTypes.func
}
export default CustomAlert
