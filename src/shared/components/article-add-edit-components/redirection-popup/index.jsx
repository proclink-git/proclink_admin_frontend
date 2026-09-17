import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { Button, Modal } from 'react-bootstrap'

import { URL_PREFIX } from 'shared/constants'
import useRedirection from 'shared/components/add-edit-seo-redirects/useRedirection'

const REDIRECTION_STATUS_CODE = 301

function RedirectionPopup({ show, onSuccess, sNewUrl, sOldUrl, onClose }) {
  const { addRedirection, loading } = useRedirection()

  function handleSubmit() {
    addRedirection(REDIRECTION_STATUS_CODE, sNewUrl, sOldUrl).then(({ data }) => {
      if (data?.addSeoRedirect?.oData) onSuccess()
    })
  }

  return (
    <Modal show={show} centered>
      <Modal.Header>
        <h4 className="m-0">
          <FormattedMessage id="redirection" />
        </h4>
      </Modal.Header>
      <Modal.Body>
        <p>
          <FormattedMessage id="redirectionMsg" />
        </p>
        <p className="mb-1">
          <FormattedMessage id="oldUrl" />: <br />
          <a href={URL_PREFIX + sOldUrl} target="_blank" rel="noreferrer">
            {URL_PREFIX + sOldUrl}
          </a>
        </p>
        <p className="mb-1">
          <FormattedMessage id="newUrl" />: <br />
          <a href={URL_PREFIX + sNewUrl} target="_blank" rel="noreferrer">
            {URL_PREFIX + sNewUrl}
          </a>
        </p>
        <p className="m-0">
          <FormattedMessage id="statusCode" />: {REDIRECTION_STATUS_CODE}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button size="sm" variant="secondary" onClick={() => onClose()} disabled={loading}>
          <FormattedMessage id="cancel" />
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={loading}>
          <FormattedMessage id="okay" />
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
RedirectionPopup.propTypes = {
  sNewUrl: PropTypes.string,
  sOldUrl: PropTypes.string,
  show: PropTypes.bool,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func
}
export default RedirectionPopup
