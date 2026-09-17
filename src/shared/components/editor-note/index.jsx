import React from 'react'
import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'

export default function EditorNote({ title, children, className = 'mb-3' }) {
  return (
    <div
      className={`d-flex align-items-start px-3 py-3 rounded ${className}`}
      style={{
        backgroundColor: 'var(--secondary-800)',
        border: '1px solid var(--secondary-700)',
        gap: '12px'
      }}
    >
      <div
        className="d-inline-flex align-items-center justify-content-center flex-shrink-0 rounded-circle"
        style={{
          width: '30px',
          height: '30px',
          backgroundColor: 'rgba(242, 116, 33, 0.12)',
          color: 'var(--primary-400)'
        }}
      >
        <i className="icon-info" />
      </div>
      <div>
        <div
          className="fw-bold mb-1"
          style={{
            color: 'var(--secondary-200)',
            fontSize: '13px',
            lineHeight: 1.4
          }}
        >
          {title}
        </div>
        <Form.Text
          className="mb-0 d-block"
          style={{
            color: 'var(--secondary-300)',
            fontSize: '13px',
            lineHeight: 1.5
          }}
        >
          {children}
        </Form.Text>
      </div>
    </div>
  )
}

EditorNote.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string
}
