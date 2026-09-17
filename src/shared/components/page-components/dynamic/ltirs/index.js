/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import CountInput from 'shared/components/count-input'
import { getNestedObject } from 'shared/utils'
import PropTypes from 'prop-types'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { Button, Col, Row } from 'react-bootstrap'
import InputArrayBox from 'shared/components/input-array-box'
import LtirsRow from './row'

export default function Ltirs({ basePath, ltirsName = 'oLtirs' }) {
  const {
    register,
    formState: { errors },
    getValues,
    control
  } = useFormContext()

  const fieldName = basePath || ltirsName
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${fieldName}.aSection`
  })

  useEffect(() => {
    fields.length === 0 && append(getFormValue())
  }, [fields])

  function getFormValue() {
    return {
      sTitle: '',
      sDescription: '',
      oImg: {
        sText: '',
        sCaption: '',
        sAttribute: '',
        sUrl: ''
      }
    }
  }

  const values = getNestedObject(getValues(), fieldName)

  return (
    <>
        <CountInput
            name={`${fieldName}.sTitle`}
            label="Title"
            error={errors}
            register={register(`${fieldName}.sTitle`)}
        />
        <CountInput
            textarea
            name={`${fieldName}.sDescription`}
            label="Description"
            error={errors}
            register={register(`${fieldName}.sDescription`)}
        />
        <Row className="gutter-9 mt-4">
            {fields.map((field, index) => (
                <Col key={field.id} sm="6" className={`add-article ${index > 2 ? 'mt-2' : ''}`}>
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
                        }
                    >
                    {index + 1}
                        <LtirsRow index={index} ltirsName={fieldName} />
                    </InputArrayBox>
                </Col>
            ))}
        </Row>
    </>
  )
}

Ltirs.propTypes = {
  basePath: PropTypes.string,
  ltirsName: PropTypes.string
}
