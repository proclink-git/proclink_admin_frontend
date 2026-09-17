import React from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import { getDefaultServiceVisualCard } from './utils'
import useEnsureFieldArrayDefault from '../use-ensure-field-array-default'
import ImageDimensionNote from 'shared/components/image-dimension-note'

export default function ServiceVisualCardsSection({ basePath = 'oSVC' }) {
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
  useEnsureFieldArrayDefault({ fields, append, getValues, name: fieldArrayName, getDefaultValue: getDefaultServiceVisualCard })

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">Service Visual Cards</Form.Label>

      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <>
              {index + 1 === fields.length && (
                <Button type="button" onClick={() => append(getDefaultServiceVisualCard())} variant="link" size="sm" className="square icon-btn">
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

          <CountInput type="text" currentLength={values?.aCard?.[index]?.sTag?.length} register={register(`${basePath}.aCard[${index}].sTag`)} error={errors} name={`${basePath}.aCard[${index}].sTag`} label="Tag" />
          <CountInput type="text" currentLength={values?.aCard?.[index]?.sTitle?.length} register={register(`${basePath}.aCard[${index}].sTitle`)} error={errors} name={`${basePath}.aCard[${index}].sTitle`} label="Title" />
          <CountInput textarea rows={5} currentLength={values?.aCard?.[index]?.sDescription?.length} register={register(`${basePath}.aCard[${index}].sDescription`)} error={errors} name={`${basePath}.aCard[${index}].sDescription`} label="Description" />

          <Row>
            <Col md="4" className="add-article">
              <ImageDimensionNote width={948} height={350} subject="top image" />
              <CategoryPlayerTeamImage
                galleryType="pb"
                title="Top Image"
                name={`${basePath}.aCard[${index}].oImgTop`}
                register={register}
                setValue={setValue}
                values={getValues()}
                errors={errors}
                clearErrors={clearErrors}
                hideAttribution
              />
            </Col>
            <Col md="4" className="add-article">
              <ImageDimensionNote width={474} height={350} subject="bottom left image" />
              <CategoryPlayerTeamImage
                galleryType="pb"
                title="Bottom Left Image"
                name={`${basePath}.aCard[${index}].oImgBottomLeft`}
                register={register}
                setValue={setValue}
                values={getValues()}
                errors={errors}
                clearErrors={clearErrors}
                hideAttribution
              />
            </Col>
            <Col md="4" className="add-article">
              <ImageDimensionNote width={474} height={350} subject="bottom right image" />
              <CategoryPlayerTeamImage
                galleryType="pb"
                title="Bottom Right Image"
                name={`${basePath}.aCard[${index}].oImgBottomRight`}
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

ServiceVisualCardsSection.propTypes = {
  basePath: PropTypes.string
}
