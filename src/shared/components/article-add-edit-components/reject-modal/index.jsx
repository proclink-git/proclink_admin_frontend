import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'
import { Button, Dropdown, Form, Modal, Spinner } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import { Controller, useForm } from 'react-hook-form'
import { useMutation } from '@apollo/client'

import { CREATE_ARTICLE_COMMENT } from 'graph-ql/article/mutation'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { getCurrentUser } from 'shared/utils'
import { REJECT_REASON } from 'shared/constants'

function RejectModal({ articleSubmit, formSubmit, articleData, type }) {
  const [show, setShow] = useState(false)
  const currentUser = getCurrentUser()
  const placeholder = useIntl().formatMessage({ id: 'message' })
  const [addComment, { loading }] = useMutation(CREATE_ARTICLE_COMMENT, {
    onCompleted: (data) => {
      if (data?.createArticleComment) {
        articleSubmit((d) => formSubmit(d, 'r'))()
        handleChange()
      }
    }
  })
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch
  } = useForm({ mode: 'all', defaultValues: {} })
  const reason = watch('eReason')

  function handleChange() {
    setShow(!show)
    reset({})
  }

  function getMessage(msg) {
    if (reason === 'custom') {
      return `Your article "${articleData.sTitle}" is rejected.\nReason: ${msg}`
    } else {
      return `Your article "${articleData.sTitle}" is rejected.\nReason: ${reason}`
    }
  }

  function onSubmit(data) {
    const input = {
      sMessage: getMessage(data.sMessage),
      iArticleId: articleData._id,
      iReceiverId: currentUser._id === articleData.iAuthorId ? articleData.iReviewerId : articleData.iAuthorId
    }
    addComment({ variables: { input } })
  }
  return (
    <>
      <Dropdown.Item onClick={handleChange}>
        <FormattedMessage id="reject" />
      </Dropdown.Item>
      <Modal show={show} onHide={handleChange} centered>
        <Modal.Body>
          <h4 className="mb-3">
            <FormattedMessage id="rejectReason" />
          </h4>
          <Form>
            <Form.Group className="form-group">
              <Controller
                name="eReason"
                control={control}
                rules={{ required: validationErrors.required }}
                render={({ field: { onChange } }) => (
                  <Select
                    options={REJECT_REASON}
                    className={`react-select ${errors.eReason && 'error'}`}
                    classNamePrefix="select"
                    placeholder={<FormattedMessage id="selectReason" />}
                    isSearchable={false}
                    onChange={(e) => {
                      onChange(e.value)
                    }}
                  />
                )}
              />
              {errors.eReason && <Form.Control.Feedback type="invalid">{errors.eReason.message}</Form.Control.Feedback>}
            </Form.Group>
            {reason === 'custom' && (
              <Form.Group className="form-group">
                <Form.Control
                  className={errors.sMessage && 'error'}
                  as="textarea"
                  name="sMessage"
                  placeholder={placeholder}
                  {...register('sMessage', { required: validationErrors.required })}
                />
                {errors.sMessage && <Form.Control.Feedback type="invalid">{errors.sMessage.message}</Form.Control.Feedback>}
              </Form.Group>
            )}
            <div>
              <Button size="sm" variant="primary" onClick={handleSubmit(onSubmit)} disabled={loading}>
                <FormattedMessage id="confirm" />
                {(loading) && <Spinner animation="border" size="sm" />}
              </Button>
              <Button variant="outline-secondary" onClick={handleChange} size="sm" className="ms-2" disabled={loading}>
                <FormattedMessage id="cancel" />
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  )
}
RejectModal.propTypes = {
  articleSubmit: PropTypes.func,
  formSubmit: PropTypes.func,
  articleData: PropTypes.object,
  type: PropTypes.string
}
export default RejectModal
