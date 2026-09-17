import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Row, Col } from 'react-bootstrap'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { IFSC_CODE, ACCOUNT_NO } from 'shared/constants'
import { FormattedMessage } from 'react-intl'
import { getS3Url } from 'shared/utils'
import CommonInput from '../common-input'

function PancardDetails({ register, errors, trigger, clearErrors, sBankDetailPic }) {
  const [bankImage, setBankImage] = useState()

  function handleBankImgChange(e) {
    setBankImage(URL.createObjectURL(e.target.files[0]))
  }

  const bankImg = register('sBankDetailPic')
  return (
    <>
      <h5 className="title-text title-font mb-3">
        <FormattedMessage id="bankDetails" />
      </h5>
      <Row>
        <Col md="4">
          <div className="step-two-left">
            <div className="pan-img d-flex align-items-center justify-content-center">
              {sBankDetailPic || bankImage ? (
                <img src={bankImage || getS3Url(sBankDetailPic)} alt="Bank Detail Image" className="cover" />
              ) : (
                <i className="icon-id-card"></i>
              )}
            </div>
            <input
              type="file"
              id="bank-img"
              name="sBankDetailPic"
              accept=".jpg,.png,.webp"
              {...bankImg}
              onChange={(e) => {
                bankImg.onChange(e)
                handleBankImgChange(e)
              }}
              hidden
            />
            <label htmlFor="bank-img" className="btn btn-outline-secondary">
              <FormattedMessage id="uploadImage" />
            </label>
          </div>
        </Col>
        <Col md="8">
          <Row>
            <Col sm="6">
              <CommonInput
                type="text"
                register={register}
                errors={errors}
                className={`form-control ${errors.sPanName && 'error'}`}
                name="sPanName"
                label="nameAsPerPANCard"
              />
            </Col>
            <Col sm="6">
              <Form.Group className="form-group">
                <Form.Label>
                  <FormattedMessage id="ifscCode" />
                </Form.Label>
                <Form.Control
                  type="text"
                  name="sIfsc"
                  className={errors.sIfsc && 'error'}
                  {...register('sIfsc', { pattern: { value: IFSC_CODE, message: validationErrors.IFSCCode } })}
                />
                {errors.sIfsc && <Form.Control.Feedback type="invalid">{errors.sIfsc.message}</Form.Control.Feedback>}
              </Form.Group>
            </Col>
            <Col sm="6">
              <Form.Group className="form-group">
                <Form.Label>
                  <FormattedMessage id="accountNo" />
                </Form.Label>
                <Form.Control
                  type="text"
                  name="sAccountNumber"
                  id="sAccountNumber"
                  className={errors.sAccountNumber && 'error'}
                  {...register('sAccountNumber', { pattern: { value: ACCOUNT_NO, message: validationErrors.accountNumber } })}
                />
                {errors.sAccountNumber && <Form.Control.Feedback type="invalid">{errors.sAccountNumber.message}</Form.Control.Feedback>}
              </Form.Group>
            </Col>
            <Col sm="6">
              <CommonInput
                type="text"
                register={register}
                errors={errors}
                className={`form-control ${errors.sAccountName && 'error'}`}
                name="sAccountName"
                label="accountName"
              />
            </Col>
            <Col sm="6">
              <CommonInput
                type="text"
                register={register}
                errors={errors}
                className={`form-control ${errors.sBankName && 'error'}`}
                name="sBankName"
                label="bankName"
              />
            </Col>
            <Col sm="6">
              <CommonInput
                type="text"
                register={register}
                errors={errors}
                className={`form-control ${errors.sBranchName && 'error'}`}
                name="sBranchName"
                label="branchName"
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  )
}

PancardDetails.propTypes = {
  register: PropTypes.func,
  errors: PropTypes.object,
  sBankDetailPic: PropTypes.string,
  trigger: PropTypes.func,
  clearErrors: PropTypes.func
}

export default PancardDetails
