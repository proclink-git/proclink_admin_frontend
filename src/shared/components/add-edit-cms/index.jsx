import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Row, Col } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'

import { validationErrors } from 'shared/constants/ValidationErrors'
import TinyEditor from 'shared/components/editor'
import CommonInput from '../common-input'

function AddEditCms({ register, errors, data, control, nameChanged }) {
  const [name, setName] = useState()
  useEffect(() => {
    name && nameChanged(name)
  }, [name])
  function handleBlur(e) {
    e.target.value && !name && setName(e.target.value)
  }
  return (
    <>
      <Row>
        <Col sm="12">
          <CommonInput
            type="text"
            register={register}
            errors={errors}
            onBlur={handleBlur}
            className={errors?.sTitle && 'error'}
            validation={{ maxLength: { value: 150, message: validationErrors.maxLength(150) } }}
            name="sTitle"
            label="title"
            required
          />
          <CommonInput
            type="textarea"
            register={register}
            errors={errors}
            className={errors?.sDescription && 'error'}
            validation={{ maxLength: { value: 200, message: validationErrors.maxLength(200) } }}
            name="sDescription"
            label="description"
          />
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="content" />*
            </Form.Label>
            <TinyEditor className={'form-control'} name="sContent" control={control} initialValue={data?.sContent} required />
            {errors.sContent && <Form.Control.Feedback type="invalid">{errors.sContent.message}</Form.Control.Feedback>}
          </Form.Group>
        </Col>
      </Row>
    </>
  )
}
AddEditCms.propTypes = {
  register: PropTypes.func,
  errors: PropTypes.object,
  control: PropTypes.object,
  data: PropTypes.object,
  nameChanged: PropTypes.func
}

export default AddEditCms
