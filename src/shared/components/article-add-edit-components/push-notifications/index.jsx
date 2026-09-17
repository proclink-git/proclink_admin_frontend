import React from 'react'
import { Button, ButtonGroup, Dropdown, Form } from 'react-bootstrap'

import ArticleTab from 'shared/components/article-tab'
import { FormattedMessage, useIntl } from 'react-intl'

function PushNotifications() {
  return (
    <ArticleTab title="Push Notifications">
      <Form.Group className="form-group">
        <Form.Label>
          <FormattedMessage id="title" />
        </Form.Label>
        <Form.Control type="text" name="sTitle" placeholder={useIntl().formatMessage({ id: 'writeHere' })} />
      </Form.Group>
      <Form.Group className="form-group">
        <Form.Label>
          <FormattedMessage id="message" />
        </Form.Label>
        <Form.Control as="textarea" name="sMessage" placeholder={useIntl().formatMessage({ id: 'writeHere' })} />
      </Form.Group>
      <Form.Group className="form-group">
        <Form.Label>
          <FormattedMessage id="targetUsers" />
        </Form.Label>
        <i className="icon-chevron-down"></i>
        <Form.Select className="form-control" name="eDesignation">
          <option>{useIntl().formatMessage({ id: 'select' })}...</option>
          <option>{useIntl().formatMessage({ id: 'yes' })}</option>
          <option>{useIntl().formatMessage({ id: 'no' })}</option>
        </Form.Select>
      </Form.Group>
      <Dropdown as={ButtonGroup}>
        <Button variant="primary">
          <FormattedMessage id="sendWhenPublished" />
        </Button>
        <Dropdown.Toggle split variant="primary" />
        <Dropdown.Menu>
          <Dropdown.Item href="#/action-1">
            <FormattedMessage id="action" />
          </Dropdown.Item>
          <Dropdown.Item href="#/action-2">
            <FormattedMessage id="anotherAction" />
          </Dropdown.Item>
          <Dropdown.Item href="#/action-3">
            <FormattedMessage id="somethingElse" />
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </ArticleTab>
  )
}
export default PushNotifications
