import React from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'
import { Form, Modal } from 'react-bootstrap'

function UploadMediaModal({ show, setShow, onSelect, data }) {
  return (
    <>
      <Modal show={show} onHide={() => setShow(!show)} centered>
        <Modal.Body>
          <h4 className="mb-3">Select media type</h4>
          <Form>
            <Form.Group className="form-group">
              <Select
                options={data}
                getOptionLabel={(option) => `${option?.sName} ${option?.eType !== 'free' ? `(${option?.nWidth}x${option?.nHeight})` : ''}`}
                getOptionValue={(option) => option?.eType}
                className={'react-select'}
                classNamePrefix="select"
                placeholder="Select type"
                onChange={onSelect}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  )
}
UploadMediaModal.propTypes = {
  show: PropTypes.bool,
  data: PropTypes.array,
  onSelect: PropTypes.func.isRequired,
  setShow: PropTypes.func.isRequired
}
export default UploadMediaModal
