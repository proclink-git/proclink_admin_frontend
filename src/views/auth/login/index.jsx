import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Form, InputGroup, Spinner } from 'react-bootstrap'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { FormattedMessage } from 'react-intl'

import { LOGIN } from 'graph-ql/auth/Login'
import { encryption } from 'shared/utils'
import { allRoutes } from 'shared/constants/AllRoutes'
import { validationErrors } from 'shared/constants/ValidationErrors'

function Login() {
  const history = useHistory()
  const { state } = useLocation()

  const {
    register: fields,
    handleSubmit,
    formState: { errors }
  } = useForm({ mode: 'onTouched' })
  const [showPassword, setShowPassword] = useState(true)

  const [login, { loading }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      const loginData = data?.adminLogin?.oData
      if (loginData) {
        localStorage.setItem('token', loginData.sToken)
        localStorage.setItem('tinyApiKey', loginData.sTinyApiKey || '')
        if (state && state.previousPath) {
          history.replace(state.previousPath)
        } else {
          history.replace(allRoutes.dashboard)
        }
      }
    }
  })

  function handlePasswordToggle() {
    setShowPassword(!showPassword)
  }

  function onSubmit(data) {
    login({ variables: { sUserName: data.sUserName, sPassword: encryption(data.sPassword) } })
  }

  return (
    <>
      <Form noValidate onSubmit={handleSubmit(onSubmit)} className="login-form">
        <div className="title-b">
          <h2 className="title">
            <FormattedMessage id="letsGo" />
          </h2>
        </div>
        <Form.Group className="form-group">
          <Form.Label>
            <FormattedMessage id="emailAddress" />
          </Form.Label>
          <Form.Control
            type="text"
            required
            name="sUserName"
            className={errors.sUserName && 'error'}
            {...fields('sUserName', { required: validationErrors.required })}
          />
          {errors.sUserName && <Form.Control.Feedback type="invalid">{errors.sUserName.message}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group className="form-group">
          <Form.Label>
            <FormattedMessage id="password" />
          </Form.Label>
          <InputGroup>
            <Form.Control
              type={showPassword ? 'password' : 'text'}
              required
              name="sPassword"
              className={errors.sPassword && 'error'}
              {...fields('sPassword', { required: validationErrors.required })}
            />
            <Button onClick={handlePasswordToggle} variant="link" className="icon-right">
              <i className={showPassword ? 'icon-visibility' : 'icon-visibility-off'}></i>
            </Button>
          </InputGroup>
          {errors.sPassword && <Form.Control.Feedback type="invalid">{errors.sPassword.message}</Form.Control.Feedback>}
        </Form.Group>
        <Button variant="primary" type="submit" disabled={loading}>
          <FormattedMessage id="login" /> {loading && <Spinner animation="border" size="sm" />}
        </Button>
      </Form>
      <Link to={allRoutes.forgotPassword} className="b-link">
        <FormattedMessage id="forgotPassword" />?
      </Link>
    </>
  )
}

export default Login
