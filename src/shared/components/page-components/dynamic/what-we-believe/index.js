import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import TinyEditor from 'shared/components/editor'

import CountInput from 'shared/components/count-input'
import { getNestedObject } from 'shared/utils'

function WhatWeBelieve({ basePath, wwbName = 'oWWB' }) {
  const {
    control,
    register,
    formState: { errors },
    getValues,
    setValue,
    clearErrors
  } = useFormContext()
  const fieldName = basePath || wwbName
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${fieldName}.aData`
  })

  useEffect(() => {
    if (fields.length === 0) {
      append('')
    }
  }, [fields])
  const result = getNestedObject(errors, fieldName)
  const values = getNestedObject(getValues(), fieldName)
  return (
    <Row className="gutter-9">
      <Col xs={12}>
        <Form.Label className="text-uppercase">what we believe</Form.Label>
      </Col>
      <Col sm={8}>
        <CountInput
          type="text"
          register={register(`${fieldName}.sTitle`)}
          maxWord={50}
          currentLength={values?.sTitle?.length || 0}
          error={errors}
          className={result?.sTitle && 'error'}
          name={`${fieldName}.sTitle`}
          label="Title*"
        />
        {/* <CommonInput
          type="textarea"
          register={register}
          errors={errors}
          className={`form-control ${result?.sDescription && 'error'}`}
          name={`${wwbName}.sDescription`}
          label="Description"
          defaultValue=""
          required
        /> */}
        <TinyEditor name={`${fieldName}.sDescription`} control={control} onlyTextFormatting minHeight={500} />
        {result?.sDescription && <Form.Control.Feedback type="invalid">{result.sDescription.message}</Form.Control.Feedback>}
        <Row className="gutter-9 mt-3">
          <Form.Label>Data*</Form.Label>
          {fields.map((field, index) => (
            <Col sm="6" key={field.id}>
              <Form.Group className="form-group">
                <InputGroup>
                  <Form.Control
                    type={'text'}
                    className={result?.aData?.[index] && 'error'}
                    {...register(`${fieldName}.aData[${index}]`)}
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
        </Row>
        {result?.aData?.flat()?.length > 0 && (
          <Form.Control.Feedback type="invalid">{result?.aData?.flat()?.[0]?.message}</Form.Control.Feedback>
        )}
        {fields?.length < 4 && (
          <Button onClick={() => append('')} variant="link" className="square add-media hover-none btn-sm">
            <i className="icon-add" />
            Add More
          </Button>
        )}
      </Col>
      <Col sm="4" className="add-article">
        <CategoryPlayerTeamImage
          galleryType="wwbb"
          name={`${fieldName}.oBackgroundImg`}
          register={register}
          setValue={setValue}
          values={getValues()}
          errors={errors}
          clearErrors={clearErrors}
          hideAttribution
          hideCaption
        />
      </Col>
    </Row>
  )
}
WhatWeBelieve.propTypes = {
  basePath: PropTypes.string,
  wwbName: PropTypes.string
}
export default WhatWeBelieve
