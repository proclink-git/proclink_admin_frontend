import React, { useEffect, useState, useContext } from 'react'
import { Form } from 'react-bootstrap'
// import { useForm } from 'react-hook-form'
import { FormattedMessage, useIntl } from 'react-intl'
import PropTypes from 'prop-types'
import { useMutation } from '@apollo/client'
import { confirmAlert } from 'react-confirm-alert'

import { TOAST_TYPE } from 'shared/constants'
import CustomAlert from 'shared/components/alert'
import { convertIntoKb, getS3Url, isSvgMedia } from 'shared/utils'
import ImageEditor from 'shared/components/image-editor'
import { uploadImage } from 'shared/functions/PreSignedData'
import { EDIT_IMAGE, DELETE_IMAGE } from 'graph-ql/article/mutation'
import { ToastrContext } from 'shared/components/toastr'
import { GENERATE_PRE_SIGNED } from 'graph-ql/generate-pre-signed-url'
import { useFormContext } from 'react-hook-form'
import moment from 'moment'
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

const FeatureImageSidebar = ({ data, refetch, gifsGalary, afterDelete }) => {
  const { dispatch } = useContext(ToastrContext)
  const methods = useFormContext()
  let type
  const [imageSrc, setImageSrc] = useState()
  const [show, setShow] = useState(false)
  const [fileData, setFileData] = useState()
  const [imageData, setImageData] = useState()
  const [showCopied, setShowCopied] = useState(false)
  const mediaKind = getGalleryItemMediaKind(data)
  const isVideo = mediaKind === 'video'
  const isLottie = mediaKind === 'lottie'
  const isDocument = mediaKind === 'document'
  const isSvg = isSvgMedia(data?.sUrl)
  let mediaTitleId = 'featuredImage'
  let mediaTitle = 'Featured Image'
  let deleteMediaId = 'deleteImagePermanently'
  let deleteMediaLabel = 'Delete Image Permanently'

  if (isVideo) {
    mediaTitleId = 'featuredVideo'
    mediaTitle = 'Featured Video'
    deleteMediaId = 'deleteVideoPermanently'
    deleteMediaLabel = 'Delete Video Permanently'
  }

  if (isDocument) {
    mediaTitleId = 'featuredDocument'
    mediaTitle = 'Featured Document'
    deleteMediaId = 'deleteDocumentPermanently'
    deleteMediaLabel = 'Delete Document Permanently'
  }

  if (isLottie) {
    mediaTitleId = 'featuredLottie'
    mediaTitle = 'Featured Lottie'
    deleteMediaId = 'deleteLottiePermanently'
    deleteMediaLabel = 'Delete Lottie Permanently'
  }
  const fileName = getFileName(data?.sUrl)
  const formattedCreatedDate = moment(Number(data?.dCreated)).format('MMM D, YYYY h:mm A')
  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteThisItem' })
  }

  const [generatePreSignedUrl] = useMutation(GENERATE_PRE_SIGNED, {
    onCompleted: (data) => {
      const urls = data.generatePreSignedUrl
      const uploadData = []
      uploadData.push({ sUploadUrl: urls[0].sUploadUrl, file: fileData })

      const img = document.createElement('img')

      img.src = URL.createObjectURL(fileData)

      uploadImage(uploadData)
        .then((res) => {
          editImage({
            variables: {
              input: {
                _id: imageData?._id,
                sUrl: data.generatePreSignedUrl[0].sS3Url,
                oMeta: { nSize: fileData?.size, nWidth: img?.width, nHeight: img?.height }
              }
            }
          })
        })
        .catch((err) => {
          console.log('err', err)
        })
    }
  })

  const [editImage] = useMutation(EDIT_IMAGE, {
    onCompleted: (data) => {
      if (data) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editImage.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
        refetch()
      }
    }
  })

  const [deleteImage] = useMutation(DELETE_IMAGE, {
    onCompleted: (data) => {
      if (data) {
        afterDelete(imageData._id)
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.deleteImage.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
      }
    }
  })

  const handleCopy = (e) => {
    e.preventDefault()
    navigator.clipboard.writeText(getS3Url(data?.sUrl))
    setShowCopied(true)
  }

  // eslint-disable-next-line no-unused-vars
  const handleEditImage = (e) => {
    e.preventDefault()
    setImageSrc(getS3Url(data?.sUrl))
    setShow(true)
  }

  function onConfirm(croppedFile) {
    setFileData(croppedFile)
    if (data?.sUrl?.split('/')[1] === 'attachments') {
      type = 'articleEditorMedia'
    } else if (data?.sUrl?.split('/')[1] === 'featureimage') {
      type = 'articleFtImg'
    } else {
      type = 'articleThumbImg'
    }
    generatePreSignedUrl({
      variables: {
        generatePreSignedUrlInput: {
          sFileName: data?.sUrl?.split('/').pop().split('.')[0],
          sContentType: croppedFile.type,
          sType: type,
          bAdd: false
        }
      }
    })
  }

  function handleDeleteImage(e) {
    e.preventDefault()
    confirmAlert({
      title: labels.confirmationTitle,
      message: labels.confirmationMessage,
      customUI: CustomAlert,
      buttons: [
        {
          label: labels.yes,
          onClick: async () => {
            await deleteImage({ variables: { input: { aId: [imageData?._id] } } })
          }
        },
        {
          label: labels.no
        }
      ]
    })
  }

  useEffect(() => {
    setImageData(data)
  }, [data])

  useEffect(() => {
    if (showCopied) {
      setTimeout(() => {
        setShowCopied(false)
      }, 2000)
    }
  }, [showCopied])

  return (
    <>
      <ImageEditor
        file={imageSrc}
        aspectRatio={16 / 10}
        show={show}
        setShow={setShow}
        onConfirmProp={(croppedFile) => {
          onConfirm(croppedFile)
        }}
      />
      <div className="feature-image-div">
        <h6>
          <FormattedMessage id={mediaTitleId} defaultMessage={mediaTitle} />
        </h6>
        <div className={`media-sidebar-card media-sidebar-card--${mediaKind}`}>
          <div className="media-sidebar-card__preview">
            {isVideo ? (
              <video className="media-sidebar-card__media" src={getS3Url(data?.sUrl)} controls playsInline preload="metadata" />
            ) : isLottie ? (
              <LottiePreview src={data?.sUrl} className="media-sidebar-card__media" />
            ) : isDocument ? (
              <div className="media-document-preview media-document-preview--sidebar">
                <span className="media-document-preview__badge">{getMediaBadge(data)}</span>
              </div>
            ) : isSvg ? (
              <SvgPreview src={data?.sUrl} className="media-sidebar-card__media" alt={fileName} />
            ) : (
              <img className="media-sidebar-card__media" src={getS3Url(data?.sUrl)} />
            )}
          </div>
          <div className="media-sidebar-card__body">
            <span className="media-sidebar-card__title">{fileName}</span>
            <span className="media-sidebar-card__meta">{formattedCreatedDate}</span>
            {data?.oMeta?.nSize && (
              <span className="media-sidebar-card__meta">
                {convertIntoKb(data?.oMeta?.nSize)} <FormattedMessage id="kb" />
              </span>
            )}
            {data?.oMeta?.nWidth && data?.oMeta?.nHeight && (
              <span className="media-sidebar-card__meta">
                <FormattedMessage id="dimensions" /> {data?.oMeta?.nWidth} <FormattedMessage id="by" /> {data?.oMeta?.nHeight}{' '}
                <FormattedMessage id="pixels" />
              </span>
            )}
            {(data?.oAuthor?.sDisplayName || data?.oAuthor?.sUName) && (
              <span className="media-sidebar-card__meta">{data?.oAuthor?.sDisplayName || data?.oAuthor?.sUName}</span>
            )}
            <div className="media-sidebar-card__actions">
              {isDocument && (
                <a className="btn btn-primary btn-sm media-sidebar-card__primary-action" href={getS3Url(data?.sUrl)} target="_blank" rel="noreferrer">
                  <FormattedMessage id="openDocument" defaultMessage="Open Document" />
                </a>
              )}
              <button type="button" className="media-sidebar-card__delete" onClick={(e) => handleDeleteImage(e)}>
                <FormattedMessage id={deleteMediaId} defaultMessage={deleteMediaLabel} />
              </button>
            </div>
          </div>
        </div>
        <div className="mt-2 me-4">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="altText" />
            </Form.Label>
            <Form.Control type="text" name="sText" {...methods.register('sText')} />
          </Form.Group>
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="caption" />
            </Form.Label>
            <Form.Control as="textarea" name="sCaption" {...methods.register('sCaption')} />
          </Form.Group>
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="attribution" />
            </Form.Label>
            <Form.Control as="textarea" name="sAttribution" {...methods.register('sAttribute')} />
          </Form.Group>
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="fileUrl" />
            </Form.Label>
            <Form.Control type="text" defaultValue={getS3Url(data?.sUrl)} disabled />
          </Form.Group>
          <button onClick={(e) => handleCopy(e)} className="modify-button-blue-underline">
            <FormattedMessage id="copyUrlToClipboard" />
          </button>
          {showCopied && (
            <span className="dark-text">
              <FormattedMessage id="copied" />
            </span>
          )}
        </div>
      </div>
    </>
  )
}

FeatureImageSidebar.propTypes = {
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  register: PropTypes.func,
  refetch: PropTypes.func,
  afterDelete: PropTypes.func,
  isPlugin: PropTypes.bool,
  gifsGalary: PropTypes.bool,
  mediaType: PropTypes.oneOf(['all', 'image', 'video', 'document'])
}

export default FeatureImageSidebar
