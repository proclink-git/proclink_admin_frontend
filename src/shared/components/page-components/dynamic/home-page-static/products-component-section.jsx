import React from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import TitleFormatHint from 'shared/components/title-format-hint'
import { getDefaultProductCard } from './utils'
import useEnsureFieldArrayDefault from '../use-ensure-field-array-default'
import ImageDimensionNote from 'shared/components/image-dimension-note'

function getEmptyMedia() {
  return {
    sUrl: '',
    sText: '',
    sCaption: '',
    sAttribute: ''
  }
}

function normalizeProductMediaType(value = '') {
  if (value === 'v' || value === 'video') return 'v'
  return 'i'
}

export default function ProductsComponentSection({
  basePath = 'oHomePage.oPC',
  sectionLabel = 'Products Component',
  showSectionImage = false,
  showSectionImageTitle = false,
  showCardTitle = true,
  showCardImage = true,
  getDefaultCard = getDefaultProductCard
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
  const sectionMediaType = normalizeProductMediaType(values?.eMediaType)

  const fieldArrayName = `${basePath}.aCard`
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayName
  })
  useEnsureFieldArrayDefault({ fields, append, getValues, name: fieldArrayName, getDefaultValue: getDefaultCard })

  const sectionFields = (
    <>
      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title*" />
      <TitleFormatHint subject="title" />
      <CountInput textarea rows={6} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description*" />
      {showSectionImageTitle && (
        <CountInput type="text" currentLength={values?.sImageTitle?.length} register={register(`${basePath}.sImageTitle`)} error={errors} name={`${basePath}.sImageTitle`} label={sectionMediaType === 'v' ? 'Video Title*' : 'Image Title*'} />
      )}
    </>
  )

  function handleSectionMediaTypeChange(mediaType) {
    setValue(`${basePath}.eMediaType`, mediaType, { shouldDirty: true })
    setValue(`${basePath}.oImg`, getEmptyMedia(), { shouldDirty: true })
    clearErrors([`${basePath}.oImg`])
  }

  function handleCardMediaTypeChange(index, mediaType) {
    const cardPath = `${basePath}.aCard[${index}]`

    setValue(`${cardPath}.eMediaType`, mediaType, { shouldDirty: true })
    setValue(`${cardPath}.sMediaUrl`, '', { shouldDirty: true })
    setValue(`${cardPath}.oImg`, getEmptyMedia(), { shouldDirty: true })
    clearErrors([`${cardPath}.sMediaUrl`, `${cardPath}.oImg`])
  }

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">{sectionLabel}</Form.Label>

      {showSectionImage ? (
        <Row>
          <Col lg="8">{sectionFields}</Col>
          <Col lg="4" className="add-article">
            <Form.Group className="form-group">
              <Form.Label>Media Type</Form.Label>
              <Form.Select
                {...register(`${basePath}.eMediaType`)}
                onChange={(event) => handleSectionMediaTypeChange(event.target.value)}
              >
                <option value="i">Image</option>
                <option value="v">Video</option>
              </Form.Select>
            </Form.Group>
            <ImageDimensionNote width={1860} height={1320} subject="products component media" />
            <CategoryPlayerTeamImage
              key={`${basePath}.oImg-${sectionMediaType}`}
              galleryType="pb"
              title={sectionMediaType === 'v' ? 'Video*' : 'Image*'}
              name={`${basePath}.oImg`}
              register={register}
              setValue={setValue}
              values={getValues()}
              errors={errors}
              clearErrors={clearErrors}
              hideAttribution
              mediaType={sectionMediaType === 'v' ? 'video' : 'image'}
            />
          </Col>
        </Row>
      ) : (
        sectionFields
      )}

      {fields.map((field, index) => {
        const cardMediaType = normalizeProductMediaType(values?.aCard?.[index]?.eMediaType)

        return (
          <InputArrayBox
            key={field.id}
            className="mb-3"
            actions={
              <>
                {index + 1 === fields.length && (
                  <Button type="button" onClick={() => append(getDefaultCard())} variant="link" size="sm" className="square icon-btn">
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
            <Row>
              <Col sm={showCardImage ? '8' : '12'}>
                <CountInput type="text" currentLength={values?.aCard?.[index]?.sProductName?.length} register={register(`${basePath}.aCard[${index}].sProductName`)} error={errors} name={`${basePath}.aCard[${index}].sProductName`} label="Product Name*" />
                {showCardTitle && (
                  <CountInput type="text" currentLength={values?.aCard?.[index]?.sTitle?.length} register={register(`${basePath}.aCard[${index}].sTitle`)} error={errors} name={`${basePath}.aCard[${index}].sTitle`} label="Card Title*" />
                )}
                <CountInput textarea rows={6} currentLength={values?.aCard?.[index]?.sDescription?.length} register={register(`${basePath}.aCard[${index}].sDescription`)} error={errors} name={`${basePath}.aCard[${index}].sDescription`} label="Description*" />
                <CommonInput type="text" register={register} errors={errors} name={`${basePath}.aCard[${index}].sRedirectUrl`} label="Redirect Url" disableDefaultMaxLength />
                <input type="hidden" value="_self" {...register(`${basePath}.aCard[${index}].eTarget`)} />
                <input type="hidden" {...register(`${basePath}.aCard[${index}].sMediaUrl`)} />
              </Col>
              {showCardImage && (
                <Col sm="4" className="add-article">
                  <Form.Group className="form-group">
                    <Form.Label>Media Type</Form.Label>
                    <Form.Select
                      {...register(`${basePath}.aCard[${index}].eMediaType`)}
                      onChange={(event) => handleCardMediaTypeChange(index, event.target.value)}
                    >
                      <option value="i">Image</option>
                      <option value="v">Video</option>
                    </Form.Select>
                  </Form.Group>
                  <ImageDimensionNote width={455} height={200} subject="products component media" />
                  <CategoryPlayerTeamImage
                    key={`${basePath}.aCard[${index}].oImg-${cardMediaType}`}
                    galleryType="pb"
                    title={cardMediaType === 'v' ? 'Video*' : 'Image*'}
                    name={`${basePath}.aCard[${index}].oImg`}
                    register={register}
                    setValue={setValue}
                    urlFieldName={`${basePath}.aCard[${index}].sMediaUrl`}
                    onDelete={() => setValue(`${basePath}.aCard[${index}].sMediaUrl`, '')}
                    values={getValues()}
                    errors={errors}
                    clearErrors={clearErrors}
                    hideAttribution
                    mediaType={cardMediaType === 'v' ? 'video' : 'image'}
                  />
                </Col>
              )}
            </Row>
          </InputArrayBox>
        )
      })}
    </div>
  )
}

ProductsComponentSection.propTypes = {
  basePath: PropTypes.string,
  sectionLabel: PropTypes.string,
  showSectionImage: PropTypes.bool,
  showSectionImageTitle: PropTypes.bool,
  showCardTitle: PropTypes.bool,
  showCardImage: PropTypes.bool,
  getDefaultCard: PropTypes.func
}
