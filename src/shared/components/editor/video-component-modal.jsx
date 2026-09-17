import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Form, Modal } from 'react-bootstrap'

const emptyVideoValues = {
  videoSourceMode: 'gallery',
  videoUrl: ''
}

function VideoComponentModal({
  show,
  onClose,
  onSubmit,
  onSelectThumbnail,
  onSelectVideo,
  onClearThumbnail,
  onClearVideo,
  thumbnailPreview,
  videoPreview,
  loading,
  defaultValues = emptyVideoValues,
  isEditing = false
}) {
  const [videoSourceMode, setVideoSourceMode] = useState(defaultValues.videoSourceMode || emptyVideoValues.videoSourceMode)
  const [videoUrl, setVideoUrl] = useState(defaultValues.videoUrl || emptyVideoValues.videoUrl)
  const [error, setError] = useState('')

  function resetForm() {
    setVideoSourceMode('gallery')
    setVideoUrl('')
    setError('')
  }

  function handleClose() {
    if (loading) return
    resetForm()
    onClose()
  }

  async function handleInsert(e) {
    e.preventDefault()
    e.stopPropagation()

    if (videoSourceMode === 'gallery' && !videoPreview) {
      setError('Select a video from media gallery.')
      return
    }

    if (videoSourceMode === 'url' && !videoUrl.trim()) {
      setError('Enter a video URL.')
      return
    }

    setError('')
    const inserted = await onSubmit({
      videoSourceMode,
      videoUrl: videoUrl.trim()
    })

    if (inserted) {
      resetForm()
    }
  }

  useEffect(() => {
    if (show) {
      setVideoSourceMode(defaultValues.videoSourceMode || emptyVideoValues.videoSourceMode)
      setVideoUrl(defaultValues.videoUrl || emptyVideoValues.videoUrl)
      setError('')
      return
    }

    resetForm()
  }, [defaultValues, show])

  useEffect(() => {
    if (videoPreview) {
      setVideoSourceMode('gallery')
      setVideoUrl('')
      setError('')
    }
  }, [videoPreview])

  function handleVideoSourceModeChange(e) {
    const mode = e.target.value

    setVideoSourceMode(mode)
    setError('')

    if (mode === 'gallery') {
      setVideoUrl('')
      return
    }

    onClearVideo()
  }

  function handleVideoUrlChange(e) {
    const nextValue = e.target.value

    if (videoSourceMode !== 'url') {
      setVideoSourceMode('url')
      onClearVideo()
    }

    setVideoUrl(nextValue)
    if (nextValue.trim()) setError('')
  }

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton={!loading}>
        <Modal.Title>{isEditing ? 'Edit Video Component' : 'Insert Video Component'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Thumbnail Image</Form.Label>
          <div className="d-flex gap-2">
            <Button type="button" variant="outline-primary" onClick={onSelectThumbnail} disabled={loading}>
              {thumbnailPreview ? 'Change Thumbnail' : 'Open Image Gallery'}
            </Button>
            {thumbnailPreview && (
              <Button type="button" variant="outline-secondary" onClick={onClearThumbnail} disabled={loading}>
                Remove
              </Button>
            )}
          </div>
          <Form.Text className="text-muted">
            Opens media gallery so you can upload or select an image.
          </Form.Text>
          {thumbnailPreview && (
            <img
              className="w-100 mt-3 rounded"
              src={thumbnailPreview}
              alt="Video thumbnail preview"
              style={{ maxHeight: '240px', objectFit: 'cover' }}
            />
          )}
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Video Source</Form.Label>
          <Form.Select value={videoSourceMode} onChange={handleVideoSourceModeChange} disabled={loading}>
            <option value="gallery">Gallery Video</option>
            <option value="url">Video URL</option>
          </Form.Select>
        </Form.Group>
        {videoSourceMode === 'gallery' && (
          <Form.Group className="mb-3">
            <Form.Label>Video Media</Form.Label>
            <div className="d-flex gap-2">
              <Button type="button" variant="outline-primary" onClick={onSelectVideo} disabled={loading}>
                {videoPreview ? 'Change Video' : 'Open Video Gallery'}
              </Button>
              {videoPreview && (
                <Button type="button" variant="outline-secondary" onClick={onClearVideo} disabled={loading}>
                  Remove
                </Button>
              )}
            </div>
            <Form.Text className="text-muted">
              Choose this mode to upload or select a video from media gallery.
            </Form.Text>
            {videoPreview && (
              <video className="w-100 mt-3 rounded" src={videoPreview} controls playsInline preload="metadata" />
            )}
          </Form.Group>
        )}
        {videoSourceMode === 'url' && (
          <Form.Group className="mb-3">
            <Form.Label>Video URL</Form.Label>
            <Form.Control
              type="text"
              value={videoUrl}
              onChange={handleVideoUrlChange}
              placeholder="https://example.com/video.mp4"
              disabled={loading}
            />
            <Form.Text className="text-muted">
              Use this mode only when you want a direct video URL instead of a gallery video.
            </Form.Text>
          </Form.Group>
        )}
        {error && <div className="text-danger">{error}</div>}
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="button" variant="primary" onClick={handleInsert} disabled={loading}>
          {isEditing ? 'Update' : 'Insert'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

VideoComponentModal.propTypes = {
  defaultValues: PropTypes.shape({
    videoSourceMode: PropTypes.string,
    videoUrl: PropTypes.string
  }),
  isEditing: PropTypes.bool,
  loading: PropTypes.bool,
  onClearThumbnail: PropTypes.func,
  onClearVideo: PropTypes.func,
  onClose: PropTypes.func,
  onSelectThumbnail: PropTypes.func,
  onSelectVideo: PropTypes.func,
  onSubmit: PropTypes.func,
  show: PropTypes.bool,
  thumbnailPreview: PropTypes.string,
  videoPreview: PropTypes.string
}

export default VideoComponentModal
