/* eslint-disable no-unused-vars */
import { useMutation } from '@apollo/client'
import React, { useContext, useRef, useState } from 'react'
import { Badge, Container } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'

import { ToastrContext } from 'shared/components/toastr'
import { uploadImage } from 'shared/functions/PreSignedData'
import { TOAST_TYPE } from 'shared/constants'
import Loading from '../loading'
import { INSERT_IMAGE } from 'graph-ql/article/mutation'
import { GENERATE_PRE_SIGNED } from 'graph-ql/generate-pre-signed-url'
import UploadMediaModal from './uploadModal'
import {
  DOT_LOTTIE_CONTENT_TYPE,
  getDotLottieAnimationData,
  isDotLottieFile,
  isLottieJsonFile
} from 'shared/utils/dotlottie'
import {
  CONTENT_TYPE,
  CONTENT_TYPE_LABEL,
  getContentTypeFromFile,
  getUploadTypeFromFile
} from '../../utils/media-content-type'

const IMAGE_UPLOAD_ACCEPT = '.jpg,.png,.jpeg,.webp,.svg,.gif,.bmp,.ico'
const VIDEO_UPLOAD_ACCEPT = '.mp4,.webm,.mov,.avi,.mkv,.m4v,.json,.lottie'
const DOCUMENT_UPLOAD_ACCEPT = '.pdf'
const ALL_UPLOAD_ACCEPT = `${IMAGE_UPLOAD_ACCEPT},${VIDEO_UPLOAD_ACCEPT},${DOCUMENT_UPLOAD_ACCEPT}`
const LOTTIE_CONTENT_TYPE = 'application/json'
const SVG_CONTENT_TYPE = 'image/svg+xml'
const IMAGE_CONTENT_TYPE_BY_EXTENSION = {
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: SVG_CONTENT_TYPE,
  webp: 'image/webp',
  bmp: 'image/bmp',
  ico: 'image/x-icon'
}
const VIDEO_CONTENT_TYPE_BY_EXTENSION = {
  avi: 'video/x-msvideo',
  m4v: 'video/mp4',
  mkv: 'video/x-matroska',
  mov: 'video/quicktime',
  mp4: 'video/mp4',
  webm: 'video/webm'
}

function getFileExtension(fileName = '') {
  return String(fileName).split('.').pop()?.toLowerCase() || ''
}

function getBaseFileName(fileName = '') {
  return String(fileName).replace(/\.[^/.]+$/, '')
}

function isLottieFile(file = {}) {
  return isLottieJsonFile(file) || isDotLottieFile(file)
}

function readFileAsArrayBuffer(file) {
  if (file?.arrayBuffer) return file.arrayBuffer()

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('There was an error loading the Lottie file.'))
    reader.readAsArrayBuffer(file)
  })
}

function getUploadFileName(file = {}) {
  if (isLottieFile(file)) return String(file.name || '')

  return getBaseFileName(file.name)
}

function getUploadContentType(file = {}) {
  const fileExtension = getFileExtension(file.name)

  if (isDotLottieFile(file)) return DOT_LOTTIE_CONTENT_TYPE
  if (isLottieJsonFile(file)) return LOTTIE_CONTENT_TYPE
  if (getContentTypeFromFile(file) === CONTENT_TYPE.video) return file.type || VIDEO_CONTENT_TYPE_BY_EXTENSION[fileExtension] || 'video/mp4'
  if (getContentTypeFromFile(file) === CONTENT_TYPE.pdf) return 'application/pdf'

  return file.type || IMAGE_CONTENT_TYPE_BY_EXTENSION[fileExtension] || 'image/jpeg'
}

function getPreSignedContentType(file = {}) {
  return getUploadContentType(file)
}

function getUploadAccept(mediaType = 'image') {
  if (mediaType === 'all') return ALL_UPLOAD_ACCEPT
  if (mediaType === 'video') return VIDEO_UPLOAD_ACCEPT
  if (mediaType === 'document') return DOCUMENT_UPLOAD_ACCEPT

  return IMAGE_UPLOAD_ACCEPT
}

function getSelectFileLabel(mediaType = 'image') {
  if (mediaType === 'all') return { id: 'selectMedia', defaultMessage: 'Select Media' }
  if (mediaType === 'video') return { id: 'selectVideo', defaultMessage: 'Select Video/Lottie' }
  if (mediaType === 'document') return { id: 'selectDocument', defaultMessage: 'Select PDF' }

  return { id: 'selectFile', defaultMessage: 'Select File' }
}

const UploadFiles = ({ handleTabs, galleryType, mediaType = 'image' }) => {
  const inputRef = useRef()
  const [show, setShow] = useState(false)
  const { dispatch } = useContext(ToastrContext)
  const mediaFiles = useRef()
  const mediaMetadata = useRef([])
  const [loading, setLoading] = useState(false)
  const [selectedFileTypes, setSelectedFileTypes] = useState([])
  const [selectedType, setSelectedType] = useState()
  const selectFileLabel = getSelectFileLabel(mediaType)

  const [insertImage] = useMutation(INSERT_IMAGE, {
    onCompleted: (data) => {
      if (data) {
        setLoading(false)
        setSelectedFileTypes([])
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.insertImage.sMessage, type: TOAST_TYPE.Success, btnTxt: 'close' }
        })
        handleTabs()
      }
    },
    onError: (err) => {
      setLoading(false)
      setSelectedFileTypes([])
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: err.message || 'Unable to save uploaded media.', type: TOAST_TYPE.Error }
      })
    }
  })

  const [generatePreSignedUrl] = useMutation(GENERATE_PRE_SIGNED, {
    onCompleted: (data) => {
      if (data && data.generatePreSignedUrl) {
        const urls = data.generatePreSignedUrl
        const uploadData = []
        const mediaData = []

        for (let img = 0; img < mediaFiles.current?.length; img++) {
          uploadData.push({
            sUploadUrl: urls[img].sUploadUrl,
            sContentType: getUploadContentType(mediaFiles.current[img]),
            file: mediaFiles.current[img]
          })
          mediaData.push({
            sUrl: urls[img]?.sS3Url,
            eType: selectedType?.eType,
            eContentType: getContentTypeFromFile(mediaFiles.current[img]),
            oMeta:
              mediaMetadata.current?.[img] || {
                nSize: mediaFiles.current[img]?.size,
                nWidth: selectedType?.nWidth,
                nHeight: selectedType?.nHeight
              }
          })
        }

        uploadImage(uploadData)
          .then(() => {
            insertImage({
              variables: {
                input: mediaData
              }
            })
          })
          .catch((err) => {
            console.log('err', err)
            setLoading(false)
            setSelectedFileTypes([])
            dispatch({
              type: 'SHOW_TOAST',
              payload: { message: err.message || 'Media upload failed.', type: TOAST_TYPE.Error }
            })
          })
      }
    },
    onError: (err) => {
      setLoading(false)
      setSelectedFileTypes([])
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: err.message || 'Unable to generate upload URL.', type: TOAST_TYPE.Error }
      })
    }
  })

  const handleImageChange = (e) => {
    if (e.target.files.length) {
      const aFiles = Object.values(e.target.files)
      setSelectedFileTypes(
        aFiles.map((file) => ({
          name: file.name,
          contentType: getContentTypeFromFile(file)
        }))
      )
      setLoading(true)
      getMediaMetadata(aFiles)
        .then((metadata) => {
          mediaFiles.current = aFiles
          mediaMetadata.current = metadata
          const mediaPayload = aFiles.map((obj) => {
            return {
              sFileName: getUploadFileName(obj),
              sContentType: getPreSignedContentType(obj),
              sType: getUploadTypeFromFile(obj),
              bAdd: true
            }
          })
          generatePreSignedUrl({
            variables: {
              generatePreSignedUrlInput: mediaPayload
            }
          })
        })
        .catch((err) => {
          setLoading(false)
          setSelectedFileTypes([])
          dispatch({
            type: 'SHOW_TOAST',
            payload: { message: err.message, type: TOAST_TYPE.Error }
          })
        })
    }
  }

  function handleMediaTypeSelect(s) {
    setSelectedType(s)
    inputRef.current.click()
    setShow(false)
  }

  function getImageMetadata(file) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const objectURL = URL.createObjectURL(file)
      img.src = objectURL
      img.onload = () => {
        URL.revokeObjectURL(objectURL)
        resolve({
          nSize: file?.size,
          nWidth: img.width || selectedType?.nWidth,
          nHeight: img.height || selectedType?.nHeight
        })
      }
      img.onerror = () => {
        URL.revokeObjectURL(objectURL)
        reject(new Error('There was an error loading the image.'))
      }
    })
  }

  function getVideoMetadata(file) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      const objectURL = URL.createObjectURL(file)
      video.preload = 'metadata'
      video.src = objectURL
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(objectURL)
        resolve({
          nSize: file?.size,
          nWidth: video.videoWidth,
          nHeight: video.videoHeight
        })
      }
      video.onerror = () => {
        URL.revokeObjectURL(objectURL)
        resolve({
          nSize: file?.size
        })
      }
    })
  }

  function getDocumentMetadata(file) {
    return Promise.resolve({
      nSize: file?.size
    })
  }

  function getLottieMetadata(file) {
    if (isDotLottieFile(file)) {
      return readFileAsArrayBuffer(file).then((arrayBuffer) => {
        const { animationData } = getDotLottieAnimationData(arrayBuffer)

        return {
          nSize: file?.size,
          nWidth: Number(animationData?.w) || selectedType?.nWidth,
          nHeight: Number(animationData?.h) || selectedType?.nHeight
        }
      }).catch(() => {
        throw new Error('There was an error loading the Lottie file.')
      })
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        try {
          const animationData = JSON.parse(reader.result)

          resolve({
            nSize: file?.size,
            nWidth: Number(animationData?.w) || selectedType?.nWidth,
            nHeight: Number(animationData?.h) || selectedType?.nHeight
          })
        } catch (err) {
          reject(new Error('There was an error loading the Lottie file.'))
        }
      }

      reader.onerror = () => reject(new Error('There was an error loading the Lottie file.'))
      reader.readAsText(file)
    })
  }

  function getMediaMetadata(files) {
    const promises = Array.from(files).map((file) => {
      return new Promise((resolve, reject) => {
        const contentType = getContentTypeFromFile(file)

        if (contentType === CONTENT_TYPE.video && isLottieFile(file)) return getLottieMetadata(file).then(resolve).catch(reject)
        if (contentType === CONTENT_TYPE.video) return getVideoMetadata(file).then(resolve).catch(reject)
        if (contentType === CONTENT_TYPE.pdf) return getDocumentMetadata(file).then(resolve).catch(reject)
        return getImageMetadata(file).then(resolve).catch(reject)
      })
    })

    return Promise.all(promises)
  }

  return (
    <>
      <UploadMediaModal show={show} setShow={setShow} onSelect={handleMediaTypeSelect} />
      <Container>
        <div className="middle-div text-center">
          {!loading && (
            <div>
              {/* <h1>
                <FormattedMessage id="dropFilesToUpload" />
              </h1>
              <p className="text-left dark-text">
                <FormattedMessage id="or" />
              </p> */}
              <input type="hidden" name="oImg.sUrl" />
              <input
                ref={inputRef}
                type="file"
                name="oImg.fSUrl"
                id="uploadImg"
                accept={getUploadAccept(mediaType)}
                hidden
                multiple={true}
                onChange={(e) => {
                  handleImageChange(e)
                }}
              />
              {galleryType ? (
                <label htmlFor="uploadImg" className="btn btn-primary">
                  <i className="icon-upload big"></i>
                  <FormattedMessage id={selectFileLabel.id} defaultMessage={selectFileLabel.defaultMessage} />
                </label>
              ) : (
                <label htmlFor="uploadImg" className="btn btn-primary">
                  <i className="icon-upload big"></i>
                  <FormattedMessage id={selectFileLabel.id} defaultMessage={selectFileLabel.defaultMessage} />
                </label>
              )}

            </div>
          )}
          {loading && (
            <div className="loader media-upload-loader">
              {!!selectedFileTypes.length && (
                <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
                  {selectedFileTypes.map((file) => (
                    <Badge key={`${file.name}-${file.contentType}`} bg="secondary">
                      {file.name}: {CONTENT_TYPE_LABEL[file.contentType]}
                    </Badge>
                  ))}
                </div>
              )}
              <Loading />
            </div>
          )}
        </div>
      </Container>
    </>
  )
}

UploadFiles.propTypes = {
  handleTabs: PropTypes.func,
  galleryType: PropTypes.string,
  mediaType: PropTypes.oneOf(['all', 'image', 'video', 'document'])
}

export default UploadFiles
