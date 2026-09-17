import React from 'react'
import { Form } from 'react-bootstrap'

import ArticleTab from 'shared/components/article-tab'
import { FormattedMessage, useIntl } from 'react-intl'

function ArticleQuotes() {
  return (
    <ArticleTab title="Quotes">
      <Form.Group className="form-group">
        <Form.Label>
          <FormattedMessage id="quoteText" />
        </Form.Label>
        <Form.Control as="textarea" name="sQuoteText" placeholder={useIntl().formatMessage({ id: 'writeHere' })} />
      </Form.Group>
      <Form.Group className="form-group">
        <Form.Label>
          <FormattedMessage id="quotedBy" />
        </Form.Label>
        <Form.Control type="text" name="sQuotedBy" placeholder={useIntl().formatMessage({ id: 'writeHere' })} />
      </Form.Group>
      <Form.Check
        type="checkbox"
        className="mb-0"
        label={useIntl().formatMessage({ id: 'addThisQuoteToHomePageQuotesOfTheWeek' })}
        id="Quotes"
      />
    </ArticleTab>
  )
}
export default ArticleQuotes
