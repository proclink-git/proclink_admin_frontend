import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useMutation } from '@apollo/client'
import { Button, Spinner } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'

import { FORGOT_PASSWORD } from 'graph-ql/auth/ForgotPassword'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from '../toastr'

function ReSendOtp({ sEmail, isOTPLoading }) {
  const { dispatch } = useContext(ToastrContext)
  const [count, setCount] = useState()
  let countDown

  useEffect(() => {
    startCount()
    return () => {
      clearInterval(countDown)
    }
  }, [])

  function startCount() {
    countDown = setInterval(() => {
      const fTime = localStorage.getItem('resendTime')
      const diffTime = (fTime - +new Date()) / 1000
      setCount(Math.ceil(diffTime))
      if (diffTime <= 0) {
        clearInterval(countDown)
        localStorage.removeItem('resendTime')
        setCount(0)
      }
    }, 1000)
  }

  const [resendOtp, { loading }] = useMutation(FORGOT_PASSWORD, {
    onCompleted: (data) => {
      if (data) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.forgotPassword.sMessage, type: TOAST_TYPE.Success, btnTxt: 'Close' }
        })
        startCount()
        localStorage.setItem('resendTime', +new Date() + 30000)
      }
    }
  })

  function handleResendOtp() {
    resendOtp({ variables: { sEmail } })
  }

  return (
    <Button onClick={handleResendOtp} variant="primary" className="ms-2" disabled={loading || isOTPLoading || !(count === 0)}>
      <FormattedMessage id="resend" /> <FormattedMessage id="otp" /> {count > 0 && `(00:${count <= 9 ? '0' + count : count})`}{' '}
      {loading && <Spinner animation="border" size="sm" />}
    </Button>
  )
}

ReSendOtp.propTypes = {
  sEmail: PropTypes.string,
  isOTPLoading: PropTypes.bool
}
export default ReSendOtp
