import React, { useContext } from 'react'
import { useMutation } from '@apollo/client'
import { Button, Form, Spinner } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { Link, useHistory } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

import { FORGOT_PASSWORD } from 'graph-ql/auth/ForgotPassword'
import { EMAIL, TOAST_TYPE } from 'shared/constants'
import { allRoutes } from 'shared/constants/AllRoutes'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { ToastrContext } from 'shared/components/toastr'

function ForgotPassword() {
  const { dispatch } = useContext(ToastrContext)
  const history = useHistory()
  const {
    register: fields,
    getValues,
    handleSubmit,
    formState: { errors }
  } = useForm({ mode: 'onTouched' })

  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD, {
    onCompleted: (data) => {
      if (data) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.forgotPassword.message, type: TOAST_TYPE.Success, btnTxt: 'Close' }
        })
        localStorage.setItem('resendTime', +new Date() + 30000)
        history.push(allRoutes.resetPassword, { sEmail: getValues('sEmail') })
      }
    }
  })

  function onSubmit(data) {
    forgotPassword({ variables: data })
  }
  return (
    <>
      <Form noValidate onSubmit={handleSubmit(onSubmit)} className="login-form">
        <div className="title-b">
          <h2 className="title">
            <FormattedMessage id="forgotPassword" />
          </h2>
          <p>
            <FormattedMessage id="forgotPasswordPageText" />
          </p>
        </div>
        <Form.Group className="form-group">
          <Form.Label>
            <FormattedMessage id="emailAddress" />
          </Form.Label>
          <Form.Control
            type="text"
            required
            name="sEmail"
            className={errors.sEmail && 'error'}
            {...fields('sEmail', { required: validationErrors.required, pattern: { value: EMAIL, message: validationErrors.email } })}
          />
          {errors.sEmail && <Form.Control.Feedback type="invalid">{errors.sEmail.message}</Form.Control.Feedback>}
        </Form.Group>
        <Button variant="primary" type="submit" disabled={loading}>
          <FormattedMessage id="submit" /> {loading && <Spinner animation="border" size="sm" />}
        </Button>
      </Form>
      <Link to={allRoutes.login} className="b-link">
        <FormattedMessage id="backToLogin" />
      </Link>
    </>
  )
}

export default ForgotPassword
