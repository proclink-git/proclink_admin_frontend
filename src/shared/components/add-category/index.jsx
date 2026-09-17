import React, { useRef } from 'react'
import { Row, Col } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'

import { validationErrors } from 'shared/constants/ValidationErrors'
import CommonInput from '../common-input'
function AddCategory({ register, errors, control, nameChanged, showSubTitle = true }) {
  const name = useRef()

  function handleBlur(e) {
    if (e.target.value) {
      if (!name.current) {
        name.current = e.target.value
        nameChanged(name.current)
      }
    }
  }
  return (
    <Row>
      <Col xs={12}>
        <CommonInput
          placeholder={useIntl().formatMessage({ id: 'writeHere' })}
          altText="nameIsHowItAppearsOnTheSite"
          type="text"
          register={register}
          errors={errors}
          className={errors.sName && 'error'}
          name="sName"
          label="name"
          validation={{ maxLength: { value: 40, message: validationErrors.maxLength(40) } }}
          onBlur={handleBlur}
          required
        />
      </Col>
      {showSubTitle && (
        <Col xs={12}>
          <CommonInput
            type="text"
            register={register}
            errors={errors}
            className={errors.sSubTitle && 'error'}
            name="sSubTitle"
            label="Sub Title"
            validation={{ maxLength: { value: 100, message: validationErrors.maxLength(100) } }}
          />
        </Col>
      )}
    </Row>
  )
}

AddCategory.propTypes = {
  register: PropTypes.func,
  errors: PropTypes.object,
  control: PropTypes.object,
  nameChanged: PropTypes.func,
  data: PropTypes.object,
  watch: PropTypes.func,
  values: PropTypes.object,
  setValue: PropTypes.func,
  getParentUrl: PropTypes.func,
  showSubTitle: PropTypes.bool
}

export default AddCategory
