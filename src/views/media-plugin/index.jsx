import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { useMutation } from '@apollo/client'
import { FormattedMessage } from 'react-intl'
import { FormProvider, useForm } from 'react-hook-form'
import { Button, Form, Spinner } from 'react-bootstrap'

import { ToastrContext } from 'shared/components/toastr'
import { EDIT_IMAGE } from 'graph-ql/article/mutation'
import { TOAST_TYPE } from 'shared/constants'
import UploadFiles from 'shared/components/media-gallery/upload-files'
import MediaLibrary from 'shared/components/media-gallery/media-library'
import MediaFooter from 'shared/components/media-gallery/media-footer'
import PermissionProvider from 'shared/components/permission-provider'

function getMediaPluginCopy(mediaType = 'image') {
  if (mediaType === 'all') {
    return {
      galleryId: 'allMedia',
      galleryLabel: 'All Media',
      uploadId: 'uploadMedia',
      uploadLabel: 'Upload Media'
    }
  }

  if (mediaType === 'video') {
    return {
      galleryId: 'videoGallery',
      galleryLabel: 'Video Gallery',
      uploadId: 'uploadVideo',
      uploadLabel: 'Upload Video/Lottie'
    }
  }

  if (mediaType === 'document') {
    return {
      galleryId: 'pdfGallery',
      galleryLabel: 'PDF Gallery',
      uploadId: 'uploadPdf',
      uploadLabel: 'Upload PDF'
    }
  }

  return {
    galleryId: 'mediaGallery',
    galleryLabel: 'Media Gallery',
    uploadId: 'uploadImage',
    uploadLabel: 'Upload Image'
  }
}

const MediaPlugin = ({ onSubmit }) => {
  const { dispatch } = useContext(ToastrContext)
  const methods = useForm()
  const { handleSubmit, reset } = methods
  const [tab, setTab] = useState('media')
  const [singleImage, setSingleImage] = useState()
  const [mediaType, setMediaType] = useState('all')
  const mediaPluginCopy = getMediaPluginCopy(mediaType)
  const [editImage, { loading }] = useMutation(EDIT_IMAGE, {
    onCompleted: (data) => {
      if (data && data.editImage) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editImage.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
      }
    }
  })
  const handleTab = (value) => {
    setTab(value)
    setSingleImage('')
  }

  const handleMediaType = (value) => {
    setMediaType(value)
    setTab('media')
    setSingleImage('')
    reset({
      sText: '',
      sCaption: '',
      sAttribute: ''
    })
  }

  const handleImage = (data) => {
    setSingleImage(data)
    reset({
      sText: data?.sText || '',
      sCaption: data?.sCaption || '',
      sAttribute: data?.sAttribute || ''
    })
  }

  const handleChoose = (data) => {
    editImage({
      variables: {
        input: {
          sCaption: data.sCaption,
          sText: data.sText,
          sAttribute: data.sAttribute,
          _id: singleImage._id,
          sUrl: singleImage.sUrl
        }
      }
    })
  }

  const handleTabs = () => {
    setTab('media')
  }

  function resetSelection() {
    setSingleImage()
  }

  return (
    <>
      <ul id="media-type-tab-example" className="data-table-tabs d-flex mb-3">
        <li className={mediaType === 'all' ? 'active' : ''} onClick={() => handleMediaType('all')}>
          <FormattedMessage id="all" defaultMessage="All" />
        </li>
        <li className={mediaType === 'image' ? 'active' : ''} onClick={() => handleMediaType('image')}>
          <FormattedMessage id="images" defaultMessage="Images" />
        </li>
        <li className={mediaType === 'video' ? 'active' : ''} onClick={() => handleMediaType('video')}>
          <FormattedMessage id="videos" defaultMessage="Videos" />
        </li>
        <li className={mediaType === 'document' ? 'active' : ''} onClick={() => handleMediaType('document')}>
          <FormattedMessage id="pdfs" defaultMessage="PDFs" />
        </li>
      </ul>
      <ul id="noanim-tab-example" className="data-table-tabs d-flex">
        <li className={tab === 'media' ? 'active' : ''} onClick={() => handleTab('media')}>
          <FormattedMessage id={mediaPluginCopy.galleryId} defaultMessage={mediaPluginCopy.galleryLabel} />
        </li>
        <PermissionProvider isAllowedTo="ADD_MEDIA_GALLERY">
          <li className={tab === 'upload' ? 'active' : ''} onClick={() => handleTab('upload')}>
            <FormattedMessage id={mediaPluginCopy.uploadId} defaultMessage={mediaPluginCopy.uploadLabel} />
          </li>
        </PermissionProvider>
      </ul>
      {tab === 'upload' ? (
        <UploadFiles handleTabs={handleTabs} mediaType={mediaType} />
      ) : (
        <FormProvider {...methods}>
          <Form>
            <MediaLibrary onSubmit={onSubmit} handleImage={handleImage} isPlugin overRidePermission mediaType={mediaType} />
          </Form>
        </FormProvider>
      )}
      {tab === 'media' && singleImage && (
        <>
          <div className="d-flex justify-content-between">
            <MediaFooter data={singleImage} resetSelection={resetSelection} />
            <div className="m-0 text-end">
              <Button onClick={handleSubmit(handleChoose)} size="md" variant="primary" type="submit" disabled={loading}>
                <FormattedMessage id="update" />
                {loading && <Spinner animation="border" size="sm" />}
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

MediaPlugin.propTypes = {
  onSubmit: PropTypes.bool
}

export default MediaPlugin
