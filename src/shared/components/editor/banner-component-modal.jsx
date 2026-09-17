import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Form, Modal } from 'react-bootstrap'
import CountInput from '../count-input'
import { useForm } from 'react-hook-form'

const emptyBannerValues = {
  title: '',
  description: '',
  buttonLabel: '',
  buttonUrl: ''
}

function BannerComponentModal({ show, onClose, onSubmit, defaultValues = emptyBannerValues, isEditing = false }) {
  const normalizedDefaultValues = {
    ...emptyBannerValues,
    ...defaultValues
  }
  const { handleSubmit, register, reset, watch } = useForm({
    defaultValues: normalizedDefaultValues
  })

  const title = watch('title')
  const description = watch('description')
  const buttonLabel = watch('buttonLabel')
  const buttonUrl = watch('buttonUrl')

  useEffect(() => {
    if (show) {
      reset(normalizedDefaultValues)
      return
    }

    reset(emptyBannerValues)
  }, [defaultValues, reset, show])

  function handleClose() {
    reset(normalizedDefaultValues)
    onClose()
  }

  async function handleInsert(e) {
    e.preventDefault()
    e.stopPropagation()

    const inserted = await handleSubmit(async (bannerValues) => onSubmit?.(bannerValues))()

    if (inserted !== false) {
      handleClose()
    }
  }

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isEditing ? 'Edit CTA Banner' : 'Insert CTA Banner'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleInsert}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Banner Title</Form.Label>
            <CountInput
              name="title"
              type="text"
              currentLength={title?.length}
              register={register('title')}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Banner Description</Form.Label>
            <CountInput
              name="description"
              textarea
              rows={3}
              currentLength={description?.length}
              register={register('description')}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Button Label</Form.Label>
            <CountInput
              name="buttonLabel"
              type="text"
              currentLength={buttonLabel?.length}
              register={register('buttonLabel')}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Button URL</Form.Label>
            <CountInput
              name="buttonUrl"
              type="text"
              currentLength={buttonUrl?.length}
              register={register('buttonUrl')}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {isEditing ? 'Update' : 'Insert'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

BannerComponentModal.propTypes = {
  defaultValues: PropTypes.shape({
    buttonLabel: PropTypes.string,
    buttonUrl: PropTypes.string,
    description: PropTypes.string,
    title: PropTypes.string
  }),
  isEditing: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  show: PropTypes.bool
}

export default BannerComponentModal
