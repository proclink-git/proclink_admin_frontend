import React from 'react'
import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'
import { useFormContext } from 'react-hook-form'

import CountInput from 'shared/components/count-input'

export default function SubscribeSection({ basePath = 'oSU', sectionLabel = 'Subscribe Section' }) {
  const {
    register,
    watch,
    formState: { errors }
  } = useFormContext()

  const values = watch(basePath) || {}

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">{sectionLabel}</Form.Label>

      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <CountInput textarea rows={6} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description" />
      <CountInput type="text" currentLength={values?.sPlaceholder?.length} register={register(`${basePath}.sPlaceholder`)} error={errors} name={`${basePath}.sPlaceholder`} label="Placeholder" />
      <CountInput type="text" currentLength={values?.sButtonLabel?.length} register={register(`${basePath}.sButtonLabel`)} error={errors} name={`${basePath}.sButtonLabel`} label="Button Label" />
    </div>
  )
}

SubscribeSection.propTypes = {
  basePath: PropTypes.string,
  sectionLabel: PropTypes.string
}
