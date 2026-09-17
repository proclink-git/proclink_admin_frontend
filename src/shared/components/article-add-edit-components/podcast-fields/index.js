import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { useFormContext, useWatch } from 'react-hook-form'

import CommonInput from 'shared/components/common-input'
import DurationLabelInput from 'shared/components/duration-label-input'
import MediaGallery from 'shared/components/media-gallery'
import { ONLY_NUMBER, YOUTUBE_URL_REG_EX } from 'shared/constants'
import { validationErrors } from 'shared/constants/ValidationErrors'
import useModal from 'shared/hooks/useModal'
import { convertToEmbed, formatVideoDurationLabel, getNestedObject, getS3Url, isVideoMedia } from 'shared/utils'

export function getPodcastPlatformType() {
  return { ePlatform: '', sLink: '' }
}

function getVideoDurationLabel(videoUrl = '') {
  return new Promise((resolve) => {
    const video = document.createElement('video')

    video.preload = 'metadata'
    video.src = getS3Url(videoUrl)
    video.onloadedmetadata = () => resolve(formatVideoDurationLabel(video.duration))
    video.onerror = () => resolve('')
  })
}

const DEFAULT_FIELD_NAMES = {
  episodeNumber: 'oPodcast.nEpisodeNumber',
  link: 'oPodcast.sLink',
  durationLabel: 'oPodcast.sDurationLabel',
  thumbnail: 'sThumbnailUrl'
}

export default function PodcastFields({
  disabled = false,
  videoSource = 'url',
  onVideoSourceChange,
  showEpisodeNumber = true,
  fieldNames = {},
  urlThumbnailLabel = 'YouTube Thumbnail'
}) {
  const {
    register,
    formState: { errors },
    control,
    clearErrors,
    setValue
  } = useFormContext()
  const names = { ...DEFAULT_FIELD_NAMES, ...fieldNames }
  const videoUrl = useWatch({ control, name: names.link }) || ''
  const galleryVideoUrl = useWatch({ control, name: 'sMediaUrl' }) || ''
  const durationLabel = useWatch({ control, name: names.durationLabel }) || ''
  const thumbnailUrl = useWatch({ control, name: names.thumbnail }) || ''
  const thumbnailPreview = thumbnailUrl ? getS3Url(thumbnailUrl) : ''
  const { isShowing: isThumbnailGalleryShowing, toggle: toggleThumbnailGallery } = useModal()
  const previousGalleryVideoUrl = useRef(galleryVideoUrl)
  const isGalleryVideoInitialized = useRef(false)

  useEffect(() => {
    if (videoSource !== 'gallery') {
      previousGalleryVideoUrl.current = ''
      isGalleryVideoInitialized.current = false
      return
    }

    if (!isGalleryVideoInitialized.current) {
      previousGalleryVideoUrl.current = galleryVideoUrl
      isGalleryVideoInitialized.current = true
      return
    }

    if (previousGalleryVideoUrl.current !== galleryVideoUrl) {
      setValue(names.durationLabel, '', { shouldDirty: false, shouldValidate: false })
    }

    previousGalleryVideoUrl.current = galleryVideoUrl
  }, [galleryVideoUrl, names.durationLabel, setValue, videoSource])

  useEffect(() => {
    if (videoSource !== 'gallery' || durationLabel || !galleryVideoUrl || !isVideoMedia(galleryVideoUrl)) return

    let isCurrent = true

    getVideoDurationLabel(galleryVideoUrl).then((label) => {
      if (!isCurrent || !label) return

      setValue(names.durationLabel, label, { shouldDirty: false, shouldValidate: false })
      clearErrors(names.durationLabel)
    })

    return () => {
      isCurrent = false
    }
  }, [clearErrors, durationLabel, galleryVideoUrl, names.durationLabel, setValue, videoSource])

  const handleThumbnailData = (data) => {
    const selectedUrl = data?.sUrl || ''

    setValue(names.thumbnail, selectedUrl)
    clearErrors(names.thumbnail)
    toggleThumbnailGallery()
  }

  const handleDeleteThumbnail = () => {
    setValue(names.thumbnail, '')
    clearErrors(names.thumbnail)
  }

  const episodeNumberError = getNestedObject(errors, names.episodeNumber)
  const linkError = getNestedObject(errors, names.link)
  const durationLabelError = getNestedObject(errors, names.durationLabel)
  const thumbnailError = getNestedObject(errors, names.thumbnail)

  return (
    <>
      {showEpisodeNumber && (
        <CommonInput
          type="text"
          register={register}
          errors={errors}
          className={episodeNumberError && 'error'}
          name={names.episodeNumber}
          label="Episode Number"
          validation={{ pattern: { value: ONLY_NUMBER, message: validationErrors.number } }}
          disabled={disabled}
        />
      )}
      <Form.Group className="form-group">
        <Form.Label>Featured Video Source</Form.Label>
        <Form.Select value={videoSource} onChange={(e) => onVideoSourceChange?.(e.target.value)} disabled={disabled}>
          <option value="url">YouTube URL</option>
          <option value="gallery">Media Gallery Video</option>
        </Form.Select>
      </Form.Group>

      {videoSource === 'gallery' && (
        <>
          <Form.Text className="d-block mb-3 text-muted">Choose a video from the Featured Video section below.</Form.Text>
          <DurationLabelInput
            register={register}
            errors={errors}
            setValue={setValue}
            className={durationLabelError && 'error'}
            name={names.durationLabel}
            disabled={disabled}
          />
        </>
      )}

      {videoSource === 'url' && (
        <>
          <CommonInput
            type="text"
            register={register}
            errors={errors}
            className={linkError && 'error'}
            name={names.link}
            label="YouTube URL"
            validation={{ pattern: { value: YOUTUBE_URL_REG_EX, message: validationErrors.youtubeURL } }}
            onBlur={(e) => {
              e.target.value = convertToEmbed(e?.target?.value)
            }}
            required={videoSource === 'url'}
            disabled={disabled}
          />
          {videoUrl && (
            <div
              className="mb-3 overflow-hidden rounded"
              style={{
                backgroundColor: 'var(--secondary-700)',
                borderRadius: '8px',
                minHeight: '260px'
              }}
            >
              <iframe
                title="Featured video preview"
                src={videoUrl}
                className="w-100"
                style={{ minHeight: '260px', border: 0, display: 'block' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                autoPlay={false}
                allowFullScreen
              />
            </div>
          )}
          <Form.Group className="mb-3">
            <Form.Label>{urlThumbnailLabel}</Form.Label>
            <input type="hidden" name={names.thumbnail} {...register(names.thumbnail)} />
            <div className="d-flex gap-2">
              <Button size="sm" variant="outline-primary" disabled={disabled} onClick={() => toggleThumbnailGallery()}>
                {thumbnailPreview ? 'Change Thumbnail' : 'Upload/Select Thumbnail'}
              </Button>
              {thumbnailPreview && (
                <Button size="sm" variant="outline-secondary" disabled={disabled} onClick={handleDeleteThumbnail}>
                  Remove
                </Button>
              )}
            </div>
            {thumbnailPreview && (
              <img
                className="w-100 mt-3 rounded"
                src={thumbnailPreview}
                alt="YouTube thumbnail preview"
                style={{ maxHeight: '240px', objectFit: 'cover' }}
              />
            )}
            {thumbnailError && <Form.Control.Feedback type="invalid">{thumbnailError.message}</Form.Control.Feedback>}
            <MediaGallery
              galleryType="kcdfi"
              show={isThumbnailGalleryShowing}
              overRidePermission
              handleHide={toggleThumbnailGallery}
              handleData={handleThumbnailData}
              mediaType="image"
            />
          </Form.Group>
        </>
      )}
    </>
  )
}

PodcastFields.propTypes = {
  disabled: PropTypes.bool,
  videoSource: PropTypes.oneOf(['url', 'gallery']),
  onVideoSourceChange: PropTypes.func,
  showEpisodeNumber: PropTypes.bool,
  fieldNames: PropTypes.shape({
    episodeNumber: PropTypes.string,
    link: PropTypes.string,
    durationLabel: PropTypes.string,
    thumbnail: PropTypes.string
  }),
  urlThumbnailLabel: PropTypes.string
}
