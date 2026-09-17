import React, { forwardRef } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import DatePicker from 'react-datepicker'
import PropTypes from 'prop-types'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { getDefaultUpcomingWebinarCard } from './utils'
import { dateCheck, getNestedObject } from 'shared/utils'
import useEnsureFieldArrayDefault from '../use-ensure-field-array-default'
import ImageDimensionNote from 'shared/components/image-dimension-note'

export default function UpcomingWebinarsSection({ basePath = 'oUWB' }) {
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
  const fieldArrayName = `${basePath}.aCard`
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayName
  })
  useEnsureFieldArrayDefault({ fields, append, getValues, name: fieldArrayName, getDefaultValue: getDefaultUpcomingWebinarCard })

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">Upcoming Webinars</Form.Label>
      <CountInput
        type="text"
        currentLength={values?.sSectionTitle?.length}
        register={register(`${basePath}.sSectionTitle`)}
        error={errors}
        name={`${basePath}.sSectionTitle`}
        label="Section Title"
      />

      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <>
              {index + 1 === fields.length && (
                <Button type="button" onClick={() => append(getDefaultUpcomingWebinarCard())} variant="link" size="sm" className="square icon-btn">
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
          <Form.Label>Webinar {index + 1}</Form.Label>
          <Row>
            <Col lg="8">
              <CountInput
                type="text"
                currentLength={values?.aCard?.[index]?.sTitle?.length}
                register={register(`${basePath}.aCard[${index}].sTitle`)}
                error={errors}
                name={`${basePath}.aCard[${index}].sTitle`}
                label="Title"
              />
              <CountInput
                type="text"
                currentLength={values?.aCard?.[index]?.sTag?.length}
                register={register(`${basePath}.aCard[${index}].sTag`)}
                error={errors}
                name={`${basePath}.aCard[${index}].sTag`}
                label="Tag"
              />
              <Row>
                <Col md="6">
                  <CountInput
                    type="text"
                    currentLength={values?.aCard?.[index]?.sAuthorName?.length}
                    register={register(`${basePath}.aCard[${index}].sAuthorName`)}
                    error={errors}
                    name={`${basePath}.aCard[${index}].sAuthorName`}
                    label="Author Name"
                  />
                </Col>
                <Col md="6">
                  <CountInput
                    type="text"
                    currentLength={values?.aCard?.[index]?.sAuthorDesignation?.length}
                    register={register(`${basePath}.aCard[${index}].sAuthorDesignation`)}
                    error={errors}
                    name={`${basePath}.aCard[${index}].sAuthorDesignation`}
                    label="Author Designation"
                  />
                </Col>
              </Row>
              <CommonInput
                type="text"
                register={register}
                errors={errors}
                name={`${basePath}.aCard[${index}].sRedirectionUrl`}
                label="Redirection Url"
                disableDefaultMaxLength
              />
              <Row>
                <Col md="6">
                  <Form.Group className="form-group">
                    <Form.Label className="d-block">Date Time*</Form.Label>
                    <Controller
                      name={`${basePath}.aCard[${index}].dDateTimeDisplay`}
                      control={control}
                      rules={{ required: validationErrors.required }}
                      render={({ field: { onChange, onBlur, value, name, ref } }) => (
                        <DatePicker
                          name={name}
                          selected={value ? dateCheck(value) : null}
                          className="form-control"
                          dateFormat="yyyy-MM-dd HH:mm"
                          showTimeSelect
                          timeIntervals={15}
                          withPortal
                          placeholderText="Select date and time"
                          onBlur={onBlur}
                          onChange={(date) => onChange(date ? date.toISOString() : '')}
                          customInput={<DateTimeInput error={getNestedObject(errors, `${basePath}.aCard[${index}].dDateTimeDisplay`)} inputRef={ref} />}
                        />
                      )}
                    />
                    {getNestedObject(errors, `${basePath}.aCard[${index}].dDateTimeDisplay`) && (
                      <Form.Control.Feedback type="invalid">
                        {getNestedObject(errors, `${basePath}.aCard[${index}].dDateTimeDisplay`)?.message}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </Col>
            <Col lg="4" className="add-article">\
            <ImageDimensionNote width={518} height={280} subject="card image" />
              <CategoryPlayerTeamImage
                galleryType="pb"
                title="Card Image"
                name={`${basePath}.aCard[${index}].oImg`}
                register={register}
                setValue={setValue}
                values={getValues()}
                errors={errors}
                clearErrors={clearErrors}
                hideAttribution
              />
              <ImageDimensionNote width={40} height={40} subject="author image" />
              <CategoryPlayerTeamImage
                galleryType="pb"
                title="Author Image"
                name={`${basePath}.aCard[${index}].oAuthorImg`}
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

UpcomingWebinarsSection.propTypes = {
  basePath: PropTypes.string
}

const DateTimeInput = forwardRef(({ className, error, inputRef, ...props }, datePickerRef) => {
  function setInputRef(element) {
    if (typeof datePickerRef === 'function') datePickerRef(element)
    else if (datePickerRef) datePickerRef.current = element

    if (typeof inputRef === 'function') inputRef(element)
    else if (inputRef) inputRef.current = element
  }

  return <Form.Control {...props} ref={setInputRef} type="text" className={`${className || ''} ${error ? 'error' : ''}`} />
})

DateTimeInput.displayName = 'DateTimeInput'

DateTimeInput.propTypes = {
  className: PropTypes.string,
  error: PropTypes.object,
  inputRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object])
}
