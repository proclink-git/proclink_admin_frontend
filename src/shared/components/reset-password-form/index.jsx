import React, { useContext, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Form, InputGroup, Spinner } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { useMutation } from '@apollo/client'
import { useHistory } from 'react-router'
import { FormattedMessage } from 'react-intl'

import { RESET_PASSWORD } from 'graph-ql/auth/ResetPassword'
import { encryption } from 'shared/utils'
import { PASSWORD, TOAST_TYPE } from 'shared/constants'
import { allRoutes } from 'shared/constants/AllRoutes'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { ToastrContext } from '../toastr'

function ResetPasswordForm({ sEmail }) {
  const { dispatch } = useContext(ToastrContext)
  const history = useHistory()
  const [showPassword, setShowPassword] = useState({ newPassword: true, confirmPassword: true })
  const sNewPassword = useRef({})

  const {
    register: fields,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({ mode: 'onTouched' })
  sNewPassword.current = watch('sNewPassword')

  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD, {
    onCompleted: (data) => {
      if (data) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.resetPassword.message, type: TOAST_TYPE.Success, btnTxt: 'Close' }
        })
        history.replace()
        history.push(allRoutes.login)
      }
    }
  })

  function handlePasswordToggle(name) {
    if (name === 'newPassword') {
      setShowPassword({ ...showPassword, newPassword: !showPassword.newPassword })
    } else {
      setShowPassword({ ...showPassword, confirmPassword: !showPassword.confirmPassword })
    }
  }

  function onSubmit(data) {
    resetPassword({
      variables: {
        sEmail,
        sNewPassword: encryption(data.sNewPassword),
        sConfirmNewPassword: encryption(data.sConfirmNewPassword)
      }
    })
  }

  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit)} className="login-form">
      <div className="title-b">
        <h2 className="title">
          <FormattedMessage id="resetPassword" />
        </h2>
      </div>
      <Form.Group className="form-group">
        <Form.Label>
          <FormattedMessage id="newPassword" />
        </Form.Label>
        <InputGroup>
          <Form.Control
            type={showPassword.newPassword ? 'password' : 'text'}
            required
            name="sNewPassword"
            className={errors.sNewPassword && 'error'}
            {...fields('sNewPassword', {
              required: validationErrors.required,
              pattern: {
                value: PASSWORD,
                message: validationErrors.passwordRegEx
              },
              maxLength: { value: 12, message: validationErrors.rangeLength(8, 12) },
              minLength: { value: 8, message: validationErrors.rangeLength(8, 12) }
            })}
          />
          <Button onClick={() => handlePasswordToggle('newPassword')} variant="link" className="icon-right">
            <i className={showPassword.newPassword ? 'icon-visibility' : 'icon-visibility-off'}></i>
          </Button>
        </InputGroup>
        {errors.sNewPassword && <Form.Control.Feedback type="invalid">{errors.sNewPassword.message}</Form.Control.Feedback>}
      </Form.Group>
      <Form.Group className="form-group">
        <Form.Label>
          <FormattedMessage id="confirmNewPassword" />
        </Form.Label>
        <InputGroup>
          <Form.Control
            type={showPassword.confirmPassword ? 'password' : 'text'}
            required
            name="sConfirmNewPassword"
            className={errors.sConfirmNewPassword && 'error'}
            {...fields('sConfirmNewPassword', {
              required: validationErrors.required,
              validate: (value) => value === sNewPassword.current || validationErrors.passwordNotMatch
            })}
          />
          <Button onClick={() => handlePasswordToggle('confirmPassword')} variant="link" className="icon-right">
            <i className={showPassword.confirmPassword ? 'icon-visibility' : 'icon-visibility-off'}></i>
          </Button>
        </InputGroup>
        {errors.sConfirmNewPassword && <Form.Control.Feedback type="invalid">{errors.sConfirmNewPassword.message}</Form.Control.Feedback>}
      </Form.Group>
      <Button variant="primary" type="submit" disabled={loading}>
        <FormattedMessage id="submit" /> {loading && <Spinner animation="border" size="sm" />}
      </Button>
    </Form>
  )
}
ResetPasswordForm.propTypes = {
  sEmail: PropTypes.string
}
export default ResetPasswordForm
