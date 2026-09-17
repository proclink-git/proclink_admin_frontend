import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Accordion } from 'react-bootstrap'
import { useHistory } from 'react-router'
import { useMutation, useQuery } from '@apollo/client'
import { confirmAlert } from 'react-confirm-alert'
import { useIntl } from 'react-intl'

import TopBar from 'shared/components/top-bar'
import DataTable from 'shared/components/data-table'
import RoleItemRow from 'shared/components/role-item-row'
import CustomAlert from 'shared/components/alert'
import { GET_ROLES, DELETE_ROLE } from 'graph-ql/settings/role'
import { sortArray, searchFromArray, setSortType, parseParams, appendParams } from 'shared/utils'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import { allRoutes } from 'shared/constants/AllRoutes'

function Roles({ userPermission }) {
  const router = useHistory()
  const { dispatch } = useContext(ToastrContext)
  const params = parseParams(location.search)
  const [roles, setRoles] = useState([])
  const [columns, setColumns] = useState([
    {
      name: useIntl().formatMessage({ id: 'title' }),
      internalName: 'sName',
      type: params.nOrder || 0
    },
    { name: useIntl().formatMessage({ id: 'lastUpdated' }), internalName: 'dUpdated', type: params.nOrder || 0 }
  ])
  const actionColumnPermission = ['EDIT_ROLE', 'DELETE_ROLE']

  const {
    loading,
    refetch,
    data: roleList
  } = useQuery(GET_ROLES, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      if (data && data.getRoles) {
        !params.sSearch && !params.sSortBy ? setRoles(data.getRoles.aResults) : applySearchAndSort(data.getRoles.aResults)
      }
    }
  })

  const [deleteRole] = useMutation(DELETE_ROLE, {
    onCompleted: (data) => {
      if (data && data.deleteRole) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.deleteRole.message, type: TOAST_TYPE.Success, btnTxt: 'Close' }
        })
        refetch()
      }
    }
  })

  function handleBtnEvent(eventName) {
    switch (eventName) {
      case 'newRole':
        router.push(allRoutes.roleAdd)
        break
      default:
        break
    }
  }

  function handleSort(field, searchData) {
    if (field.internalName !== 'parentRole') {
      const data = searchData ? [...searchData] : [...roles]
      setRoles(sortArray(data, field.internalName, field.type))
      if (!searchData?.length) {
        appendParams({ nOrder: field.type === 0 ? -1 : field.type, sSortBy: field.internalName })
        setColumns(setSortType(columns, field.internalName))
      }
    }
  }

  function handleSearch(txt, isReturn) {
    const searchData = searchFromArray(roleList.getRoles.aResults, txt, 'sName')
    if (isReturn) {
      return searchData
    } else {
      setRoles(searchData)
      appendParams({ sSearch: txt })
    }
  }

  function handleDeleteRole(id) {
    confirmAlert({
      title: 'Confirmation',
      message: 'Are you sure you want to delete this role?',
      customUI: CustomAlert,
      buttons: [
        {
          label: 'Yes',
          onClick: () => deleteRole({ variables: { input: { _id: id } } })
        },
        {
          label: 'No'
        }
      ]
    })
  }

  function applySearchAndSort(roles, e) {
    const data = e ? parseParams(e) : params
    if (data.sSearch && !data.sSortBy) {
      setRoles(handleSearch(data.sSearch, true))
    } else if (!data.sSearch && data.sSortBy) {
      handleSort({ internalName: data.sSortBy, type: data.nOrder }, roles)
      setColumns(setSortType(columns, data.sSortBy))
    } else if (data.sSearch && data.sSortBy) {
      const searchData = handleSearch(data.sSearch, true)
      handleSort({ internalName: data.sSortBy, type: data.nOrder }, searchData)
      setColumns(setSortType(columns, data.sSortBy))
    } else {
      setRoles(roles)
      setColumns(setSortType(columns, ''))
    }
  }

  useEffect(() => {
    return router.listen((e) => {
      applySearchAndSort(roleList?.getRoles?.aResults, e.search)
    })
  }, [router, roleList])

  return (
    <>
      <TopBar
        buttons={[
          {
            text: useIntl().formatMessage({ id: 'newRole' }),
            icon: 'icon-add',
            type: 'primary',
            clickEventName: 'newRole',
            isAllowedTo: 'CREATE_ROLE'
          }
        ]}
        btnEvent={handleBtnEvent}
        searchEvent={handleSearch}
      />
      <Accordion>
        <DataTable
          className="role-listing"
          columns={columns}
          sortEvent={handleSort}
          totalRecord={roles.length}
          isLoading={loading}
          actionColumn={!!userPermission.filter((p) => actionColumnPermission.includes(p)).length}
        >
          {roles.map((item) => {
            return (
              <RoleItemRow
                key={item._id}
                dataModal={item}
                event={item._id}
                deleteRole={handleDeleteRole}
                actionPermission={actionColumnPermission}
              />
            )
          })}
        </DataTable>
      </Accordion>
    </>
  )
}
Roles.propTypes = {
  userPermission: PropTypes.array
}
export default Roles
