import React from 'react'
import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'
import { Controller, useFormContext } from 'react-hook-form'
import Select from 'react-select'

import { LIST_INDUSTRY_WITHOUT_PERMISSION } from 'graph-ql/Industries/query'
import useReactSelect from 'shared/hooks/useReactSelect'
import TinyEditor from 'shared/components/editor'
import CountInput from 'shared/components/count-input'

function IndustriesSlider({ basePath, industriesName = 'oHomePage.oIndustrySlider.aIndustry' }) {
  const {
    control,
    formState: { errors },
    register
  } = useFormContext()
  const sectionPath = basePath || industriesName.replace(/\.aIndustry$/, '')
  const industryFieldName = basePath ? `${basePath}.aIndustry` : industriesName
  const splitName = industryFieldName.split('.')
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

  function getNestedError(obj, keys) {
    return splitName.reduce((obj, key) => {
      const cleanKey = key.replace(/\[|\]/g, '')
      return obj && obj[cleanKey] !== 'undefined' ? obj[cleanKey] : undefined
    }, obj)
  }
  const nestedError = getNestedError(errors, splitName)

  return (
    <>
      <Form.Label>Industries Slider</Form.Label>
      <CountInput
        name={`${sectionPath}.sTitle`}
        label="Title"
        type="text"
        error={errors}
        register={register(`${sectionPath}.sTitle`)}
      />
      <Form.Group className="form-group">
        <Form.Label>Description*</Form.Label>
        <TinyEditor name={`${sectionPath}.sDescription`} control={control} onlyTextFormatting minHeight={500} />
      </Form.Group>
      <Form.Group className="form-group mb-0">
        <Controller
          name={industryFieldName}
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
        {nestedError && <Form.Control.Feedback type="invalid">{nestedError.message}</Form.Control.Feedback>}
      </Form.Group>
    </>
  )
}
IndustriesSlider.propTypes = {
  basePath: PropTypes.string,
  industriesName: PropTypes.string
}
export default IndustriesSlider
