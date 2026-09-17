import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { useQuery } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'

import { GET_ROLES } from 'graph-ql/settings/role'
import { USER_CUSTOM_FILTER } from 'shared/constants'

function UserFilters({ filterChange, defaultValue }) {
  const [roles, setRoles] = useState([])
  const [selectedRole, setSelectedRole] = useState([])
  const { register, handleSubmit, reset, setValue } = useForm({ mode: 'onTouched' })

  useQuery(GET_ROLES, {
    onCompleted: (data) => {
      if (data && data.getRoles) {
        setRoles(data.getRoles.aResults)
      }
    }
  })

  useEffect(() => {
    if (defaultValue && roles.length) {
      const value = {}
      setSelectedRole(defaultValue.filter((item) => !USER_CUSTOM_FILTER.includes(item.replace(/([A-Z])/g, ' $1')) && item))
      defaultValue.forEach((item) => {
        value[item] = true
      })
      reset(value)
    }
  }, [defaultValue, roles])

  useEffect(() => {
    if (selectedRole && roles.length) {
      setValue('selectAll', selectedRole.length === roles.length)
    }
  }, [selectedRole])

  function handleSelectAll(e) {
    roles.forEach((item) => setValue(item._id, e.target.checked))
  }

  function handleRole({ target }) {
    if (target.checked) {
      setSelectedRole([...selectedRole, target.name])
    } else {
      setSelectedRole((data) => data.filter((item) => item !== target.name))
    }
  }

  function onSubmit(data) {
    filterChange(Object.keys(data).filter((key) => data[key] && key !== 'selectAll'))
  }
  return (
    <Form className="user-filter" onSubmit={handleSubmit(onSubmit)}>
      <div className="top-d-button">
        <Button variant="success" type="submit" className="square" size="sm">
          <FormattedMessage id="save" />
        </Button>
      </div>
      <div className="box">
        <h2 className="title d-flex align-items-center justify-content-between">
          <span>
            <FormattedMessage id="selectRole" />
          </span>
          <Form.Check
            type="checkbox"
            onClick={handleSelectAll}
            {...register('selectAll')}
            label={useIntl().formatMessage({ id: 'selectAll' })}
            className="m-0"
            id={'selectAll'}
          />
        </h2>
        <Row>
          {roles.map((item) => {
            return (
              <Col key={item._id} sm={6}>
                <Form.Check type="checkbox" {...register(item._id)} onClick={handleRole} label={item.sName} id={item._id} />
              </Col>
            )
          })}
        </Row>
      </div>
      {/* <div className="box">
        <h2 className="title">
          <span>
            <FormattedMessage id="otherOptions" />
          </span>
        </h2>
        {USER_CUSTOM_FILTER.map((item) => {
          return (
            <Form.Check
              key={item}
              type="checkbox"
              {...register(item.replaceAll(' ', ''))}
              label={item}
              id={item.replaceAll(' ', '')}
              className="ms-0"
            />
          )
        })}
      </div> */}
    </Form>
  )
}
UserFilters.propTypes = {
  filterChange: PropTypes.func,
  defaultValue: PropTypes.array
}
export default UserFilters
