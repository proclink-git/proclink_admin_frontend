import React from 'react'
import PropTypes from 'prop-types'
import { Accordion } from 'react-bootstrap'

function ArticleTab({ children, event, title }) {
  return (
    <Accordion>
      <Accordion defaultActiveKey={event} flush>
        <Accordion.Item eventKey={event}>
          <Accordion.Header>
            {title} <i className="icon-chevron-up" />
          </Accordion.Header>
          <Accordion.Body>{children}</Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Accordion>
  )
}
ArticleTab.propTypes = {
  children: PropTypes.node,
  event: PropTypes.number,
  title: PropTypes.string
}
export default ArticleTab
