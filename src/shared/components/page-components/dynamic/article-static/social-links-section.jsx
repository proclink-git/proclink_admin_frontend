import React from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import Select from 'react-select'

import CommonInput from 'shared/components/common-input'
import InputArrayBox from 'shared/components/input-array-box'
import { URL_REGEX } from 'shared/constants'
import { validationErrors } from 'shared/constants/ValidationErrors'

const ARTICLE_SOCIAL_LINK_TYPES = [
  { value: 'i', label: 'Instagram' },
  { value: 'f', label: 'Facebook' },
  { value: 't', label: 'Twitter / X' },
  { value: 'l', label: 'LinkedIn' },
  { value: 'y', label: 'YouTube' }
]

function getArticleSocialOptions(items = [], currentIndex) {
  const selectedTypes = items.map((item, index) => (index === currentIndex ? null : item?.eType)).filter(Boolean)

  return ARTICLE_SOCIAL_LINK_TYPES.map((option) => ({
    ...option,
    isDisabled: selectedTypes.includes(option.value)
  }))
}

export function getDefaultArticleSocialLink() {
  return {
    eType: '',
    sUrl: ''
  }
}

export default function ArticleSocialLinksSection({ basePath = 'aSocialLinks', sectionLabel = 'Social Links' }) {
  const {
    register,
    control,
    watch,
    formState: { errors }
  } = useFormContext()

  const values = watch(basePath) || []

  const { fields, append, remove } = useFieldArray({
    control,
    name: basePath
  })

  return (
    <div className="p-3 mt-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <Form.Label className="text-uppercase small text-muted mb-0">{sectionLabel}</Form.Label>
        <Button
          type="button"
          onClick={() => append(getDefaultArticleSocialLink())}
          variant="link"
          className="square add-media hover-none"
          disabled={values.some((item) => !item?.eType || !item?.sUrl)}
        >
          <i className="icon-add" />
          Add Social Link
        </Button>
      </div>

      {fields.length === 0 && (
        <Button type="button" onClick={() => append(getDefaultArticleSocialLink())} variant="outline-primary" size="sm">
          Add Social Link
        </Button>
      )}

      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            fields.length > 0 ? (
              <Button type="button" onClick={() => remove(index)} variant="link" size="sm" className="square icon-btn">
                <i className="icon-delete d-block" />
              </Button>
            ) : null
          }
        >
          <Row>
            <Col md="5">
              <Form.Group className="form-group">
                <Form.Label>Social Type*</Form.Label>
                <i className="icon-chevron-down"></i>
                <Controller
                  name={`${basePath}[${index}].eType`}
                  control={control}
                  rules={{ required: validationErrors.required }}
                  render={({ field: { onChange, value, ref } }) => (
                    <Select
                      ref={ref}
                      value={ARTICLE_SOCIAL_LINK_TYPES.find((option) => option.value === value) || null}
                      options={getArticleSocialOptions(values, index)}
                      className={`react-select ${errors?.aSocialLinks?.[index]?.eType ? 'error' : ''}`}
                      classNamePrefix="select"
                      isSearchable={false}
                      onChange={(selectedOption) => onChange(selectedOption?.value || '')}
                    />
                  )}
                />
                {errors?.aSocialLinks?.[index]?.eType && <Form.Control.Feedback type="invalid">{errors?.aSocialLinks?.[index]?.eType.message}</Form.Control.Feedback>}
              </Form.Group>
            </Col>
            <Col md="7">
              <CommonInput
                type="text"
                register={register}
                errors={errors}
                className={errors?.aSocialLinks?.[index]?.sUrl && 'error'}
                name={`${basePath}[${index}].sUrl`}
                label="URL"
                required
                validation={{ pattern: { value: URL_REGEX, message: validationErrors.url } }}
                disableDefaultMaxLength
              />
            </Col>
          </Row>
        </InputArrayBox>
      ))}
    </div>
  )
}

ArticleSocialLinksSection.propTypes = {
  basePath: PropTypes.string,
  sectionLabel: PropTypes.string
}
