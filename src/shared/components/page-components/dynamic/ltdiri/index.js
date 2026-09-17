/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import CountInput from 'shared/components/count-input'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { validationErrors } from 'shared/constants/ValidationErrors'
import TinyEditor from 'shared/components/editor'
import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import InputArrayBox from 'shared/components/input-array-box'
import IconRow from './iconRow'
import { FormattedMessage } from 'react-intl'
import { getNestedObject } from 'shared/utils'

// ltdiri = 'Left Title Description Right Image'
function LTDiri({ basePath, ltdiriName = 'oLtdiri' }) {
  const {
    register,
    formState: { errors },
    getValues,
    control,
    setValue,
    clearErrors
  } = useFormContext()

  const fieldName = basePath || ltdiriName
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${fieldName}.aIconData`
  })
  useEffect(() => {
    fields.length === 0 && append(getFormValue())
  }, [fields])

  //   const values = getValues()

  function getFormValue() {
    return { sTitle: '', oIcon: {} }
  }

  const result = getNestedObject(errors, fieldName)
  const values = getNestedObject(getValues(), fieldName)

  return (
        <>
            <Row className="gutter-9">
                <Col xs={12}>
                    <Form.Label className="text-uppercase">LTDIRI Section</Form.Label>
                </Col>
                <Col sm={8}>
                    <CountInput
                        name={`${fieldName}.sTitle`}
                        label="Title"
                        count={4}
                        error={errors}register={register(`${fieldName}.sTitle`)}
                    />
                    <Form.Group className="form-group">
                        <Form.Label>
                            <FormattedMessage id="content" />
                        </Form.Label>
                        <TinyEditor className={'form-control'} name={`${fieldName}.sDescription`} control={control} onlyTextFormatting minHeight={500} />
                        {(result?.sDescription) && <Form.Control.Feedback type="invalid">{result.sDescription.message}</Form.Control.Feedback>}
                    </Form.Group>
                </Col>
                <Col sm={4} className="add-article">
                    <CategoryPlayerTeamImage
                        galleryType="ltdiri"
                        name={`${fieldName}.oImg`}
                        register={register}
                        setValue={setValue}
                        values={getValues()}
                        errors={errors}
                        clearErrors={clearErrors}
                        hideCaption
                        hideAttribution
                    />
                </Col>
            </Row>
            <Row className="gutter-9 mt-4">
                {fields.map((field, index) => (
                    <Col key={field.id} sm="4" className={`add-article ${index > 3 ? 'mt-2' : ''}`}>
                        <InputArrayBox
                            key={field.id}
                            actions={
                                <>
                                    {index + 1 === fields.length && (
                                        <Button onClick={() => append(getFormValue())} variant="link" size="sm" className="square icon-btn">
                                            <i className="icon-add d-block" />
                                        </Button>
                                    )}
                                    {fields.length > 1 && (
                                        <Button onClick={() => remove(index)} variant="link" size="sm" className="square icon-btn">
                                            <i className="icon-delete d-block" />
                                        </Button>
                                    )}
                                </>
                            }>
                            <IconRow index={index} ltdiriName={fieldName} />
                        </InputArrayBox>
                    </Col>
                ))}
            </Row>
        </>
  )
}

LTDiri.propTypes = {
  basePath: PropTypes.string,
  ltdiriName: PropTypes.string
}

export default LTDiri
