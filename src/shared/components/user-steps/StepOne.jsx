import React, { useContext, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useLazyQuery, useMutation } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'

import { validationErrors } from 'shared/constants/ValidationErrors'
import { EMAIL, ONLY_NUMBER, PASSWORD, TOAST_TYPE } from 'shared/constants'
import { generatePassword, checkImageType, getS3Url } from 'shared/utils'
import { GENERATE_USERNAME, CHANGE_PROFILE_PICTURE } from 'graph-ql/settings/user'
import { GENERATE_PRE_SIGNED } from 'graph-ql/generate-pre-signed-url'
import { getPreSignedData, uploadImage } from 'shared/functions/PreSignedData'
import { ToastrContext } from '../toastr'
import ImageEditor from 'shared/components/image-editor'
import CommonInput from '../common-input'

function StepOne({
  nextStep,
  register,
  submit,
  errors,
  watch,
  setValue,
  values,
  setError,
  clearErrors,
  id,
  hidden,
  sProfilePicture,
  profilePictureUpdate,
  control,
  sUserName
}) {
  const { dispatch } = useContext(ToastrContext)
  const sPassword = useRef({})
  const [profilePicture, setProfilePicture] = useState()
  const [, setAvailableUserName] = useState()
  const [userName, setUserName] = useState()
  const [file, setFile] = useState(null)
  const [show, setShow] = useState(false)
  sPassword.current = watch('sPassword')
  const inputRef = useRef()

  const [generateUserName] = useLazyQuery(GENERATE_USERNAME, {
    onCompleted: (data) => {
      if (data?.generateUsername?.oData) {
        if (!userName && !data.generateUsername.oData.bIsExists) {
          setUserName(data.generateUsername.oData.sUsername)
          setValue('sUserName', data.generateUsername.oData.sUsername)
          clearErrors('sUserName')
        } else {
          setAvailableUserName(data.generateUsername.oData.sUsername)
        }
        if (!userName && data.generateUsername.oData.bIsExists) {
          setUserName(data.generateUsername.oData.sUsername)
          setValue('sUserName', data.generateUsername.oData.sUsername)
          setAvailableUserName('')
        }
        if (userName && data.generateUsername.oData.bIsExists) {
          setError('sUserName', { type: 'manual', message: validationErrors.notAvailable })
        }
        if (userName && !data.generateUsername.oData.bIsExists) {
          setAvailableUserName('')
          if (errors.sUserName && errors.sUserName.type === 'manual') {
            clearErrors('sUserName')
          }
        }
      }
    }
  })

  const [generatePreSignedUrl] = useMutation(GENERATE_PRE_SIGNED)

  const [changeProfile] = useMutation(CHANGE_PROFILE_PICTURE, {
    onCompleted: (data) => {
      if (data && data.editSubAdminProfilePicture) {
        setValue('sProfilePicture', '')
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editSubAdminProfilePicture.sMessage, type: TOAST_TYPE.Success }
        })
      }
    }
  })

  async function handleImageChange(e) {
    if (e.target.files && e.target.files.length > 0) {
      if (checkImageType(e.target.files[0].type)) {
        setFile(e.target.files[0])
        setShow(true)
      } else {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: <FormattedMessage id="imgValidation" />, type: TOAST_TYPE.Error }
        })
        e.target.value = null
      }
    }
  }
  async function onConfirm(croppedFile) {
    const file = [croppedFile]
    setValue('sProfilePicture.files', file)
    setProfilePicture(URL.createObjectURL(croppedFile))
    inputRef.current.value = ''
    const profileImagePreSignedData = { files: [croppedFile] }
    if (id) {
      const { value } = getPreSignedData({ sProfilePicture: profileImagePreSignedData })
      const { data } = await generatePreSignedUrl({ variables: { generatePreSignedUrlInput: value } })
      if (data && data.generatePreSignedUrl) {
        uploadImage([{ ...data.generatePreSignedUrl[0], file: croppedFile }])
          .then((res) => {
            changeProfile({ variables: { _id: id, sUrl: data.generatePreSignedUrl[0].sS3Url } })
            profilePictureUpdate(data.generatePreSignedUrl[0].sS3Url)
          })
          .catch((err) => {
            console.log('err', err)
          })
      }
    } else {
      setProfilePicture(URL.createObjectURL(croppedFile))
    }
  }
  function handleGeneratePassword() {
    const password = generatePassword()
    setValue('sPassword', password)
    setValue('sConfirmPassword', password)
    clearErrors(['sPassword', 'sConfirmPassword'])
  }

  function handleChange(e) {
    e.target.name === 'sUserName' && setUserName(e.target.value)
    if (!id && e.target.name === 'sUserName' && e.target.value) generateUserName({ variables: { sUserName: e.target.value } })
    if (id && e.target.value !== sUserName && e.target.name === 'sUserName' && e.target.value) {
      generateUserName({ variables: { sUserName: e.target.value } })
    }
    if (!id && !userName && e.target.name === 'sFullName' && e.target.value) generateUserName({ variables: { sUserName: e.target.value } })
    if (e.target.name === 'sEmail' && e.target.value) setValue('sEmail', e.target.value.toLowerCase())
  }

  const userImage = register('sProfilePicture')

  function onCompleted(type) {
    setFile(null)
    if (type === 'close') inputRef.current.value = ''
  }
  return (
    <>
      <ImageEditor
        aspectRatio={1}
        file={file}
        show={show}
        setShow={setShow}
        onConfirmProp={(croppedFile) => {
          onConfirm(croppedFile)
        }}
        onCompleted={(e) => onCompleted(e)}
      />
      {/* <Form hidden={hidden} className="step-one" onSubmit={submit(onSubmit)} autoComplete="off"> */}
      <h2 className="title-txt">
        <FormattedMessage id="personalDetails" />
      </h2>
      <div className="personal-details">
        <div className="u-img">
          <div className="img">
            <input
              type="file"
              id="u-img"
              accept=".jpg,.png,.webp"
              name="sProfilePicture"
              hidden
              {...userImage}
              ref={inputRef}
              onChange={(e) => {
                handleImageChange(e)
              }}
            />
            {sProfilePicture || profilePicture ? (
              <img src={profilePicture || getS3Url(sProfilePicture)} alt="Profile Picture" className="cover" />
            ) : (
              <i className="icon-account profile-icon"></i>
            )}
            <label htmlFor="u-img">
              <i className="icon-create d-block"></i>
            </label>
          </div>
        </div>
        <div className="user-form">
          <Row>
            <Col sm="6">
              <CommonInput
                type="text"
                register={register}
                errors={errors}
                className={`form-control ${errors?.sFullName && 'error'}`}
                name="sFullName"
                label="fullName"
                required
              />
            </Col>
            {/* <Col sm="6">
                <CommonInput
                  type="text"
                  register={register}
                  errors={errors}
                  className={`form-control ${errors?.sDisplayName && 'error'}`}
                  name="sDisplayName"
                  label="displayName"
                  required
                />
              </Col> */}
            <Col sm="6">
              <Form.Group className="form-group">
                <Form.Label>
                  <FormattedMessage id="communicationEmailID" />*
                </Form.Label>
                <Form.Control
                  type="text"
                  name="sEmail"
                  className={errors.sEmail && 'error'}
                  disabled={id}
                  autoComplete="off"
                  {...register('sEmail', {
                    required: validationErrors.required,
                    pattern: { value: EMAIL, message: validationErrors.email }
                  })}
                  onBlur={handleChange}
                />
                {errors.sEmail && <Form.Control.Feedback type="invalid">{errors.sEmail.message}</Form.Control.Feedback>}
              </Form.Group>
            </Col>
            <Col sm="6">
              <Form.Group className="form-group">
                <Form.Label>
                  <FormattedMessage id="phoneNumber" />*
                </Form.Label>
                <Form.Control
                  type="text"
                  name="sNumber"
                  className={errors.sNumber && 'error'}
                  autoComplete="off"
                  {...register('sNumber', {
                    required: validationErrors.required,
                    pattern: { value: ONLY_NUMBER, message: validationErrors.number },
                    maxLength: { value: 10, message: validationErrors.number },
                    minLength: { value: 10, message: validationErrors.number }
                  })}
                />
                {errors.sNumber && <Form.Control.Feedback type="invalid">{errors.sNumber.message}</Form.Control.Feedback>}
              </Form.Group>
            </Col>
            {/* <Col sm="6">
                <CommonInput
                  type="text"
                  register={register}
                  errors={errors}
                  className={`form-control ${errors?.sCity && 'error'}`}
                  name="sCity"
                  label="city"
                />
              </Col> */}
            <Col sm="6">
              <Form.Group className="form-group radio-group">
                <Form.Label>
                  <FormattedMessage id="gender" />*
                </Form.Label>
                <div className="d-flex">
                  <Form.Check
                    {...register('eGender', { required: validationErrors.required })}
                    value="m"
                    type="radio"
                    label={useIntl().formatMessage({ id: 'male' })}
                    className="mb-0 mt-0"
                    name="eGender"
                    id="Male"
                  />
                  <Form.Check
                    {...register('eGender', { required: validationErrors.required })}
                    value="f"
                    type="radio"
                    label={useIntl().formatMessage({ id: 'female' })}
                    className="mb-0 mt-0"
                    name="eGender"
                    id="Female"
                  />
                  <Form.Check
                    {...register('eGender', { required: validationErrors.required })}
                    value="o"
                    type="radio"
                    label={useIntl().formatMessage({ id: 'other' })}
                    className="mb-0 mt-0"
                    name="eGender"
                    id="Other"
                  />
                </div>
                {errors.eGender && <Form.Control.Feedback type="invalid">{errors.eGender.message}</Form.Control.Feedback>}
              </Form.Group>
            </Col>
            {/* <Col xs="12">
                <CommonInput
                  type="text"
                  register={register}
                  errors={errors}
                  className={`form-control ${errors?.sAddress && 'error'}`}
                  name="sAddress"
                  label="address"
                />
              </Col> */}
            {/* <Col xs="12">
                <CountInput
                  textarea
                  maxWord={250}
                  currentLength={values?.sBio?.length}
                  label={useIntl().formatMessage({ id: 'bio' })}
                  name="sBio"
                  error={errors}
                  register={register('sBio', { maxLength: { value: 250, message: validationErrors.maxLength(250) } })}
                />
              </Col> */}
          </Row>
        </div>
      </div>
      {!id && (
        <div className="login-detail add-border mt-0">
          <h2 className="title-txt">
            <FormattedMessage id="userLoginDetails" />
          </h2>
          <Row>
            {/* <Col sm="4">
              <Form.Group className="form-group">
                <Form.Label>
                  {' '}
                  <FormattedMessage id="userName" />*
                </Form.Label>
                <Form.Control
                  type="text"
                  name="sUserName"
                  autoComplete="new-password"
                  className={errors.sUserName && 'error'}
                  {...register('sUserName', {
                    required: validationErrors.required,
                    pattern: { value: ONLY_DOT_AND_UNDERSCORE_WITH_NO_SPACE, message: validationErrors.underscoreAndDot },
                    maxLength: { value: 15, message: validationErrors.rangeLength(3, 15) },
                    minLength: { value: 3, message: validationErrors.rangeLength(3, 15) }
                  })}
                  onBlur={handleChange}
                />
                {availableUserName && (
                  <Form.Text>
                    {' '}
                    <FormattedMessage id="suggestedUserName" /> {availableUserName}
                  </Form.Text>
                )}
                {errors.sUserName && <Form.Control.Feedback type="invalid">{errors.sUserName.message}</Form.Control.Feedback>}
              </Form.Group>
            </Col> */}
            {!id && (
              <>
                <Col sm="6">
                  <Form.Group className="form-group">
                    <Form.Label>
                      <FormattedMessage id="password" />*
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="sPassword"
                      autoComplete="new-password"
                      className={errors.sPassword && 'error'}
                      {...register('sPassword', {
                        required: validationErrors.required,
                        pattern: {
                          value: PASSWORD,
                          message: validationErrors.passwordRegEx
                        },
                        maxLength: { value: 12, message: validationErrors.rangeLength(8, 12) },
                        minLength: { value: 8, message: validationErrors.rangeLength(8, 12) }
                      })}
                    />
                    {errors.sPassword && <Form.Control.Feedback type="invalid">{errors.sPassword.message}</Form.Control.Feedback>}
                  </Form.Group>
                </Col>
                <Col sm="6">
                  <Form.Group className="form-group">
                    <Form.Label>
                      <FormattedMessage id="confirmPassword" />*
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="sConfirmPassword"
                      autoComplete="new-password"
                      className={errors.sConfirmPassword && 'error'}
                      {...register('sConfirmPassword', {
                        required: validationErrors.required,
                        validate: (value) => value === sPassword.current || validationErrors.passwordNotMatch
                      })}
                    />
                    {errors.sConfirmPassword && (
                      <Form.Control.Feedback type="invalid">{errors.sConfirmPassword.message}</Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
              </>
            )}
          </Row>
          {!id && (
            <div className="text-center">
              <Button type="button" variant="primary" onClick={handleGeneratePassword}>
                <FormattedMessage id="generatePassword" />
              </Button>
            </div>
          )}
        </div>
      )}
      {/* <div className={`btn-bottom add-border ${id && 'mt-0'}`}>
        <Button type="submit" variant="primary" disabled={errors.sUserName}>
          <FormattedMessage id="next" />
        </Button>
      </div> */}
      {/* </Form> */}
    </>
  )
}
StepOne.propTypes = {
  nextStep: PropTypes.func,
  register: PropTypes.func,
  submit: PropTypes.func,
  watch: PropTypes.func,
  setValue: PropTypes.func,
  errors: PropTypes.object,
  values: PropTypes.object,
  setError: PropTypes.func,
  clearErrors: PropTypes.func,
  id: PropTypes.string,
  sProfilePicture: PropTypes.string,
  hidden: PropTypes.bool,
  control: PropTypes.object,
  profilePictureUpdate: PropTypes.func,
  sUserName: PropTypes.string
}
export default StepOne
