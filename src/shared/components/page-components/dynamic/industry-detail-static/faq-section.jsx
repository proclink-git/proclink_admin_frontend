import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CountInput from 'shared/components/count-input'
import TinyEditor from 'shared/components/editor'
import InputArrayBox from 'shared/components/input-array-box'
import TitleFormatHint from 'shared/components/title-format-hint'
import { getDefaultFaqItem } from './utils'

export default function FaqSection({
  basePath = 'oFAQ',
  sectionLabel = 'FAQ',
  itemsLabel = 'FAQ Items'
}) {
  const {
    register,
    control,
    watch,
    formState: { errors }
  } = useFormContext()

  const values = watch(basePath) || {}

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${basePath}.aFaq`
  })

  useEffect(() => {
    if (fields.length === 0) {
      append(getDefaultFaqItem())
    }
  }, [append, fields.length])

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">{sectionLabel}</Form.Label>

      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <TitleFormatHint subject="title" />
      <CountInput textarea rows={6} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description" />

      <Form.Label className="text-uppercase small text-muted mb-2">{itemsLabel}</Form.Label>

      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <>
              {index + 1 === fields.length && (
                <Button type="button" onClick={() => append(getDefaultFaqItem())} variant="link" size="sm" className="square icon-btn">
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
          <Form.Label>FAQ {index + 1}</Form.Label>
          <CountInput type="text" currentLength={values?.aFaq?.[index]?.sQuestion?.length} register={register(`${basePath}.aFaq[${index}].sQuestion`)} error={errors} name={`${basePath}.aFaq[${index}].sQuestion`} label="Question" />
          <div className="mt-3">
            <TinyEditor name={`${basePath}.aFaq[${index}].sAnswer`} control={control} onlyTextFormatting minHeight={250} />
          </div>
        </InputArrayBox>
      ))}
    </div>
  )
}

FaqSection.propTypes = {
  basePath: PropTypes.string,
  sectionLabel: PropTypes.string,
  itemsLabel: PropTypes.string
}
