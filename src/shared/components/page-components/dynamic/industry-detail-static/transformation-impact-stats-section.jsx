import React from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import TinyEditor from 'shared/components/editor'
import InputArrayBox from 'shared/components/input-array-box'
import TitleFormatHint from 'shared/components/title-format-hint'
import { getDefaultTransformationStat } from './utils'
import useEnsureFieldArrayDefault from '../use-ensure-field-array-default'

export default function TransformationImpactStatsSection({ basePath = 'oTIS' }) {
  const {
    register,
    control,
    watch,
    getValues,
    formState: { errors }
  } = useFormContext()

  const values = watch(basePath) || {}

  const fieldArrayName = `${basePath}.aStat`
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayName
  })
  useEnsureFieldArrayDefault({ fields, append, getValues, name: fieldArrayName, getDefaultValue: getDefaultTransformationStat })

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">Transformation Impact</Form.Label>

      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <TitleFormatHint subject="title" />
      <CountInput textarea rows={6} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description" />

      <div className="form-group">
        <Form.Label>Content</Form.Label>
        <TinyEditor name={`${basePath}.sContent`} control={control} onlyTextFormatting minHeight={260} />
      </div>

      <Form.Label className="text-uppercase small text-muted mb-2">Stats</Form.Label>

      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          className="mb-3"
          actions={
            <>
              {index + 1 === fields.length && (
                <Button type="button" onClick={() => append(getDefaultTransformationStat())} variant="link" size="sm" className="square icon-btn">
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
          <Form.Label>Stat {index + 1}</Form.Label>
          <CommonInput type="text" register={register} errors={errors} name={`${basePath}.aStat[${index}].sValue`} label="Value" disableDefaultMaxLength />
          <CommonInput type="text" register={register} errors={errors} name={`${basePath}.aStat[${index}].sLabel`} label="Label" disableDefaultMaxLength />
          <CountInput
            textarea
            rows={5}
            currentLength={values?.aStat?.[index]?.sDescription?.length}
            register={register(`${basePath}.aStat[${index}].sDescription`)}
            error={errors}
            name={`${basePath}.aStat[${index}].sDescription`}
            label="Description"
          />
        </InputArrayBox>
      ))}
    </div>
  )
}

TransformationImpactStatsSection.propTypes = {
  basePath: PropTypes.string
}
