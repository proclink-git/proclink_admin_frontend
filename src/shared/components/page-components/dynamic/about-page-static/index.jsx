import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import TitleFormatHint from 'shared/components/title-format-hint'
import { getNestedObject, isVideoMedia } from 'shared/utils'
import CareerBannerSection from '../home-page-static/career-banner-section'
import {
  ABOUT_HEADER_STATEMENT_COUNT,
  getDefaultAboutStatement,
  getDefaultBeliefItem,
  getDefaultCredibilityCard,
  getDefaultImage,
  getDefaultLeadershipCard,
  getDefaultMissionVisionItem,
  getDefaultOperationalInsightItem,
  PICTURE_FUTURE_LINE_COUNT,
  getDefaultWhoWeAreItem
} from './utils'
import TinyEditor from 'shared/components/editor'
import ImageDimensionNote from 'shared/components/image-dimension-note'

function SectionHeading({ label }) {
  return <Form.Label className="text-uppercase small text-muted mb-3">{label}</Form.Label>
}

SectionHeading.propTypes = {
  label: PropTypes.string
}

function AboutHeaderSection({ basePath = 'oAboutUs.oAUH' }) {
  const {
    register,
    control,
    watch,
    getValues,
    formState: { errors }
  } = useFormContext()
  const values = watch(basePath) || {}
  const { fields, append } = useFieldArray({
    control,
    name: `${basePath}.aStatement`
  })

  useEffect(() => {
    const currentItems = getValues(`${basePath}.aStatement`)
    const length = Array.isArray(currentItems) ? currentItems.length : fields.length
    const missingCount = Math.max(0, ABOUT_HEADER_STATEMENT_COUNT - (length || 0))
    if (missingCount) {
      append(Array.from({ length: missingCount }, () => getDefaultAboutStatement()))
    }
  }, [append, basePath, fields.length, getValues])

  return (
    <div className="p-3">
      <SectionHeading label="About Us Header" />
      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <TitleFormatHint subject="title" />
      {fields.map((field, index) => (
        <InputArrayBox key={field.id} className="mb-3">
          <Form.Label>Statement {index + 1}</Form.Label>
          <CountInput
            type="text"
            currentLength={values?.aStatement?.[index]?.sTitle?.length}
            register={register(`${basePath}.aStatement[${index}].sTitle`)}
            error={errors}
            name={`${basePath}.aStatement[${index}].sTitle`}
            label="Title"
          />
          <CountInput
            textarea
            rows={4}
            currentLength={values?.aStatement?.[index]?.sDescription?.length}
            register={register(`${basePath}.aStatement[${index}].sDescription`)}
            error={errors}
            name={`${basePath}.aStatement[${index}].sDescription`}
            label="Description"
          />
        </InputArrayBox>
      ))}
    </div>
  )
}

AboutHeaderSection.propTypes = {
  basePath: PropTypes.string
}

function getTextListValues(items, minItems) {
  const values = (Array.isArray(items) ? items : []).map((item) => String(item || ''))

  while (values.length < minItems) {
    values.push('')
  }

  return values
}

function TextListFields({ name, label, rows = 3, minItems = 1 }) {
  const {
    register,
    getValues,
    setValue,
    watch,
    formState: { errors }
  } = useFormContext()
  const values = getTextListValues(watch(name), minItems)

  useEffect(() => {
    const currentItems = getValues(name)
    const nextItems = getTextListValues(currentItems, minItems)
    if (!Array.isArray(currentItems) || currentItems.length < minItems) {
      setValue(name, nextItems, { shouldDirty: false })
    }
  }, [getValues, minItems, name, setValue])

  return (
    <>
      {values.map((_, index) => (
        <InputArrayBox key={`${name}-${index}`} className="mb-3">
          <CountInput
            textarea
            rows={rows}
            currentLength={values?.[index]?.length}
            register={register(`${name}[${index}]`)}
            error={errors}
            name={`${name}[${index}]`}
            label={`${label} ${index + 1}`}
          />
        </InputArrayBox>
      ))}
    </>
  )
}

TextListFields.propTypes = {
  label: PropTypes.string,
  minItems: PropTypes.number,
  name: PropTypes.string,
  rows: PropTypes.number
}

function WhoWeAreSection({ basePath = 'oAboutUs.oWWA' }) {
  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    clearErrors,
    formState: { errors }
  } = useFormContext()
  const values = watch(basePath) || {}
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${basePath}.aItem`
  })
  const descriptionError = getNestedObject(errors, `${basePath}.sDescription`)

  useEffect(() => {
    const currentItems = getValues(`${basePath}.aItem`)
    if (!fields.length && (!Array.isArray(currentItems) || !currentItems.length)) append(getDefaultWhoWeAreItem())
  }, [append, basePath, fields.length, getValues])

  return (
    <div className="p-3">
      <SectionHeading label="Who We Are" />
      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <TitleFormatHint subject="title" />
      <TinyEditor
        name={`${basePath}.sDescription`}
        control={control}
        onlyTextFormatting
        minHeight={500}
        height={200}
        error={descriptionError?.message}
      />

      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <>
              {index + 1 === fields.length && (
                <Button type="button" onClick={() => append(getDefaultWhoWeAreItem())} variant="link" size="sm" className="square icon-btn">
                  <i className="icon-add d-block" />
                </Button>
              )}
              {fields.length > 1 && (
                <Button type="button" onClick={() => remove(index)} variant="link" size="sm" className="square icon-btn">
                  <i className="icon-delete d-block" />
                </Button>
              )}
            </>
          }
        >
          <Form.Label>Item {index + 1}</Form.Label>
          <Row>
            <Col sm="8">
              <CountInput
                textarea
                rows={4}
                currentLength={values?.aItem?.[index]?.sDescription?.length}
                register={register(`${basePath}.aItem[${index}].sDescription`)}
                error={errors}
                name={`${basePath}.aItem[${index}].sDescription`}
                label="Description"
              />
            </Col>
            <Col sm="4" className="add-article">
              <ImageDimensionNote width={60} height={60} subject="image" />
              <CategoryPlayerTeamImage
                galleryType="pb"
                title="Image"
                name={`${basePath}.aItem[${index}].oImg`}
                register={register}
                setValue={setValue}
                values={getValues()}
                errors={errors}
                clearErrors={clearErrors}
                hideAttribution
              />
            </Col>
          </Row>
        </InputArrayBox>
      ))}
    </div>
  )
}

WhoWeAreSection.propTypes = {
  basePath: PropTypes.string
}

function CredibilityPresenceSection({ basePath = 'oAboutUs.oCAP' }) {
  const {
    register,
    control,
    getValues,
    watch,
    formState: { errors }
  } = useFormContext()
  const values = watch(basePath) || {}
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${basePath}.aCard`
  })

  useEffect(() => {
    const currentItems = getValues(`${basePath}.aCard`)
    if (!fields.length && (!Array.isArray(currentItems) || !currentItems.length)) append(getDefaultCredibilityCard())
  }, [append, basePath, fields.length, getValues])

  return (
    <div className="p-3">
      <SectionHeading label="Credibility and Presence" />
      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <TitleFormatHint subject="title" />
      <CountInput textarea rows={5} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description" />

      <Row className="gutter-9">
        {fields.map((field, index) => (
          <Col sm="6" key={field.id} className="mb-3">
            <InputArrayBox
              className="h-100"
              actions={
                <>
                  {index + 1 === fields.length && (
                    <Button type="button" onClick={() => append(getDefaultCredibilityCard())} variant="link" size="sm" className="square icon-btn">
                      <i className="icon-add d-block" />
                    </Button>
                  )}
                  {fields.length > 1 && (
                    <Button type="button" onClick={() => remove(index)} variant="link" size="sm" className="square icon-btn">
                      <i className="icon-delete d-block" />
                    </Button>
                  )}
                </>
              }
            >
              <Form.Label>Card {index + 1}</Form.Label>
              <CountInput type="text" currentLength={values?.aCard?.[index]?.sLabel?.length} register={register(`${basePath}.aCard[${index}].sLabel`)} error={errors} name={`${basePath}.aCard[${index}].sLabel`} label="Label" />
              <CountInput
                textarea
                rows={4}
                currentLength={values?.aCard?.[index]?.sDescription?.length}
                register={register(`${basePath}.aCard[${index}].sDescription`)}
                error={errors}
                name={`${basePath}.aCard[${index}].sDescription`}
                label="Description"
              />
            </InputArrayBox>
          </Col>
        ))}
      </Row>
    </div>
  )
}

CredibilityPresenceSection.propTypes = {
  basePath: PropTypes.string
}

function WhyProclinkAboutSection({ basePath = 'oAboutUs.oWYP' }) {
  const {
    register,
    watch,
    setValue,
    getValues,
    clearErrors,
    formState: { errors },
    control
  } = useFormContext()
  const values = watch(basePath) || {}
  const selectedMediaType = values?.eMediaType === 'i' ? 'image' : 'video'
  const currentMediaUrl = values?.oMedia?.sUrl || values?.sMediaUrl || ''
  const currentThumbnailUrl = values?.oThumbnail?.sUrl || values?.sThumbnailUrl || ''
  const previousMediaTypeRef = useRef(selectedMediaType)
  const contentError = getNestedObject(errors, `${basePath}.sContent`)

  useEffect(() => {
    if (previousMediaTypeRef.current === selectedMediaType) return

    setValue(`${basePath}.sMediaUrl`, '', { shouldDirty: true })
    setValue(`${basePath}.oMedia`, getDefaultImage(), { shouldDirty: true })
    setValue(`${basePath}.sThumbnailUrl`, '', { shouldDirty: true })
    setValue(`${basePath}.oThumbnail`, getDefaultImage(), { shouldDirty: true })
    clearErrors([`${basePath}.oMedia`, `${basePath}.sMediaUrl`, `${basePath}.oThumbnail`, `${basePath}.sThumbnailUrl`])
    previousMediaTypeRef.current = selectedMediaType
  }, [basePath, clearErrors, selectedMediaType, setValue])

  useEffect(() => {
    const hasVideoInImageField = selectedMediaType === 'image' && currentMediaUrl && isVideoMedia(currentMediaUrl)
    const hasThumbnailInImageMode = selectedMediaType === 'image' && currentThumbnailUrl

    if (!hasVideoInImageField && !hasThumbnailInImageMode) return

    if (hasVideoInImageField) {
      setValue(`${basePath}.sMediaUrl`, '', { shouldDirty: true })
      setValue(`${basePath}.oMedia`, getDefaultImage(), { shouldDirty: true })
    }

    setValue(`${basePath}.sThumbnailUrl`, '', { shouldDirty: true })
    setValue(`${basePath}.oThumbnail`, getDefaultImage(), { shouldDirty: true })
    clearErrors([`${basePath}.oMedia`, `${basePath}.sMediaUrl`, `${basePath}.oThumbnail`, `${basePath}.sThumbnailUrl`])
  }, [basePath, clearErrors, currentMediaUrl, currentThumbnailUrl, selectedMediaType, setValue])

  return (
    <div className="p-3">
      <SectionHeading label="Why Proclink" />
      <Row>
        <Col sm="8">
          <Form.Group className="form-group">
            <Form.Label>Media Type</Form.Label>
            <Form.Select {...register(`${basePath}.eMediaType`)}>
              <option value="v">Video</option>
              <option value="i">Image</option>
            </Form.Select>
          </Form.Group>
          <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
          <TitleFormatHint subject="title" />
          <TinyEditor name={`${basePath}.sContent`} control={control} onlyTextFormatting minHeight={500} height={200} error={contentError?.message} />
        </Col>
        <Col sm="4" className="add-article">
          <ImageDimensionNote width={1720} height={800} subject="product dual media image" />
          <CategoryPlayerTeamImage
            key={`${basePath}-media-${selectedMediaType}`}
            galleryType="pb"
            title={selectedMediaType === 'image' ? 'Media Image' : 'Media Video'}
            name={`${basePath}.oMedia`}
            register={register}
            setValue={setValue}
            values={getValues()}
            errors={errors}
            clearErrors={clearErrors}
            urlFieldName={`${basePath}.sMediaUrl`}
            hideText
            hideCaption
            hideAttribution
            mediaType={selectedMediaType}
          />
          {selectedMediaType === 'video' && (
            <CategoryPlayerTeamImage
              galleryType="pb"
              title="Thumbnail Image"
              name={`${basePath}.oThumbnail`}
              register={register}
              setValue={setValue}
              values={getValues()}
              errors={errors}
              clearErrors={clearErrors}
              urlFieldName={`${basePath}.sThumbnailUrl`}
              hideText
              hideCaption
              hideAttribution
            />
          )}
        </Col>
      </Row>
    </div>
  )
}

WhyProclinkAboutSection.propTypes = {
  basePath: PropTypes.string
}

function OperationalInsightsSection({ basePath = 'oAboutUs.oOIA' }) {
  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    clearErrors,
    formState: { errors }
  } = useFormContext()
  const values = watch(basePath) || {}
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${basePath}.aItem`
  })

  useEffect(() => {
    const currentItems = getValues(`${basePath}.aItem`)
    if (!fields.length && (!Array.isArray(currentItems) || !currentItems.length)) append(getDefaultOperationalInsightItem())
  }, [append, basePath, fields.length, getValues])

  return (
    <div className="p-3">
      <SectionHeading label="Operational Insights" />
      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <TitleFormatHint subject="title" />
      <CountInput textarea rows={5} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description" />

      <Row className="gutter-9">
        {fields.map((field, index) => (
          <Col sm="6" key={field.id} className="mb-3">
            <InputArrayBox
              className="h-100"
              actions={
                <>
                  {index + 1 === fields.length && (
                    <Button type="button" onClick={() => append(getDefaultOperationalInsightItem())} variant="link" size="sm" className="square icon-btn">
                      <i className="icon-add d-block" />
                    </Button>
                  )}
                  {fields.length > 1 && (
                    <Button type="button" onClick={() => remove(index)} variant="link" size="sm" className="square icon-btn">
                      <i className="icon-delete d-block" />
                    </Button>
                  )}
                </>
              }
            >
              <Form.Label>Card {index + 1}</Form.Label>
              <CountInput type="text" currentLength={values?.aItem?.[index]?.sTitle?.length} register={register(`${basePath}.aItem[${index}].sTitle`)} error={errors} name={`${basePath}.aItem[${index}].sTitle`} label="Item Title" />
              <CountInput
                textarea
                rows={4}
                currentLength={values?.aItem?.[index]?.sDescription?.length}
                register={register(`${basePath}.aItem[${index}].sDescription`)}
                error={errors}
                name={`${basePath}.aItem[${index}].sDescription`}
                label="Description"
              />
              <div className="add-article">
                <ImageDimensionNote width={32} height={32} subject="icon" />
                <CategoryPlayerTeamImage
                  galleryType="pb"
                  title="Icon"
                  name={`${basePath}.aItem[${index}].oImg`}
                  register={register}
                  setValue={setValue}
                  values={getValues()}
                  errors={errors}
                  clearErrors={clearErrors}
                  hideAttribution
                />
              </div>
            </InputArrayBox>
          </Col>
        ))}
      </Row>
    </div>
  )
}

OperationalInsightsSection.propTypes = {
  basePath: PropTypes.string
}

function WhatWeBelieveExecutionSection({ basePath = 'oAboutUs.oWBE' }) {
  const {
    register,
    control,
    getValues,
    watch,
    formState: { errors }
  } = useFormContext()
  const values = watch(basePath) || {}
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${basePath}.aItem`
  })

  useEffect(() => {
    const currentItems = getValues(`${basePath}.aItem`)
    if (!fields.length && (!Array.isArray(currentItems) || !currentItems.length)) append(getDefaultBeliefItem())
  }, [append, basePath, fields.length, getValues])

  return (
    <div className="p-3">
      <SectionHeading label="What We Believe in Execution" />
      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <TitleFormatHint subject="title" />
      <CountInput textarea rows={5} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description" />
      <Row className="g-2">
        <Col md="5">
          <CountInput type="text" currentLength={values?.oCta?.sLabel?.length} register={register(`${basePath}.oCta.sLabel`)} error={errors} name={`${basePath}.oCta.sLabel`} label="CTA Label" />
        </Col>
        <Col md="7">
          <CommonInput type="text" register={register} errors={errors} name={`${basePath}.oCta.sUrl`} label="CTA Link" disableDefaultMaxLength />
        </Col>
      </Row>

      <Row className="gutter-9">
        {fields.map((field, index) => (
          <Col sm="6" key={field.id} className="mb-3">
            <InputArrayBox
              className="h-100"
              actions={
                <>
                  {index + 1 === fields.length && (
                    <Button type="button" onClick={() => append(getDefaultBeliefItem())} variant="link" size="sm" className="square icon-btn">
                      <i className="icon-add d-block" />
                    </Button>
                  )}
                  {fields.length > 1 && (
                    <Button type="button" onClick={() => remove(index)} variant="link" size="sm" className="square icon-btn">
                      <i className="icon-delete d-block" />
                    </Button>
                  )}
                </>
              }
            >
              <Form.Label>Item {index + 1}</Form.Label>
              <CountInput type="text" currentLength={values?.aItem?.[index]?.sTitle?.length} register={register(`${basePath}.aItem[${index}].sTitle`)} error={errors} name={`${basePath}.aItem[${index}].sTitle`} label="Item Title" />
              <CountInput
                textarea
                rows={4}
                currentLength={values?.aItem?.[index]?.sDescription?.length}
                register={register(`${basePath}.aItem[${index}].sDescription`)}
                error={errors}
                name={`${basePath}.aItem[${index}].sDescription`}
                label="Description"
              />
            </InputArrayBox>
          </Col>
        ))}
      </Row>
    </div>
  )
}

WhatWeBelieveExecutionSection.propTypes = {
  basePath: PropTypes.string
}

function LeadershipSection({ basePath = 'oAboutUs.oALP' }) {
  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    clearErrors,
    formState: { errors }
  } = useFormContext()
  const values = watch(basePath) || {}
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${basePath}.aCard`
  })

  useEffect(() => {
    const currentItems = getValues(`${basePath}.aCard`)
    if (!fields.length && (!Array.isArray(currentItems) || !currentItems.length)) append(getDefaultLeadershipCard())
  }, [append, basePath, fields.length, getValues])

  return (
    <div className="p-3">
      <SectionHeading label="Leadership" />
      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <TitleFormatHint subject="title" />
      <CountInput textarea rows={5} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description" />

      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <>
              {index + 1 === fields.length && (
                <Button type="button" onClick={() => append(getDefaultLeadershipCard())} variant="link" size="sm" className="square icon-btn">
                  <i className="icon-add d-block" />
                </Button>
              )}
              {fields.length > 1 && (
                <Button type="button" onClick={() => remove(index)} variant="link" size="sm" className="square icon-btn">
                  <i className="icon-delete d-block" />
                </Button>
              )}
            </>
          }
        >
          <Form.Label>Leader {index + 1}</Form.Label>
          <Row>
            <Col sm="8">
              <CountInput type="text" currentLength={values?.aCard?.[index]?.sName?.length} register={register(`${basePath}.aCard[${index}].sName`)} error={errors} name={`${basePath}.aCard[${index}].sName`} label="Name" />
              <CountInput
                type="text"
                currentLength={values?.aCard?.[index]?.sDesignation?.length}
                register={register(`${basePath}.aCard[${index}].sDesignation`)}
                error={errors}
                name={`${basePath}.aCard[${index}].sDesignation`}
                label="Designation"
              />
              <CountInput
                textarea
                rows={6}
                currentLength={values?.aCard?.[index]?.sDescription?.length}
                register={register(`${basePath}.aCard[${index}].sDescription`)}
                error={errors}
                name={`${basePath}.aCard[${index}].sDescription`}
                label="Description"
              />
              <CommonInput type="text" register={register} errors={errors} name={`${basePath}.aCard[${index}].sRedirectUrl`} label="Redirect Url" disableDefaultMaxLength />
            </Col>
            <Col sm="4" className="add-article">
              <ImageDimensionNote width={412} height={500} subject="portrait" />
              <CategoryPlayerTeamImage
                galleryType="pb"
                title="Portrait"
                name={`${basePath}.aCard[${index}].oImg`}
                register={register}
                setValue={setValue}
                values={getValues()}
                errors={errors}
                clearErrors={clearErrors}
                hideAttribution
              />
            </Col>
          </Row>
        </InputArrayBox>
      ))}
    </div>
  )
}

LeadershipSection.propTypes = {
  basePath: PropTypes.string
}

function HowWeCollaborateSection({ basePath = 'oAboutUs.oHWC' }) {
  const {
    register,
    watch,
    setValue,
    getValues,
    clearErrors,
    formState: { errors }
  } = useFormContext()
  const values = watch(basePath) || {}

  return (
    <div className="p-3">
      <SectionHeading label="How We Collaborate" />
      <Row>
        <Col sm="8">
          <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
          <TitleFormatHint subject="title" />
          <CountInput textarea rows={5} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description" />
          <CountInput textarea rows={5} currentLength={values?.sLeftContent?.length} register={register(`${basePath}.sLeftContent`)} error={errors} name={`${basePath}.sLeftContent`} label="Left Content" />
          <CountInput textarea rows={5} currentLength={values?.sRightContent?.length} register={register(`${basePath}.sRightContent`)} error={errors} name={`${basePath}.sRightContent`} label="Right Content" />
        </Col>
        <Col sm="4" className="add-article">
          <ImageDimensionNote width={656} height={600} subject="image" />
          <CategoryPlayerTeamImage
            galleryType="pb"
            title="Image"
            name={`${basePath}.oImg`}
            register={register}
            setValue={setValue}
            values={getValues()}
            errors={errors}
            clearErrors={clearErrors}
            hideAttribution
          />
        </Col>
      </Row>
    </div>
  )
}

HowWeCollaborateSection.propTypes = {
  basePath: PropTypes.string
}

function MissionVisionSection({ basePath = 'oAboutUs.oOMV' }) {
  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    clearErrors,
    formState: { errors }
  } = useFormContext()
  const values = watch(basePath) || {}
  const { fields, append } = useFieldArray({
    control,
    name: `${basePath}.aItem`
  })

  useEffect(() => {
    const currentItems = getValues(`${basePath}.aItem`)
    const length = Array.isArray(currentItems) ? currentItems.length : fields.length
    const missingCount = Math.max(0, 2 - (length || 0))
    if (missingCount) {
      append(Array.from({ length: missingCount }, () => getDefaultMissionVisionItem()))
    }
  }, [append, basePath, fields.length, getValues])

  return (
    <div className="p-3">
      <SectionHeading label="Mission and Vision" />
      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <TitleFormatHint subject="title" />
      <CountInput textarea rows={5} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description" />

      {fields.map((field, index) => (
        <InputArrayBox key={field.id} className="mb-3">
          <Form.Label>Item {index + 1}</Form.Label>
          <Row>
            <Col sm="8">
              <CountInput type="text" currentLength={values?.aItem?.[index]?.sTitle?.length} register={register(`${basePath}.aItem[${index}].sTitle`)} error={errors} name={`${basePath}.aItem[${index}].sTitle`} label="Item Title" />
              <Form.Label>Content</Form.Label>
              <TinyEditor
                name={`${basePath}.aItem[${index}].sContent`}
                control={control}
                onlyTextFormatting
                minHeight={500}
                height={200}
                error={getNestedObject(errors, `${basePath}.aItem[${index}].sContent`)?.message}
              />
            </Col>
            <Col sm="4" className="add-article">
              <ImageDimensionNote width={49} height={49} subject="image" />
              <CategoryPlayerTeamImage
                galleryType="pb"
                title="Image"
                name={`${basePath}.aItem[${index}].oImg`}
                register={register}
                setValue={setValue}
                values={getValues()}
                errors={errors}
                clearErrors={clearErrors}
                hideAttribution
              />
            </Col>
          </Row>
        </InputArrayBox>
      ))}
    </div>
  )
}

MissionVisionSection.propTypes = {
  basePath: PropTypes.string
}

function PictureFutureSection({ basePath = 'oAboutUs.oPTF' }) {
  const {
    register,
    watch,
    formState: { errors }
  } = useFormContext()
  const values = watch(basePath) || {}

  return (
    <div className="p-3">
      <SectionHeading label="Picture the Future" />
      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <TitleFormatHint subject="title" />
      <TextListFields name={`${basePath}.aLine`} label="Line" rows={3} minItems={PICTURE_FUTURE_LINE_COUNT} />
      <TitleFormatHint subject="title" />
    </div>
  )
}

PictureFutureSection.propTypes = {
  basePath: PropTypes.string
}

function AboutCareerBannerSection({ basePath = 'oAboutUs.oCB' }) {
  return <CareerBannerSection basePath={basePath} sectionLabel="Career CTA Banner" />
}

AboutCareerBannerSection.propTypes = {
  basePath: PropTypes.string
}

const componentMap = {
  auh: AboutHeaderSection,
  wwa: WhoWeAreSection,
  cap: CredibilityPresenceSection,
  wyp: WhyProclinkAboutSection,
  oia: OperationalInsightsSection,
  wbe: WhatWeBelieveExecutionSection,
  alp: LeadershipSection,
  hwc: HowWeCollaborateSection,
  omv: MissionVisionSection,
  ptf: PictureFutureSection,
  cb: AboutCareerBannerSection
}

export default function AboutPageStaticComponent({ basePath, component }) {
  const componentType = component?.eType || component?.iId?.eType
  const Component = componentMap?.[componentType]

  if (!Component) return component?.sComponentTitle || component?.iId?.sComponentTitle || componentType || null

  return <Component basePath={basePath} component={component} />
}

AboutPageStaticComponent.propTypes = {
  basePath: PropTypes.string,
  component: PropTypes.object
}
