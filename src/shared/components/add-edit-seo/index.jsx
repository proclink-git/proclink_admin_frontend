import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col } from 'react-bootstrap'
import { useParams } from 'react-router-dom'

import { validationErrors } from 'shared/constants/ValidationErrors'
import { URL_PREFIX, CUSTOM_URL_WITH_SLASH } from 'shared/constants'
import CommonInput from '../common-input'

function AddEditSeo({ register, errors, getSeoBySlug, disabled }) {
  const { id } = useParams()

  function handleBlur(e) {
    if (!id) {
      getSeoBySlug({ variables: { input: { sSlug: e.target.value } } })
    }
  }
  return (
    <>
      <Row>
        <Col sm="12">
          <CommonInput
            type="text"
            register={register}
            urlPrifix={URL_PREFIX}
            errors={errors}
            onBlur={handleBlur}
            className={errors?.customSlug && 'error'}
            validation={{ pattern: { value: CUSTOM_URL_WITH_SLASH, message: validationErrors.customURL } }}
            name="customSlug"
            disabled={disabled || id}
            label="slug"
            required
          />
        </Col>
      </Row>
    </>
  )
}
AddEditSeo.propTypes = {
  register: PropTypes.func,
  errors: PropTypes.object,
  getSeoBySlug: PropTypes.func,
  disabled: PropTypes.bool
}

export default AddEditSeo
