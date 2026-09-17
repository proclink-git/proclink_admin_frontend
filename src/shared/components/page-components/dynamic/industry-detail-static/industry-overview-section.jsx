import React from 'react'
import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'
import { useFormContext } from 'react-hook-form'

import CountInput from 'shared/components/count-input'
import TinyEditor from 'shared/components/editor'
import TitleFormatHint from 'shared/components/title-format-hint'

export default function IndustryOverviewSection({ basePath = 'oIOV' }) {
  const {
    register,
    control,
    watch,
    formState: { errors }
  } = useFormContext()

  const values = watch(basePath) || {}

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">Industry Overview</Form.Label>

      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <TitleFormatHint subject="title" />

      <div className="form-group">
        <Form.Label>Content</Form.Label>
        <TinyEditor name={`${basePath}.sContent`} control={control} onlyTextFormatting minHeight={260} />
      </div>
    </div>
  )
}

IndustryOverviewSection.propTypes = {
  basePath: PropTypes.string
}
