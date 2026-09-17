import React, { useRef, useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import { useMutation } from '@apollo/client'
import { Form, Row, Col, Button, Spinner, InputGroup } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'

import { validationErrors } from 'shared/constants/ValidationErrors'
import { PASSWORD, TOAST_TYPE } from 'shared/constants'
import { encryption } from 'shared/utils'
import { ToastrContext } from 'shared/components/toastr'
import { CHANGE_PASSWORD } from 'graph-ql/auth/mutation'

function ChangePassword({ handleChangePass }) {
  const { dispatch } = useContext(ToastrContext)
  const [showCurrentPassword, setShowCurrentPassword] = useState(true)
  const [showNewPassword, setShowNewPassword] = useState(true)
  const [showConfirmPassword, setConfirmPassword] = useState(true)

  const [changePassword, { loading }] = useMutation(CHANGE_PASSWORD, {
    onCompleted: (data) => {
      if (data && data.changePassword) {
        handleChangePass()
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.changePassword.sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
        })
      }
    }
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    mode: 'onTouched'
  })
  const sNewPassword = useRef({})
  sNewPassword.current = watch('sNewPassword')

  const onSubmit = (data) => {
    data.sCurrentPassword = encryption(data.sCurrentPassword)
    data.sNewPassword = encryption(data.sNewPassword)
    data.sConfirmPassword = encryption(data.sConfirmPassword)
    changePassword({
      variables: {
        input: data
      }
    })
  }

  const handleCurrentPasswordToggle = () => {
    setShowCurrentPassword(!showCurrentPassword)
  }
  const handleNewPasswordToggle = () => {
    setShowNewPassword(!showNewPassword)
  }
  const handleConfirmPasswordToggle = () => {
    setConfirmPassword(!showConfirmPassword)
  }

  return (
    <>
      <Row>
        <Col>
          <Form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <div className="top-d-button">
              <Button variant="success" disabled={loading} type="submit" className="square" size="sm">
                <FormattedMessage id="submit" />
                {loading && <Spinner animation="border" size="sm" />}
              </Button>
            </div>
            <Form.Group className="form-group">
              <Form.Label>
                <FormattedMessage id="currentPassword" />*
              </Form.Label>
              <InputGroup>
                <Form.Control
                  className={`form-control ${errors.sCurrentPassword && 'error'}`}
                  type={showCurrentPassword ? 'password' : 'text'}
                  name="sCurrentPassword"
                  {...register('sCurrentPassword', { required: validationErrors.required })}
                />
                <Button onClick={handleCurrentPasswordToggle} variant="link" className="icon-right">
                  <i className={showCurrentPassword ? 'icon-visibility' : 'icon-visibility-off'}></i>
                </Button>
              </InputGroup>
              {errors.sCurrentPassword && <Form.Control.Feedback type="invalid">{errors.sCurrentPassword.message}</Form.Control.Feedback>}
            </Form.Group>
            <Form.Group className="form-group">
              <Form.Label>
                <FormattedMessage id="newPassword" />*
              </Form.Label>
              <InputGroup>
                <Form.Control
                  className={`form-control ${errors.sNewPassword && 'error'}`}
                  type={showNewPassword ? 'password' : 'text'}
                  name="sNewPassword"
                  {...register('sNewPassword', {
                    required: validationErrors.required,
                    pattern: {
                      value: PASSWORD,
                      message: validationErrors.passwordRegEx
                    },
                    maxLength: { value: 12, message: validationErrors.rangeLength(8, 12) },
                    minLength: { value: 8, message: validationErrors.rangeLength(8, 12) }
                  })}
                />
                <Button onClick={handleNewPasswordToggle} variant="link" className="icon-right">
                  <i className={showNewPassword ? 'icon-visibility' : 'icon-visibility-off'}></i>
                </Button>
              </InputGroup>
              {errors.sNewPassword && <Form.Control.Feedback type="invalid">{errors.sNewPassword.message}</Form.Control.Feedback>}
            </Form.Group>
            <Form.Group className="form-group">
              <Form.Label>
                <FormattedMessage id="confirmNewPassword" />*
              </Form.Label>
              <InputGroup>
                <Form.Control
                  className={`form-control ${errors.sConfirmPassword && 'error'}`}
                  type={showConfirmPassword ? 'password' : 'text'}
                  name="sConfirmPassword"
                  {...register('sConfirmPassword', {
                    required: validationErrors.required,
                    validate: (value) => value === sNewPassword.current || validationErrors.passwordNotMatch
                  })}
                />
                <Button onClick={handleConfirmPasswordToggle} variant="link" className="icon-right">
                  <i className={showConfirmPassword ? 'icon-visibility' : 'icon-visibility-off'}></i>
                </Button>
              </InputGroup>
              {errors.sConfirmPassword && <Form.Control.Feedback type="invalid">{errors.sConfirmPassword.message}</Form.Control.Feedback>}
            </Form.Group>
          </Form>
        </Col>
      </Row>
    </>
  )
}
ChangePassword.propTypes = {
  handleChangePass: PropTypes.func
}
export default ChangePassword
