import React, { useState, useContext, useRef } from 'react'
import { Row, Col, Button, Form } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { FormattedMessage, useIntl } from 'react-intl'

import { TOAST_TYPE } from 'shared/constants'
import { checkImageType, getS3Url } from 'shared/utils'
// import { ToastrContext } from 'shared/components/toastr'
import ImageEditor from '../image-editor'
import { ToastrContext } from '../toastr'
import CommonInput from '../common-input'
import { validationErrors } from 'shared/constants/ValidationErrors'
function EditProfileComponent({
  register,
  errors,
  sProfilePicture,
  profileData,
  handleChange,
  setValue
}) {
  const [profilePicture, setProfilePicture] = useState()
  const { dispatch } = useContext(ToastrContext)
  const [oldImage, setOldImage] = useState({})
  // const [panImage, setPanImage] = useState()
  const [file, setFile] = useState(null)
  const [show, setShow] = useState(false)
  // const panImg = register('sPanPicture')
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
      setValue('sProfilePicture', oldImage)
    }
  }

  function removeImage() {
    setProfilePicture('')
    handleChange('')
    setValue('sProfilePicture', '')
  }

  // function handlePanImgChange(e) {
  //   setPanImage(URL.createObjectURL(e.target.files[0]))
  // }

  const userImage = register('sProfilePicture')
  function onConfirm(croppedFile) {
    const file = [croppedFile]
    setValue('sProfilePicture.files', file)
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
              name="sProfilePicture"
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
            className={`form-control ${errors.sFullName && 'error'}`}
            name="sFullName"
            label="fullName"
            required
          />
        </Col>
        {/* <Col sm="4">
          <CommonInput
            type="text"
            register={register}
            errors={errors}
            className={`form-control ${errors.sDisplayName && 'error'}`}
            name="sDisplayName"
            label="displayName"
            required
          />
        </Col> */}
        <Col sm="4">
          <Form.Group className="form-group">
            <Form.Label className="light-font">
              <FormattedMessage id="userName" />
            </Form.Label>
            <Form.Control type="text" name="sUserName" value={profileData.sUName} disabled />
          </Form.Group>
        </Col>
        <Col sm="4">
          <Form.Group className="form-group">
            <Form.Label className="light-font">
              <FormattedMessage id="emailAddress" />
            </Form.Label>
            <Form.Control type="text" name="sEmail" value={profileData.sEmail} disabled />
          </Form.Group>
        </Col>
        <Col sm="4">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="phoneNumber" />*
            </Form.Label>
            <Form.Control
              type="text"
              name="sNumber"
              className={errors.sNumber && 'error'}
              {...register('sNumber', {
                required: validationErrors.required,
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
      </Row>
      {/* <div className="add-border">
        <h5 className="title-text title-font mb-3">
          <FormattedMessage id="about" />
        </h5>
        <Col xs="12">
          <CountInput
            textarea
            currentLength={values?.sBio?.length}
            maxWord={250}
            label={useIntl().formatMessage({ id: 'bio' })}
            name="sBio"
            error={errors}
            register={register('sBio', { maxLength: { value: 250, message: validationErrors.maxLength(250) } })}
          />
        </Col>
      </div>
      <div className="add-border">
        <h5 className="title-text title-font mb-3">
          <FormattedMessage id="panDetails" />
        </h5>
        <Row>
          <Col md="4">
            <div className="step-two-left">
              <div className="pan-img d-flex align-items-center justify-content-center">
                {sPanPicture || panImage ? (
                  <img src={panImage || `${S3_PREFIX}${sPanPicture}`} alt="Pan Image" className="cover" />
                ) : (
                  <i className="icon-id-card"></i>
                )}
              </div>
              <input
                type="file"
                id="pan-img"
                name="sPanPicture"
                accept=".jpg,.png,.webp"
                {...panImg}
                onChange={(e) => {
                  panImg.onChange(e)
                  handlePanImgChange(e)
                }}
                hidden
              />
              <label htmlFor="pan-img" className="btn btn-outline-secondary">
                <FormattedMessage id="uploadImage" />
              </label>
            </div>
          </Col>
          <Col sm="6">
            <CommonInput
              type="text"
              register={register}
              errors={errors}
              className={`form-control ${errors.sPanNumber && 'error'}`}
              name="sPanNumber"
              label="panNumber"
            />
          </Col>
        </Row>
      </div>
      <div className="add-border">
        <PancardDetails register={register} errors={errors} sBankDetailPic={sBankDetailPic} trigger={trigger} clearErrors={clearErrors} />
      </div> */}
    </>
  )
}

EditProfileComponent.propTypes = {
  register: PropTypes.func,
  errors: PropTypes.object,
  sProfilePicture: PropTypes.string,
  profileData: PropTypes.object,
  handleChange: PropTypes.func,
  setValue: PropTypes.func
}

export default EditProfileComponent
