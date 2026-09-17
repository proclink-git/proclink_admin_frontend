import React from 'react'
import PropTypes from 'prop-types'
import { Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
// import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import ImageDimensionNote from 'shared/components/image-dimension-note'
import InputArrayBox from 'shared/components/input-array-box'
import TitleFormatHint from 'shared/components/title-format-hint'
import { getDefaultImage, getDefaultWhyProclinkCard } from './utils'
import useEnsureFieldArrayDefault from '../use-ensure-field-array-default'

const WHY_PROCLINK_CARD_COUNT = 4

const WHY_PROCLINK_CARD_IMAGE_DIMENSIONS = [
  { width: 701, height: 296 },
  { width: 342, height: 312 },
  { width: 264, height: 236 },
  { width: 780, height: 344 }
]

function normalizeWhyProclinkMediaType(value = '') {
  if (value === 'v' || value === 'video') return 'v'
  return 'i'
}

export default function WhyProclinkSection({ basePath = 'oHomePage.oWP' }) {
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
  const { fields, append } = useFieldArray({
    control,
    name: fieldArrayName
  })
  useEnsureFieldArrayDefault({
    fields,
    append,
    getValues,
    name: fieldArrayName,
    getDefaultValue: getDefaultWhyProclinkCard,
    minLength: WHY_PROCLINK_CARD_COUNT
  })

  function handleCardMediaTypeChange(index, mediaType) {
    const cardPath = `${basePath}.aCard[${index}]`

    setValue(`${cardPath}.eMediaType`, mediaType, { shouldDirty: true })
    setValue(`${cardPath}.sMediaUrl`, '', { shouldDirty: true })
    setValue(`${cardPath}.oImg`, getDefaultImage(), { shouldDirty: true })
    clearErrors([`${cardPath}.sMediaUrl`, `${cardPath}.oImg`])
  }

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">Why Proclink</Form.Label>

      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title*" />
      <TitleFormatHint subject="title" />
      <CountInput textarea rows={6} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description*" />

      {fields.map((field, index) => {
        const cardImageDimensions = WHY_PROCLINK_CARD_IMAGE_DIMENSIONS[index] || {}
        const cardMediaType = normalizeWhyProclinkMediaType(values?.aCard?.[index]?.eMediaType)
        const cardPath = `${basePath}.aCard[${index}]`

        return (
          <InputArrayBox key={field.id} className="mb-3">
            <Form.Label>Card {index + 1}</Form.Label>
            <Row>
              <Col sm="8">
                <CountInput type="text" currentLength={values?.aCard?.[index]?.sTitle?.length} register={register(`${cardPath}.sTitle`)} error={errors} name={`${cardPath}.sTitle`} label="Card Title*" />
                <CountInput textarea rows={6} currentLength={values?.aCard?.[index]?.sDescription?.length} register={register(`${cardPath}.sDescription`)} error={errors} name={`${cardPath}.sDescription`} label="Description*" />
                {/* <CommonInput type="text" register={register} errors={errors} name={`${cardPath}.sRedirectUrl`} label="Redirect Url" disableDefaultMaxLength /> */}
                <input type="hidden" value="_self" {...register(`${cardPath}.eTarget`)} />
                <input type="hidden" {...register(`${cardPath}.sMediaUrl`)} />
              </Col>
              <Col sm="4" className="add-article">
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
                <ImageDimensionNote
                  width={cardImageDimensions.width}
                  height={cardImageDimensions.height}
                  dimensions={cardImageDimensions.dimensions}
                  subject={`card ${index + 1} media`}
                />
                <CategoryPlayerTeamImage
                  key={`${cardPath}.oImg-${cardMediaType}`}
                  galleryType="pb"
                  title={cardMediaType === 'v' ? 'Video*' : 'Image*'}
                  name={`${cardPath}.oImg`}
                  register={register}
                  setValue={setValue}
                  urlFieldName={`${cardPath}.sMediaUrl`}
                  onDelete={() => setValue(`${cardPath}.sMediaUrl`, '')}
                  values={getValues()}
                  errors={errors}
                  clearErrors={clearErrors}
                  hideAttribution
                  mediaType={cardMediaType === 'v' ? 'video' : 'image'}
                />
              </Col>
            </Row>
          </InputArrayBox>
        )
      })}
    </div>
  )
}

WhyProclinkSection.propTypes = {
  basePath: PropTypes.string
}
