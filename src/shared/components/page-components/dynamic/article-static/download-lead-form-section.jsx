import React, { useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFormContext } from 'react-hook-form'

import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import CategoryPlayerTeamTab from 'shared/components/category-player-team-tab'
import DurationLabelInput from 'shared/components/duration-label-input'
import MediaGallery from 'shared/components/media-gallery'
import useModal from 'shared/hooks/useModal'
import { getNestedObject, getS3Url } from 'shared/utils'
import { URL_REGEX } from 'shared/constants'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { DLF_FORM_TYPE, DLF_VIDEO_SOURCE, getDlfVideoSource } from './download-lead-form.utils'

function getFileName(url = '') {
  const fileName = String(url || '')
    .split('?')[0]
    .split('#')[0]
    .split('/')
    .pop()

  if (!fileName) return 'Selected document'

  try {
    return decodeURIComponent(fileName)
  } catch (error) {
    return fileName
  }
}

function getFileExtension(url = '') {
  return getFileName(url).split('.').pop()?.toUpperCase() || 'PDF'
}

const FORM_PURPOSE_OPTIONS = [
  {
    value: DLF_FORM_TYPE.WEBINAR_REGISTER,
    label: 'Webinar Register — Registration Form'
  },
  {
    value: DLF_FORM_TYPE.WEBINAR_RECORDING,
    label: 'Webinar Recording — Post-Event Recording Access'
  }
]

const VIDEO_SOURCE_OPTIONS = [
  {
    value: '',
    label: 'Select Video Source'
  },
  {
    value: DLF_VIDEO_SOURCE.EXTERNAL,
    label: 'YouTube / External Video'
  },
  {
    value: DLF_VIDEO_SOURCE.UPLOAD,
    label: 'Upload Video'
  }
]

function DlfMediaPicker({
  title,
  fieldName,
  register,
  registerOptions,
  previewUrl,
  mediaType = 'image',
  mediaAlt,
  error,
  galleryShowing,
  toggleGallery,
  handleData,
  onRemove
}) {
  const isVideo = mediaType === 'video'
  const galleryButtonLabel = isVideo ? 'Video Gallery' : 'Media Gallery'
  const replaceButtonLabel = isVideo ? 'Replace Video' : 'Replace Image'
  const deleteButtonLabel = isVideo ? 'Delete' : 'Delete Image'

  return (
    <CategoryPlayerTeamTab title={title} event={1}>
      <div className="f-image d-flex align-items-center justify-content-center">
        <input type="hidden" {...register(fieldName, registerOptions)} />
        {previewUrl &&
          (isVideo ? (
            <video key={previewUrl} controls playsInline preload="metadata" className="media-preview">
              <source src={previewUrl} />
            </video>
          ) : (
            <img src={previewUrl} alt={mediaAlt || title} className="media-preview" />
          ))}
        {!previewUrl && (
          <div>
            <Button size="sm" variant="primary" onClick={toggleGallery}>
              {galleryButtonLabel}
            </Button>
          </div>
        )}
        <MediaGallery
          galleryType="kcdfi"
          show={galleryShowing}
          overRidePermission
          handleHide={toggleGallery}
          handleData={handleData}
          mediaType={mediaType}
        />
      </div>
      {previewUrl && (
        <div className="change-img-btn">
          <Button variant="outline-secondary" size="sm" onClick={onRemove}>
            {deleteButtonLabel}
          </Button>
          <label className="btn btn-outline-secondary btn-sm" onClick={toggleGallery}>
            {replaceButtonLabel}
          </label>
        </div>
      )}
      {error?.message && <Form.Control.Feedback type="invalid">{error.message}</Form.Control.Feedback>}
    </CategoryPlayerTeamTab>
  )
}

DlfMediaPicker.propTypes = {
  title: PropTypes.string.isRequired,
  fieldName: PropTypes.string.isRequired,
  register: PropTypes.func.isRequired,
  registerOptions: PropTypes.object,
  previewUrl: PropTypes.string,
  mediaType: PropTypes.oneOf(['image', 'video']),
  mediaAlt: PropTypes.string,
  error: PropTypes.shape({
    message: PropTypes.string
  }),
  galleryShowing: PropTypes.bool,
  toggleGallery: PropTypes.func.isRequired,
  handleData: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired
}

export default function DownloadLeadFormSection({
  basePath = 'oDLF',
  sectionLabel = 'Download Lead Form',
  formType = '',
  hideFormPurpose = false,
  linkedFormTypeName = '',
  durationLabelName = ''
}) {
  const {
    register,
    setValue,
    watch,
    clearErrors,
    formState: { errors }
  } = useFormContext()

  const values = watch(basePath) || {}
  const ctaUrl = watch(`${basePath}.oCta.sUrl`)
  const selectedPdfUrl = ctaUrl ? getS3Url(ctaUrl) : ''
  const selectedPdfName = getFileName(ctaUrl)
  const selectedPdfExtension = getFileExtension(ctaUrl)
  const linkedFormType = linkedFormTypeName ? watch(linkedFormTypeName) : ''
  const currentFormType = linkedFormType || values?.eFormType || ''
  const isWebinarForm = formType === DLF_FORM_TYPE.WEBINAR_REGISTER
  const showMediaFields = currentFormType === DLF_FORM_TYPE.WEBINAR_RECORDING
  const isWebinarDownloadLeadForm =
    isWebinarForm ||
    currentFormType === DLF_FORM_TYPE.WEBINAR_REGISTER ||
    currentFormType === DLF_FORM_TYPE.WEBINAR_RECORDING
  const showPdfField = !isWebinarDownloadLeadForm
  const videoSource = getDlfVideoSource(values)
  const mediaUrl = values?.sMediaUrl || ''
  const thumbnailUrl = values?.sThumbnailUrl || ''
  const mediaPreviewUrl = mediaUrl ? getS3Url(mediaUrl) : ''
  const thumbnailPreviewUrl = thumbnailUrl ? getS3Url(thumbnailUrl) : ''
  const thumbnailError = getNestedObject(errors, `${basePath}.sThumbnailUrl`)
  const videoSourceError = getNestedObject(errors, `${basePath}.videoSource`)
  const durationLabelError = durationLabelName ? getNestedObject(errors, durationLabelName) : undefined
  const { isShowing: isDocumentGalleryShowing, toggle: toggleDocumentGallery } = useModal()
  const { isShowing: isThumbnailGalleryShowing, toggle: toggleThumbnailGallery } = useModal()
  const { isShowing: isMediaGalleryShowing, toggle: toggleMediaGallery } = useModal()

  const clearRecordingMediaFields = useCallback((options = { shouldDirty: true, shouldValidate: true }) => {
    setValue(`${basePath}.sThumbnailUrl`, '', options)
    setValue(`${basePath}.sMediaUrl`, '', options)
    setValue(`${basePath}.eMediaType`, '', { ...options, shouldValidate: false })
    setValue(`${basePath}.sLink`, '', options)
    setValue(`${basePath}.videoSource`, '', options)
    clearErrors([`${basePath}.sThumbnailUrl`, `${basePath}.videoSource`, `${basePath}.sMediaUrl`, `${basePath}.sLink`])
  }, [basePath, clearErrors, setValue])

  useEffect(() => {
    if (!formType) return

    if (isWebinarForm) {
      if (![DLF_FORM_TYPE.WEBINAR_REGISTER, DLF_FORM_TYPE.WEBINAR_RECORDING].includes(currentFormType)) {
        setValue(`${basePath}.eFormType`, DLF_FORM_TYPE.WEBINAR_REGISTER, { shouldDirty: false, shouldValidate: false })
      }
      return
    }

    if (currentFormType !== formType) {
      setValue(`${basePath}.eFormType`, formType, { shouldDirty: false, shouldValidate: false })
    }
  }, [basePath, currentFormType, formType, isWebinarForm, setValue])

  useEffect(() => {
    if (!linkedFormTypeName || !currentFormType || values?.eFormType === currentFormType) return

    setValue(`${basePath}.eFormType`, currentFormType, { shouldDirty: false, shouldValidate: false })
  }, [basePath, currentFormType, linkedFormTypeName, setValue, values?.eFormType])

  useEffect(() => {
    if (!isWebinarDownloadLeadForm || !ctaUrl) return

    setValue(`${basePath}.oCta.sUrl`, '', { shouldDirty: false, shouldValidate: false })
  }, [basePath, ctaUrl, isWebinarDownloadLeadForm, setValue])

  useEffect(() => {
    if (!isWebinarDownloadLeadForm || showMediaFields) return
    if (!values?.sThumbnailUrl && !values?.sMediaUrl && !values?.eMediaType && !values?.sLink && !values?.videoSource) return

    clearRecordingMediaFields({ shouldDirty: false, shouldValidate: false })
  }, [
    clearRecordingMediaFields,
    isWebinarDownloadLeadForm,
    showMediaFields,
    values?.eMediaType,
    values?.sLink,
    values?.sMediaUrl,
    values?.sThumbnailUrl,
    values?.videoSource
  ])

  useEffect(() => {
    if (!showMediaFields || values?.videoSource || !videoSource) return

    setValue(`${basePath}.videoSource`, videoSource, { shouldDirty: false, shouldValidate: false })
  }, [basePath, setValue, showMediaFields, values?.videoSource, videoSource])

  function handleRemoveCtaUrl() {
    setValue(`${basePath}.oCta.sUrl`, '')
  }

  function handlePdfData(data) {
    setValue(`${basePath}.oCta.sUrl`, data?.sUrl || '')
    clearErrors(`${basePath}.oCta.sUrl`)
    toggleDocumentGallery()
  }

  function handleFormTypeChange(event) {
    const nextFormType = event.target.value

    setValue(`${basePath}.eFormType`, nextFormType, { shouldDirty: true, shouldValidate: true })
    if (nextFormType !== DLF_FORM_TYPE.WEBINAR_RECORDING) clearRecordingMediaFields()
    clearErrors([`${basePath}.sThumbnailUrl`, `${basePath}.videoSource`])
  }

  function handleVideoSourceChange(event) {
    const nextVideoSource = event.target.value

    setValue(`${basePath}.videoSource`, nextVideoSource, { shouldDirty: true, shouldValidate: true })

    if (nextVideoSource === DLF_VIDEO_SOURCE.EXTERNAL) {
      setValue(`${basePath}.sMediaUrl`, '', { shouldDirty: true, shouldValidate: true })
      setValue(`${basePath}.eMediaType`, '', { shouldDirty: true, shouldValidate: false })
      if (durationLabelName) {
        setValue(durationLabelName, '', { shouldDirty: true, shouldValidate: false })
        clearErrors(durationLabelName)
      }
    } else if (nextVideoSource === DLF_VIDEO_SOURCE.UPLOAD) {
      setValue(`${basePath}.sLink`, '', { shouldDirty: true, shouldValidate: true })
      if (durationLabelName) {
        setValue(durationLabelName, '', { shouldDirty: true, shouldValidate: false })
        clearErrors(durationLabelName)
      }
    } else {
      setValue(`${basePath}.sLink`, '', { shouldDirty: true, shouldValidate: true })
      setValue(`${basePath}.sMediaUrl`, '', { shouldDirty: true, shouldValidate: true })
      setValue(`${basePath}.eMediaType`, '', { shouldDirty: true, shouldValidate: false })
      if (durationLabelName) {
        setValue(durationLabelName, '', { shouldDirty: true, shouldValidate: false })
        clearErrors(durationLabelName)
      }
    }

    clearErrors(`${basePath}.videoSource`)
  }

  function handleThumbnailData(data) {
    setValue(`${basePath}.sThumbnailUrl`, data?.sUrl || '', { shouldDirty: true, shouldValidate: true })
    clearErrors(`${basePath}.sThumbnailUrl`)
    toggleThumbnailGallery()
  }

  function handleRemoveThumbnail() {
    setValue(`${basePath}.sThumbnailUrl`, '', { shouldDirty: true, shouldValidate: true })
  }

  function handleMediaData(data) {
    const nextMediaUrl = data?.sUrl || ''

    setValue(`${basePath}.sMediaUrl`, nextMediaUrl, { shouldDirty: true, shouldValidate: true })
    setValue(`${basePath}.eMediaType`, nextMediaUrl ? 'v' : '', { shouldDirty: true, shouldValidate: false })
    clearErrors(`${basePath}.sMediaUrl`)
    clearErrors(`${basePath}.videoSource`)
    toggleMediaGallery()
  }

  function handleRemoveMedia() {
    setValue(`${basePath}.sMediaUrl`, '', { shouldDirty: true, shouldValidate: true })
    setValue(`${basePath}.eMediaType`, '', { shouldDirty: true, shouldValidate: false })
  }

  function validateVideoSource(value) {
    if (!showMediaFields) return true
    if (value === DLF_VIDEO_SOURCE.EXTERNAL && String(values?.sLink || '').trim()) return true
    if (value === DLF_VIDEO_SOURCE.UPLOAD && String(values?.sMediaUrl || '').trim()) return true
    if (!value) return 'Select a video source'
    return value === DLF_VIDEO_SOURCE.EXTERNAL ? 'External video URL is required' : 'Video file is required'
  }

  return (
    <div className="p-3">
      <input type="hidden" {...register(`${basePath}.eFormType`)} />
      <Form.Label className="text-uppercase small text-muted mb-3">{sectionLabel}</Form.Label>

      {isWebinarForm && !hideFormPurpose && (
        <Form.Group className="form-group">
          <Form.Label>Form purpose</Form.Label>
          <Form.Select value={currentFormType || DLF_FORM_TYPE.WEBINAR_REGISTER} onChange={handleFormTypeChange}>
            {FORM_PURPOSE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      )}

      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <CountInput textarea rows={6} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description" />

      {showMediaFields && (
        <>
          <Form.Label className="text-uppercase small text-muted mb-2">Recording Media</Form.Label>
          <Row className="mb-3">
            <Col lg="6" className="add-article">
              <DlfMediaPicker
                title="Thumbnail"
                fieldName={`${basePath}.sThumbnailUrl`}
                register={register}
                previewUrl={thumbnailPreviewUrl}
                mediaType="image"
                mediaAlt="Webinar recording thumbnail"
                error={thumbnailError}
                galleryShowing={isThumbnailGalleryShowing}
                toggleGallery={toggleThumbnailGallery}
                handleData={handleThumbnailData}
                onRemove={handleRemoveThumbnail}
              />
            </Col>
            <Col lg="6" className="add-article">
              <Form.Group className="form-group">
                <Form.Label>Video source*</Form.Label>
                <input type="hidden" {...register(`${basePath}.videoSource`, { validate: validateVideoSource })} />
                <input type="hidden" {...register(`${basePath}.eMediaType`)} />
                <Form.Select value={videoSource} onChange={handleVideoSourceChange} isInvalid={Boolean(videoSourceError?.message && !videoSource)}>
                  {VIDEO_SOURCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
                {videoSourceError?.message && !videoSource && <Form.Control.Feedback type="invalid">{videoSourceError.message}</Form.Control.Feedback>}
              </Form.Group>

              {videoSource === DLF_VIDEO_SOURCE.EXTERNAL && (
                <CommonInput
                  type="text"
                  register={register}
                  errors={errors}
                  name={`${basePath}.sLink`}
                  label="YouTube / External video URL*"
                  placeholder="https://www.youtube.com/watch?v=..."
                  validation={{ pattern: { value: URL_REGEX, message: validationErrors.url } }}
                  onChange={() => clearErrors(`${basePath}.videoSource`)}
                  disableDefaultMaxLength
                >
                  {videoSourceError?.message && <Form.Control.Feedback type="invalid">{videoSourceError.message}</Form.Control.Feedback>}
                </CommonInput>
              )}

              {videoSource === DLF_VIDEO_SOURCE.UPLOAD && (
                <DlfMediaPicker
                  title="Video File*"
                  fieldName={`${basePath}.sMediaUrl`}
                  register={register}
                  previewUrl={mediaPreviewUrl}
                  mediaType="video"
                  mediaAlt="Webinar recording video"
                  error={videoSourceError}
                  galleryShowing={isMediaGalleryShowing}
                  toggleGallery={toggleMediaGallery}
                  handleData={handleMediaData}
                  onRemove={handleRemoveMedia}
                />
              )}
              {videoSource === DLF_VIDEO_SOURCE.UPLOAD && durationLabelName && (
                <DurationLabelInput
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  className={durationLabelError && 'error'}
                  name={durationLabelName}
                  required
                />
              )}
            </Col>
          </Row>
        </>
      )}

      <Form.Label className="text-uppercase small text-muted mb-2">CTA</Form.Label>
      <Row>
        <Col md="6">
          <CommonInput type="text" register={register} errors={errors} name={`${basePath}.oCta.sLabel`} label="Button Label" disableDefaultMaxLength />
        </Col>
        {/* <Col md="6">
          <CommonInput type="text" register={register} errors={errors} name={`${basePath}.oCta.sUrl`} label="Button Url" disableDefaultMaxLength />
        </Col> */}
      </Row>
      {showPdfField && (
        <Form.Group className="form-group">
          <Form.Label>PDF</Form.Label>
          {ctaUrl ? (
            <div className="media-sidebar-card media-sidebar-card--document mt-2">
              <div className="media-sidebar-card__preview">
                <div className="media-document-preview media-document-preview--sidebar">
                  <span className="media-document-preview__badge">{selectedPdfExtension}</span>
                </div>
              </div>
              <div className="media-sidebar-card__body">
                <span className="media-sidebar-card__meta text-uppercase">Selected download file</span>
                <span className="media-sidebar-card__title">{selectedPdfName}</span>
                <span className="media-sidebar-card__meta">This file will open from the Download Lead Form button.</span>
                <div className="media-sidebar-card__actions">
                  <a className="btn btn-primary btn-sm media-sidebar-card__primary-action" href={selectedPdfUrl} target="_blank" rel="noreferrer">
                    Open PDF
                  </a>
                  <Button type="button" variant="outline-secondary" size="sm" onClick={toggleDocumentGallery}>
                    Replace
                  </Button>
                  <Button type="button" variant="outline-danger" size="sm" onClick={handleRemoveCtaUrl}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 border rounded d-flex flex-wrap align-items-center justify-content-between gap-2">
              <div>
                <div className="fw-bold">No PDF selected</div>
                <div className="text-muted small">Choose or upload a PDF from the media gallery.</div>
              </div>
              <Button type="button" size="sm" variant="primary" onClick={toggleDocumentGallery}>
                Upload/Select PDF
              </Button>
            </div>
          )}
          <MediaGallery
            show={isDocumentGalleryShowing}
            overRidePermission
            handleHide={toggleDocumentGallery}
            handleData={handlePdfData}
            mediaType="document"
          />
        </Form.Group>
      )}
      <CountInput textarea rows={4} currentLength={values?.sFooterNote?.length} register={register(`${basePath}.sFooterNote`)} error={errors} name={`${basePath}.sFooterNote`} label="Footer Note" />
    </div>
  )
}

DownloadLeadFormSection.propTypes = {
  basePath: PropTypes.string,
  sectionLabel: PropTypes.string,
  formType: PropTypes.string,
  hideFormPurpose: PropTypes.bool,
  linkedFormTypeName: PropTypes.string,
  durationLabelName: PropTypes.string
}
