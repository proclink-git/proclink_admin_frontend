import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import { useFormContext } from 'react-hook-form'

import CategoryPlayerTeamTab from '../category-player-team-tab'
import MediaGallery from 'shared/components/media-gallery'
import useModal from 'shared/hooks/useModal'
import CommonInput from '../common-input'
import LottiePreview from 'shared/components/media-gallery/lottie-preview'
import { getMediaKind, getNestedObject, getS3Url } from 'shared/utils'
import { validationErrors } from 'shared/constants/ValidationErrors'

function CategoryPlayerTeamImage({
  name,
  register,
  setValue,
  onDelete,
  values,
  errors,
  hideCaption = false,
  hideAttribution = false,
  required = false,
  clearErrors,
  title,
  galleryType,
  mediaType = 'image',
  hideText = false,
  urlFieldName
}) {
  const [image, setImage] = useState()
  const formContext = useFormContext()
  const watchedSUrl = formContext?.watch?.(`${name}.sUrl`)
  const watchedFSUrl = formContext?.watch?.(`${name}.fSUrl`)
  const { isShowing, toggle } = useModal()
  const isVideo = mediaType === 'video'
  const isLottie = isVideo && getMediaKind(image) === 'lottie'

  useEffect(() => {
    const fieldValue = getNestedObject(values, name) || {}
    const sUrl = watchedSUrl !== undefined ? watchedSUrl : fieldValue.sUrl
    const fSUrl = watchedFSUrl !== undefined ? watchedFSUrl : fieldValue.fSUrl

    if (sUrl && !fSUrl?.length) {
      setImage(getS3Url(sUrl))
      return
    }

    setImage('')
  }, [name, values, watchedFSUrl, watchedSUrl])

  function deleteImg() {
    setImage('')
    setValue(`${name}.sUrl`, '')
    setValue(`${name}.sText`, '')
    setValue(`${name}.sCaption`, '')
    setValue(`${name}.sAttribute`, '')
    if (urlFieldName) setValue(urlFieldName, '')
    clearErrors && clearErrors(`${name}`)
    onDelete && onDelete(name)
  }

  const handleData = (data) => {
    const selectedUrl = data?.sUrl || ''

    setValue(`${name}.sText`, data?.sText)
    setValue(`${name}.sCaption`, data?.sCaption)
    setValue(`${name}.sAttribute`, data?.sAttribute)
    setValue(`${name}.sUrl`, selectedUrl)
    if (urlFieldName) setValue(urlFieldName, selectedUrl)
    setImage(getS3Url(selectedUrl))
    clearErrors && clearErrors(`${name}`)
    toggle()
  }
  const err = getNestedObject(errors, name)

  return (
    <>
      <CategoryPlayerTeamTab
        title={title || useIntl().formatMessage({ id: isVideo ? 'featuredVideo' : 'featuredImage', defaultMessage: isVideo ? 'Featured Video' : 'Featured Image' })}
        event={1}
      >
        <div className="f-image d-flex align-items-center justify-content-center">
          <input type="hidden" {...register(`${name}.sUrl`, { required: required ? validationErrors.required : false })} />
          {image &&
            (isLottie ? (
              <LottiePreview src={image} className="media-preview" />
            ) : isVideo ? (
              <video key={image} controls playsInline preload="metadata" className="media-preview">
                <source src={image} />
              </video>
            ) : (
              <img src={image} alt="Featured Image" className="media-preview" />
            ))}
          {!image && (
            <div>
              {/* <label htmlFor="featureImg">
                <i className="icon-upload" />
                <FormattedMessage id="uploadImage" />
              </label> */}
              {/* FOR PHASE 2 */}
              {/* <span className="or d-block">
                <FormattedMessage id="or" />
              </span> */}
              <Button size="sm" variant="primary" onClick={() => toggle()}>
                <FormattedMessage id={isVideo ? 'videoGallery' : 'mediaGallery'} defaultMessage={isVideo ? 'Video Gallery' : 'Media Gallery'} />
              </Button>
            </div>
          )}
          <MediaGallery show={isShowing} overRidePermission handleHide={toggle} handleData={handleData} galleryType={galleryType} mediaType={mediaType} />
        </div>
        {image && (
          <div className="change-img-btn">
            <Button variant="outline-secondary" size="sm" onClick={deleteImg}>
              <FormattedMessage id="delete" />
            </Button>
            {/* FOR PHASE 2 */}
            {/* <Button variant="outline-secondary" size="sm">
              <FormattedMessage id="photoEditor" />
            </Button>
            <Button variant="outline-secondary" size="sm">
              <FormattedMessage id="clearFocusPoint" />
            </Button> */}
            <label className="btn btn-outline-secondary btn-sm" onClick={() => toggle()}>
              <FormattedMessage id={isVideo ? 'replaceVideo' : 'replaceImage'} defaultMessage={isVideo ? 'Replace Video' : 'Replace image'} />
            </label>
          </div>
        )}
        {err?.sUrl && <Form.Control.Feedback type="invalid">{err?.sUrl.message}</Form.Control.Feedback>}
        {!hideText && (
          <CommonInput
            type="text"
            register={register}
            errors={errors}
            className={`form-control ${err?.sText && 'error'}`}
            displayClass={hideCaption && hideAttribution ? 'mb-0' : ''}
            name={`${name}.sText`}
            label="altText"
            validation={{ maxLength: { value: 125, message: validationErrors.maxLength(125) } }}
          />
        )}
        {!hideCaption && (
          <CommonInput
            type="textarea"
            register={register}
            errors={errors}
            className={`form-control ${err?.sCaption && 'error'}`}
            name={`${name}.sCaption`}
            label="caption"
          />
        )}
      </CategoryPlayerTeamTab>
    </>
  )
}
CategoryPlayerTeamImage.propTypes = {
  name: PropTypes.string.isRequired,
  register: PropTypes.func,
  setValue: PropTypes.func,
  onDelete: PropTypes.func,
  values: PropTypes.object,
  errors: PropTypes.object,
  hideCaption: PropTypes.bool,
  hideAttribution: PropTypes.bool,
  required: PropTypes.bool,
  clearErrors: PropTypes.func,
  title: PropTypes.string,
  galleryType: PropTypes.string,
  mediaType: PropTypes.oneOf(['image', 'video']),
  hideText: PropTypes.bool,
  urlFieldName: PropTypes.string
}
export default CategoryPlayerTeamImage
