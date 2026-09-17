import React, { useState, useEffect, useContext, useRef } from 'react'
import PropTypes from 'prop-types'
import { useHistory } from 'react-router'
import { useMutation, useQuery } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'
import { confirmAlert } from 'react-confirm-alert'

import DataTable from 'shared/components/data-table'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import { setSortType, parseParams, appendParams } from 'shared/utils'
import EndUserItemRow from 'shared/components/end-user-item-row'
import CustomAlert from 'shared/components/alert'
import { LIST_USERS } from 'graph-ql/end-user/query'
import { BULK_STATUS_UPDATE } from 'graph-ql/end-user/mutation'
import Drawer from 'shared/components/drawer'
import EndUserFilters from 'shared/components/end-user-filters'

function EndUsers({ userPermission }) {
  const history = useHistory()
  const params = useRef(parseParams(location.search))
  const { dispatch } = useContext(ToastrContext)
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const [userList, setUserList] = useState([])
  const totalRecord = useRef(0)
  const [selectedUser, setSelectedUser] = useState([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const columns = useRef([
    { name: <FormattedMessage id="name" />, internalName: 'sFullName', type: 0 },
    { name: <FormattedMessage id="email" />, internalName: 'sEmail', type: 0 },
    { name: <FormattedMessage id="registrationDate" />, internalName: 'sCreatedDate', type: 0 }
  ])
  const actionPermission = ['UPDATE_USER_STATUS', 'UPDATE_USER_STATUS', 'DELETE_USER']
  const bulkActionDropDown = [
    { label: <FormattedMessage id="activeAll" />, value: 'a', isAllowedTo: 'UPDATE_USER_STATUS' },
    { label: <FormattedMessage id="deactivateAll" />, value: 'i', isAllowedTo: 'UPDATE_USER_STATUS' },
    { label: <FormattedMessage id="deleteAll" />, value: 'd', isAllowedTo: 'DELETE_USER' }
  ]
  const bulkActionPermission = bulkActionDropDown.map((e) => e.isAllowedTo)

  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteThisItem' })
  }

  const { loading, refetch } = useQuery(LIST_USERS, {
    variables: {
      input: requestParams
    },
    onCompleted: (data) => {
      if (data && data?.listUsers?.aResults) {
        setSelectedUser(
          data.listUsers.aResults.map((item) => {
            return {
              _id: item._id,
              value: false
            }
          })
        )
        totalRecord.current = data?.listUsers?.nTotal
        setUserList(data.listUsers.aResults)
      }
    }
  })

  const [bulkAction, { loading: bulkLoading }] = useMutation(BULK_STATUS_UPDATE, {
    onCompleted: (data) => {
      if (data && data.bulkUpdateUsers) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.bulkUpdateUsers.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
        refetch()
      }
    }
  })

  useEffect(() => {
    return history.listen((e) => {
      params.current = parseParams(e.search)
      setRequestParams(getRequestParams(e.search))
    })
  }, [history])

  useEffect(() => {
    const data = setSortType(columns.current, requestParams.sSortBy)
    columns.current = data
  }, [requestParams])

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    return {
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 10,
      sSortBy: data.sSortBy || 'dCreated',
      nOrder: Number(data.nOrder) || -1,
      sSearch: data.sSearch || '',
      eStatus: data.eStatus || null
    }
  }
  function handleBulkResponse(aIds, eType) {
    if (eType === 'd') {
      setUserList(userList.filter((item) => !aIds.includes(item._id)))
      setSelectedUser(selectedUser.filter((item) => !aIds.includes(item._id)))
    } else {
      setUserList(
        userList.map((item) => {
          if (aIds.includes(item._id)) return { ...item, eStatus: eType }
          return item
        })
      )
    }
    setSelectedUser(
      selectedUser.map((item) => {
        return {
          ...item,
          value: false
        }
      })
    )
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

  async function handleHeaderEvent(name, value) {
    switch (name) {
      case 'bulkAction': {
        const user = selectedUser.map((a) => ({ ...a }))
        const obj = {
          aId: user.filter((item) => item.value && delete item.value),
          eStatus: value
        }
        const { data } = await bulkAction({
          variables: {
            input: {
              aId: obj.aId.map((id) => {
                return id._id
              }),
              eStatus: obj.eStatus
            }
          }
        })
        if (data) {
          handleBulkResponse(
            user.filter((item) => item.value === undefined && item).map((e) => e._id),
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
        setRequestParams({ ...requestParams, sSearch: value, nSkip: 1 })

        appendParams({ sSearch: value, nSkip: 1 })
        break
      case 'filter':
        setIsFilterOpen(value)
        break
      default:
        break
    }
  }

  async function onIsApprove(target, type) {
    if (type === 'approved') {
      const { data: approveData } = await bulkAction({ variables: { input: { aId: [target], eStatus: 'a' } } })
      if (approveData && approveData.bulkUpdateUsers) handleBulkResponse([target], 'approved')
    } else {
      const { data } = await bulkAction({ variables: { input: { aId: [target], eStatus: 'i' } } })
      if (data && data.bulkUpdateUsers) handleBulkResponse([target], 'dec')
    }
  }

  function handleSort(field) {
    setRequestParams({ ...requestParams, sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
    appendParams({ sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
  }
  function handlePageEvent(page) {
    setRequestParams({ ...requestParams, nSkip: page })
    appendParams({ nSkip: page })
  }
  async function handleStatusChange({ target }) {
    const { data } = await bulkAction({ variables: { input: { aId: [target.name], eStatus: target.checked ? 'a' : 'i' } } })
    if (data && data.bulkUpdateUsers) handleBulkResponse([target.name], target.checked ? 'i' : 'a')
  }
  function handleDelete(id) {
    confirmAlert({
      title: labels.confirmationTitle,
      message: labels.confirmationMessage,
      customUI: CustomAlert,
      buttons: [
        {
          label: labels.yes,
          onClick: async () => {
            const { data } = await bulkAction({ variables: { input: { aId: [id], eStatus: 'd' } } })
            if (data && data.bulkUpdateUsers) handleBulkResponse([id], 'd')
          }
        },
        {
          label: labels.no
        }
      ]
    })
  }
  function handleFilterChange(e) {
    if (e?.data?.eStatusFilters?.value) {
      setRequestParams({ ...requestParams, nSkip: 1, eStatus: e.data.eStatusFilters.value })
      appendParams({ eStatus: e.data.eStatusFilters.value, nSkip: 1 })
    } else {
      setRequestParams({ ...requestParams, nSkip: 1, eStatus: null })
      appendParams({ eStatus: '', nSkip: 1 })
    }
    setIsFilterOpen(!isFilterOpen)
  }
  return (
    <>
      <DataTable
        className="end-user-list"
        bulkAction={bulkActionDropDown}
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
        selectAllValue={selectedUser}
        pageChangeEvent={handlePageEvent}
        checkbox={!!userPermission.filter((p) => bulkActionPermission.includes(p)).length}
        actionColumn={!!userPermission.filter((p) => actionPermission.includes(p)).length}
      >
        {userList.map((user, index) => {
          return (
            <EndUserItemRow
              key={user._id}
              index={index}
              user={user}
              selectedUser={selectedUser}
              onDelete={handleDelete}
              onSelect={handleCheckbox}
              onIsApprove={onIsApprove}
              bulkPermission={bulkActionPermission}
              actionPermission={actionPermission}
              onStatusChange={handleStatusChange}
            />
          )
        })}
        <Drawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(!isFilterOpen)} title={useIntl().formatMessage({ id: 'filterUser' })}>
          <EndUserFilters filterChange={handleFilterChange} defaultValue={requestParams} />
        </Drawer>
      </DataTable>
    </>
  )
}
EndUsers.propTypes = {
  userPermission: PropTypes.array
}
export default EndUsers
