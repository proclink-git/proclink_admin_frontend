import React, { useContext, useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useHistory } from 'react-router'
import { useQuery, useMutation } from '@apollo/client'
import { useIntl } from 'react-intl'
import { confirmAlert } from 'react-confirm-alert'

import TopBar from 'shared/components/top-bar'
import DataTable from 'shared/components/data-table'
import CustomAlert from 'shared/components/alert'
import { allRoutes } from 'shared/constants/AllRoutes'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import { setSortType, parseParams, appendParams } from 'shared/utils'
import PopupRow from 'shared/components/popup-components/popup-row'
import { GET_POPUP_LIST } from 'graph-ql/popup-managment/query'
import { BULK_OPERATION_POPUP } from 'graph-ql/popup-managment/mutation'

function PopupManagement({ userPermission }) {
  const history = useHistory()
  const params = useRef(parseParams(location.search))
  const { dispatch } = useContext(ToastrContext)
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const [categoryList, setCategoryList] = useState([])
  const [selectedCategory, setSelectedCategory] = useState([])
  const totalRecord = useRef(0)
  const tabs = useRef([
    { name: 'Event', internalName: 'e', active: requestParams?.ePopupType === 'e' },
    { name: 'General', internalName: 'g', active: requestParams?.ePopupType === 'g' },
    { name: 'Content Recommendations', internalName: 'cr', active: requestParams?.ePopupType === 'cr' },
    { name: 'Downloadable', internalName: 'dc', active: requestParams?.ePopupType === 'dc' },
    { name: 'Survey', internalName: 's', active: requestParams?.ePopupType === 's' },
    { name: 'Exit Intent', internalName: 'ei', active: requestParams?.ePopupType === 'ei' }
  ])
  const columns = useRef(getActionColumns())
  const bulkActionDropDown = [
    { label: 'Delete All', value: 'd', isAllowedTo: 'UPDATE_POPUP_STATUS' },
    { label: 'Active  All', value: 'a', isAllowedTo: 'UPDATE_POPUP_STATUS' },
    { label: 'Deactivate All', value: 'i', isAllowedTo: 'UPDATE_POPUP_STATUS' }
  ]
  const bulkActionPermission = bulkActionDropDown.map((e) => e.isAllowedTo)

  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteAllItem' })
  }

  Object.assign(requestParams, { aStatus: ['a', 'i'] })
  const { loading, refetch } = useQuery(GET_POPUP_LIST, {
    variables: { input: requestParams },
    onCompleted: (data) => {
      handleApiResponse(data)
    }
  })

  const [bulkAction, { loading: bulkLoading }] = useMutation(BULK_OPERATION_POPUP, {
    onCompleted: (data) => {
      if (data && data.bulkPopupUpdate) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.bulkPopupUpdate?.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })

  useEffect(() => {
    return history.listen((e) => {
      params.current = parseParams(e.search)
      changeTab(getActiveTabName(e.search))
      setRequestParams(getRequestParams(e.search))
    })
  }, [history])

  function handleApiResponse(data) {
    if (data && data?.listPopup?.aResults) {
      setSelectedCategory(
        data.listPopup?.aResults.map((item) => {
          return {
            _id: item._id,
            value: false
          }
        })
      )
      totalRecord.current = data.listPopup.nTotal
      setCategoryList(data.listPopup?.aResults)
    }
  }

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    return {
      ePopupType: data?.ePopupType || 'e',
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 10,
      sSortBy: data.sSortBy || 'dCreated',
      nOrder: Number(data.nOrder) || -1,
      sSearch: data.sSearch || ''
    }
  }

  function handleBtnEvent(eventName) {
    switch (eventName) {
      case 'newIndustries':
        history.push(allRoutes.popupAdd)
        break
      default:
        break
    }
  }

  function getActionColumns() {
    const data = params.current
    const clm = [
      { name: 'Title', internalName: 'sPopupTitle', type: 0 },
      { name: 'Start/End Date', internalName: 'startEndDate' },
      { name: 'Is Permanent', internalName: 'bIsPermanent' }
    ]
    return clm.map((e) => {
      if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder ? Number(data.nOrder) : -1 }
      return e
    })
  }

  function handleTabChange(name) {
    changeTab(name)
    setRequestParams({
      ...requestParams,
      ePopupType: name,
      nSkip: 1
    })
    appendParams({ ePopupType: name, nSkip: 1 })
  }

  function changeTab(name) {
    tabs.current = tabs.current.map((e) => ({ ...e, active: e.internalName === name }))
  }

  function handleBulkResponse(aIds, eType) {
    if (eType === 'd') {
      if (requestParams?.nLimit / 2 >= categoryList?.length || requestParams?.nLimit / 2 <= aIds?.length) {
        handleMultipleDelete()
      } else {
        setCategoryList(categoryList.filter((item) => !aIds.includes(item._id)))
      }
    } else if (['a', 'i'].includes(eType)) {
      setCategoryList(
        categoryList.map((item) => {
          if (aIds.includes(item._id)) return { ...item, eStatus: eType }
          return item
        })
      )
    }
    setSelectedCategory(
      selectedCategory.map((item) => {
        return {
          ...item,
          value: false
        }
      })
    )
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
            const { data } = await bulkAction({ variables: { input: { aId: id, eStatus: 'd' } } })
            if (data && data.bulkPopupUpdate) handleBulkResponse([id], 'd')
          }
        },
        {
          label: labels.no
        }
      ]
    })
  }

  async function handleHeaderEvent(name, value) {
    switch (name) {
      case 'bulkAction': {
        const category = selectedCategory.map((a) => ({ ...a }))
        const obj = {
          bulkIds: category.filter((item) => item.value && delete item.value),
          eStatus: value
        }
        if (obj.eStatus === 'd') {
          const { data } = await bulkAction({
            variables: {
              input: {
                aId: obj.bulkIds.map((id) => {
                  return id._id
                }),
                eStatus: obj.eStatus
              }
            }
          })
          if (data?.bulkPopupUpdate) {
            handleBulkResponse(
              category.filter((item) => item.value === undefined && item).map((e) => e._id),
              value
            )
          }
        } else if (['a', 'i'].includes(obj.eStatus)) {
          const { data } = await bulkAction({
            variables: {
              input: {
                aId: obj.bulkIds.map((id) => {
                  return id._id
                }),
                eStatus: obj.eStatus
              }
            }
          })
          if (data?.bulkPopupUpdate) {
            handleBulkResponse(
              category.filter((item) => item.value === undefined && item).map((e) => e._id),
              value
            )
          }
        }
        break
      }
      case 'rows':
        setRequestParams({
          ...requestParams,
          nLimit: Number(value),
          nSkip: 1
        })
        appendParams({ nLimit: value, nSkip: 1 })
        break
      case 'search':
        setRequestParams({
          ...requestParams,
          sSearch: value,
          nSkip: 1
        })
        appendParams({ sSearch: value, nSkip: 1 })
        break
      default:
        break
    }
  }

  function handleSort(field) {
    setRequestParams({
      ...requestParams,
      sSortBy: field.internalName,
      nOrder: field.type === 0 ? -1 : field.type
    })
    appendParams({ sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
    columns.current = setSortType(columns.current, field.internalName)
  }

  function handlePageEvent(page) {
    setRequestParams({ ...requestParams, nSkip: page })
    appendParams({ nSkip: page })
  }

  function handleCheckbox({ target }) {
    if (target.name === 'selectAll') {
      setSelectedCategory(
        selectedCategory.map((item) => {
          item.value = target.checked
          return item
        })
      )
    } else {
      if (target.checked) {
        setSelectedCategory(
          selectedCategory.map((item) => {
            if (item._id === target.name) item.value = true
            return item
          })
        )
      } else {
        setSelectedCategory(
          selectedCategory.map((item) => {
            if (item._id === target.name) item.value = false
            return item
          })
        )
      }
    }
  }

  async function handleStatusChange({ target }) {
    const { data } = await bulkAction({ variables: { input: { aId: [target.name], eStatus: target.checked ? 'a' : 'i' } } })
    if (data?.bulkPopupUpdate) handleBulkResponse([target.name], target.checked ? 'i' : 'a')
  }

  function getActiveTabName(e) {
    const data = e ? parseParams(e) : params.current
    return tabs.current.find((e) => e.internalName === data?.ePopupType)?.internalName
  }

  async function handleMultipleDelete() {
    if (categoryList?.length === 0) {
      const lastPage = Math.ceil(totalRecord / requestParams?.nLimit)
      handlePageEvent(lastPage - 1)
    } else {
      const { data } = await refetch()
      handleApiResponse(data)
    }
  }
  return (
    <>
      <TopBar
        buttons={[{ text: 'New Popup', icon: 'icon-add', type: 'primary', clickEventName: 'newIndustries', isAllowedTo: 'ADD_POPUP' }]}
        btnEvent={handleBtnEvent}
      />
      <DataTable
        className="category-list"
        columns={columns.current}
        bulkAction={bulkActionDropDown}
        sortEvent={handleSort}
        totalRecord={totalRecord.current}
        isLoading={loading || bulkLoading}
        header={{
          left: {
            bulkAction: !!userPermission.filter((p) => bulkActionPermission.includes(p)).length,
            rows: true
          },
          right: {
            search: true
          }
        }}
        headerEvent={(name, value) => handleHeaderEvent(name, value)}
        selectAllEvent={handleCheckbox}
        pageChangeEvent={handlePageEvent}
        pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
        selectAllValue={selectedCategory}
        tabs={tabs.current}
        tabEvent={handleTabChange}
        checkbox={!!userPermission.filter((p) => bulkActionPermission.includes(p)).length}
        actionColumn
      >
        {categoryList.map((d, index) => {
          return (
            <PopupRow
              key={d?._id}
              index={index}
              data={d}
              selected={selectedCategory}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onSelect={handleCheckbox}
              bulkPermission={bulkActionPermission}
              // actionPermission={actionPermission.current}
            />
          )
        })}
      </DataTable>
    </>
  )
}
PopupManagement.propTypes = {
  userPermission: PropTypes.array
}
export default PopupManagement
