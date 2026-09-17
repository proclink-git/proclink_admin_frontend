import React from 'react'
import PropTypes from 'prop-types'
import { Modal, Button, Form } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { useHistory } from 'react-router-dom'
import PermissionProvider from '../permission-provider'

const ArticleTakeOverModal = ({ name, pickHandler, permission, show }) => {
  const history = useHistory()
  return (
    <Modal show={show} size="sm" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Body>
        <h3>
          <FormattedMessage id="oops" />
        </h3>
        <Form.Label>
          {name} <FormattedMessage id="hasTakenOver" />{' '}
        </Form.Label>
        <div className="mt-2 d-flex gap-2">
          <Button size="sm" variant="primary" onClick={() => history.goBack()}>
            <FormattedMessage id="back" />
          </Button>
          <PermissionProvider isAllowedTo={permission.overtake} isArray>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                pickHandler('o')
              }}
            >
              <FormattedMessage id="reTakeover" />
            </Button>
          </PermissionProvider>
        </div>
      </Modal.Body>
    </Modal>
  )
}

ArticleTakeOverModal.propTypes = {
  name: PropTypes.string,
  pickHandler: PropTypes.func,
  permission: PropTypes.object,
  show: PropTypes.bool
}

export default ArticleTakeOverModal
