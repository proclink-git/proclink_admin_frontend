import React from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import TitleFormatHint from 'shared/components/title-format-hint'
import { getDefaultServiceImpactLine } from './utils'
import useEnsureFieldArrayDefault from '../use-ensure-field-array-default'

export default function ServiceImpactLinesSection({ basePath = 'oSIP' }) {
  const {
    register,
    control,
    watch,
    getValues,
    formState: { errors }
  } = useFormContext()

  const values = watch(basePath) || {}

  const fieldArrayName = `${basePath}.aLine`
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayName
  })
  useEnsureFieldArrayDefault({ fields, append, getValues, name: fieldArrayName, getDefaultValue: getDefaultServiceImpactLine })

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">Service Impact Points</Form.Label>

      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <TitleFormatHint subject="title" />
      <CountInput textarea rows={6} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description" />

      <Form.Label className="text-uppercase small text-muted mb-2">Lines</Form.Label>

      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <>
              {index + 1 === fields.length && (
                <Button type="button" onClick={() => append(getDefaultServiceImpactLine())} variant="link" size="sm" className="square icon-btn">
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
          <Form.Label>Line {index + 1}</Form.Label>
          <CommonInput type="text" register={register} errors={errors} name={`${basePath}.aLine[${index}].sValue`} label="Value" disableDefaultMaxLength />
          <CommonInput type="text" register={register} errors={errors} name={`${basePath}.aLine[${index}].sLabel`} label="Label" disableDefaultMaxLength />
          <CountInput textarea rows={5} currentLength={values?.aLine?.[index]?.sDescription?.length} register={register(`${basePath}.aLine[${index}].sDescription`)} error={errors} name={`${basePath}.aLine[${index}].sDescription`} label="Description" />
        </InputArrayBox>
      ))}
    </div>
  )
}

ServiceImpactLinesSection.propTypes = {
  basePath: PropTypes.string
}
