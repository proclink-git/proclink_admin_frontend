import React, { useState, useEffect } from 'react'
import { Col } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import { getS3Url, isSvgMedia } from 'shared/utils'
import LottiePreview from './lottie-preview'
import SvgPreview from './svg-preview'
import { getGalleryItemMediaKind } from '../../utils/media-content-type'

function getFileName(url = '') {
  return String(url).split('?')[0].split('/').pop() || 'Document'
}

function getFileExtension(url = '') {
  return getFileName(url).split('.').pop()?.toUpperCase() || 'DOC'
}

function getMediaBadge(item = {}) {
  return getGalleryItemMediaKind(item) === 'lottie' ? 'LOTTIE' : getFileExtension(item?.sUrl)
}

const MediaFooter = ({ data, isGif }) => {
  const [imageData, setImageData] = useState()

  useEffect(() => {
    setImageData(data)
  }, [data])
  const mediaKind = getGalleryItemMediaKind(imageData)

  return (
    <>
      {imageData && (
        <>
          <Col xs={8} className="m-0">
            <div className="d-flex">
              <div>
                <h6>
                  1 <FormattedMessage id="itemSelected" />
                </h6>
              </div>
              <div className="ms-4">
                {mediaKind === 'video' ? (
                  <video className="footer-image" src={getS3Url(imageData?.sUrl)} muted playsInline preload="metadata" />
                ) : mediaKind === 'lottie' ? (
                  <LottiePreview src={imageData?.sUrl} className="footer-image" />
                ) : mediaKind === 'document' ? (
                  <div className="footer-image media-document-preview media-document-preview--footer">
                    <span className="media-document-preview__badge">{getMediaBadge(imageData)}</span>
                    <span className="media-document-preview__name">{getFileName(imageData?.sUrl)}</span>
                  </div>
                ) : isSvgMedia(imageData?.sUrl) ? (
                  <SvgPreview src={imageData?.sUrl} className="footer-image" alt={getFileName(imageData?.sUrl)} />
                ) : (
                  <img className="footer-image" src={getS3Url(imageData?.sUrl)} />
                )}
              </div>
            </div>
          </Col>
        </>
      )}
    </>
  )
}

MediaFooter.propTypes = {
  data: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  isGif: PropTypes.bool
}

export default MediaFooter
