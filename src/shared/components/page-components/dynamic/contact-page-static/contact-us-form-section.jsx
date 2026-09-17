import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import Select from 'react-select'

import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import TitleFormatHint from 'shared/components/title-format-hint'
import { EMAIL, URL_REGEX } from 'shared/constants'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { getNestedObject } from 'shared/utils'

const CONTACT_SOCIAL_LINK_TYPES = [
  { value: 'i', label: 'Instagram' },
  { value: 'f', label: 'Facebook' },
  { value: 't', label: 'Twitter / X' },
  { value: 'l', label: 'LinkedIn' },
  { value: 'y', label: 'YouTube' }
]

function getContactSocialOptions(items = [], currentIndex) {
  const selectedTypes = items.map((item, index) => (index === currentIndex ? null : item?.eType)).filter(Boolean)

  return CONTACT_SOCIAL_LINK_TYPES.map((option) => ({
    ...option,
    isDisabled: selectedTypes.includes(option.value)
  }))
}

export function getDefaultContactSocialLink() {
  return {
    eType: '',
    sUrl: ''
  }
}

export function getDefaultContactField() {
  return {
    sLabel: '',
    sPlaceholder: '',
    bRequired: false
  }
}

export default function ContactUsFormSection({ basePath = 'oContactUsPage.oCUF', sectionLabel = 'Contact Us Form' }) {
  const {
    register,
    control,
    watch,
    formState: { errors }
  } = useFormContext()

  const values = watch(basePath) || {}
  const socialValues = watch(`${basePath}.aSocialLinks`) || []

  const {
    fields: socialFields,
    append: appendSocial,
    remove: removeSocial
  } = useFieldArray({
    control,
    name: `${basePath}.aSocialLinks`
  })

  const {
    fields: dropdownFields,
    append: appendDropdown,
    remove: removeDropdown
  } = useFieldArray({
    control,
    name: `${basePath}.aDropdownOptions`
  })

  const {
    fields: formFields,
    append: appendFormField
  } = useFieldArray({
    control,
    name: `${basePath}.aField`
  })

  useEffect(() => {
    if (!formFields.length) appendFormField(getDefaultContactField())
  }, [appendFormField, formFields.length])

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">{sectionLabel}</Form.Label>

      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title*" />
      <TitleFormatHint subject="title" />
      <CountInput textarea rows={6} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description*" />

      <Row>
        <Col md="6">
          <CommonInput type="text" register={register} errors={errors} name={`${basePath}.sPhoneNumber`} label="Phone Number" disableDefaultMaxLength />
        </Col>
        <Col md="6">
          <CommonInput
            type="text"
            register={register}
            errors={errors}
            name={`${basePath}.sEmail`}
            label="Email"
            validation={{ pattern: { value: EMAIL, message: validationErrors.email } }}
            disableDefaultMaxLength
          />
        </Col>
      </Row>

      <Form.Label className="text-uppercase small text-muted mb-2">Discussion Dropdown</Form.Label>
      <CommonInput type="text" register={register} errors={errors} name={`${basePath}.sDropdownLabel`} label="Dropdown Label" disableDefaultMaxLength />
      {dropdownFields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <>
              {index + 1 === dropdownFields.length && (
                <Button type="button" onClick={() => appendDropdown('')} variant="link" size="sm" className="square icon-btn">
                  <i className="icon-add d-block" />
                </Button>
              )}
              {dropdownFields.length > 1 && (
                <Button type="button" onClick={() => removeDropdown(index)} variant="link" size="sm" className="square icon-btn">
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
            name={`${basePath}.aDropdownOptions[${index}]`}
            label={`Option ${index + 1}`}
            disableDefaultMaxLength
          />
        </InputArrayBox>
      ))}
      {dropdownFields.length === 0 && (
        <Button type="button" onClick={() => appendDropdown('')} variant="outline-primary" size="sm" className="mb-3">
          Add Option
        </Button>
      )}

      {/* <Form.Label className="text-uppercase small text-muted mb-2">Form Fields</Form.Label>
      {formFields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <>
              {index + 1 === formFields.length && (
                <Button type="button" onClick={() => appendFormField(getDefaultContactField())} variant="link" size="sm" className="square icon-btn">
                  <i className="icon-add d-block" />
                </Button>
              )}
              {formFields.length > 1 && (
                <Button type="button" onClick={() => removeFormField(index)} variant="link" size="sm" className="square icon-btn">
                  <i className="icon-delete d-block" />
                </Button>
              )}
            </>
          }
        >
          <Form.Label>Field {index + 1}</Form.Label>
          <Row>
            <Col md="6">
              <CommonInput type="text" register={register} errors={errors} name={`${basePath}.aField[${index}].sLabel`} label="Label" disableDefaultMaxLength />
            </Col>
            <Col md="6">
              <CommonInput
                type="text"
                register={register}
                errors={errors}
                name={`${basePath}.aField[${index}].sPlaceholder`}
                label="Placeholder"
                disableDefaultMaxLength
              />
            </Col>
          </Row>
          <Form.Group className="form-group mb-0">
            <Form.Check type="switch" className="required-field-switch" label="Required" {...register(`${basePath}.aField[${index}].bRequired`)} />
          </Form.Group>
        </InputArrayBox>
      ))}
      {formFields.length === 0 && (
        <Button type="button" onClick={() => appendFormField(getDefaultContactField())} variant="outline-primary" size="sm" className="mb-3">
          Add Field
        </Button>
      )} */}

      <Form.Label className="text-uppercase small text-muted mb-2">Social Links</Form.Label>
      <div className="d-flex justify-content-end mb-2">
        <Button
          type="button"
          onClick={() => appendSocial(getDefaultContactSocialLink())}
          variant="link"
          className="square add-media hover-none"
          disabled={socialValues.some((item) => !item?.eType || !item?.sUrl)}
        >
          <i className="icon-add" />
          Add Social Link
        </Button>
      </div>
      {socialFields.length === 0 && (
        <Button type="button" onClick={() => appendSocial(getDefaultContactSocialLink())} variant="outline-primary" size="sm" className="mb-3">
          Add Social Link
        </Button>
      )}
      {socialFields.map((field, index) => {
        const typeError = getNestedObject(errors, `${basePath}.aSocialLinks[${index}].eType`)

        return (
          <InputArrayBox
            key={field.id}
            className="mb-3"
            actions={
              <Button type="button" onClick={() => removeSocial(index)} variant="link" size="sm" className="square icon-btn">
                <i className="icon-delete d-block" />
              </Button>
            }
          >
            <Row>
              <Col md="5">
                <Form.Group className="form-group">
                  <Form.Label>Social Type*</Form.Label>
                  <i className="icon-chevron-down"></i>
                  <Controller
                    name={`${basePath}.aSocialLinks[${index}].eType`}
                    control={control}
                    rules={{ required: validationErrors.required }}
                    render={({ field: { onChange, value, ref } }) => (
                      <Select
                        ref={ref}
                        value={CONTACT_SOCIAL_LINK_TYPES.find((option) => option.value === value) || null}
                        options={getContactSocialOptions(socialValues, index)}
                        className={`react-select ${typeError ? 'error' : ''}`}
                        classNamePrefix="select"
                        isSearchable={false}
                        onChange={(selectedOption) => onChange(selectedOption?.value || '')}
                      />
                    )}
                  />
                  {typeError && <Form.Control.Feedback type="invalid">{typeError.message}</Form.Control.Feedback>}
                </Form.Group>
              </Col>
              <Col md="7">
                <CommonInput
                  type="text"
                  register={register}
                  errors={errors}
                  name={`${basePath}.aSocialLinks[${index}].sUrl`}
                  label="URL"
                  required
                  validation={{ pattern: { value: URL_REGEX, message: validationErrors.url } }}
                  disableDefaultMaxLength
                />
              </Col>
            </Row>
          </InputArrayBox>
        )
      })}

      <Form.Label className="text-uppercase small text-muted mb-2">CTA</Form.Label>
      <Row>
        <Col md="6">
          <CommonInput type="text" register={register} errors={errors} name={`${basePath}.oCta.sLabel`} label="Button Label" disableDefaultMaxLength />
        </Col>
        <Col md="6">
          <CommonInput type="text" register={register} errors={errors} name={`${basePath}.oCta.sUrl`} label="Button Link" disableDefaultMaxLength />
        </Col>
      </Row>
    </div>
  )
}

ContactUsFormSection.propTypes = {
  basePath: PropTypes.string,
  sectionLabel: PropTypes.string
}
