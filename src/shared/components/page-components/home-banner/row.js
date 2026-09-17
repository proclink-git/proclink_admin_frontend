import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CountInput from 'shared/components/count-input'
import CommonInput from 'shared/components/common-input'
import TitleFormatHint from 'shared/components/title-format-hint'
import { isVideoMedia } from 'shared/utils'
import ImageDimensionNote from 'shared/components/image-dimension-note'

export function getDefaultHeroCta() {
  return { sLabel: '', sUrl: '' }
}

export function getDefaultHomeBannerHero() {
  return {
    sMediaUrl: '',
    eMediaType: 'v',
    oVideo: {
      sUrl: '',
      sText: '',
      sCaption: '',
      sAttribute: ''
    },
    sEyebrow: '',
    sTitle: '',
    sDescription: '',
    aCta: [getDefaultHeroCta()]
  }
}

function normalizeHomeBannerCtas(aCta = [], fallbackCta) {
  const normalizedCtas = (Array.isArray(aCta) ? aCta : [])
    .map((item) => ({
      sLabel: item?.sLabel || '',
      sUrl: item?.sUrl || ''
    }))
    .filter((item) => item.sLabel || item.sUrl)
    .slice(0, 2)

  if (normalizedCtas.length) return normalizedCtas
  if (fallbackCta?.sLabel || fallbackCta?.sUrl) return [fallbackCta]

  return [getDefaultHeroCta()]
}

function normalizeHomeBannerTitle(hero = {}, component = {}) {
  if (hero?.sTitle) return hero.sTitle

  return [hero?.sHeadlinePrimary || component?.sTitle || '', hero?.sHeadlineSecondary || ''].filter(Boolean).join(' | ')
}

function normalizeBannerMediaType(value) {
  if (value === 'i' || value === 'image') return 'i'
  if (value === 'v' || value === 'video') return 'v'

  return 'v'
}

export function normalizeHomeBannerComponent(component = {}) {
  const hero = component?.oHPB || {}
  const primaryCta = component?.sButtonText || component?.sButtonLink ? { sLabel: component?.sButtonText || '', sUrl: component?.sButtonLink || '' } : getDefaultHeroCta()
  const defaultHero = getDefaultHomeBannerHero()
  const normalizedMediaUrl = hero?.oVideo?.sUrl || hero?.sMediaUrl || hero?.sVideoUrl || ''
  const normalizedMediaType = normalizeBannerMediaType(hero?.eMediaType)

  return {
    sDescription: hero?.sDescription || component?.sDescription || '',
    oHPB: {
      ...defaultHero,
      sMediaUrl: normalizedMediaUrl,
      eMediaType: normalizedMediaType,
      oVideo: {
        ...defaultHero.oVideo,
        ...(hero?.oVideo || {}),
        sUrl: normalizedMediaUrl
      },
      sEyebrow: hero?.sEyebrow || '',
      sTitle: normalizeHomeBannerTitle(hero, component),
      sDescription: hero?.sDescription || component?.sDescription || '',
      aCta: normalizeHomeBannerCtas(hero?.aCta, primaryCta)
    }
  }
}

export function buildHomeBannerPayload(data = {}) {
  const hero = data?.oComponentInput?.oHPB || getDefaultHomeBannerHero()
  const nextMediaUrl = hero?.oVideo?.sUrl || hero?.sMediaUrl || ''
  const nextHero = {
    sMediaUrl: nextMediaUrl,
    eMediaType: normalizeBannerMediaType(hero?.eMediaType),
    sEyebrow: hero?.sEyebrow || '',
    sTitle: hero?.sTitle || '',
    sDescription: hero?.sDescription || '',
    aCta: normalizeHomeBannerCtas(hero?.aCta).filter((item) => item?.sLabel || item?.sUrl)
  }

  return {
    eType: data?.eType,
    oComponentInput: {
      sDescription: nextHero.sDescription,
      oHPB: nextHero
    }
  }
}

export function HomeBannerRow({ basePath = 'oComponentInput.oHPB', registerTypeField = true, showCtaControls = true, showCtaSection = true, showEyebrow = true }) {
  const { eType } = useParams()
  const {
    register,
    control,
    watch,
    getValues,
    setValue,
    clearErrors,
    formState: { errors }
  } = useFormContext()

  const getFieldName = (name) => `${basePath}.${name}`
  const eyebrowFieldName = getFieldName('sEyebrow')
  const selectedMediaType = normalizeBannerMediaType(watch(getFieldName('eMediaType')))
  const selectedMediaUrl = watch(getFieldName('oVideo.sUrl')) || ''
  const currentMediaUrl = watch(getFieldName('sMediaUrl')) || ''
  const currentEyebrow = watch(eyebrowFieldName) || ''
  const previousMediaTypeRef = useRef(selectedMediaType)
  const previousShowEyebrowRef = useRef(showEyebrow)

  const { fields, append, remove } = useFieldArray({
    control,
    name: getFieldName('aCta')
  })
  const ctaFields = showCtaControls ? fields : Array.from({ length: Math.max(fields.length, 2) }, (_, index) => fields[index] || { id: `cta-${index}` })

  useEffect(() => {
    if (previousMediaTypeRef.current === selectedMediaType) return

    setValue(getFieldName('oVideo'), {
      sUrl: '',
      sText: '',
      sCaption: '',
      sAttribute: ''
    })
    setValue(getFieldName('sMediaUrl'), '')
    clearErrors(getFieldName('oVideo'))
    previousMediaTypeRef.current = selectedMediaType
  }, [clearErrors, selectedMediaType, setValue])

  useEffect(() => {
    const hasVideoInImageField = selectedMediaType === 'i' && selectedMediaUrl && isVideoMedia(selectedMediaUrl)
    const hasVideoInHiddenField = selectedMediaType === 'i' && currentMediaUrl && isVideoMedia(currentMediaUrl)

    if (!hasVideoInImageField && !hasVideoInHiddenField) return

    if (hasVideoInImageField) {
      setValue(getFieldName('oVideo'), {
        sUrl: '',
        sText: '',
        sCaption: '',
        sAttribute: ''
      })
    }
    setValue(getFieldName('sMediaUrl'), '')
    clearErrors(getFieldName('oVideo'))
  }, [clearErrors, currentMediaUrl, selectedMediaType, selectedMediaUrl, setValue])

  useEffect(() => {
    if (selectedMediaType === 'i' && selectedMediaUrl && isVideoMedia(selectedMediaUrl)) return
    if (selectedMediaUrl === currentMediaUrl) return

    setValue(getFieldName('sMediaUrl'), selectedMediaUrl)
  }, [currentMediaUrl, selectedMediaType, selectedMediaUrl, setValue])

  useEffect(() => {
    if (previousShowEyebrowRef.current && !showEyebrow) {
      setValue(eyebrowFieldName, '')
    }

    previousShowEyebrowRef.current = showEyebrow
  }, [eyebrowFieldName, setValue, showEyebrow])

  useEffect(() => {
    if (!showEyebrow || currentEyebrow) return

    const savedEyebrow = getValues(eyebrowFieldName) || ''
    if (!savedEyebrow) return

    setValue(eyebrowFieldName, savedEyebrow, { shouldDirty: false, shouldValidate: false })
  }, [basePath, currentEyebrow, eyebrowFieldName, getValues, setValue, showEyebrow])

  return (
    <Row className="g-4 align-items-start">
      {registerTypeField && <input type="hidden" {...register('eType')} value={eType} />}
      <Col xl="12">
        <div className="d-flex flex-column gap-3">
          <div>
            <Form.Label className="text-uppercase small text-muted mb-2">Hero Structure</Form.Label>
            {showEyebrow && (
              <CountInput
                type="text"
                register={register(eyebrowFieldName)}
                error={errors}
                name={eyebrowFieldName}
                label="Eyebrow"
              />
            )}
            <CountInput
              type="text"
              register={register(getFieldName('sTitle'))}
              error={errors}
              name={getFieldName('sTitle')}
              label="Title"
            />
            <TitleFormatHint subject="title" />
            <CountInput
              textarea
              register={register(getFieldName('sDescription'))}
              error={errors}
              name={getFieldName('sDescription')}
              label="Description"
            />
          </div>
          <ImageDimensionNote width={1920} height={1080} subject="hero banner media" />
          <div>
            <Form.Label className="text-uppercase small text-muted mb-2">Media</Form.Label>
            <Form.Group className="mb-3">
              <Form.Label>Media Type</Form.Label>
              <Form.Select {...register(getFieldName('eMediaType'))}>
                <option value="v">Video</option>
                <option value="i">Image</option>
              </Form.Select>
            </Form.Group>
            <div className="add-article">
              <CategoryPlayerTeamImage
                key={`${getFieldName('oVideo')}-${selectedMediaType}`}
                galleryType="hb"
                name={getFieldName('oVideo')}
                register={register}
                setValue={setValue}
                onDelete={() => setValue(getFieldName('sMediaUrl'), '')}
                urlFieldName={getFieldName('sMediaUrl')}
                values={getValues()}
                errors={errors}
                clearErrors={clearErrors}
                hideText
                hideCaption
                hideAttribution
                mediaType={selectedMediaType === 'i' ? 'image' : 'video'}
                title={selectedMediaType === 'i' ? 'Featured Image' : 'Featured Video'}
              />
            </div>
          </div>

          {showCtaSection && (
            <div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <Form.Label className="text-uppercase small text-muted mb-0">Call To Action</Form.Label>
                {showCtaControls && fields.length < 2 && (
                  <Button type="button" onClick={() => append(getDefaultHeroCta())} variant="link" className="square add-media hover-none btn-sm p-0">
                    <i className="icon-add" />
                    Add CTA
                  </Button>
                )}
              </div>
              {ctaFields.map((field, index) => (
                <Row className="g-2 align-items-start mb-2" key={field.id}>
                  <Col md="5">
                    <CommonInput
                      type="text"
                      register={register}
                      errors={errors}
                      name={getFieldName(`aCta[${index}].sLabel`)}
                      label={`CTA ${index + 1} Label`}
                      disableDefaultMaxLength
                    />
                  </Col>
                  <Col md="6">
                    <CommonInput
                      type="text"
                      register={register}
                      errors={errors}
                      name={getFieldName(`aCta[${index}].sUrl`)}
                      label={`CTA ${index + 1} Link`}
                      disableDefaultMaxLength
                    />
                  </Col>
                  <Col md="1">
                    {showCtaControls && fields.length > 1 && (
                      <InputGroup className="mt-md-4">
                        <Button type="button" onClick={() => remove(index)} variant="link" className="icon-right">
                          <i className="icon-delete"></i>
                        </Button>
                      </InputGroup>
                    )}
                  </Col>
                </Row>
              ))}
            </div>
          )}
        </div>
      </Col>
    </Row>
  )
}

HomeBannerRow.propTypes = {
  basePath: PropTypes.string,
  registerTypeField: PropTypes.bool,
  showCtaControls: PropTypes.bool,
  showCtaSection: PropTypes.bool,
  showEyebrow: PropTypes.bool
}
