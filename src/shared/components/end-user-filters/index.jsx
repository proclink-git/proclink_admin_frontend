import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { Button, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import Select from 'react-select'

import { FRONT_USER_FILTER } from 'shared/constants'

function EndUserFilters({ filterChange, type, defaultValue }) {
  const { handleSubmit, control, reset, setValue, getValues } = useForm({})
  const values = getValues()

  useEffect(() => {
    if (defaultValue.eStatus) {
      const paramStatusFilter = FRONT_USER_FILTER.filter((role) => role.value === defaultValue.eStatus)
      setValue('eStatusFilters', paramStatusFilter)
    }
  }, [defaultValue.eStatusFilter])

  function onSubmit(data) {
    filterChange({ data })
  }

  function onReset() {
    reset({})
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
        <Form.Label>
          <FormattedMessage id="status" />
        </Form.Label>
        <Controller
          name="eStatusFilters"
          control={control}
          render={({ field: { onChange, value = [], ref } }) => (
            <Select
              ref={ref}
              value={value || values?.eStatusFilters}
              options={FRONT_USER_FILTER}
              className="react-select"
              classNamePrefix="select"
              closeMenuOnSelect={true}
              onChange={(e) => {
                onChange(e)
              }}
            />
          )}
        />
      </Form.Group>
    </Form>
  )
}
EndUserFilters.propTypes = {
  filterChange: PropTypes.func,
  defaultValue: PropTypes.object,
  type: PropTypes.string
}
export default EndUserFilters
