import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { Button, Form, Spinner } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { useMutation } from '@apollo/client'
import { FormattedMessage } from 'react-intl'

import { VERIFY_OTP } from 'graph-ql/auth/ResetPassword'
import { TOAST_TYPE, ONLY_NUMBER } from 'shared/constants'
import ReSendOtp from '../resend-otp'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { ToastrContext } from '../toastr'

function OTPForm({ sEmail, onOtpSuccess }) {
  const { dispatch } = useContext(ToastrContext)
  const {
    register: fields,
    handleSubmit,
    formState: { errors }
  } = useForm({ mode: 'onTouched' })

  const [verifyOtp, { loading }] = useMutation(VERIFY_OTP, {
    onCompleted: (data) => {
      if (data?.verifyOtp) {
        onOtpSuccess()
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.verifyOtp.sMessage, type: TOAST_TYPE.Success, btnTxt: 'Close' }
        })
      }
    }
  })

  function otpSubmit(data) {
    verifyOtp({ variables: { input: { sOtp: data.nOtp, sEmail, eAuth: 'f', eType: 'e' } } })
  }
  return (
    <Form noValidate onSubmit={handleSubmit(otpSubmit)} className="login-form">
      <div className="title-b">
        <h2 className="title">
          <FormattedMessage id="enterOTP" />
        </h2>
        <p>
          <FormattedMessage id="pleaseDoNotHitRefresh" />
        </p>
      </div>
      <Form.Group className="form-group">
        <Form.Label>
          <FormattedMessage id="otp" />
        </Form.Label>
        <Form.Control
          type="text"
          required
          name="nOtp"
          mask="9999 9999 9999 9999"
          className={errors.nOtp && 'error'}
          {...fields('nOtp', {
            required: validationErrors.required,
            maxLength: { value: 6, message: validationErrors.maxLength(6) },
            pattern: { value: ONLY_NUMBER, message: validationErrors.number }
          })}
        />
        {errors.nOtp && <Form.Control.Feedback type="invalid">{errors.nOtp.message}</Form.Control.Feedback>}
      </Form.Group>
      <Button variant="primary" type="submit" disabled={loading}>
        <FormattedMessage id="submit" /> {loading && <Spinner animation="border" size="sm" />}
      </Button>
      <ReSendOtp sEmail={sEmail} isOTPLoading={loading} />
    </Form>
  )
}

OTPForm.propTypes = {
  sEmail: PropTypes.string,
  onOtpSuccess: PropTypes.func
}
export default OTPForm
