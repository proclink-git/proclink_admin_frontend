import React from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import TitleFormatHint from 'shared/components/title-format-hint'
import { getDefaultTestimonial } from './utils'
import useEnsureFieldArrayDefault from '../use-ensure-field-array-default'
import ImageDimensionNote from 'shared/components/image-dimension-note'

export default function TestimonialsSection({ basePath = 'oHomePage.oTS', sectionLabel = 'Testimonials' }) {
  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    clearErrors,
    formState: { errors }
  } = useFormContext()

  const values = watch(basePath) || {}

  const fieldArrayName = `${basePath}.aTestimonial`
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayName
  })
  useEnsureFieldArrayDefault({ fields, append, getValues, name: fieldArrayName, getDefaultValue: getDefaultTestimonial })

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">{sectionLabel}</Form.Label>

      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title*" />
      <TitleFormatHint subject="title" />
      <CountInput textarea rows={6} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description*" />

      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <>
              {index + 1 === fields.length && (
                <Button type="button" onClick={() => append(getDefaultTestimonial())} variant="link" size="sm" className="square icon-btn">
                  <i className="icon-add d-block" />
                </Button>
              )}
              {fields.length > 1 && (
                <Button type="button" onClick={() => remove(index)} variant="link" size="sm" className="square icon-btn">
                  <i className="icon-delete d-block" />
                </Button>
              )}
            </>
          }
        >
          <Form.Label>Testimonial {index + 1}</Form.Label>
          <Row>
            <Col sm="8">
              <CountInput type="text" currentLength={values?.aTestimonial?.[index]?.sName?.length} register={register(`${basePath}.aTestimonial[${index}].sName`)} error={errors} name={`${basePath}.aTestimonial[${index}].sName`} label="Name*" />
              <CountInput type="text" currentLength={values?.aTestimonial?.[index]?.sRole?.length} register={register(`${basePath}.aTestimonial[${index}].sRole`)} error={errors} name={`${basePath}.aTestimonial[${index}].sRole`} label="Role*" />
              <CountInput textarea rows={6} currentLength={values?.aTestimonial?.[index]?.sQuote?.length} register={register(`${basePath}.aTestimonial[${index}].sQuote`)} error={errors} name={`${basePath}.aTestimonial[${index}].sQuote`} label="Quote*" />
            </Col>
            <Col sm="4" className="add-article">
              <ImageDimensionNote width={384} height={507} subject="testimonials image" />
              <CategoryPlayerTeamImage
                galleryType="pb"
                title="Portrait*"
                name={`${basePath}.aTestimonial[${index}].oImg`}
                register={register}
                setValue={setValue}
                values={getValues()}
                errors={errors}
                clearErrors={clearErrors}
                hideAttribution
              />
            </Col>
          </Row>
        </InputArrayBox>
      ))}
    </div>
  )
}

TestimonialsSection.propTypes = {
  basePath: PropTypes.string,
  sectionLabel: PropTypes.string
}
