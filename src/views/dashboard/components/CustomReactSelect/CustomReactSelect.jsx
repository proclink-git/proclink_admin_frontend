import React from 'react'
import PropTypes from 'prop-types'
import Select, { components } from 'react-select'
import DownArrowIcon from 'assets/images/down-arrow-filled.svg'
import './customReactSelect.scss'

// custom dropdown icon
const DropdownIndicator = (props) => {
  return (
    <components.DropdownIndicator {...props}>
      <img className="pe-1" src={DownArrowIcon} alt="down arrow-icon" width={32} />
    </components.DropdownIndicator>
  )
}

export const CustomReactSelect = (props) => {
  const { isLoading, options, placeholder = '', value, isClearable = false, onChange, isDisabled = false, onInputChange, ...rest } = props

  return (
    <Select
      onChange={onChange}
      isLoading={isLoading}
      options={options}
      onInputChange={onInputChange}
      placeholder={placeholder}
      value={value}
      isClearable={isClearable}
      isDisabled={isDisabled}
      className="rs"
      classNamePrefix="select"
      {...rest}
      components={{
        DropdownIndicator
      }}
    />
  )
}

CustomReactSelect.propTypes = {
  isLoading: PropTypes.bool,
  options: PropTypes.array.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.object,
  isClearable: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  onInputChange: PropTypes.func
}
