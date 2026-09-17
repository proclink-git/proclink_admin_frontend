import React from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import Select from 'react-select'
import { Controller, useForm } from 'react-hook-form'

import Loading from '../loading'
import useReactSelect from 'shared/hooks/useReactSelect'
import { GET_ROLES } from 'graph-ql/settings/role'
import { validationErrors } from 'shared/constants/ValidationErrors'

function RoleAddEdit({ onAddRole, id, apiCall, defaultRole }) {
  const {
    handleSubmit,
    formState: { errors },
    control
  } = useForm({ defaultValues: defaultRole })
  const {
    onApiResponce,
    // handleScroll,
    // handleSearch,
    loading,
    items: category
  } = useReactSelect({
    query: GET_ROLES,
    responceCallBack: (data) => {
      onApiResponce(data?.getRoles?.aResults)
    }
  })

  function onSubmit(d) {
    onAddRole(d.aRole)
  }
  return (
    <>
      {loading && <Loading />}

      <Form className="role-add-edit" onSubmit={handleSubmit(onSubmit)}>
        <div className="top-d-button">
          <Button variant="success" type="submit" className="square" size="sm">
            <FormattedMessage id="save" />
          </Button>
        </div>
        <Form.Group className="form-group">
          <Form.Label>Role*</Form.Label>
          <Controller
            name="aRole"
            rules={{ required: validationErrors.required }}
            control={control}
            render={({ field: { onChange, value = [], ref } }) => {
              return (
                <Select
                  ref={ref}
                  isLoading={loading}
                  placeholder="Select Role"
                  value={value}
                  options={category}
                  getOptionLabel={(option) => option.sName}
                  getOptionValue={(option) => option._id}
                  className={`react-select ${errors?.aRole && 'error'}`}
                  classNamePrefix="select"
                  isSearchable
                  isMulti
                  closeMenuOnSelect={false}
                  onChange={onChange}
                />
              )
            }}
          />
          {errors.aRole && (
            <Form.Control.Feedback className="pt-1" type="invalid">
              {errors.aRole.message}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      </Form>
    </>
  )
}
RoleAddEdit.propTypes = {
  onAddRole: PropTypes.func,
  id: PropTypes.string,
  apiCall: PropTypes.bool,
  defaultRole: PropTypes.object
}
export default RoleAddEdit
