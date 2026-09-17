import React, { useContext, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useHistory } from 'react-router'
import { useMutation, useQuery } from '@apollo/client'
import { useIntl } from 'react-intl'
import { confirmAlert } from 'react-confirm-alert'

import TopBar from 'shared/components/top-bar'
import DataTable from 'shared/components/data-table'
import Drawer from 'shared/components/drawer'
import UserFilters from 'shared/components/user-filters'
import CustomAlert from 'shared/components/alert'
import SubAdminItemRow from 'shared/components/sub-admin-item-row'
import { allRoutes } from 'shared/constants/AllRoutes'
import { GET_USER_LIST, BULK_ACTION } from 'graph-ql/settings/user'
import { setSortType, parseParams, appendParams } from 'shared/utils'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'

function SubAdmins({ userPermission }) {
  const history = useHistory()
  const params = parseParams(location.search)
  const { dispatch } = useContext(ToastrContext)
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const [userList, setUserList] = useState([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState([])
  const totalRecord = useRef(0)
  const columns = useRef([
    { name: 'Name', internalName: 'sFName', type: 0 },
    { name: 'Roles', internalName: 'aRole', type: 0 },
    { name: 'Email', internalName: 'sEmail', type: 0 },
    { name: 'Created At', internalName: 'dCreated', type: 0 }
  ])
  const bulkActionDropDown = [
    { label: 'Delete All', value: 'd', isAllowedTo: 'DELETE_USER' },
    { label: 'Active  All', value: 'a', isAllowedTo: 'CHANGE_STATUS_SUBADMIN' },
    { label: 'Deactivate All', value: 'i', isAllowedTo: 'CHANGE_STATUS_SUBADMIN' }
  ]
  const actionColumnPermission = ['CHANGE_STATUS_SUBADMIN', 'EDIT_USER', 'DELETE_USER']
  const bulkActionPermission = bulkActionDropDown.map((e) => e.isAllowedTo)

  const { loading, refetch } = useQuery(GET_USER_LIST, {
    variables: { ...requestParams },
    onCompleted: (data) => {
      if (data && data.listSubAdmins) {
        totalRecord.current = data.listSubAdmins.nTotal
        setSelectedUser(
          data.listSubAdmins.aResults.map((item) => {
            return {
              _id: item._id,
              value: false
            }
          })
        )
        setUserList(data.listSubAdmins.aResults)
      }
    }
  })

  const [bulkActions, { loading: bulkLoading }] = useMutation(BULK_ACTION, {
    onCompleted: (data) => {
      if (data && data.bulkAction) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.bulkAction.sMessage, type: TOAST_TYPE.Success, btnTxt: 'Close' }
        })
        refetch()
      }
    }
  })

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params
    return {
      aFilters: data.aFilters || [],
      nLimit: Number(data.nLimit) || 10,
      nOrder: Number(data.nOrder) || -1,
      nSkip: Number(data.nSkip) || 1,
      sSearch: data.sSearch || '',
      sSortBy: data.sSortBy || 'dCreated'
    }
  }

  function handleBtnEvent(eventName) {
    switch (eventName) {
      case 'newUser':
        history.push(allRoutes.addSubAdmin)
        break
      default:
        break
    }
  }

  async function handleHeaderEvent(name, value) {
    switch (name) {
      case 'bulkAction': {
        const users = selectedUser.map((a) => ({ ...a }))
        const obj = {
          aIds: users.filter((item) => item.value && delete item.value),
          eType: value
        }
        const { data } = await bulkActions({ variables: obj })
        if (data && data.bulkAction) {
          handleBulkResponse(
            users.filter((item) => item.value === undefined && item).map((e) => e._id),
            value
          )
        }
        break
      }
      case 'rows':
        setRequestParams({ ...requestParams, nLimit: Number(value), nSkip: 1 })
        appendParams({ nLimit: value, nSkip: 1 })
        break
      case 'search':
        setRequestParams({ ...requestParams, nSkip: 1, sSearch: value })
        appendParams({ sSearch: value, nSkip: 1 })
        break
      case 'filter':
        setIsFilterOpen(value)
        break
      default:
        break
    }
  }

  function handleFilterCHange(e) {
    setRequestParams({ ...requestParams, nSkip: 1, aFilters: e })
    appendParams({ aFilters: e, nSkip: 1 })
    setIsFilterOpen(!isFilterOpen)
  }

  function handleSort(field) {
    if (field.internalName !== 'aRole') {
      setRequestParams({ ...requestParams, sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
      appendParams({ sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
    }
  }

  function handleCheckbox({ target }) {
    if (target.name === 'selectAll') {
      setSelectedUser(
        selectedUser.map((item) => {
          item.value = target.checked
          return item
        })
      )
    } else {
      if (target.checked) {
        setSelectedUser(
          selectedUser.map((item) => {
            if (item._id === target.name) item.value = true
            return item
          })
        )
      } else {
        setSelectedUser(
          selectedUser.map((item) => {
            if (item._id === target.name) item.value = false
            return item
          })
        )
      }
    }
  }

  async function handleStatusChange({ target }) {
    const { data } = await bulkActions({ variables: { aIds: [{ _id: target.name }], eType: target.checked ? 'a' : 'i' } })
    if (data && data.bulkAction) handleBulkResponse([target.name], target.checked ? 'i' : 'a')
  }

  function handleDelete(id) {
    confirmAlert({
      title: 'Confirmation',
      message: 'Are you sure you want to delete this user?',
      customUI: CustomAlert,
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            const { data } = await bulkActions({ variables: { aIds: [{ _id: id }], eType: 'd' } })
            if (data && data.bulkAction) handleBulkResponse([id], 'd')
          }
        },
        {
          label: 'No'
        }
      ]
    })
  }

  function handleBulkResponse(aIds, eType) {
    if (['a', 'i'].includes(eType)) {
      setUserList(
        userList.map((item) => {
          if (aIds.includes(item._id)) return { ...item, eStatus: eType }
          return item
        })
      )
    } else if (['v', 'dv'].includes(eType)) {
      setUserList(
        userList.map((item) => {
          if (aIds.includes(item._id)) return { ...item, bIsVerified: eType === 'v' }
          return item
        })
      )
    } else if (eType === 'd') {
      setUserList(userList.filter((item) => !aIds.includes(item._id)))
      setSelectedUser(selectedUser.filter((item) => !aIds.includes(item._id)))
    }

    if (eType !== 'd') {
      setSelectedUser(
        selectedUser.map((item) => {
          return {
            ...item,
            value: false
          }
        })
      )
    }
  }

  function handlePageEvent(page) {
    setRequestParams({ ...requestParams, nSkip: page })
    appendParams({ nSkip: page })
  }

  useEffect(() => {
    const data = setSortType(columns.current, requestParams.sSortBy)
    columns.current = data
  }, [requestParams])

  useEffect(() => {
    return history.listen((e) => {
      setRequestParams(getRequestParams(e.search))
    })
  }, [history])
  return (
    <>
      <TopBar
        buttons={[{ text: 'New User', icon: 'icon-add', type: 'primary', clickEventName: 'newUser', isAllowedTo: 'CREATE_USER' }]}
        btnEvent={handleBtnEvent}
      />
      <DataTable
        className="user-list"
        columns={columns.current}
        sortEvent={handleSort}
        totalRecord={totalRecord.current}
        isLoading={loading || bulkLoading}
        header={{
          left: {
            bulkAction: !!userPermission.filter((p) => bulkActionPermission.includes(p)).length,
            rows: true
          },
          right: {
            search: true,
            filter: true
          }
        }}
        headerEvent={(name, value) => handleHeaderEvent(name, value)}
        selectAllEvent={handleCheckbox}
        pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
        pageChangeEvent={handlePageEvent}
        selectAllValue={selectedUser}
        checkbox={!!userPermission.filter((p) => bulkActionPermission.includes(p)).length}
        actionColumn={!!userPermission.filter((p) => actionColumnPermission.includes(p)).length}
        bulkAction={bulkActionDropDown}
      >
        {userList.map((user, index) => {
          return (
            <SubAdminItemRow
              key={user._id}
              index={index}
              user={user}
              selectedUser={selectedUser}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onSelect={handleCheckbox}
              actionPermission={actionColumnPermission}
              bulkPermission={bulkActionPermission}
            />
          )
        })}
      </DataTable>
      <Drawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(!isFilterOpen)} title={useIntl().formatMessage({ id: 'filterUser' })}>
        <UserFilters filterChange={handleFilterCHange} defaultValue={requestParams.aFilters} />
      </Drawer>
    </>
  )
}
SubAdmins.propTypes = {
  userPermission: PropTypes.array
}
export default SubAdmins
