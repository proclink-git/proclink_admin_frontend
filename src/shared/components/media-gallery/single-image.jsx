import React from 'react'
import { Col } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { getS3Url, isSvgMedia } from 'shared/utils'
import BlueTick from 'assets/images/blue-tick.svg'
import PermissionProvider from '../permission-provider'
import LottiePreview from './lottie-preview'
import SvgPreview from './svg-preview'
import { getGalleryItemMediaKind } from '../../utils/media-content-type'

function getFileName(url = '') {
  return String(url).split('?')[0].split('/').pop() || 'Document'
}

function getFileExtension(url = '') {
  return getFileName(url).split('.').pop()?.toUpperCase() || 'DOC'
}

const SingleImage = ({ data, handleId, selectedImageId, isGif, isMulti, overRidePermission }) => {
  const handleClick = (e) => {
    if (isMulti) {
      handleId(data?._id, e)
    } else {
      handleId(data)
    }
  }
  function isSelectedImg() {
    if (!isMulti) return { className: selectedImageId?._id === data?._id ? 'selected' : '', isSelected: selectedImageId?._id === data?._id }
    const isSelected = selectedImageId?.find(sImg => sImg === data?._id)
    return { className: selectedImageId?.find(sImg => sImg === data?._id) ? 'selected' : '', isSelected }
  }

  const { className } = !isGif && isSelectedImg()
  const mediaKind = !isGif ? getGalleryItemMediaKind(data) : 'image'
  const isVideo = mediaKind === 'video'
  const isLottie = mediaKind === 'lottie'
  const isDocument = mediaKind === 'document'
  const isSvg = isSvgMedia(data?.sUrl)
  const mediaUrl = getS3Url(data?.sUrl)

  return (
    <>
      {
        isGif ? (
          <Col xl={3} md={3} xs={3} className="mt-1">
            <div className={`media-item ${selectedImageId?.id === data?.id ? 'selected' : ''}`} id={data.id}>
              <img className="square-img" src={data?.images?.preview_gif?.url} onClick={overRidePermission ? handleClick : PermissionProvider({ children: handleClick, isAllowedTo: 'EDIT_MEDIA_GALLERY' })} />
              <div className="icon">
                <img src={BlueTick} />
              </div>
            </div>
          </Col>
        ) : (
          <Col xl={3} md={3} xs={3} className="mt-1">
            {/* <div className={`media-item ${className}`} id={data._id} onClick={PermissionProvider({ children: handleClick, isAllowedTo: 'EDIT_MEDIA_GALLERY' })}> */}
            <div className={`media-item ${className}`} id={data._id} onClick={overRidePermission ? handleClick : PermissionProvider({ children: handleClick, isAllowedTo: 'EDIT_MEDIA_GALLERY' })}>
              <div className="layer"></div>
              {isVideo ? (
                <video className="square-img" src={mediaUrl} muted playsInline preload="metadata" />
              ) : isLottie ? (
                <LottiePreview src={data?.sUrl} className="square-img" />
              ) : isDocument ? (
                <div className="square-img media-document-preview">
                  <span className="media-document-preview__badge">{getFileExtension(data?.sUrl)}</span>
                  <span className="media-document-preview__name">{getFileName(data?.sUrl)}</span>
                </div>
              ) : isSvg ? (
                <SvgPreview src={data?.sUrl} className="square-img" alt={getFileName(data?.sUrl)} />
              ) : (
                <img className="square-img" src={mediaUrl} />
              )}
              <div className="icon">
                <img src={BlueTick} />
              </div>
            </div>
          </Col>
        )
      }
    </>
  )
}

SingleImage.propTypes = {
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  handleId: PropTypes.func,
  isGif: PropTypes.bool,
  overRidePermission: PropTypes.bool,
  isMulti: PropTypes.bool,
  selectedImageId: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
}

export default SingleImage
