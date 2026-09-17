import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'
import CommonInput from 'shared/components/common-input'
import TinyEditor from 'shared/components/editor'
import { getNestedObject } from 'shared/utils'

function Faq({ basePath, faqName = 'oFaq' }) {
  const {
    control,
    register,
    formState: { errors }
  } = useFormContext()
  const fieldName = basePath || faqName
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${fieldName}.aFaq`
  })

  useEffect(() => {
    if (fields.length === 0) {
      append('')
    }
  }, [fields])

  const result = getNestedObject(errors, fieldName)

  return (
    <Row className="gutter-9">
      <Col xs={12}>
        <Form.Label className="text-uppercase">F&Q Section</Form.Label>
      </Col>
      <CommonInput
        type="text"
        register={register}
        label="Component Title"
        name={`${fieldName}.sTitle`}
        error={errors}
        className={result?.sTitle && 'error'}
      />
      <CommonInput
        type="text"
        register={register}
        label="Component Description"
        name={`${fieldName}.sDescription`}
        error={errors}
        className={result?.sDescription && 'error'}
      />
      {fields.map((field, index) => (
        <div key={field.id}>
          {/* <Col sm="12" > */}
          <Form.Group className="form-group">
            {/* <InputGroup> */}
            <Form.Control
              type={'text'}
              className={result?.aFaq?.[index]?.sQuestion && 'error'}
              {...register(`${fieldName}.aFaq[${index}].sQuestion`)}
              placeholder="Type a Question"
            />
            {result?.aFaq?.[index]?.sQuestion && <Form.Control.Feedback type="invalid">{result?.aFaq?.[`${index}`]?.sQuestion?.message}</Form.Control.Feedback>}
            {/* <Form.Control
                type={''}
                className={errors?.faqName?.aFaq?.[index]?.sAnswer && 'error'}
                {...register(`${faqName}.aFaq[${index}].sAnswer`)}
                placeholder="Type a Answer"
              /> */}
            <div className='mt-3'>
              <TinyEditor className={`form-control ${result?.aFaq?.[index]?.sAnswer && 'error'}`} name={`${fieldName}.aFaq[${index}].sAnswer`} control={control} onlyTextFormatting minHeight={300} />
            </div>
            {result?.aFaq?.[index]?.sAnswer && <Form.Control.Feedback type="invalid">{result?.aFaq?.[`${index}`]?.sAnswer?.message}</Form.Control.Feedback>}
            {fields?.length > 1 && (
              <Button onClick={() => remove(index)} variant="link" className="icon-right">
                <i className="icon-delete"></i>
              </Button>
            )}
            {/* </InputGroup> */}
          </Form.Group>
          {/* </Col> */}
        </div>
      ))}
      <Col xs={12}>
        <Button onClick={() => append('')} variant="link" className="square add-media hover-none btn-sm">
          <i className="icon-add" />
          Add More
        </Button>
      </Col>
    </Row>
  )
}
Faq.propTypes = {
  basePath: PropTypes.string,
  faqName: PropTypes.string
}
export default Faq
