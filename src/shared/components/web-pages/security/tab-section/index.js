import React from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CommonInput from 'shared/components/common-input'
import InputArrayBox from 'shared/components/input-array-box'
import { validationErrors } from 'shared/constants/ValidationErrors'
import TinyEditor from 'shared/components/editor'

export const tabSectionFields = {
  sTitle: '',
  sDescription: ''
}

export default function TabSection() {
  const {
    register,
    formState: { errors },
    control,
    setValue,
    getValues
  } = useFormContext()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'oSecurity.oTabSection.aTab'
  })
  return (
    <InputArrayBox className="me-0">
      <CommonInput
        type="text"
        register={register}
        errors={errors}
        className={errors?.oSecurity?.oTabSection?.sTitle && 'error'}
        validation={{ maxLength: { value: 100, message: validationErrors.maxLength(100) } }}
        name={'oSecurity.oTabSection.sTitle'}
        label="Title"
        required
      />
      {fields.map((item, index) => (
        <InputArrayBox
          key={item.id}
          actions={
            <>
              {index + 1 === fields.length && fields.length < 3 && (
                <Button onClick={() => append(tabSectionFields)} variant="link" size="sm" className="square icon-btn">
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
                className={errors?.oSecurity?.oTabSection?.aTab?.[index]?.sTitle && 'error'}
                validation={{ maxLength: { value: 100, message: validationErrors.maxLength(100) } }}
                name={`oSecurity.oTabSection.aTab.[${index}].sTitle`}
                label="Title"
                required
              />
              <TinyEditor
                className={`form-control ${errors.sContent && 'error'}`}
                name={`oSecurity.oTabSection.aTab.[${index}].sDescription`}
                control={control}
                onlyTextFormatting
                minHeight={500}
              />
            </Col>
            <Col sm="6" className="add-article">
              <CategoryPlayerTeamImage
                galleryType="sts"
                name={`oSecurity.oTabSection.aTab.[${index}].oImg`}
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
