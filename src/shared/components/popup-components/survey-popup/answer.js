import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap'
import { validationErrors } from 'shared/constants/ValidationErrors'

export default function SurveyAnswer({ pIndex }) {
  const {
    control,
    register,
    formState: { errors }
  } = useFormContext()

  const { fields, append, remove } = useFieldArray({
    control,
    name: `oSurveyPopup.aQuestion[${pIndex}].aOptions`
  })

  useEffect(() => {
    if (fields.length === 0) append('')
  }, [fields])

  return (
    <Row className="gutter-9">
      <Col xs={12}>
        <Form.Label className="text-uppercase">Options</Form.Label>
      </Col>
      {fields.map((field, index) => (
        <Col sm="4" key={field.id}>
          <Form.Group className="form-group">
            <InputGroup>
              <Form.Control
                type={'text'}
                placeholder={`Option ${index + 1}`}
                className={errors?.oSurveyPopup?.aQuestion?.[pIndex]?.aOptions?.[index] && 'error'}
                {...register(`oSurveyPopup.aQuestion[${pIndex}].aOptions[${index}]`, { required: validationErrors.required })}
              />
              {fields?.length > 1 && (
                <Button onClick={() => remove(index)} variant="link" className="icon-right">
                  <i className="icon-delete"></i>
                </Button>
              )}
            </InputGroup>
          </Form.Group>
        </Col>
      ))}
      <Col xs={12}>
        {/* {result?.flat()?.length > 0 && <Form.Control.Feedback type="invalid">{result?.flat()?.[0]?.message}</Form.Control.Feedback>} */}
        <Button onClick={() => append('')} variant="link" className="square add-media hover-none btn-sm">
          <i className="icon-add" />
          Add Option
        </Button>
      </Col>
    </Row>
  )
}
SurveyAnswer.propTypes = {
  pIndex: PropTypes.number.isRequired
}
