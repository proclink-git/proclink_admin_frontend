import React, { useEffect } from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CommonInput from 'shared/components/common-input'
import InputArrayBox from 'shared/components/input-array-box'
import { validationErrors } from 'shared/constants/ValidationErrors'
import SurveyAnswer from './answer'

export default function SurveyPopup() {
  const {
    register,
    formState: { errors },
    setValue,
    clearErrors,
    getValues,
    control
  } = useFormContext()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'oSurveyPopup.aQuestion'
  })

  useEffect(() => {
    if (fields.length === 0) append({ sQuestion: null })
  }, [fields])

  return (
    <Row>
      <Col sm={8}>
        {fields.map((item, index) => (
          <InputArrayBox
            key={item.id}
            className="mb-3"
            actions={
              <>
                {index + 1 === fields.length && (
                  <Button onClick={() => append({ sQuestion: null })} variant="link" className="square icon-btn">
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
            <CommonInput
              type="text"
              register={register}
              errors={errors}
              className={errors?.oSurveyPopup?.aQuestion?.[index]?.sQuestion && 'error'}
              name={`oSurveyPopup.aQuestion[${index}].sQuestion`}
              label="Question"
              placeholder={`Question ${index + 1}`}
              required
              validation={{ maxLength: { value: 300, message: validationErrors.maxLength(300) } }}
            />
            <SurveyAnswer pIndex={index} />
          </InputArrayBox>
        ))}
        <CommonInput
          type="text"
          register={register}
          errors={errors}
          className={errors?.oSurveyPopup?.sCTAText && 'error'}
          name="oSurveyPopup.sCTAText"
          label="Button Text"
          placeholder="Submit"
          validation={{ maxLength: { value: 25, message: validationErrors.maxLength(25) } }}
          required
        />
      </Col>
      <Col sm={4} className="add-article">
        <CategoryPlayerTeamImage
          galleryType="sp"
          title="Image"
          name="oBannerImage"
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
  )
}
