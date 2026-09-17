import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import ArticleTab from 'shared/components/article-tab'
import CommonInput from 'shared/components/common-input'
import InputArrayBox from 'shared/components/input-array-box'

function getDefaultTopHighlight() {
  return {
    sLabel: '',
    sValue: ''
  }
}

export default function CaseStudyFields({ disabled = false, title = 'Case Study Details', linkName, linkLabel = 'Content Link' }) {
  const {
    control,
    register,
    formState: { errors }
  } = useFormContext()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'aTopHighlights'
  })

  useEffect(() => {
    if (!fields.length) {
      append(getDefaultTopHighlight())
    }
  }, [append, fields.length])

  return (
    <ArticleTab title={title}>
      {linkName && (
        <CommonInput
          type="text"
          register={register}
          errors={errors}
          name={linkName}
          label={linkLabel}
          disabled={disabled}
          required
          disableDefaultMaxLength
        />
      )}

      <Form.Label className="text-uppercase small text-muted mb-2">Top Highlights</Form.Label>

      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <>
              {index + 1 === fields.length && (
                <Button type="button" onClick={() => append(getDefaultTopHighlight())} variant="link" size="sm" className="square icon-btn" disabled={disabled}>
                  <i className="icon-add d-block" />
                </Button>
              )}
              {fields.length > 1 && (
                <Button type="button" onClick={() => remove(index)} variant="link" size="sm" className="square icon-btn" disabled={disabled}>
                  <i className="icon-delete d-block" />
                </Button>
              )}
            </>
          }
        >
          <Form.Label>Highlight {index + 1}</Form.Label>
          <Row>
            <Col md="6">
              <CommonInput
                type="text"
                register={register}
                errors={errors}
                name={`aTopHighlights[${index}].sLabel`}
                label="Label"
                disabled={disabled}
                disableDefaultMaxLength
              />
            </Col>
            <Col md="6">
              <CommonInput
                type="text"
                register={register}
                errors={errors}
                name={`aTopHighlights[${index}].sValue`}
                label="Value"
                disabled={disabled}
                disableDefaultMaxLength
              />
            </Col>
          </Row>
        </InputArrayBox>
      ))}
    </ArticleTab>
  )
}

CaseStudyFields.propTypes = {
  disabled: PropTypes.bool,
  title: PropTypes.string,
  linkName: PropTypes.string,
  linkLabel: PropTypes.string
}
