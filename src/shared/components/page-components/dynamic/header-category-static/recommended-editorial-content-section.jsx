import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CountInput from 'shared/components/count-input'
import ImageDimensionNote from 'shared/components/image-dimension-note'
import InputArrayBox from 'shared/components/input-array-box'
import { getDefaultRecommendedEditorialCard } from './utils'

export default function RecommendedEditorialContentSection({ basePath = 'oREC', sectionLabel = 'Related Editorial Content' }) {
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
    if (!fields.length) append(getDefaultRecommendedEditorialCard())
  }, [append, fields.length])

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">{sectionLabel}</Form.Label>
      <CountInput
        type="text"
        currentLength={values?.sSectionTitle?.length}
        register={register(`${basePath}.sSectionTitle`)}
        error={errors}
        name={`${basePath}.sSectionTitle`}
        label="Section Title"
      />

      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <>
              {index + 1 === fields.length && (
                <Button
                  type="button"
                  onClick={() => append(getDefaultRecommendedEditorialCard())}
                  variant="link"
                  size="sm"
                  className="square icon-btn"
                >
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
            <Col lg="8">
              <CountInput
                type="text"
                currentLength={values?.aCard?.[index]?.sEyebrow?.length}
                register={register(`${basePath}.aCard[${index}].sEyebrow`)}
                error={errors}
                name={`${basePath}.aCard[${index}].sEyebrow`}
                label="Eyebrow"
              />
              <CountInput
                type="text"
                currentLength={values?.aCard?.[index]?.sTitle?.length}
                register={register(`${basePath}.aCard[${index}].sTitle`)}
                error={errors}
                name={`${basePath}.aCard[${index}].sTitle`}
                label="Title"
              />
              <CountInput
                textarea
                rows={5}
                currentLength={values?.aCard?.[index]?.sDescription?.length}
                register={register(`${basePath}.aCard[${index}].sDescription`)}
                error={errors}
                name={`${basePath}.aCard[${index}].sDescription`}
                label="Description"
              />
            </Col>
            <Col lg="4" className="add-article">
              <ImageDimensionNote width={830} height={600} subject="card image" />
              <CategoryPlayerTeamImage
                galleryType="pb"
                title="Card Image"
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

RecommendedEditorialContentSection.propTypes = {
  basePath: PropTypes.string,
  sectionLabel: PropTypes.string
}
