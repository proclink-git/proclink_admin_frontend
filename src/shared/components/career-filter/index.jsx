import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'
import { Button, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { FormattedMessage } from 'react-intl'

import { ONLY_NUMBER } from 'shared/constants'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { getCareerLocationOption } from 'shared/utils/career-location'

function getSelectedLocation(value, locationOptions) {
  return getCareerLocationOption(value, locationOptions)
}

function normalizeNumber(value) {
  if (value === '' || value === null || value === undefined) return ''
  return Number(value)
}

function CareerFilter({ filterChange, defaultValue, locationOptions = [] }) {
  const {
    handleSubmit,
    reset,
    register,
    control,
    formState: { errors }
  } = useForm({
    defaultValues: {
      iLocationId: getSelectedLocation(defaultValue?.iLocationId, locationOptions),
      nExperienceFilterMin: defaultValue?.nExperienceFilterMin || '',
      nExperienceFilterMax: defaultValue?.nExperienceFilterMax || ''
    }
  })

  useEffect(() => {
    reset({
      iLocationId: getSelectedLocation(defaultValue?.iLocationId, locationOptions),
      nExperienceFilterMin: defaultValue?.nExperienceFilterMin || '',
      nExperienceFilterMax: defaultValue?.nExperienceFilterMax || ''
    })
  }, [defaultValue, locationOptions, reset])

  function onSubmit(data) {
    filterChange({
      data: {
        iLocationId: data?.iLocationId?.value || '',
        nExperienceFilterMin: normalizeNumber(data?.nExperienceFilterMin),
        nExperienceFilterMax: normalizeNumber(data?.nExperienceFilterMax)
      }
    })
  }

  function onReset() {
    reset({
      iLocationId: null,
      nExperienceFilterMin: '',
      nExperienceFilterMax: ''
    })
  }

  return (
    <Form className="user-filter" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="top-d-button">
        <Button variant="outline-secondary" type="reset" onClick={onReset} className="square me-2" size="sm">
          <FormattedMessage id="reset" />
        </Button>
        <Button variant="success" type="submit" className="square" size="sm">
          <FormattedMessage id="apply" />
        </Button>
      </div>
      <Form.Group className="form-group">
        <Form.Label>Location</Form.Label>
        <Controller
          name="iLocationId"
          control={control}
          render={({ field: { onChange, value = null, ref } }) => (
            <Select
              ref={ref}
              value={value}
              options={locationOptions}
              className="react-select"
              classNamePrefix="select"
              isSearchable
              isClearable
              onChange={onChange}
            />
          )}
        />
      </Form.Group>
      <Form.Group className="form-group">
        <Form.Label>Min Experience</Form.Label>
        <Form.Control
          type="text"
          name="nExperienceFilterMin"
          className={errors?.nExperienceFilterMin && 'error'}
          {...register('nExperienceFilterMin', {
            pattern: { value: ONLY_NUMBER, message: validationErrors.number }
          })}
        />
        {errors?.nExperienceFilterMin && <Form.Control.Feedback type="invalid">{errors.nExperienceFilterMin.message}</Form.Control.Feedback>}
      </Form.Group>
      <Form.Group className="form-group">
        <Form.Label>Max Experience</Form.Label>
        <Form.Control
          type="text"
          name="nExperienceFilterMax"
          className={errors?.nExperienceFilterMax && 'error'}
          {...register('nExperienceFilterMax', {
            pattern: { value: ONLY_NUMBER, message: validationErrors.number }
          })}
        />
        {errors?.nExperienceFilterMax && <Form.Control.Feedback type="invalid">{errors.nExperienceFilterMax.message}</Form.Control.Feedback>}
      </Form.Group>
    </Form>
  )
}

CareerFilter.propTypes = {
  filterChange: PropTypes.func,
  defaultValue: PropTypes.object,
  locationOptions: PropTypes.array
}

export default CareerFilter
