import React from 'react'
import { Form } from 'react-bootstrap'
import { Controller, useFormContext } from 'react-hook-form'
import Select from 'react-select'

import { LIST_INDUSTRY_WITHOUT_PERMISSION } from 'graph-ql/Industries/query'
import useReactSelect from 'shared/hooks/useReactSelect'
import CommonInput from 'shared/components/common-input'
import PropTypes from 'prop-types'
import { getNestedObject } from 'shared/utils'
function IndustriesGrid({ basePath, industryGridName = 'oIndustryGrid' }) {
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
    query: LIST_INDUSTRY_WITHOUT_PERMISSION,
    requestParams: {
      nLimit: 10,
      nOrder: -1,
      nSkip: 1,
      sSearch: '',
      sSortBy: 'dCreated'
    },
    responceCallBack: (data) => {
      onApiResponce(data?.listIndustryFront?.aResults)
    }
  })

  const fieldName = basePath || industryGridName
  const result = getNestedObject(errors, fieldName)

  return (
    <Form.Group className="form-group mb-0">
      <Form.Label>Industries Gird</Form.Label>
      <CommonInput
        type="text"
        register={register}
        label="Component Title"
        name={`${fieldName}.sTitle`}
        errors={errors}
        className={result?.sTitle && 'error'}
      />
      <CommonInput
        type="text"
        register={register}
        label="Component Description*"
        name={`${fieldName}.sDescription`}
        error={errors}
        className={result?.sDescription && 'error'}
      />
      <Controller
        name={`${fieldName}.aIndustry`}
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
      {result?.aIndustry && <Form.Control.Feedback type="invalid">{result?.aIndustry?.message}</Form.Control.Feedback>}
    </Form.Group>
  )
}
export default IndustriesGrid

IndustriesGrid.propTypes = {
  basePath: PropTypes.string,
  industryGridName: PropTypes.string
}
