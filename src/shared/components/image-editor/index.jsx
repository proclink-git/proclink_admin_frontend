import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import ReactCropper from 'react-cropper'
import { Button, Modal, Row, Col } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import 'cropperjs/dist/cropper.css'

import { getFileInfo } from 'shared/utils'

function ImageEditor({ show, setShow, file, onConfirmProp, onCompleted, aspectRatio }) {
  const [cropper, setCropper] = useState()
  const [image, setImage] = useState()
  const [zoom, setZoom] = useState(0)
  const [rotate, setRotate] = useState(0)
  const widthRef = useRef()
  const heightRef = useRef()

  useEffect(() => {
    if (file) {
      if (typeof file === 'string') {
        setImage(file)
      } else {
        const reader = new FileReader()
        reader.addEventListener('load', () => {
          setImage(reader.result)
        })
        reader.readAsDataURL(file)
      }
    } else {
      setImage(null)
      setCropper(null)
    }
  }, [file, cropper])

  function handleCrop({ detail }) {
    if (!detail) return

    if (widthRef.current) {
      widthRef.current.value = Math.round(detail.width)
    }

    if (heightRef.current) {
      heightRef.current.value = Math.round(detail.height)
    }
  }

  function onConfirm() {
    if (!cropper) {
      return
    }

    const croppedCanvas = {
      imageSmoothingQuality: 'high',
      width: 640,
      height: 400
    }

    const canvasData = cropper.getCroppedCanvas(croppedCanvas)
    const fileInfo = getFileInfo(file)

    canvasData.toBlob((blob) => {
      const croppedFile = new File([blob], fileInfo.filename, {
        type: blob.type,
        lastModified: new Date()
      })
      typeof onConfirm === 'function' && onConfirmProp(croppedFile)
      typeof onCompleted === 'function' && onCompleted()
      setImage(null)
      setCropper(null)
      setShow(!show)
      setZoom(0)
      setRotate(0)
    }, fileInfo.mime)
  }

  function handleClose() {
    setCropper(false)
    setImage(null)
    setShow(!show)
    setZoom(0)
    setRotate(0)
    typeof onCompleted === 'function' && onCompleted('close')
  }

  function onRotateChange(e) {
    setRotate(e.target.value)
    cropper.rotateTo(e.target.value)
  }

  function onZoomChange(e) {
    setZoom(e.target.value)
    cropper.zoomTo(e.target.value)
  }
  return (
    <Modal className="editor-modal" centered backdrop="static" show={show} onHide={handleClose} size="lg">
      <Modal.Body>
        {image && (
          <ReactCropper
            src={image}
            style={{ height: 500, width: '100%' }}
            aspectRatio={aspectRatio}
            initialAspectRatio={16 / 9}
            viewMode={1}
            dragMode="move"
            cropBoxMovable={false}
            center={true}
            toggleDragModeOnDblclick={false}
            checkOrientation={true}
            onInitialized={(instance) => setCropper(instance)}
            minCropBoxWidth={600}
            minCropBoxHeight={100}
            cropBoxData={{ width: 100, height: 50 }}
            background={false}
            zoomTo={0.1}
            crop={(e) => handleCrop(e)}
            checkCrossOrigin={false}
          />
        )}
      </Modal.Body>
      <Modal.Footer className="d-block">
        <Row>
          <Col xs={6}>
            <div className="d-flex flex-wrap">
              <div className="w-50 float-left mb-3 d-block">
                <FormattedMessage id="zoom" />
                <input
                  className="d-block"
                  type="range"
                  min={0}
                  step={0.1}
                  max={4}
                  value={zoom}
                  onChange={(value) => {
                    onZoomChange(value)
                  }}
                />
              </div>
              <div className="w-50 float-left mb-3 d-block">
                <FormattedMessage id="rotate" />
                <input
                  className="d-block"
                  type="range"
                  min={-180}
                  max={180}
                  value={rotate}
                  onChange={(value) => {
                    onRotateChange(value)
                  }}
                />
              </div>
              <div className="w-50 float-left d-block">
                <FormattedMessage id="width" />
                <input className="d-block bg-transparent border-0 text-white" readOnly ref={widthRef} type="text" />
              </div>
              <div className="w-50 float-left d-block">
                <FormattedMessage id="height" />
                <input className="d-block bg-transparent border-0 text-white" readOnly ref={heightRef} type="text" />
              </div>
            </div>
          </Col>
          <Col xs={6} className="d-flex align-self-center justify-content-end">
            <div>
              <Button variant="outline-secondary" onClick={handleClose} size="md">
                <FormattedMessage id="cancel" />
              </Button>
              <Button size="md" variant="primary" onClick={onConfirm} className="ms-2">
                <FormattedMessage id="confirm" />
              </Button>
            </div>
          </Col>
        </Row>
      </Modal.Footer>
    </Modal>
  )
}

ImageEditor.propTypes = {
  show: PropTypes.bool,
  setShow: PropTypes.func,
  file: PropTypes.any,
  onConfirmProp: PropTypes.func,
  onCompleted: PropTypes.func,
  aspectRatio: PropTypes.number
}

export default ImageEditor
