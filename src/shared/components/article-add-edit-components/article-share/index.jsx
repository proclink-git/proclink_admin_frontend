import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useLazyQuery } from '@apollo/client'
import { FormattedMessage } from 'react-intl'
import { Button, Form, FormControl, InputGroup, Modal } from 'react-bootstrap'

import { GENERATE_PREVIEW_TOKEN } from 'graph-ql/article/mutation'
import { PREVIEW_URL, TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'

function ArticleShare({ slug, eType }) {
  const { dispatch } = useContext(ToastrContext)
  const [show, setShow] = useState(false)
  const [url, setUrl] = useState('')

  const [generate] = useLazyQuery(GENERATE_PREVIEW_TOKEN, {
    fetchPolicy: 'network-only',
    variables: { input: { eType } },
    onCompleted: (data) => {
      if (data?.generateTokenFront?.oData) {
        setUrl(`${PREVIEW_URL}${slug}?token=${data?.generateTokenFront?.oData?.sToken}`)
      }
    }
  })

  function handleChange() {
    setShow(!show)
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: <FormattedMessage id="linkSuccessfullyCopiedToClipboard" />, type: TOAST_TYPE.Success }
      })
      handleChange()
    } catch (err) {
      console.error('Failed to copy: ', err)
      handleChange()
    }
  }

  useEffect(() => {
    if (show) {
      generate()
    }
  }, [show])
  return (
    <>
      <Button variant="link" className="square icon-btn" onClick={handleChange}>
        <i className="icon-share d-block" />
      </Button>
      <Modal show={show} onHide={handleChange} centered>
        <Modal.Body>
          <h4 className="mb-3">
            <FormattedMessage id="share" />
          </h4>
          <Form.Group className="form-group">
            <InputGroup className="border-left padding-normal">
              <FormControl value={url} readOnly />
              <Button variant="primary square" onClick={handleCopy}>
                <FormattedMessage id="copy" />
              </Button>
            </InputGroup>
          </Form.Group>
        </Modal.Body>
      </Modal>
    </>
  )
}
ArticleShare.propTypes = {
  slug: PropTypes.string,
  eType: PropTypes.string
}
export default ArticleShare
