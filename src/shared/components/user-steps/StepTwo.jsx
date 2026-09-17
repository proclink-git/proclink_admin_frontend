import React, { Fragment, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Accordion, Button, Form } from 'react-bootstrap'
import { confirmAlert } from 'react-confirm-alert'
import { FormattedMessage } from 'react-intl'

import CustomToggle from '../custom-toggle'
import RolePermissionDropdown from '../role-permission-dropdown'
import Drawer from '../drawer'
import RoleAddEdit from '../role-add-edit'
import CustomAlert from '../alert'
import { validationErrors } from 'shared/constants/ValidationErrors'

function getSelectedRoles(value) {
  try {
    const roles = JSON.parse(value || '[]')
    return Array.isArray(roles) ? roles : []
  } catch (error) {
    return []
  }
}

function getRolePermissions(roles = []) {
  const permissions = new Map()

  roles.forEach((role) => {
    role?.aPermissions?.forEach((permission) => {
      const permissionId = permission?.iPermissionId?._id || permission?.iPermissionId || permission?._id
      if (!permissionId) return

      const currentPermission = permissions.get(permissionId) || { iPermissionId: permissionId, aRoles: [] }
      if (role?._id && !currentPermission.aRoles.includes(role._id)) currentPermission.aRoles.push(role._id)
      permissions.set(permissionId, currentPermission)
    })
  })

  return Array.from(permissions.values())
}

function StepTwo({ nextStep, submit, register, selectedRole, watch, setValue, errors, trigger }) {
  const role = getSelectedRoles(watch('oRole.aRoleId'))
  const [isRoleOpen, setIsRoleOpen] = useState(false)

  useEffect(() => {
    setValue('oRole.aRoleId', JSON.stringify(selectedRole))
  }, [selectedRole])

  function handleAddRole(data) {
    setValue('oRole.aRoleId', JSON.stringify(data))
    setIsRoleOpen(!isRoleOpen)
    trigger()
  }
  function removeRole(id) {
    confirmAlert({
      title: 'Confirmation',
      message: 'Are you sure you want to remove this role?',
      customUI: CustomAlert,
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            const r = role.filter((item) => item._id !== id)
            setValue('oRole.aRoleId', r?.length ? JSON.stringify(r) : null)
          }
        },
        {
          label: 'No'
        }
      ]
    })
  }

  function onSubmit(data) {
    const aRoleId = role.map((item) => item._id)
    const aPermissions = getRolePermissions(role)
    nextStep(3, { ...data, oRole: { aRoleId, aPermissions } })
  }

  return (
    <>
      {/* <Form hidden={hidden} className="step-two" onSubmit={submit(onSubmit)} autoComplete="off"> */}
      {/* <input type="checkbox" className="d-none" {...register('bIsCustom')} defaultValue={false} /> */}
      <div className="role-listing">
        <h2 className="title-txt d-flex align-items-center justify-content-between">
          &nbsp;
          <Button type="button" variant="outline-primary" onClick={() => setIsRoleOpen(!isRoleOpen)}>
            <FormattedMessage id="add/EditRole" />
          </Button>
        </h2>
        <input
          type="hidden"
          {...register('oRole.aRoleId', {
            required: validationErrors.required,
            validate: (value) => getRolePermissions(getSelectedRoles(value)).length > 0 || validationErrors.selectRoleAndPermission
          })}
        />
        <Accordion>
          <table className="w-100 role-table data-table">
            <thead>
              <tr>
                <th>
                  <FormattedMessage id="roleTitle" />
                </th>
                <th className="text-end"></th>
              </tr>
            </thead>
            <tbody>
              {role?.map((role, index) => {
                return (
                  <Fragment key={role._id}>
                    <tr>
                      <td className="title-b">
                        <CustomToggle Tag="i" className="icon-arrow-drop-down" eventKey={index} />
                        <span>{role.sName}</span>
                      </td>
                      <td>
                        <Button type="button" onClick={() => removeRole(role._id)} variant="link" className="square icon-btn">
                          <i className="icon-delete d-block" />
                        </Button>
                      </td>
                    </tr>
                    <RolePermissionDropdown data={role.aPermissions} eventKey={index} colSpan={2} />
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </Accordion>
        {errors?.oRole?.aRoleId && (
          <Form.Control.Feedback className="mt-2" type="invalid">
            {errors?.oRole?.aRoleId?.message}
          </Form.Control.Feedback>
        )}
      </div>
      <div className="btn-bottom mt-4">
        <Button onClick={submit(onSubmit)} type="submit" variant="primary">
          Submit
        </Button>
      </div>
      {/* </Form> */}
      <Drawer isOpen={isRoleOpen} onClose={() => setIsRoleOpen(!isRoleOpen)} title={'Add / Edit Role'}>
        <RoleAddEdit onAddRole={handleAddRole} defaultRole={{ aRole: role }} />
      </Drawer>
    </>
  )
}
StepTwo.propTypes = {
  nextStep: PropTypes.func,
  previous: PropTypes.func,
  register: PropTypes.func,
  submit: PropTypes.func,
  setValue: PropTypes.func,
  errors: PropTypes.object,
  control: PropTypes.object,
  values: PropTypes.object,
  setError: PropTypes.func,
  watch: PropTypes.func,
  clearErrors: PropTypes.func,
  trigger: PropTypes.func,
  id: PropTypes.string,
  sPanPicture: PropTypes.string,
  sBankDetailPic: PropTypes.string,
  hidden: PropTypes.bool,
  selectedRole: PropTypes.array
}
export default StepTwo
