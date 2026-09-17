import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Form, Spinner } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { useApolloClient, useLazyQuery, useMutation, useQuery } from '@apollo/client'
import Select from 'react-select'
import { FormattedMessage, useIntl } from 'react-intl'

import { validationErrors } from 'shared/constants/ValidationErrors'
import { NO_SPECIAL_CHARACTER, PERMISSION_CATEGORY, TOAST_TYPE } from 'shared/constants'
import { GET_PERMISSION } from 'graph-ql/settings/permission'
import { GET_ROLES, ADD_ROLE, GET_ROLES_DETAIL, EDIT_ROLE } from 'graph-ql/settings/role'
import { ToastrContext } from '../toastr'
import Loading from '../loading'
import CommonInput from '../common-input'

function RoleAddEdit({ onAddRole, id, apiCall, defaultRole }) {
  const client = useApolloClient()
  const { dispatch } = useContext(ToastrContext)
  const [permission, setPermission] = useState({
    [PERMISSION_CATEGORY.content]: [],
    [PERMISSION_CATEGORY.admin]: [],
    [PERMISSION_CATEGORY.analytics]: []
  })
  const [roles, setRoles] = useState([])
  const [roleData, setRoleData] = useState()
  const [cacheData, setCacheData] = useState()
  const [userSelectedP, setUserSelectedP] = useState([])
  const close = useIntl().formatMessage({ id: 'close' })

  const {
    register: fields,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
    getValues
  } = useForm({ defaultValues: { bIsDefault: 'false' } })
  const watchFields = watch(['sParentRole', 'aPermissions'])

  const { data: permissionList, loading: permissionLoading } = useQuery(GET_PERMISSION, {
    onCompleted: (data) => {
      if (data && data.getPermissions) {
        const p = dividePermission(data.getPermissions)
        setDefaultValue(p)
      }
    }
  })

  function dividePermission(permissions) {
    const object = { [PERMISSION_CATEGORY.content]: [], [PERMISSION_CATEGORY.admin]: [], [PERMISSION_CATEGORY.analytics]: [] }
    permissions.forEach((item) => {
      if (item.eType === PERMISSION_CATEGORY.content) {
        object[PERMISSION_CATEGORY.content].push(item)
      } else if (item.eType === PERMISSION_CATEGORY.admin) {
        object[PERMISSION_CATEGORY.admin].push(item)
      } else if (item.eType === PERMISSION_CATEGORY.analytics) {
        object[PERMISSION_CATEGORY.analytics].push(item)
      }
    })
    setPermission(object)
    return object
  }

  useEffect(() => {
    if (id) {
      readCache()
    }
  }, [id])

  function readCache() {
    const data = client.readQuery({
      query: GET_ROLES_DETAIL,
      variables: { id }
    })
    data ? setCacheData(data.getRoleById) : getRoleDetail({ variables: { input: { _id: id } } })
  }

  useEffect(() => {
    if (
      []
        .concat(permission[PERMISSION_CATEGORY.content])
        .concat(permission[PERMISSION_CATEGORY.admin])
        .concat(permission[PERMISSION_CATEGORY.analytics]).length
    ) {
      if (cacheData) {
        resetValue(cacheData)
      }
    }
  }, [permission, cacheData])

  useEffect(() => {
    if (defaultRole && roles) {
      setDefaultValue()
    }
  }, [roles, defaultRole])

  function setDefaultValue(p) {
    const data = { title: '', aParent: [], aPermissions: [] }
    defaultRole?.role?.forEach((item) => {
      data.aParent = [...data.aParent, item]
      data.aPermissions = [...data.aPermissions, ...item.aPermissions]
    })
    data.aPermissions = [...data.aPermissions, ...defaultRole.extraPermission]
    setUserSelectedP(defaultRole.extraPermission.map((item) => item._id))
    resetValue(data, p)
  }

  function handleParentChange(value, type) {
    if (value && value.length > 0) {
      const parentValue = value.map((a) => ({ ...a })) // get parent value
      const getSelectedPermission = parentValue
        .map((role) => role.aPermissions.map((permission) => permission._id))
        .join()
        .split(',') // get role permission ids
      const defaultSelectedPermission = Object.keys(getValues().aPermissions || {})?.filter((e) => getValues().aPermissions[e] && e)
      if (['select-option', 'remove-value'].includes(type.action)) {
        const addRemoveId = type?.removedValue?._id || type?.option?._id
        parentValue.forEach((r) => {
          if (r._id !== addRemoveId) {
            r.aPermissions = r.aPermissions.filter((p) => defaultSelectedPermission.includes(p._id) && p)
          }
        })
      }
      const roleUserPermission = [...getSelectedPermission, ...userSelectedP]
      parentValue.forEach((item) => {
        permissionList.getPermissions.forEach((permission) => {
          // Remove permission which is not related to roles
          !roleUserPermission.includes(permission._id) && setValue(`aPermissions.${permission._id}`, false)
        })
        // add selected role permission
        item.aPermissions.forEach((addPermission) => setValue(`aPermissions.${addPermission._id}`, true))
      })
    } else if (value) {
      // if parent role not selected then remove permission
      permissionList.getPermissions.forEach((permission) => {
        !userSelectedP.includes(permission._id) && setValue(`aPermissions.${permission._id}`, false)
      })
    }
  }

  useEffect(() => {
    // handle permission Change
    if (watchFields[1] && watchFields[0] && watchFields[0].length > 0) {
      const check = {}
      watchFields[0].forEach((selectedRole) => {
        // get selected parent role
        check[selectedRole._id] = []
        selectedRole.aPermissions.forEach((permission) => {
          watchFields[1][permission._id] && check[selectedRole._id].push(permission)
        })
      })
      const changeParentRole = []
      Object.keys(check).forEach((id) => {
        // remove role without permission
        check[id].length && changeParentRole.push(id)
      })
      // change update parent role
      setValue(
        'sParentRole',
        watchFields[0].filter((role) => changeParentRole.includes(role._id))
      )
    }
    // remove error if more then 1 permission selected
    watchFields[1] && Object.values(watchFields[1]).filter((data) => data).length >= 1 && delete errors.aPermissions
  }, [JSON.stringify(watchFields[1])])

  useEffect(() => {
    if (roleData && roles) {
      const selectedRole = roleData.aParent.map((item) => item._id)
      setValue(
        'sParentRole',
        roles.filter((role) => selectedRole.includes(role._id) && role)
      )
    }
  }, [roleData, roles])

  useEffect(() => {
    if (roleData && permission) {
      const selectedPermission = roleData.aPermissions.map((item) => item._id)
      const permissionData = []
        .concat(permission[PERMISSION_CATEGORY.content])
        .concat(permission[PERMISSION_CATEGORY.admin])
        .concat(permission[PERMISSION_CATEGORY.analytics])
      permissionData.forEach((item) => {
        selectedPermission.includes(item._id) && setValue(`aPermissions.${item._id}`, true)
      })
    }
  }, [roleData, permission])

  const { loading: rolesLoading } = useQuery(GET_ROLES, {
    onCompleted: (data) => {
      if (data && data.getRoles) {
        id ? setRoles(data.getRoles.aResults.filter((item) => item._id !== id)) : setRoles(data.getRoles.aResults)
      }
    }
  })

  const [addRole, { loading: AddingRole }] = useMutation(ADD_ROLE, {
    onCompleted: (data) => {
      if (data && data.addRole) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.addRole.sMessage, type: TOAST_TYPE.Success, btnTxt: 'Close' }
        })
        onAddRole()
      }
    }
  })

  const [editRole, { loading: EditRole }] = useMutation(EDIT_ROLE, {
    onCompleted: (data) => {
      if (data && data.editRole) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editRole.sMessage, type: TOAST_TYPE.Success, btnTxt: 'Close' }
        })
        onAddRole()
      }
    }
  })

  const [getRoleDetail, { loading: roleDetailLoading }] = useLazyQuery(GET_ROLES_DETAIL, {
    onCompleted: (data) => {
      if (data && data.getRoleById) {
        resetValue(data.getRoleById)
        setRoleData(data.getRoleById)
      }
    }
  })

  function resetValue(data, per) {
    const p = per || permission
    const selectedRole = data.aParent.map((item) => item._id)
    const selectedPermission = data.aPermissions.map((item) => item._id)
    setValue('sName', data.sName)
    setValue('bIsDefault', data.bIsDefault ? 'true' : 'false')
    setValue(
      'sParentRole',
      roles.filter((role) => selectedRole.includes(role._id) && role)
    )
    const permissionData = []
      .concat(p[PERMISSION_CATEGORY.content])
      .concat(p[PERMISSION_CATEGORY.admin])
      .concat(p[PERMISSION_CATEGORY.analytics])
    permissionData.forEach((item) => {
      selectedPermission.includes(item._id) && setValue(`aPermissions.${item._id}`, true)
    })
  }

  function onSubmit(data) {
    if (apiCall) {
      id &&
        editRole({
          variables: {
            sName: data.sName,
            aPermissions: Object.keys(data.aPermissions).filter((key) => data.aPermissions[key]),
            aParent: data.sParentRole ? data.sParentRole.map((item) => item._id) : [],
            bIsDefault: data.bIsDefault === 'true',
            id
          }
        })
      !id &&
        addRole({
          variables: {
            sName: data.sName,
            aPermissions: Object.keys(data.aPermissions).filter((key) => data.aPermissions[key]),
            aParent: data.sParentRole ? data.sParentRole.map((item) => item._id) : [],
            bIsDefault: data.bIsDefault === 'true'
          }
        })
    } else {
      const extraPermission = permissionList.getPermissions.filter((item) => userSelectedP.includes(item._id) && item)
      onAddRole({ ...data, extraPermission })
    }
  }

  function onError(error) {
    if (error.aPermissions) {
      dispatch({
        type: 'SHOW_TOAST',
        payload: {
          message: error.aPermissions[Object.keys(error.aPermissions)[0]].message,
          type: TOAST_TYPE.Error,
          btnTxt: close
        }
      })
    }
  }

  return (
    <>
      {(permissionLoading || rolesLoading || roleDetailLoading) && <Loading />}

      <Form className="role-add-edit" onSubmit={handleSubmit(onSubmit, onError)}>
        <div className="top-d-button">
          <Button variant="success" disabled={AddingRole || EditRole} type="submit" className="square" size="sm">
            <FormattedMessage id="save" />

            {(AddingRole || EditRole) && <Spinner animation="border" size="sm" />}
          </Button>
        </div>
        {apiCall && (
          <CommonInput
            placeholder={useIntl().formatMessage({ id: 'superAdmin' })}
            type="text"
            register={fields}
            errors={errors}
            className={`form-control ${errors?.sName && 'error'}`}
            name="sName"
            label="name"
            validation={{ pattern: { value: NO_SPECIAL_CHARACTER, message: validationErrors.noSpecialCharacters } }}
            required
          />
        )}
        <Form.Group className="form-group">
          <Form.Label>{apiCall ? useIntl().formatMessage({ id: 'parentRole' }) : 'Select Role'}</Form.Label>
          <Controller
            name="sParentRole"
            control={control}
            render={({ field: { onChange, value = [], ref } }) => (
              <Select
                ref={ref}
                value={value}
                options={roles}
                getOptionLabel={(option) => option.sName}
                getOptionValue={(option) => option._id}
                isMulti
                isSearchable
                className="react-select"
                classNamePrefix="select"
                closeMenuOnSelect={false}
                onChange={(e, t) => {
                  handleParentChange(e, t)
                  onChange(e)
                }}
              />
            )}
          />
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
