import React, { useContext, useState } from 'react'
import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { Button, Form, Spinner } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { useHistory, useParams } from 'react-router-dom'

import { GET_PERMISSION } from 'graph-ql/settings/permission'
import { NO_SPECIAL_CHARACTER, TOAST_TYPE } from 'shared/constants'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { ToastrContext } from 'shared/components/toastr'
import { ADD_ROLE, EDIT_ROLE, GET_ROLES_DETAIL } from 'graph-ql/settings/role'
import { allRoutes } from 'shared/constants/AllRoutes'
import CountInput from 'shared/components/count-input'

function AddEditRole() {
  const { dispatch } = useContext(ToastrContext)
  const { id } = useParams()
  const history = useHistory()
  const [permission, setPermission] = useState({})

  useQuery(GET_PERMISSION, {
    onCompleted: (data) => {
      if (data && data.getPermissions) {
        if (id) getRoleById({ variables: { input: { _id: id } } })
        const groupedPermissions = data.getPermissions.reduce((acc, obj) => {
          const key = obj.ePerType
          if (!acc[key]) {
            acc[key] = []
          }
          acc[key].push(obj)
          return acc
        }, {})
        setPermission(groupedPermissions)
      }
    }
  })

  const [getRoleById] = useLazyQuery(GET_ROLES_DETAIL, {
    variables: { input: { _id: id } },
    onCompleted: (data) => {
      if (data && data.getRoleById) {
        setFormValue(data.getRoleById)
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
        history.push(allRoutes.roles)
      }
    }
  })

  const [editRole, { loading: editLoading }] = useMutation(EDIT_ROLE, {
    onCompleted: (data) => {
      if (data && data.editRole) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editRole.sMessage, type: TOAST_TYPE.Success, btnTxt: 'Close' }
        })
        history.push(allRoutes.roles)
      }
    }
  })

  const {
    handleSubmit,
    register,
    getValues,
    setValue,
    reset,
    formState: { errors }
  } = useForm({ mode: 'onChange' })
  const values = getValues()

  function handleSelectAll({ target }) {
    const { name, checked } = target
    const aPermissions = getValues('aPermissions')
    const newPermissions = permission?.[name].reduce((acc, item) => {
      acc[item._id] = checked
      return acc
    }, {})
    setValue('aPermissions', { ...aPermissions, ...newPermissions })
  }

  function handleCheckbox({ target }, key, item) {
    const aPermissions = getValues('aPermissions')
    aPermissions[target.id] = target.checked
    if (target.checked) {
      item?.aAssociatedPermission?.forEach((e) => {
        aPermissions[e] = target.checked
      })
    } else {
      item?.aAssociatedPermission?.forEach((aid) => {
        const otherAssociated = permission?.[key].filter(
          (p) => item?._id !== p?._id && p.aAssociatedPermission && p.aAssociatedPermission.includes(aid)
        )
        const isAllAssociatedUnchecked = otherAssociated?.every((p) => aPermissions?.[p._id] === false)
        if (isAllAssociatedUnchecked) aPermissions[aid] = target.checked
      })
    }
    setValue('aPermissions', aPermissions)
    handleIndeterminate(key, aPermissions)
  }

  function handleIndeterminate(key, value) {
    const ele = document.getElementById(key)
    if (permission?.[key]?.some((item) => value[item._id] === true)) {
      if (permission?.[key]?.every((item) => value[item._id] === true)) {
        ele.indeterminate = false
        ele.checked = true
      } else ele.indeterminate = true
      ele.checked = true
    } else {
      ele.indeterminate = false
      ele.checked = false
    }
  }

  function setFormValue(data) {
    const keySet = new Set()
    const perValue = data.aPermissions.reduce((acc, item) => {
      keySet.add(item.ePerType)
      acc[item._id] = true
      return acc
    }, {})
    reset({
      sName: data.sName,
      aPermissions: perValue
    })
    keySet.forEach((key) => {
      handleIndeterminate(key, perValue)
    })
  }

  function onSubmit(e) {
    const selectedPermissions = Object.keys(e?.aPermissions || {}).filter((key) => e.aPermissions[key])
    if (!selectedPermissions.length) {
      dispatch({
        type: 'SHOW_TOAST',
        payload: {
          message: validationErrors.selectOnePermission,
          type: TOAST_TYPE.Error
        }
      })
    } else {
      if (id) {
        editRole({ variables: { input: { ...e, aPermissions: selectedPermissions, _id: id } } })
      } else {
        addRole({ variables: { input: { ...e, aPermissions: selectedPermissions } } })
      }
    }
  }

  return (
    <Form className="role-add-edit" onSubmit={handleSubmit(onSubmit)}>
      <CountInput
        maxWord={100}
        currentLength={values?.sName?.length}
        // type="text"
        // register={register}
        error={errors}
        className={`form-control ${errors?.sName && 'error'}`}
        name="sName"
        label="name*"
        register={register('sName', {
          required: validationErrors.required,
          maxLength: { value: 100, message: validationErrors.maxLength(100) },
          pattern: { value: NO_SPECIAL_CHARACTER, message: validationErrors.noSpecialCharacters }
        })}
      />
      {Object.keys(permission).map((key) => (
        <div key={key} className="border border-secondary mb-3 rounded-2">
          <div className="border-bottom border-secondary p-2 bg-secondary bg-opacity-25">
            <Form.Check
              onClick={handleSelectAll}
              className="mb-0"
              style={{ minHeight: 'initial' }}
              type="checkbox"
              name={key}
              label={key}
              id={key}
            />
          </div>
          <div className="d-flex flex-wrap py-3 px-2 gap-3">
            {permission[key].map((item) => (
              <Form.Check
                key={item._id}
                className={`m-0 ${item?.bDisabled ? 'd-none' : ''}`}
                style={{ minHeight: 'initial' }}
                onClick={(e) => handleCheckbox(e, key, item)}
                type="checkbox"
                {...register(`aPermissions.${item._id}`)}
                label={item.sTitle}
                id={item._id}
              />
            ))}
          </div>
        </div>
      ))}
      {errors?.aPermissions && <Form.Control.Feedback type="invalid">{errors.aPermissions?.message}</Form.Control.Feedback>}
      <Button variant="primary" type="submit" className="m-2" disabled={AddingRole || editLoading}>
        {id ? 'Edit' : 'Add'}
        {(AddingRole || editLoading) && <Spinner animation="border" size="sm" />}
      </Button>
    </Form>
  )
}
export default AddEditRole
