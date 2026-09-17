import React, { Fragment, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Accordion, Button, Form } from 'react-bootstrap'
import { confirmAlert } from 'react-confirm-alert'
import { FormattedMessage } from 'react-intl'

import CustomToggle from '../custom-toggle'
import RolePermissionDropdown from '../role-permission-dropdown'
import { validationErrors } from 'shared/constants/ValidationErrors'
import Drawer from '../drawer'
import RoleAddEdit from '../role-add-edit'
import CustomAlert from '../alert'

function StepTwo({ nextStep, previous, register, submit, errors, control, values, clearErrors, trigger, id, hidden, selectedRole }) {
  const [isRoleOpen, setIsRoleOpen] = useState(false)
  const [defaultRole, setDefaultRole] = useState([])
  const [extraPermission, setExtraPermission] = useState([])
  const [roleError, setRoleError] = useState(false)

  useEffect(() => {
    if (defaultRole && !defaultRole.length && !extraPermission?.length) {
      setRoleError(true)
    } else {
      setRoleError(false)
    }
  }, [defaultRole, extraPermission])

  useEffect(() => {
    if (selectedRole) {
      const extraPermissions = []
      const role = []
      const permission = selectedRole.aPermissions.map((item) => {
        if (!item.aRoles.length) extraPermissions.push(item.iPermissionId)
        return { ...item, aRoles: item.aRoles.map((role) => role._id) }
      })
      selectedRole.aRoleId.forEach((item) => {
        permission.map((ele) => {
          if (ele.aRoles.includes(item._id)) {
            if (role.map((e) => e._id).includes(item._id)) {
              // if role added then add only permission
              role.forEach((dRole) => {
                dRole._id === item._id && dRole.aPermissions.push(ele.iPermissionId)
              })
            } else {
              // Add role if it's not added
              role.push({ ...item, aPermissions: [ele.iPermissionId] })
            }
          }
          ele.aRoles = ele.aRoles.filter((role) => role !== item._id) // Delete Role from permission it it's match
          return ele
        })
      })
      setDefaultRole(role)
      extraPermissions.length && setExtraPermission(extraPermissions)
    }
    // const mediaSelected = values.aSocialProfiles.map((ele) => ele.eSocialNetworkType)
    // setSelectedMedia(mediaSelected)
  }, [selectedRole])

  function handleAddRole(data) {
    const changedRole = data?.sParentRole?.map((a) => ({ ...a }))
    const editedPermission = Object.keys(data.aPermissions).filter((key) => data.aPermissions[key])
    changedRole?.forEach((item) => {
      item.aPermissions = item.aPermissions.filter((permission) => editedPermission.includes(permission._id) && permission)
    })
    setExtraPermission(data.extraPermission)
    setDefaultRole(changedRole)
    setIsRoleOpen(!isRoleOpen)
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
            setDefaultRole(defaultRole.filter((item) => item._id !== id))
          }
        },
        {
          label: 'No'
        }
      ]
    })
  }

  function onSubmit(data) {
    trigger()
    const aPermissions = convertRole({ defaultRole, extraPermission })
    const aRoleId = defaultRole.map((item) => item._id)
    nextStep(3, { ...data, oRole: { aRoleId, aPermissions } })
  }

  function convertRole(oRole) {
    const array = []
    oRole.defaultRole.forEach((s) => {
      s.aPermissions.forEach((p) => {
        const index = array.map((x) => x.iPermissionId).indexOf(p._id)
        if (index >= 0) {
          array[index].aRoles.push(s._id)
        } else {
          array.push({ iPermissionId: p._id, aRoles: [s._id] })
        }
      })
    })

    oRole.extraPermission.forEach((s) => {
      array.push({ iPermissionId: s._id })
    })
    return array
  }

  return (
    <>
      {/* <Form hidden={hidden} className="step-two" onSubmit={submit(onSubmit)} autoComplete="off"> */}
      {/* <input type="checkbox" className="d-none" {...register('bIsCustom')} defaultValue={false} /> */}
      <div className="role-listing">
        <h2 className="title-txt d-flex align-items-center justify-content-between">
          <FormattedMessage id="Roles" />
          <Button type="button" variant="outline-primary" onClick={() => setIsRoleOpen(!isRoleOpen)}>
            <FormattedMessage id="add/EditRole" />
          </Button>
        </h2>
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
              {defaultRole?.map((role, index) => {
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
              {extraPermission.length > 0 && (
                <>
                  <tr>
                    <td className="title-b" colSpan="2">
                      <CustomToggle Tag="i" className="icon-arrow-drop-down" eventKey={defaultRole?.length + 1} />
                      <span>
                        <FormattedMessage id="extraPermissions" />
                      </span>
                    </td>
                  </tr>
                  <RolePermissionDropdown data={extraPermission} eventKey={defaultRole?.length + 1} colSpan={2} />
                </>
              )}
            </tbody>
          </table>
          {roleError && (
            <Form.Control.Feedback className="mt-2" type="invalid">
              {validationErrors.selectRoleAndPermission}
            </Form.Control.Feedback>
          )}
        </Accordion>
      </div>
      <div className="btn-bottom mt-4">
        <Button onClick={submit(onSubmit)} type="submit" variant="primary" disabled={roleError}>
          Submit
        </Button>
      </div>
      {/* </Form> */}
      <Drawer isOpen={isRoleOpen} onClose={() => setIsRoleOpen(!isRoleOpen)} title={'Add / Edit Role'}>
        <RoleAddEdit onAddRole={handleAddRole} defaultRole={{ role: defaultRole, extraPermission }} />
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
  clearErrors: PropTypes.func,
  trigger: PropTypes.func,
  id: PropTypes.string,
  sPanPicture: PropTypes.string,
  sBankDetailPic: PropTypes.string,
  hidden: PropTypes.bool,
  selectedRole: PropTypes.object
}
export default StepTwo
