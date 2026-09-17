import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { FormattedMessage } from 'react-intl'
import Select from 'react-select'

import { parseParams } from 'shared/utils'
import { FEEDBACK_CONTACT_STATUS } from 'shared/constants'

function FeedbackContactFilter({ filterChange }) {
  const { handleSubmit, setValue, control } = useForm({})
  const params = parseParams(location.search)

  useEffect(() => {
    if (params.aState) {
      const paramState = FEEDBACK_CONTACT_STATUS.filter((d) => params.aState.includes(d.value) && d)
      setValue('aState', paramState)
    }
  }, [])

  function onSubmit(data) {
    data.aState = data.aState ? data.aState.map((item) => item.value) : []
    filterChange({ data })
  }

  function onReset() {
    setValue('aState', '')
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
          name="aState"
          control={control}
          render={({ field: { onChange, value = [], ref } }) => (
            <Select
              ref={ref}
              value={value}
              options={FEEDBACK_CONTACT_STATUS}
              isSearchable
              isMulti
              isClearable
              className="react-select"
              classNamePrefix="select"
              closeMenuOnSelect={false}
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
FeedbackContactFilter.propTypes = {
  filterChange: PropTypes.func
}
export default FeedbackContactFilter
