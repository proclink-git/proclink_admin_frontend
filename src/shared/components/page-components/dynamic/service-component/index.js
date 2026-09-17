/* eslint-disable no-unused-vars */
import { React } from 'react'
import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'
import { Controller, useFormContext } from 'react-hook-form'
import { LIST_SERVICE_WITHOUT_PERMISSION } from 'graph-ql/services/query'
import useReactSelect from 'shared/hooks/useReactSelect'
import Select from 'react-select'
import CommonInput from 'shared/components/common-input'
import { getNestedObject } from 'shared/utils'

export default function ServiceComponent({ basePath, serviceComponent = 'oServiceComponent' }) {
  const {
    formState: { errors },
    register,
    getValues,
    control
  } = useFormContext()
  const fieldName = basePath || serviceComponent

  const {
    onApiResponce,
    handleScroll,
    handleSearch,
    loading,
    items: category
  } = useReactSelect({
    query: LIST_SERVICE_WITHOUT_PERMISSION,
    requestParams: {
      nLimit: 10,
      nSkip: 1,
      sSearch: ''
    },
    responceCallBack: (data) => {
      onApiResponce(data?.listServiceFront?.aResults)
    }
  })

  const result = getNestedObject(errors, fieldName)

  return (
    <>
      <Form.Group className="form-group mb-0">
        <Form.Label>Service Component</Form.Label>
        <CommonInput
          type="text"
          register={register}
          label="Title"
          name={`${fieldName}.sTitle`}
          errors={errors}
          className={result?.sTitle && 'error'}
        />
        <CommonInput
          type="text"
          register={register}
          label="Description"
          name={`${fieldName}.sDescription`}
          errors={errors}
          className={result?.sDescription && 'error'}
        />
      </Form.Group>
      <Form.Group className="form-group mb-0">
        <Controller
          name={`${fieldName}.aService`}
          control={control}
          render={({ field: { onChange, value = [], ref } }) => {
            return (
              <Select
                ref={ref}
                isLoading={loading}
                value={value}
                options={category}
                getOptionLabel={(option) => option.sShortTitle}
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
        {result?.aService && <Form.Control.Feedback type="invalid">{result.aService.message}</Form.Control.Feedback>}
      </Form.Group>
    </>
  )
}

ServiceComponent.propTypes = {
  basePath: PropTypes.string,
  serviceComponent: PropTypes.string
}
