import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { FormattedMessage } from 'react-intl'
import Select from 'react-select'

import { SEO_REDIRECTS_TYPE_BY_CODE } from 'shared/constants'

function SeoRedirectsFilter({ filterChange, defaultValue }) {
  const { handleSubmit, setValue, control } = useForm({})

  useEffect(() => {
    if (defaultValue) {
      const paramCode = SEO_REDIRECTS_TYPE_BY_CODE.filter((code) => defaultValue.includes(code.value) && code)
      setValue('aCodeFilters', paramCode)
    }
  }, [defaultValue])

  function onSubmit(data) {
    data.aCodeFilters = data.aCodeFilters ? data.aCodeFilters.map((item) => item.value) : []
    filterChange({ data })
  }

  function onReset() {
    setValue('aCodeFilters', [])
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
          <FormattedMessage id="type" />
        </Form.Label>
        <Controller
          name="aCodeFilters"
          control={control}
          render={({ field: { onChange, value = [], ref } }) => (
            <Select
              ref={ref}
              value={value}
              options={SEO_REDIRECTS_TYPE_BY_CODE}
              isMulti
              isClearable
              className="react-select"
              closeMenuOnSelect={false}
              classNamePrefix="select"
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
SeoRedirectsFilter.propTypes = {
  filterChange: PropTypes.func,
  defaultValue: PropTypes.array
}
export default SeoRedirectsFilter
