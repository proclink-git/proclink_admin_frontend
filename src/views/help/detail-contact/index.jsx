import React from 'react'
import { Button, Form, Row, Col } from 'react-bootstrap'
import { useQuery } from '@apollo/client'
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'

import { GET_CONTACT_BY_ID } from 'graph-ql/help/contacts'
import PermissionProvider from 'shared/components/permission-provider'
function DetailContact({ id, onDelete }) {
  const { data } = useQuery(GET_CONTACT_BY_ID, {
    variables: { input: { _id: id } },
    skip: !id
  })
  const contactData = data?.getContactById

  return (
    <>
      <Row>
        <Col sm="4">
          <Form.Group className="form-group">
            <Form.Label>Full Name</Form.Label>
            <Form.Control disabled readOnly type="text" name="sFullName" value={contactData?.sFullName || ''} />
          </Form.Group>
        </Col>
        <Col sm="4">
          <Form.Group className="form-group">
            <Form.Label>Company Name</Form.Label>
            <Form.Control disabled readOnly type="text" name="sCompanyName" value={contactData?.sCompanyName || ''} />
          </Form.Group>
        </Col>
        <Col sm="4">
          <Form.Group className="form-group">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control disabled readOnly type="text" name="sPhoneNumber" value={contactData?.sPhoneNumber || ''} />
          </Form.Group>
        </Col>
        <Col sm="4">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="emailAddress" />
            </Form.Label>
            <Form.Control disabled readOnly type="text" name="email" value={contactData?.sEmail || ''} />
          </Form.Group>
        </Col>
        <Col sm="4">
          <Form.Group className="form-group">
            <Form.Label>Discussion Topic</Form.Label>
            <Form.Control disabled readOnly type="text" name="sDiscussionTopic" value={contactData?.sDiscussionTopic || ''} />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col sm="12">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="message" />
            </Form.Label>
            <Form.Control
              as={'textarea'}
              className="h-auto"
              rows="6"
              type="text"
              disabled
              readOnly
              name="message"
              value={contactData?.sMessage || ''}
            />
          </Form.Group>
        </Col>
      </Row>
      {onDelete && (
        <PermissionProvider isAllowedTo="DELETE_CONTACT">
          <div className="inquiry-detail__actions">
            <Button variant="outline-danger" onClick={onDelete}>
              <FormattedMessage id="delete" />
            </Button>
          </div>
        </PermissionProvider>
      )}
    </>
  )
}

DetailContact.propTypes = {
  id: PropTypes.string.isRequired,
  onDelete: PropTypes.func
}

export default DetailContact
