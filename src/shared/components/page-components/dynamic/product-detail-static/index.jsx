import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import EditorNote from 'shared/components/editor-note'
import InputArrayBox from 'shared/components/input-array-box'
import TitleFormatHint from 'shared/components/title-format-hint'
import CareerBannerSection from '../home-page-static/career-banner-section'
import FaqSection from '../industry-detail-static/faq-section'
import IndustrialSectorsGridSection from '../industry-detail-static/industrial-sectors-grid-section'
import ProofStripSection from '../industry-detail-static/proof-strip-section'
import RelevantServicesCarouselSection from '../industry-detail-static/relevant-services-carousel-section'
import ServicePageBannerSection from '../service-detail-static/service-page-banner-section'
import { isVideoMedia } from 'shared/utils'
import useEnsureFieldArrayDefault from '../use-ensure-field-array-default'
import {
  getDefaultBenefitItem,
  getDefaultComparisonItem,
  getDefaultImage,
  getDefaultImageTitleItem,
  getDefaultProductInterfaceItem,
  getDefaultImageCard,
  getDefaultMediaImageCard,
  getDefaultTitleDescriptionItem,
  getDefaultTextItem
} from './utils'
import ImageDimensionNote from 'shared/components/image-dimension-note'

function SectionHeading({ label }) {
  return <Form.Label className="text-uppercase small text-muted mb-3">{label}</Form.Label>
}

SectionHeading.propTypes = {
  label: PropTypes.string
}

function AddRemoveActions({ canAdd, canRemove, onAdd, onRemove }) {
  return (
    <>
      {canAdd && (
        <Button type="button" onClick={onAdd} variant="link" size="sm" className="square icon-btn">
          <i className="icon-add d-block" />
        </Button>
      )}
      {canRemove && (
        <Button type="button" onClick={onRemove} variant="link" size="sm" className="square icon-btn">
          <i className="icon-delete d-block" />
        </Button>
      )}
    </>
  )
}

AddRemoveActions.propTypes = {
  canAdd: PropTypes.bool,
  canRemove: PropTypes.bool,
  onAdd: PropTypes.func,
  onRemove: PropTypes.func
}

function ProductHeroSection({ basePath = 'oHPB' }) {
  return (
    <div className="p-3">
      <SectionHeading label="Home Page Banner" />
      <ServicePageBannerSection basePath={basePath} showContentField={false} />
    </div>
  )
}

function ProductDualMediaSection({ basePath = 'oPDM' }) {
  const {
    register,
    watch,
    setValue,
    getValues,
    clearErrors,
    formState: { errors }
  } = useFormContext()
  const values = watch(basePath) || {}
  const selectedMediaType = values?.eMediaType === 'i' ? 'image' : 'video'
  const currentMediaUrl = values?.oMedia?.sUrl || values?.sMediaUrl || ''
  const currentThumbnailUrl = values?.oThumbnail?.sUrl || values?.sThumbnailUrl || ''
  const previousMediaTypeRef = useRef(selectedMediaType)

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
      <SectionHeading label="Product Dual Media" />
      <Row className="g-4">
        <Col lg="8">
          <Form.Group className="form-group">
            <Form.Label>Media Type</Form.Label>
            <Form.Select {...register(`${basePath}.eMediaType`)}>
              <option value="v">Video</option>
              <option value="i">Image</option>
            </Form.Select>
          </Form.Group>
          <CountInput
            textarea
            rows={5}
            currentLength={values?.sTopLeftContent?.length}
            register={register(`${basePath}.sTopLeftContent`)}
            error={errors}
            name={`${basePath}.sTopLeftContent`}
            label="Top Left Content"
          />
          <CountInput
            textarea
            rows={5}
            currentLength={values?.sBottomRightContent?.length}
            register={register(`${basePath}.sBottomRightContent`)}
            error={errors}
            name={`${basePath}.sBottomRightContent`}
            label="Bottom Right Content"
          />
        </Col>
        <Col lg="4" className="add-article">
          <ImageDimensionNote width={1720} height={800} subject="product dual media image" />
          <CategoryPlayerTeamImage
            key={`product-dual-media-${selectedMediaType}`}
            galleryType="pb"
            title={selectedMediaType === 'image' ? 'Media Image' : 'Media Video'}
            name={`${basePath}.oMedia`}
            register={register}
            setValue={setValue}
            values={getValues()}
            errors={errors}
            clearErrors={clearErrors}
            onDelete={() => setValue(`${basePath}.sMediaUrl`, '')}
            urlFieldName={`${basePath}.sMediaUrl`}
            hideText
            hideCaption
            hideAttribution
            mediaType={selectedMediaType}
          />
          {/* {selectedMediaType === 'video' && (
            <CategoryPlayerTeamImage
              galleryType="pb"
              title="Thumbnail Image"
              name={`${basePath}.oThumbnail`}
              register={register}
              setValue={setValue}
              values={getValues()}
              errors={errors}
              clearErrors={clearErrors}
              onDelete={() => setValue(`${basePath}.sThumbnailUrl`, '')}
              urlFieldName={`${basePath}.sThumbnailUrl`}
              hideText
              hideCaption
              hideAttribution
            />
          )} */}
        </Col>
      </Row>
    </div>
  )
}

function normalizeItemMediaType(value = '') {
  if (value === 'v' || value === 'video') return 'v'
  return 'i'
}

function TextItemsSection({ basePath, sectionLabel, itemName = 'aItem', itemLabel = 'Item', showDescription = true }) {
  const {
    register,
    control,
    watch,
    getValues,
    formState: { errors }
  } = useFormContext()
  const values = watch(basePath) || {}
  const fieldArrayName = `${basePath}.${itemName}`
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayName
  })
  useEnsureFieldArrayDefault({ fields, append, getValues, name: fieldArrayName, getDefaultValue: getDefaultTextItem })

  return (
    <div className="p-3">
      <SectionHeading label={sectionLabel} />
      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <TitleFormatHint subject="title" />
      {showDescription && (
        <CountInput
          textarea
          rows={5}
          currentLength={values?.sDescription?.length}
          register={register(`${basePath}.sDescription`)}
          error={errors}
          name={`${basePath}.sDescription`}
          label="Description"
        />
      )}
      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <AddRemoveActions
              canAdd={index + 1 === fields.length}
              canRemove={fields.length > 1}
              onAdd={() => append(getDefaultTextItem())}
              onRemove={() => remove(index)}
            />
          }
        >
          <CountInput
            textarea
            rows={3}
            currentLength={values?.[itemName]?.[index]?.sValue?.length}
            register={register(`${basePath}.${itemName}[${index}].sValue`)}
            error={errors}
            name={`${basePath}.${itemName}[${index}].sValue`}
            label={`${itemLabel} ${index + 1}`}
          />
        </InputArrayBox>
      ))}
    </div>
  )
}

TextItemsSection.propTypes = {
  basePath: PropTypes.string,
  itemLabel: PropTypes.string,
  itemName: PropTypes.string,
  sectionLabel: PropTypes.string,
  showDescription: PropTypes.bool
}

// Design: cap Before/After rows so the public comparison stays scannable; more than ~6 pairs hurts readability on smaller viewports.
const COMPARISON_BEFORE_AFTER_MAX = 6

function ComparisonSection({ basePath = 'oWDW' }) {
  const {
    register,
    control,
    watch,
    getValues,
    formState: { errors }
  } = useFormContext()
  const values = watch(basePath) || {}
  const fieldArrayName = `${basePath}.aItem`
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayName
  })
  useEnsureFieldArrayDefault({ fields, append, getValues, name: fieldArrayName, getDefaultValue: getDefaultComparisonItem })

  return (
    <div className="p-3">
      <SectionHeading label="Why Digital Workflows" />
      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <TitleFormatHint subject="title" />
      <CountInput textarea rows={5} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description" />
      <EditorNote title="Design Note">
        For better design, keep up to {COMPARISON_BEFORE_AFTER_MAX} Before/After pairs in this section.
      </EditorNote>
      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <AddRemoveActions
              canAdd={index + 1 === fields.length}
              canRemove={fields.length > 1}
              onAdd={() => append(getDefaultComparisonItem())}
              onRemove={() => remove(index)}
            />
          }
        >
          <Row>
            <Col md="6">
              <CountInput
                type="text"
                currentLength={values?.aItem?.[index]?.sTitle?.length}
                register={register(`${basePath}.aItem[${index}].sTitle`)}
                error={errors}
                name={`${basePath}.aItem[${index}].sTitle`}
                label="Before"
              />
            </Col>
            <Col md="6">
              <CountInput
                type="text"
                currentLength={values?.aItem?.[index]?.sDescription?.length}
                register={register(`${basePath}.aItem[${index}].sDescription`)}
                error={errors}
                name={`${basePath}.aItem[${index}].sDescription`}
                label="After"
              />
            </Col>
          </Row>
        </InputArrayBox>
      ))}
    </div>
  )
}

function TitleDescriptionItemsSection({ basePath, sectionLabel, itemName = 'aItem', itemLabel = 'Item' }) {
  const {
    register,
    control,
    watch,
    getValues,
    formState: { errors }
  } = useFormContext()
  const values = watch(basePath) || {}
  const fieldArrayName = `${basePath}.${itemName}`
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayName
  })
  useEnsureFieldArrayDefault({ fields, append, getValues, name: fieldArrayName, getDefaultValue: getDefaultTitleDescriptionItem })

  return (
    <div className="p-3">
      <SectionHeading label={sectionLabel} />
      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <TitleFormatHint subject="title" />
      <CountInput
        textarea
        rows={5}
        currentLength={values?.sDescription?.length}
        register={register(`${basePath}.sDescription`)}
        error={errors}
        name={`${basePath}.sDescription`}
        label="Description"
      />
      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <AddRemoveActions
              canAdd={index + 1 === fields.length}
              canRemove={fields.length > 1}
              onAdd={() => append(getDefaultTitleDescriptionItem())}
              onRemove={() => remove(index)}
            />
          }
        >
          <Form.Label>{itemLabel} {index + 1}</Form.Label>
          <CountInput
            type="text"
            currentLength={values?.[itemName]?.[index]?.sTitle?.length}
            register={register(`${basePath}.${itemName}[${index}].sTitle`)}
            error={errors}
            name={`${basePath}.${itemName}[${index}].sTitle`}
            label="Title"
          />
          <CountInput
            textarea
            rows={5}
            currentLength={values?.[itemName]?.[index]?.sDescription?.length}
            register={register(`${basePath}.${itemName}[${index}].sDescription`)}
            error={errors}
            name={`${basePath}.${itemName}[${index}].sDescription`}
            label="Description"
          />
        </InputArrayBox>
      ))}
    </div>
  )
}

TitleDescriptionItemsSection.propTypes = {
  basePath: PropTypes.string,
  itemLabel: PropTypes.string,
  itemName: PropTypes.string,
  sectionLabel: PropTypes.string
}

function ImageCardsSection({
  basePath,
  sectionLabel,
  cardLabel = 'Card',
  showSectionImage = true,
  showCardDescription = true,
  supportMediaType = false,
  getDefaultCard = getDefaultImageCard,
  cardImageWidth = 37.5,
  cardImageHeight = 37.5,
  cardImageDimensionSubject = 'icon'
}) {
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
  const fieldArrayName = `${basePath}.aCard`
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayName
  })
  useEnsureFieldArrayDefault({ fields, append, getValues, name: fieldArrayName, getDefaultValue: getDefaultCard })

  function handleCardMediaTypeChange(index, mediaType) {
    const cardPath = `${basePath}.aCard[${index}]`

    setValue(`${cardPath}.eMediaType`, mediaType, { shouldDirty: true })
    setValue(`${cardPath}.sMediaUrl`, '', { shouldDirty: true })
    setValue(`${cardPath}.oImg`, getDefaultImage(), { shouldDirty: true })
    clearErrors([`${cardPath}.sMediaUrl`, `${cardPath}.oImg`])
  }

  return (
    <div className="p-3">
      <SectionHeading label={sectionLabel} />
      <Row className="g-4">
        <Col lg={showSectionImage ? '8' : '12'}>
          <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
          <TitleFormatHint subject="title" />
          <CountInput
            textarea
            rows={5}
            currentLength={values?.sDescription?.length}
            register={register(`${basePath}.sDescription`)}
            error={errors}
            name={`${basePath}.sDescription`}
            label="Description"
          />
        </Col>
        {showSectionImage && (
          <Col lg="4" className="add-article">
            <ImageDimensionNote width={741} height={632} subject="section image" />
            <CategoryPlayerTeamImage
              galleryType="pb"
              title="Section Image"
              name={`${basePath}.oImg`}
              register={register}
              setValue={setValue}
              values={getValues()}
              errors={errors}
              clearErrors={clearErrors}
              hideAttribution
            />
          </Col>
        )}
      </Row>
      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <AddRemoveActions
              canAdd={index + 1 === fields.length}
              canRemove={fields.length > 1}
              onAdd={() => append(getDefaultCard())}
              onRemove={() => remove(index)}
            />
          }
        >
          {(() => {
            const cardPath = `${basePath}.aCard[${index}]`
            const cardMediaType = normalizeItemMediaType(values?.aCard?.[index]?.eMediaType)

            return (
              <>
                <Form.Label>{cardLabel} {index + 1}</Form.Label>
                <Row>
                  <Col sm="8">
                    <CountInput
                      type="text"
                      currentLength={values?.aCard?.[index]?.sTitle?.length}
                      register={register(`${cardPath}.sTitle`)}
                      error={errors}
                      name={`${cardPath}.sTitle`}
                      label="Title"
                    />
                    {showCardDescription && (
                      <CountInput
                        textarea
                        rows={5}
                        currentLength={values?.aCard?.[index]?.sDescription?.length}
                        register={register(`${cardPath}.sDescription`)}
                        error={errors}
                        name={`${cardPath}.sDescription`}
                        label="Description"
                      />
                    )}
                    {supportMediaType && <input type="hidden" {...register(`${cardPath}.sMediaUrl`)} />}
                  </Col>
                  <Col sm="4" className="add-article">
                    {supportMediaType && (
                      <Form.Group className="form-group">
                        <Form.Label>Media Type</Form.Label>
                        <Form.Select
                          {...register(`${cardPath}.eMediaType`)}
                          onChange={(event) => handleCardMediaTypeChange(index, event.target.value)}
                        >
                          <option value="i">Image</option>
                          <option value="v">Video</option>
                        </Form.Select>
                      </Form.Group>
                    )}
                    <ImageDimensionNote width={cardImageWidth} height={cardImageHeight} subject={cardImageDimensionSubject} />
                    <CategoryPlayerTeamImage
                      key={`${cardPath}.oImg-${cardMediaType}`}
                      galleryType="pb"
                      title={supportMediaType && cardMediaType === 'v' ? 'Video' : 'Icon'}
                      name={`${cardPath}.oImg`}
                      register={register}
                      setValue={setValue}
                      values={getValues()}
                      errors={errors}
                      clearErrors={clearErrors}
                      onDelete={supportMediaType ? () => setValue(`${cardPath}.sMediaUrl`, '') : undefined}
                      urlFieldName={supportMediaType ? `${cardPath}.sMediaUrl` : undefined}
                      hideAttribution
                      mediaType={supportMediaType && cardMediaType === 'v' ? 'video' : 'image'}
                    />
                  </Col>
                </Row>
              </>
            )
          })()}
        </InputArrayBox>
      ))}
    </div>
  )
}

ImageCardsSection.propTypes = {
  basePath: PropTypes.string,
  cardLabel: PropTypes.string,
  sectionLabel: PropTypes.string,
  showCardDescription: PropTypes.bool,
  showSectionImage: PropTypes.bool,
  supportMediaType: PropTypes.bool,
  getDefaultCard: PropTypes.func,
  cardImageWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  cardImageHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  cardImageDimensionSubject: PropTypes.string
}

function ImageTitleItemsSection({
  basePath,
  sectionLabel,
  itemName = 'aCard',
  cardsLabel = 'Cards',
  cardLabel = 'Card',
  showDescription = true,
  showCta = false,
  supportMediaType = false,
  getDefaultItem = getDefaultImageTitleItem,
  cardImageWidth = 950,
  cardImageHeight = 550,
  cardImageDimensionSubject = 'image'
}) {
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
  const fieldArrayName = `${basePath}.${itemName}`
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayName
  })
  useEnsureFieldArrayDefault({ fields, append, getValues, name: fieldArrayName, getDefaultValue: getDefaultItem })

  function handleItemMediaTypeChange(index, mediaType) {
    const itemPath = `${basePath}.${itemName}[${index}]`

    setValue(`${itemPath}.eMediaType`, mediaType, { shouldDirty: true })
    setValue(`${itemPath}.sMediaUrl`, '', { shouldDirty: true })
    setValue(`${itemPath}.oImg`, getDefaultImage(), { shouldDirty: true })
    clearErrors([`${itemPath}.sMediaUrl`, `${itemPath}.oImg`])
  }

  return (
    <div className="p-3">
      <SectionHeading label={sectionLabel} />
      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      {showDescription && (
        <CountInput
          textarea
          rows={5}
          currentLength={values?.sDescription?.length}
          register={register(`${basePath}.sDescription`)}
          error={errors}
          name={`${basePath}.sDescription`}
          label="Description"
        />
      )}
      {showCta && (
        <Row className="g-2">
          <Col md="5">
            <CountInput
              type="text"
              currentLength={values?.oCta?.sLabel?.length}
              register={register(`${basePath}.oCta.sLabel`)}
              error={errors}
              name={`${basePath}.oCta.sLabel`}
              label="CTA Label"
            />
          </Col>
          <Col md="7">
            <CommonInput type="text" register={register} errors={errors} name={`${basePath}.oCta.sUrl`} label="CTA Link" disableDefaultMaxLength />
          </Col>
        </Row>
      )}

      <Form.Label className="text-uppercase small text-muted mb-2">{cardsLabel}</Form.Label>
      {fields.map((field, index) => {
        const itemPath = `${basePath}.${itemName}[${index}]`
        const itemMediaType = normalizeItemMediaType(values?.[itemName]?.[index]?.eMediaType)

        return (
          <InputArrayBox
            key={field.id}
            className="mb-3"
            actions={
              <AddRemoveActions
                canAdd={index + 1 === fields.length}
                canRemove={fields.length > 1}
                onAdd={() => append(getDefaultItem())}
                onRemove={() => remove(index)}
              />
            }
          >
            <Form.Label>{cardLabel} {index + 1}</Form.Label>
            <Row>
              <Col sm="8">
                <CountInput
                  type="text"
                  currentLength={values?.[itemName]?.[index]?.sTitle?.length}
                  register={register(`${itemPath}.sTitle`)}
                  error={errors}
                  name={`${itemPath}.sTitle`}
                  label="Title"
                />
                {supportMediaType && <input type="hidden" {...register(`${itemPath}.sMediaUrl`)} />}
              </Col>
              <Col sm="4" className="add-article">
                {supportMediaType && (
                  <Form.Group className="form-group">
                    <Form.Label>Media Type</Form.Label>
                    <Form.Select
                      {...register(`${itemPath}.eMediaType`)}
                      onChange={(event) => handleItemMediaTypeChange(index, event.target.value)}
                    >
                      <option value="i">Image</option>
                      <option value="v">Video</option>
                    </Form.Select>
                  </Form.Group>
                )}
                <ImageDimensionNote width={cardImageWidth} height={cardImageHeight} subject={cardImageDimensionSubject} />
                <CategoryPlayerTeamImage
                  key={`${itemPath}.oImg-${itemMediaType}`}
                  galleryType="pb"
                  title={supportMediaType && itemMediaType === 'v' ? 'Video' : 'Image'}
                  name={`${itemPath}.oImg`}
                  register={register}
                  setValue={setValue}
                  values={getValues()}
                  errors={errors}
                  clearErrors={clearErrors}
                  onDelete={supportMediaType ? () => setValue(`${itemPath}.sMediaUrl`, '') : undefined}
                  urlFieldName={supportMediaType ? `${itemPath}.sMediaUrl` : undefined}
                  hideAttribution
                  mediaType={supportMediaType && itemMediaType === 'v' ? 'video' : 'image'}
                />
              </Col>
            </Row>
          </InputArrayBox>
        )
      })}
    </div>
  )
}

ImageTitleItemsSection.propTypes = {
  basePath: PropTypes.string,
  cardLabel: PropTypes.string,
  cardsLabel: PropTypes.string,
  itemName: PropTypes.string,
  sectionLabel: PropTypes.string,
  getDefaultItem: PropTypes.func,
  showCta: PropTypes.bool,
  showDescription: PropTypes.bool,
  supportMediaType: PropTypes.bool,
  cardImageWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  cardImageHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  cardImageDimensionSubject: PropTypes.string
}

function BenefitsSection({ basePath = 'oOBW' }) {
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
  const fieldArrayName = `${basePath}.aItem`
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayName
  })
  useEnsureFieldArrayDefault({ fields, append, getValues, name: fieldArrayName, getDefaultValue: getDefaultBenefitItem })

  return (
    <div className="p-3">
      <SectionHeading label="Operational Benefits" />
      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <TitleFormatHint subject="title" />
      <CountInput textarea rows={5} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description" />
      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <AddRemoveActions
              canAdd={index + 1 === fields.length}
              canRemove={fields.length > 1}
              onAdd={() => append(getDefaultBenefitItem())}
              onRemove={() => remove(index)}
            />
          }
        >
          <Row>
            <Col sm="8">
              <CountInput
                type="text"
                currentLength={values?.aItem?.[index]?.sTitle?.length}
                register={register(`${basePath}.aItem[${index}].sTitle`)}
                error={errors}
                name={`${basePath}.aItem[${index}].sTitle`}
                label="Title"
              />
            </Col>
            <Col sm="4" className="add-article">
              <ImageDimensionNote width={60} height={60} subject="benefit item icon" />
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
            </Col>
          </Row>
        </InputArrayBox>
      ))}
    </div>
  )
}

ProductHeroSection.propTypes = {
  basePath: PropTypes.string
}

ProductDualMediaSection.propTypes = {
  basePath: PropTypes.string
}

ComparisonSection.propTypes = {
  basePath: PropTypes.string
}

BenefitsSection.propTypes = {
  basePath: PropTypes.string
}

const componentMap = {
  hpb: ProductHeroSection,
  pdm: ProductDualMediaSection,
  cce: ({ basePath = 'oCCE' }) => <TextItemsSection basePath={basePath} sectionLabel="Common Challenges In SOP Execution" itemLabel="Challenge" />,
  wdw: ComparisonSection,
  waw: ({ basePath = 'oWAW' }) => <TextItemsSection basePath={basePath} sectionLabel="What Anoma Workflow Software Does" itemName="aDescription" itemLabel="Description" showDescription={false} />,
  wsh: ({ basePath = 'oWSH' }) => <ImageCardsSection basePath={basePath} sectionLabel="Workflow System - How It Works" cardLabel="Step" />,
  wmf: ({ basePath = 'oWMF' }) => (
    <ImageCardsSection
      basePath={basePath}
      sectionLabel="Workflow Management Features"
      cardLabel="Feature"
      showSectionImage={false}
      cardImageWidth={32}
      cardImageHeight={32}
    />
  ),
  obw: BenefitsSection,
  wpi: ({ basePath = 'oWPI' }) => <TitleDescriptionItemsSection basePath={basePath} sectionLabel="Who The Product Is For" itemLabel="Audience" />,
  pif: ({ basePath = 'oPIF' }) => (
    <ImageTitleItemsSection
      basePath={basePath}
      sectionLabel="Product Interface"
      itemName="aItem"
      cardsLabel="Interface Items"
      cardLabel="Interface"
      showDescription={false}
      supportMediaType
      getDefaultItem={getDefaultProductInterfaceItem}
      cardImageDimensionSubject="product interface media"
    />
  ),
  plt: ({ basePath = 'oPLT' }) => <TextItemsSection basePath={basePath} sectionLabel="Product Lifecycle Timeline" itemLabel="Lifecycle Item" />,
  pwa: ({ basePath = 'oPWA' }) => (
    <ImageCardsSection
      basePath={basePath}
      sectionLabel="Product Workflow Architecture"
      cardLabel="Architecture Card"
      showSectionImage={false}
      cardImageWidth={246}
      cardImageHeight={183}
      cardImageDimensionSubject="architecture card image"
      supportMediaType
      getDefaultCard={getDefaultMediaImageCard}
    />
  ),
  isf: ({ basePath = 'oISF' }) => (
    <ImageTitleItemsSection
      basePath={basePath}
      sectionLabel="Integrations & System Fit"
      cardsLabel="Integration Cards"
      cardLabel="Integration"
      cardImageWidth={475}
      cardImageHeight={475}
      cardImageDimensionSubject="integration card image"
    />
  ),
  isg: ({ basePath = 'oISG' }) => <IndustrialSectorsGridSection basePath={basePath} sectionLabel="Industrial Sectors Grid" cardsLabel="Sector Cards" />,
  pia: ({ basePath = 'oPIA' }) => (
    <ImageTitleItemsSection
      basePath={basePath}
      sectionLabel="Product In Action Use Cases"
      cardsLabel="Use Cases"
      cardLabel="Use Case"
      showCta
      cardImageWidth={80}
      cardImageHeight={80}
      cardImageDimensionSubject="use case image"
    />
  ),
  oiw: ({ basePath = 'oOIW' }) => <TextItemsSection basePath={basePath} sectionLabel="Operational Insights On Workflow Execution" itemLabel="Insight" />,
  ps: ({ basePath = 'oPS' }) => <ProofStripSection basePath={basePath} sectionLabel="Proof Strip" showBadge={false} />,
  faq: ({ basePath = 'oFAQ' }) => <FaqSection basePath={basePath} sectionLabel="FAQ" itemsLabel="FAQ Items" />,
  rsc: ({ basePath = 'oRSC' }) => <RelevantServicesCarouselSection basePath={basePath} sectionLabel="Relevant Services Carousel" cardsLabel="Service Cards" />,
  cb: ({ basePath = 'oCB' }) => <CareerBannerSection basePath={basePath} sectionLabel="Career Banner" />
}

export default function ProductDetailStaticComponent({ basePath, component }) {
  const componentType = component?.eType || component?.iId?.eType
  const Component = componentMap?.[componentType]

  if (!Component) return component?.sComponentTitle || component?.iId?.sComponentTitle || componentType || null

  return <Component basePath={basePath} component={component} />
}

ProductDetailStaticComponent.propTypes = {
  basePath: PropTypes.string,
  component: PropTypes.object
}
