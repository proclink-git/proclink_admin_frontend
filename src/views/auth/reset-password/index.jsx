import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import OTPForm from 'shared/components/otp-form'
import ResetPasswordForm from 'shared/components/reset-password-form'
import { allRoutes } from 'shared/constants/AllRoutes'

function ResetPassword() {
  const { state } = useLocation()
  const history = useHistory()
  const [formType, setFormType] = useState('OTP')

  useEffect(() => {
    if ((state && !state.sEmail) || !state) {
      history.push(allRoutes.forgotPassword)
    }
  }, [])

  function handleChangeScreen() {
    setFormType('resetPassword')
  }

  return (
    <>
      {state && formType === 'OTP' && <OTPForm sEmail={state.sEmail} onOtpSuccess={() => handleChangeScreen()} />}
      {state && formType === 'resetPassword' && <ResetPasswordForm sEmail={state.sEmail} />}
    </>
  )
}

export default ResetPassword
