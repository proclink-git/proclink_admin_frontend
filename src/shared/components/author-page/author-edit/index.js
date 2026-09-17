import React, { useState, useContext, useRef } from 'react'
import { Row, Col, Button, Form } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { FormattedMessage, useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'

import { EMAIL, TOAST_TYPE } from 'shared/constants'
import { checkImageType, getS3Url } from 'shared/utils'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { ToastrContext } from 'shared/components/toastr'
import ImageEditor from 'shared/components/image-editor'
import CommonInput from 'shared/components/common-input'
import SocialLinks from 'shared/components/social-links'
import TinyEditor from 'shared/components/editor'

function AuthorEdit({ register, values, control, errors, clearErrors, trigger, sProfilePicture, profileData, handleChange, setValue }) {
  const { categoryType } = useParams()
  const [profilePicture, setProfilePicture] = useState()
  const { dispatch } = useContext(ToastrContext)
  const [oldImage, setOldImage] = useState({})
  const [file, setFile] = useState(null)
  const [show, setShow] = useState(false)
  const inputRef = useRef()

  function handleImageChange(e) {
    if (e.target.files && e.target.files.length > 0) {
      if (checkImageType(e.target.files[0].type)) {
        setOldImage(e.target.files)
        setFile(e.target.files[0])
        setShow(true)
      } else {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: <FormattedMessage id="imgValidation" />, type: TOAST_TYPE.Error }
        })
        e.target.value = null
      }
    } else {
      setValue('sUrl', oldImage)
    }
  }

  function removeImage() {
    setProfilePicture('')
    handleChange('')
    setValue('sUrl', '')
  }

  const userImage = register('sUrl')
  function onConfirm(croppedFile) {
    const file = [croppedFile]
    setValue('sUrl.files', file)
    setProfilePicture(URL.createObjectURL(croppedFile))
    inputRef.current.value = ''
  }
  function onCompleted(type) {
    setFile(null)
    setOldImage(null)
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
      <Row>
        <Col sm="2">
          <div className="img mb-4 d-inline-block">
            <input
              type="file"
              id="u-img"
              accept=".jpg,.png,.jpeg,.webp"
              name="sUrl"
              hidden
              {...userImage}
              ref={inputRef}
              onChange={(e) => {
                userImage.onChange(e)
                handleImageChange(e)
              }}
            />
            {sProfilePicture || profilePicture ? (
              <img src={profilePicture || getS3Url(sProfilePicture)} alt="Profile Picture" className="cover" />
            ) : (
              <i className="icon-account profile-icon"></i>
            )}
          </div>
        </Col>
        <Col sm="6">
          <div className="mt-5 upload-image">
            <label htmlFor="u-img" className="btn btn-primary">
              <FormattedMessage id="uploadImage" />
            </label>
            <Button
              variant="outline-secondary"
              className="button-space"
              htmlFor="u-img"
              onClick={() => {
                removeImage()
              }}
            >
              <FormattedMessage id="remove" />
            </Button>
          </div>
        </Col>
      </Row>

      <h5 className="title-text title-font mb-3 text-uppercase">
        <FormattedMessage id="personalDetails" />
      </h5>
      <Row>
        <Col sm="4">
          <CommonInput
            type="text"
            register={register}
            errors={errors}
            className={`form-control ${errors.sFName && 'error'}`}
            name="sFName"
            label="fullName"
            required
          />
        </Col>
        <Col sm="4">
          <CommonInput
            type="text"
            register={register}
            errors={errors}
            className={`form-control ${errors?.sEmail && 'error'}`}
            name="sEmail"
            label="Email"
            required
            validation={{ pattern: { value: EMAIL, message: validationErrors.email } }}
          />
        </Col>
        <Col sm="4">
          <CommonInput
            type="text"
            register={register}
            errors={errors}
            className={`form-control ${errors?.eDesignation && 'error'}`}
            name="eDesignation"
            label="designation"
            required
          />
        </Col>
        <Col sm="4">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="phoneNumber" />
            </Form.Label>
            <Form.Control
              type="text"
              name="sNumber"
              className={errors.sNumber && 'error'}
              {...register('sNumber', {
                maxLength: { value: 10, message: validationErrors.number },
                minLength: { value: 10, message: validationErrors.number }
              })}
            />
            {errors.sNumber && <Form.Control.Feedback type="invalid">{errors.sNumber.message}</Form.Control.Feedback>}
          </Form.Group>
        </Col>
        <Col sm="4">
          <Form.Group className="form-group radio-group">
            <Form.Label>
              <FormattedMessage id="gender" />*
            </Form.Label>
            <div className="d-flex mt-2">
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
        <Col xs="12">
          <TinyEditor className={`form-control ${errors.sContent && 'error'}`} name="sBio" control={control} onlyTextFormatting />
          {/* <CountInput
            textarea
            currentLength={values?.sBio?.length}
            maxWord={1000}
            label={useIntl().formatMessage({ id: 'bio' })}
            name="sBio"
            error={errors}
            register={register('sBio', { maxLength: { value: 1000, message: validationErrors.maxLength(1000) } })}
          /> */}
        </Col>
      </Row>
      {categoryType === 'b' && (
        <div className="add-border">
          <SocialLinks register={register} control={control} clearErrors={clearErrors} errors={errors} trigger={trigger} values={values} />
        </div>
      )}
    </>
  )
}

AuthorEdit.propTypes = {
  register: PropTypes.func,
  values: PropTypes.object,
  control: PropTypes.object,
  errors: PropTypes.object,
  clearErrors: PropTypes.func,
  trigger: PropTypes.func,
  sProfilePicture: PropTypes.string,
  profileData: PropTypes.object,
  sBankDetailPic: PropTypes.string,
  sPanPicture: PropTypes.string,
  handleChange: PropTypes.func,
  setValue: PropTypes.func
}

export default AuthorEdit
