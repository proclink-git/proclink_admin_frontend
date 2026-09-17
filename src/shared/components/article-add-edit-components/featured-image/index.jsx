import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import { useWatch } from 'react-hook-form'

import ArticleTab from 'shared/components/article-tab'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { getMediaKind, getS3Url, isVideoGalleryMedia } from 'shared/utils'
import MediaGallery from 'shared/components/media-gallery'
import LottiePreview from 'shared/components/media-gallery/lottie-preview'
import useModal from 'shared/hooks/useModal'
import CommonInput from 'shared/components/common-input'
import ImageDimensionNote from 'shared/components/image-dimension-note'

function normalizeArticleMediaType(value, fallback = 'i') {
  if (value === 'v' || value === 'video') return 'v'
  if (value === 'i' || value === 'image') return 'i'

  return fallback
}

function FeaturedImage({
  register,
  setValue,
  onDelete,
  articleData,
  disabled,
  errors,
  clearErrors,
  required = false,
  requireMediaSelection = false,
  control,
  title,
  fixedMediaType = ''
}) {
  const [mediaPreview, setMediaPreview] = useState('')
  const { isShowing: isMediaGalleryShowing, toggle: toggleMediaGallery } = useModal()
  const { isShowing: isThumbnailGalleryShowing, toggle: toggleThumbnailGallery } = useModal()
  const intl = useIntl()
  const watchedMediaUrl = useWatch({ control, name: 'oImg.sUrl' })
  const watchedFormMediaUrl = useWatch({ control, name: 'sMediaUrl' })
  const watchedMediaType = useWatch({ control, name: 'eMediaType' })
  const watchedThumbnailUrl = useWatch({ control, name: 'sThumbnailUrl' })
  const currentMediaUrl = watchedMediaUrl ?? articleData?.oImg?.sUrl ?? articleData?.sMediaUrl ?? ''
  const currentMediaType = fixedMediaType || normalizeArticleMediaType(watchedMediaType || articleData?.eMediaType, fixedMediaType || 'i')
  const previousMediaTypeRef = useRef(currentMediaType)
  const currentThumbnailUrl = watchedThumbnailUrl ?? articleData?.sThumbnailUrl ?? ''
  const isVideo = currentMediaType === 'v'
  const isLottie = isVideo && getMediaKind(currentMediaUrl || mediaPreview) === 'lottie'
  const thumbnailPreview = currentThumbnailUrl ? getS3Url(currentThumbnailUrl) : ''
  const sectionTitle = title || intl.formatMessage({ id: isVideo ? 'featuredVideo' : 'featuredImage', defaultMessage: isVideo ? 'Featured Video' : 'Featured Image' })

  function deleteMedia() {
    setMediaPreview('')
    setValue('oImg.sUrl', '')
    setValue('oImg.sText', '')
    setValue('oImg.sCaption', '')
    setValue('oImg.sAttribute', '')
    setValue('sMediaUrl', '')
    setValue('sThumbnailUrl', '')
    clearErrors('oImg.sUrl')
    onDelete && onDelete('oImg')
  }

  function deleteThumbnail() {
    setValue('sThumbnailUrl', '')
    clearErrors('sThumbnailUrl')
  }

  useEffect(() => {
    const nextMediaUrl = currentMediaUrl || ''

    setMediaPreview(nextMediaUrl ? getS3Url(nextMediaUrl) : '')
    if ((watchedFormMediaUrl || '') !== nextMediaUrl) {
      setValue('sMediaUrl', nextMediaUrl, { shouldDirty: false, shouldValidate: false })
    }
  }, [currentMediaUrl, setValue, watchedFormMediaUrl])

  useEffect(() => {
    if (!fixedMediaType || watchedMediaType === fixedMediaType) return

    setValue('eMediaType', fixedMediaType, { shouldDirty: false, shouldValidate: false })
  }, [fixedMediaType, setValue, watchedMediaType])

  useEffect(() => {
    if (previousMediaTypeRef.current === currentMediaType) return

    deleteMedia()
    previousMediaTypeRef.current = currentMediaType
  }, [currentMediaType])

  useEffect(() => {
    const hasVideoInImageField = currentMediaType === 'i' && currentMediaUrl && isVideoGalleryMedia(currentMediaUrl)
    const hasThumbnailInImageMode = currentMediaType === 'i' && currentThumbnailUrl

    if (!hasVideoInImageField && !hasThumbnailInImageMode) return

    if (hasVideoInImageField) {
      setMediaPreview('')
      setValue('oImg.sUrl', '')
      setValue('oImg.sText', '')
      setValue('oImg.sCaption', '')
      setValue('oImg.sAttribute', '')
      setValue('sMediaUrl', '')
      clearErrors('oImg.sUrl')
      onDelete && onDelete('oImg')
    }

    setValue('sThumbnailUrl', '')
    clearErrors('sThumbnailUrl')
  }, [clearErrors, currentMediaType, currentMediaUrl, currentThumbnailUrl, onDelete, setValue])

  const handleMediaData = (data) => {
    const selectedUrl = data?.sUrl || ''

    setValue('oImg.sText', data?.sText || '')
    setValue('oImg.sCaption', data?.sCaption || '')
    setValue('oImg.sAttribute', data?.sAttribute || '')
    setValue('oImg.sUrl', selectedUrl)
    setValue('sMediaUrl', selectedUrl)
    setValue('eMediaType', isVideoGalleryMedia(selectedUrl) ? 'v' : 'i')
    clearErrors('oImg.sUrl')
    setMediaPreview(getS3Url(selectedUrl))
    toggleMediaGallery()
  }

  const handleThumbnailData = (data) => {
    const selectedUrl = data?.sUrl || ''
    setValue('sThumbnailUrl', selectedUrl)
    clearErrors('sThumbnailUrl')
    toggleThumbnailGallery()
  }

  return (
    <ArticleTab title={sectionTitle} event={1}>
      {!fixedMediaType && (
        <Form.Group className="mb-3">
          <Form.Label>Media Type</Form.Label>
          <Form.Select {...register('eMediaType')} disabled={disabled}>
            <option value="i">Image</option>
            <option value="v">Video</option>
          </Form.Select>
        </Form.Group>
      )}
      <ImageDimensionNote width={1096} height={600} subject="featured media" />
      <div className="f-image d-flex align-items-center justify-content-center">
        <input type="hidden" name="oImg.sUrl" {...register('oImg.sUrl', { required: requireMediaSelection || required ? validationErrors.required : false })} />
        {mediaPreview &&
          (isLottie ? (
            <LottiePreview src={mediaPreview} className="media-preview" />
          ) : isVideo ? (
            <video key={mediaPreview} controls playsInline preload="metadata" className="media-preview">
              <source src={mediaPreview} />
            </video>
          ) : (
            <img src={mediaPreview} alt="Featured Media" className="media-preview" />
          ))}
        {!mediaPreview && (
          <div>
            <Button size="sm" variant="primary" disabled={disabled} onClick={() => toggleMediaGallery()}>
              <FormattedMessage id={isVideo ? 'videoGallery' : 'mediaGallery'} defaultMessage={isVideo ? 'Video Gallery' : 'Media Gallery'} />
            </Button>
          </div>
        )}
        <MediaGallery
          galleryType="kcdfi"
          show={isMediaGalleryShowing}
          overRidePermission
          handleHide={toggleMediaGallery}
          handleData={handleMediaData}
          mediaType={currentMediaType === 'v' ? 'video' : 'image'}
        />
      </div>
      {mediaPreview && (
        <div className="change-img-btn">
          <Button variant="outline-secondary" disabled={disabled} size="sm" onClick={deleteMedia}>
            <FormattedMessage id={isVideo ? 'delete' : 'deleteImage'} defaultMessage={isVideo ? 'Delete' : 'Delete Image'} />
          </Button>
          <label className={`btn btn-outline-secondary btn-sm ${disabled ? 'disabled' : ''}`} onClick={() => toggleMediaGallery()}>
            <FormattedMessage id={isVideo ? 'replaceVideo' : 'replaceImage'} defaultMessage={isVideo ? 'Replace Video' : 'Replace Image'} />
          </label>
        </div>
      )}
      {errors?.oImg?.sUrl && <Form.Control.Feedback type="invalid">{errors?.oImg?.sUrl.message}</Form.Control.Feedback>}

      {isVideo && (
        <Form.Group className="mt-3">
          <Form.Label>Video Thumbnail</Form.Label>
          <input type="hidden" name="sThumbnailUrl" {...register('sThumbnailUrl')} />
          <div className="d-flex gap-2">
            <Button size="sm" variant="outline-primary" disabled={disabled} onClick={() => toggleThumbnailGallery()}>
              {thumbnailPreview ? 'Change Thumbnail' : 'Upload/Select Thumbnail'}
            </Button>
            {thumbnailPreview && (
              <Button size="sm" variant="outline-secondary" disabled={disabled} onClick={deleteThumbnail}>
                Remove
              </Button>
            )}
          </div>
          {thumbnailPreview && (
            <img
              className="w-100 mt-3 rounded"
              src={thumbnailPreview}
              alt="Video thumbnail preview"
              style={{ maxHeight: '240px', objectFit: 'cover' }}
            />
          )}
          {errors?.sThumbnailUrl && <Form.Control.Feedback type="invalid">{errors?.sThumbnailUrl.message}</Form.Control.Feedback>}
          <MediaGallery
            galleryType="kcdfi"
            show={isThumbnailGalleryShowing}
            overRidePermission
            handleHide={toggleThumbnailGallery}
            handleData={handleThumbnailData}
            mediaType="image"
          />
        </Form.Group>
      )}

      <CommonInput
        type="text"
        register={register}
        errors={errors}
        className={`form-control ${errors?.oImg?.sText && 'error'}`}
        name="oImg.sText"
        label="altText"
        disabled={disabled}
        required={required}
      />
      <CommonInput
        type="textarea"
        register={register}
        errors={errors}
        className={`form-control ${errors?.oImg?.sCaption && 'error'}`}
        name="oImg.sCaption"
        label="caption"
        disabled={disabled}
      />
    </ArticleTab>
  )
}

FeaturedImage.propTypes = {
  register: PropTypes.func,
  setValue: PropTypes.func,
  onDelete: PropTypes.func,
  articleData: PropTypes.object,
  errors: PropTypes.object,
  disabled: PropTypes.bool,
  clearErrors: PropTypes.func,
  required: PropTypes.bool,
  requireMediaSelection: PropTypes.bool,
  control: PropTypes.object,
  title: PropTypes.string,
  fixedMediaType: PropTypes.oneOf(['', 'i', 'v'])
}

export default FeaturedImage
