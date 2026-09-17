import React from 'react'
import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'
import { Controller, useFormContext } from 'react-hook-form'
import Select from 'react-select'

import { LIST_TESTIMONIAL_WITHOUT_PERMISSION } from 'graph-ql/testimonial/query'
import useReactSelect from 'shared/hooks/useReactSelect'
import CommonInput from 'shared/components/common-input'

function TestimonialsComponent({ basePath, testimonialsName = 'aTestimonial', testimonialComponentTitle = 'sTestimonialComponentTitle', testimonialComponentDescription = 'sTestimonialComponentDescription' }) {
  const {
    control,
    register,
    formState: { errors }
  } = useFormContext()
  const {
    onApiResponce,
    handleScroll,
    handleSearch,
    loading,
    items: category
  } = useReactSelect({
    query: LIST_TESTIMONIAL_WITHOUT_PERMISSION,
    requestParams: {
      nLimit: 10,
      nOrder: -1,
      nSkip: 1,
      sSearch: '',
      sSortBy: 'dCreated'
    },
    responceCallBack: (data) => {
      onApiResponce(data?.listTestimonialWithoutPermissions?.aResults)
    }
  })
  const fieldName = basePath || testimonialsName
  const splitName = fieldName.split('.')
  function getNestedError(obj, keys) {
    return keys.reduce((obj, key) => {
      const cleanKey = key.replace(/\[|\]/g, '')
      return obj && obj[cleanKey] !== 'undefined' ? obj[cleanKey] : undefined
    }, obj)
  }
  const nestedError = getNestedError(errors, splitName)
  return (
    <Form.Group className="form-group mb-0">
      <Form.Label>Testimonials</Form.Label>
      <CommonInput
      type="text"
      register={register}
      label="Component Title"
      name={testimonialComponentTitle}
      error={errors}
      />
      <CommonInput
      type="text"
      register={register}
      label="Component Description"
      name={testimonialComponentDescription}
      error={errors}
      />
      <Controller
        name={fieldName}
        control={control}
        render={({ field: { onChange, value = [], ref } }) => {
          return (
            <Select
              ref={ref}
              isLoading={loading}
              value={value}
              options={category}
              getOptionLabel={(option) => option.sTitle}
              getOptionValue={(option) => option._id}
              className="react-select"
              classNamePrefix="select"
              onInputChange={handleSearch}
              isSearchable
              onMenuScrollToBottom={handleScroll}
              closeMenuOnSelect={false}
              isMulti
              onChange={onChange}
            />
          )
        }}
      />
      {nestedError && <Form.Control.Feedback type="invalid">{nestedError.message}</Form.Control.Feedback>}
    </Form.Group>
  )
}
TestimonialsComponent.propTypes = {
  basePath: PropTypes.string,
  testimonialsName: PropTypes.string,
  testimonialComponentTitle: PropTypes.string,
  testimonialComponentDescription: PropTypes.string
}

export default TestimonialsComponent
