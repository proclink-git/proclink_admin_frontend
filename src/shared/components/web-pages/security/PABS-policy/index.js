import React from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'
import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CommonInput from 'shared/components/common-input'
import InputArrayBox from 'shared/components/input-array-box'
import { validationErrors } from 'shared/constants/ValidationErrors'

export const PABSPolicyFields = {
  sTitle: '',
  sDescription: ''
}

export default function PABSPolicy() {
  const {
    register,
    formState: { errors },
    control,
    setValue,
    getValues,
    clearErrors
  } = useFormContext()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'oSecurity.oPABSPolicy.aData'
  })
  return (
    <InputArrayBox className="me-0">
      <Row>
        <Col sm="8">
          <CommonInput
            type="text"
            register={register}
            errors={errors}
            className={errors?.oSecurity?.oPABSPolicy?.sTitle && 'error'}
            validation={{ maxLength: { value: 100, message: validationErrors.maxLength(100) } }}
            name="oSecurity.oPABSPolicy.sTitle"
            label="Section Title"
            required
          />
        </Col>
        <Col sm="4" className="add-article">
          <CategoryPlayerTeamImage
            galleryType="pi2"
            name={'oSecurity.oPABSPolicy.oImg'}
            register={register}
            setValue={setValue}
            values={getValues()}
            errors={errors}
            clearErrors={clearErrors}
            hideCaption
            hideAttribution
            required
          />
        </Col>
      </Row>
      {fields.map((item, index) => (
        <InputArrayBox
          key={item.id}
          actions={
            <>
              {index + 1 === fields.length && (
                <Button onClick={() => append(PABSPolicyFields)} variant="link" size="sm" className="square icon-btn">
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
          <CommonInput
            type="text"
            register={register}
            errors={errors}
            className={errors?.oSecurity?.oPABSPolicy?.aData?.[index]?.sTitle && 'error'}
            validation={{ maxLength: { value: 100, message: validationErrors.maxLength(100) } }}
            name={`oSecurity.oPABSPolicy.aData[${index}].sTitle`}
            label="Title"
            required
          />
          <CommonInput
            type="textarea"
            register={register}
            errors={errors}
            className={errors?.oSecurity?.oPABSPolicy?.aData?.[index]?.sDescription && 'error'}
            validation={{ maxLength: { value: 900, message: validationErrors.maxLength(900) } }}
            name={`oSecurity.oPABSPolicy.aData.[${index}].sDescription`}
            label="Description"
            displayClass='mb-0'
            required
          />
        </InputArrayBox>
      ))}
    </InputArrayBox>
  )
}
