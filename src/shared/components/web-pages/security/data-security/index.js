import React from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'
import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CommonInput from 'shared/components/common-input'
import InputArrayBox from 'shared/components/input-array-box'
import { validationErrors } from 'shared/constants/ValidationErrors'

export const dataSecurityFields = {
  sTitle: '',
  sDescription: ''
}

export default function DataSecurity() {
  const {
    register,
    formState: { errors },
    control,
    setValue,
    getValues
  } = useFormContext()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'oSecurity.oDataSecurity.aCard'
  })
  return (
    <InputArrayBox className="me-0">
      <CommonInput
        type="text"
        register={register}
        errors={errors}
        className={errors?.oSecurity?.oDataSecurity?.sTitle && 'error'}
        validation={{ maxLength: { value: 100, message: validationErrors.maxLength(100) } }}
        name="oSecurity.oDataSecurity.sTitle"
        label="Section Title"
        required
      />
      {fields.map((item, index) => (
        <InputArrayBox
          key={item.id}
          actions={
            <>
              {index + 1 === fields.length && (
                <Button onClick={() => append(dataSecurityFields)} variant="link" size="sm" className="square icon-btn">
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
          <Row>
            <Col sm="6">
              <CommonInput
                type="text"
                register={register}
                errors={errors}
                className={errors?.oSecurity?.oDataSecurity?.aCard?.[index]?.sTitle && 'error'}
                validation={{ maxLength: { value: 100, message: validationErrors.maxLength(100) } }}
                name={`oSecurity.oDataSecurity.aCard[${index}].sTitle`}
                label="Title"
                required
              />
              <CommonInput
                type="textarea"
                register={register}
                errors={errors}
                className={errors?.oSecurity?.oDataSecurity?.aCard?.[index]?.sDescription && 'error'}
                validation={{ maxLength: { value: 900, message: validationErrors.maxLength(900) } }}
                name={`oSecurity.oDataSecurity.aCard.[${index}].sDescription`}
                label="Description"
                required
              />
            </Col>
            <Col sm="6" className="add-article">
              <CategoryPlayerTeamImage
                galleryType="icon"
                name={`oSecurity.oDataSecurity.aCard.[${index}].oIcon`}
                register={register}
                setValue={setValue}
                values={getValues()}
                errors={errors}
                required
                hideAttribution
                hideCaption
              />
            </Col>
          </Row>
        </InputArrayBox>
      ))}
    </InputArrayBox>
  )
}
