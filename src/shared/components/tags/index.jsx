import React from 'react'
import PropTypes from 'prop-types'
// import { Form } from 'react-bootstrap'
// import { FormattedMessage } from 'react-intl'

import { validationErrors } from 'shared/constants/ValidationErrors'
import CommonInput from '../common-input'

function AddTag({ register, errors, control, nameChanged, name }) {
  function handleBlur({ target }) {
    !name && nameChanged(target.value)
  }

  return (
    <>
      <CommonInput
        type="text"
        onBlur={handleBlur}
        register={register}
        errors={errors}
        className={errors.sName && 'error'}
        name="sName"
        label="name"
        validation={{ maxLength: { value: 40, message: validationErrors.maxLength(40) } }}
        required
      />
      <CommonInput
        // placeholder={useIntl().formatMessage({ id: 'writeHere' })}
        // altText="nameIsHowItAppearsOnTheSite"
        type="text"
        register={register}
        errors={errors}
        className={errors.sSubTitle && 'error'}
        name="sSubTitle"
        label="Sub Title"
        validation={{ maxLength: { value: 100, message: validationErrors.maxLength(100) } }}
      // onBlur={handleBlur}
      // required
      />
      {/* <Form.Group className="form-group">
        <Form.Label>
          <FormattedMessage id="content" />
        </Form.Label>
        <TinyEditor className={`form-control ${errors.sContent && 'error'}`} name="sContent" control={control} onlyTextFormatting />
        {errors.sContent && <Form.Control.Feedback type="invalid">{errors.sContent.message}</Form.Control.Feedback>}
      </Form.Group> */}
    </>
  )
}

AddTag.propTypes = {
  register: PropTypes.func,
  errors: PropTypes.object,
  setValue: PropTypes.func,
  reset: PropTypes.func,
  control: PropTypes.object,
  nameChanged: PropTypes.func,
  data: PropTypes.object,
  watch: PropTypes.func,
  getValues: PropTypes.func,
  setSeoData: PropTypes.func,
  clearErrors: PropTypes.func,
  setTagSlug: PropTypes.func,
  name: PropTypes.string,
  tagData: PropTypes.object
}

export default AddTag
