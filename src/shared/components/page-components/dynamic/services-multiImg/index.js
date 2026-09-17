import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button, Col, Form, Row } from 'react-bootstrap'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'

export default function ServicesMultiImg({ basePath = 'oMultiImageDescription' }) {
  const {
    control,
    register,
    formState: { errors },
    getValues,
    setValue,
    clearErrors
  } = useFormContext()

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${basePath}.aSliderImg`
  })

  useEffect(() => {
    fields?.length === 0 && append(getDefaultValues())
  }, [fields])

  function getDefaultValues() {
    return { sDescription: '', sTitle: '', oImg: '' }
  }
  return (
    <Row className="gutter-9">
      <Col xs={12}>
        <Form.Label className="text-uppercase">Services Multi Image</Form.Label>
        <CountInput
          type="text"
          register={register(`${basePath}.sTitle`)}
          error={errors}
          name={`${basePath}.sTitle`}
          label="H3"
        />
        <CountInput
          type="textarea"
          textarea
          register={register(`${basePath}.sDescription`)}
          error={errors}
          name={`${basePath}.sDescription`}
          label="Description"
        />
      </Col>
      {fields.map((field, index) => (
        <Col sm={6} key={field.id} className={`add-article ${index > 1 ? 'mt-3' : ''}`}>
          <InputArrayBox
            actions={
              <>
                {index + 1 === fields.length && (
                  <Button onClick={() => append(getDefaultValues())} variant="link" size="sm" className="square icon-btn">
                    <i className="icon-add d-block" />
                  </Button>
                )}
                {fields.length > 1 && (
                  <Button onClick={() => remove(index)} variant="link" size="sm" className="square icon-btn">
                    <i className="icon-delete d-block" />
                  </Button>
                )}
              </>
            }
          >
            <CountInput
              type="text"
              register={register(`${basePath}.aSliderImg.[${index}].sTitle`)}
              error={errors}
              name={`${basePath}.aSliderImg.[${index}].sTitle`}
              label="Title"
            />
            <CountInput
              type="text"
              register={register(`${basePath}.aSliderImg.[${index}].sDescription`)}
              textarea
              error={errors}
              name={`${basePath}.aSliderImg.[${index}].sDescription`}
              label="Description"
            />
            <CategoryPlayerTeamImage
              galleryType="smic"
              title={'Image'}
              name={`${basePath}.aSliderImg.[${index}].oImg`}
              register={register}
              setValue={setValue}
              // onDelete={console.log}
              values={getValues()}
              errors={errors}
              clearErrors={clearErrors}
              // imgUrl={reset}
              hideCaption
              hideAttribution
            />
          </InputArrayBox>
        </Col>
      ))}
    </Row>
  )
}

ServicesMultiImg.propTypes = {
  basePath: PropTypes.string
}
