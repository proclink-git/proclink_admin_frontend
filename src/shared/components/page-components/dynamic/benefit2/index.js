import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'
import CommonInput from 'shared/components/common-input'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import InputArrayBox from 'shared/components/input-array-box'

function Benefit2({ basePath, benefitName = 'aBenefit', benefitComponentTitle = 'sBenefitComponentTitle' }) {
  const {
    control,
    register,
    formState: { errors },
    setValue,
    getValues,
    clearErrors
  } = useFormContext()
  const fieldName = basePath || benefitName
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldName
  })

  useEffect(() => {
    if (fields.length === 0) {
      append('')
    }
  }, [fields])
  const keys = fieldName.split('.')
  const result = keys.reduce((obj, key) => (obj && obj[key] !== 'undefined' ? obj[key] : undefined), errors)
  return (
    <Row className="gutter-9">
      <Col xs={12}>
        <Form.Label className="text-uppercase">Benefit</Form.Label>
      </Col>
      <CommonInput
        type="text"
        register={register}
        label="Component Title"
        name={benefitComponentTitle}
        error={errors}
      />
      {fields.map((field, index) => (
        <Col sm="4" key={field.id}>
          <Form.Group className="form-group">
          <InputArrayBox
              className="mb-3"
              actions={
                <>
                  {index + 1 === fields.length && (
                    <Button onClick={() => append({ sTitle: null, oIcon: null })} variant="link" className="square icon-btn">
                      <i className="icon-add d-block" />
                    </Button>
                  )}
                  {fields.length > 1 && (
                    <Button onClick={() => remove(index)} variant="link" className="square icon-btn">
                      <i className="icon-delete d-block" />
                    </Button>
                  )}
                </>
              }
            >
              <div className="add-article">
                <CategoryPlayerTeamImage
                  galleryType="icon"
                  name={`${fieldName}.[${index}].oIcon`}
                  register={register}
                  setValue={setValue}
                  values={getValues()}
                  errors={errors}
                  clearErrors={clearErrors}
                  hideCaption
                  hideAttribution
                />
                <br />
              </div>
              <Form.Control
                type={'text'}
                className={result?.[index]?.sTitle && 'error'}
                {...register(`${fieldName}[${index}].sTitle`)}
              />
            </InputArrayBox>
          </Form.Group>
        </Col>
      ))}
      <Col xs={12}>
        {result?.flat()?.length > 0 && <Form.Control.Feedback type="invalid">{result?.flat()?.[0]?.message}</Form.Control.Feedback>}
        <Button onClick={() => append('')} variant="link" className="square add-media hover-none btn-sm">
          <i className="icon-add" />
          Add More
        </Button>
      </Col>
    </Row>
  )
}
Benefit2.propTypes = {
  basePath: PropTypes.string,
  benefitName: PropTypes.string,
  benefitComponentTitle: PropTypes.string
}
export default Benefit2
