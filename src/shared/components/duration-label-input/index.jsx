import React from 'react'
import PropTypes from 'prop-types'

import CommonInput from 'shared/components/common-input'
import { ONLY_NUMBER_WITH_DECIMAL } from 'shared/constants'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { sanitizeDurationLabelInput } from 'shared/utils'

export default function DurationLabelInput({
  name,
  register,
  errors,
  setValue,
  label = 'Duration Label',
  placeholder = '0:20',
  required = false,
  disabled = false,
  className,
  children
}) {
  return (
    <CommonInput
      type="text"
      register={register}
      errors={errors}
      className={className}
      name={name}
      label={label}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      disableDefaultMaxLength
      validation={{ pattern: { value: ONLY_NUMBER_WITH_DECIMAL, message: validationErrors.number } }}
      onChange={(e) => {
        const nextValue = sanitizeDurationLabelInput(e.target.value)

        if (nextValue !== e.target.value) {
          e.target.value = nextValue
          setValue(name, nextValue, { shouldDirty: true, shouldValidate: true })
        }
      }}
      onBlur={(e) => {
        const nextValue = e.target.value.replace(/[.:]$/, '')

        if (nextValue !== e.target.value) {
          e.target.value = nextValue
          setValue(name, nextValue, { shouldDirty: true, shouldValidate: true })
        }
      }}
    >
      {children}
    </CommonInput>
  )
}

DurationLabelInput.propTypes = {
  name: PropTypes.string.isRequired,
  register: PropTypes.func.isRequired,
  errors: PropTypes.object,
  setValue: PropTypes.func.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.any,
  children: PropTypes.node
}
