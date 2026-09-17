import React from 'react'
import PropTypes from 'prop-types'
import { Form, InputGroup } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'

import { validationErrors } from 'shared/constants/ValidationErrors'
import ToolTip from 'shared/components/tooltip'
import { getNestedObject } from 'shared/utils'

function getPathSegments(path = '') {
  return String(path).match(/[^.[\]]+/g) || []
}

function getInputError(errors, name) {
  const pathSegments = getPathSegments(name)

  for (let index = 0; index < pathSegments.length; index += 1) {
    const fieldError = getNestedObject(errors, pathSegments.slice(index).join('.'))
    if (fieldError?.message || fieldError?.type) return fieldError
  }

  return undefined
}

function CommonInput({
  type,
  errors,
  size,
  className,
  onChange,
  label,
  name,
  register,
  disabled,
  required,
  onBlur,
  placeholder,
  defaultValue,
  validation,
  style,
  altText,
  urlPrifix,
  categoryURL,
  availableSlug,
  displayClass,
  altTextLabel,
  children,
  toolTipText,
  disableDefaultMaxLength,
  inputGroupLeft,
  inputGroupRight
}) {
  const fieldError = getInputError(errors, name)

  function applyValidation() {
    const baseValidation = {}

    if (required) {
      baseValidation.required = validationErrors.required
      baseValidation.minLength = { value: 1, message: validationErrors.minLength(1) }
      baseValidation.onChange = (e) => {}
    }

    if (!disableDefaultMaxLength) {
      baseValidation.maxLength = { value: 10000, message: validationErrors.maxLength(10000) }
    }

    return {
      ...baseValidation,
      ...validation
    }
  }

  const setRegister = register(name, applyValidation())
  return (
    <Form.Group className={`form-group w-100 ${displayClass}`}>
      {label && (
        <Form.Label>
          {label && <FormattedMessage id={label} defaultMessage={label} />}
          {label && required && '*'}
          {toolTipText && (
            <ToolTip toolTipMessage={<FormattedMessage id={toolTipText} />}>
              <i className="icon-info" />
            </ToolTip>
          )}
        </Form.Label>
      )}
      {(() => {
        if (urlPrifix || inputGroupLeft || inputGroupRight) {
          return (
            <InputGroup>
              {urlPrifix && (
                <InputGroup.Text>
                  {urlPrifix}
                  {categoryURL && categoryURL}
                </InputGroup.Text>
              )}
              {inputGroupLeft}
              <Form.Control
                as={type === 'text' ? 'input' : 'textarea'}
                name={name}
                size={size}
                className={className}
                disabled={disabled}
                defaultValue={defaultValue}
                style={style}
                placeholder={placeholder}
                {...setRegister}
                onChange={(e) => {
                  setRegister.onChange(e)
                  onChange && onChange(e)
                }}
                onBlur={(e) => {
                  e.target.value = e?.target?.value.trim()
                  onBlur && onBlur(e)
                  setRegister.onChange(e)
                  setRegister.onBlur(e)
                }}
              />
              {inputGroupRight}
            </InputGroup>
          )
        } else {
          return (
            <Form.Control
              as={type === 'text' ? 'input' : 'textarea'}
              name={name}
              size={size}
              className={className}
              defaultValue={defaultValue}
              disabled={disabled}
              style={style}
              placeholder={placeholder}
              {...setRegister}
              onChange={(e) => {
                setRegister.onChange(e)
                onChange && onChange(e)
              }}
              onBlur={(e) => {
                e.target.value = e?.target?.value.trim()
                onBlur && onBlur(e)
                setRegister.onChange(e)
                setRegister.onBlur(e)
              }}
            />
          )
        }
      })()}
      {altText && (
        <Form.Text>
          <FormattedMessage id={altText} defaultMessage={altText} />
        </Form.Text>
      )}
      {availableSlug && (
        <Form.Text>
          <FormattedMessage id={altTextLabel} defaultMessage={altTextLabel} />: {availableSlug}
        </Form.Text>
      )}
      {!children && fieldError?.message && <Form.Control.Feedback type="invalid">{fieldError.message}</Form.Control.Feedback>}
      {children}
    </Form.Group>
  )
}
CommonInput.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  size: PropTypes.string,
  categoryURL: PropTypes.string,
  altText: PropTypes.string,
  urlPrifix: PropTypes.string,
  toolTipText: PropTypes.string,
  displayClass: PropTypes.string,
  label: PropTypes.string,
  defaultValue: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  maxWord: PropTypes.number,
  register: PropTypes.func,
  children: PropTypes.node,
  onBlur: PropTypes.any,
  onChange: PropTypes.any,
  control: PropTypes.object,
  style: PropTypes.object,
  errors: PropTypes.object,
  className: PropTypes.any,
  availableSlug: PropTypes.string,
  altTextLabel: PropTypes.string,
  validation: PropTypes.object,
  disableDefaultMaxLength: PropTypes.bool,
  inputGroupLeft: PropTypes.node,
  inputGroupRight: PropTypes.node
}
export default CommonInput
