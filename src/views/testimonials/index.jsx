import React, { useEffect, useRef, useState, useContext } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { useHistory } from 'react-router'

import { LIST_TESTIMONIAL } from 'graph-ql/testimonial/query'
import { BULK_TESTIMONIAL_UPDATE } from 'graph-ql/testimonial/mutation'
import DataTable from 'shared/components/data-table'
import { appendParams, parseParams } from 'shared/utils'
import TestimonialRow from 'shared/components/testimonial-row'
import TopBar from 'shared/components/top-bar'
import { allRoutes } from 'shared/constants/AllRoutes'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'
import { confirmAlert } from 'react-confirm-alert'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import CustomAlert from 'shared/components/alert'

function Testimonials({ userPermission }) {
  const history = useHistory()
  const params = useRef(parseParams(location.search))
  const [selectedCategory, setSelectedCategory] = useState([])
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const totalData = useRef(null)
  const [listTestimonialList, setTestimonialList] = useState([])
  const columns = useRef(getActionColumns())
  const totalRecord = useRef(0)
  const { dispatch } = useContext(ToastrContext)

  const tabs = useRef([
    { name: 'Active', internalName: 'active', active: requestParams?.eStatus === 'a' },
    { name: 'inactive', internalName: 'inActive', active: requestParams?.eStatus === 'i' }
  ])

  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteAllItem' })
  }

  const bulkActionDropDown = [
    { label: 'Delete All', value: 'd', isAllowedTo: 'UPDATE_TESTIMONIAL_STATUS' },
    { label: 'Active  All', value: 'a', isAllowedTo: 'UPDATE_TESTIMONIAL_STATUS' },
    { label: 'Deactivate All', value: 'i', isAllowedTo: 'UPDATE_TESTIMONIAL_STATUS' }
  ]
  const bulkActionPermission = bulkActionDropDown.map((e) => e.isAllowedTo)

  const { loading, refetch } = useQuery(LIST_TESTIMONIAL, {
    variables: { input: requestParams },
    onCompleted: (data) => {
      totalData.current = data?.listTestimonials?.nTotal
      handleAPIResponse(data)
    }
  })

  function handleBulkResponse(aIds, eType) {
    if (eType === 'd') {
      if (requestParams?.nLimit / 2 >= listTestimonialList?.length || requestParams?.nLimit / 2 <= aIds?.length) {
        handleMultipleDelete()
      } else {
        setTestimonialList(listTestimonialList.filter((item) => !aIds.includes(item._id)))
      }
    } else if (['a', 'i'].includes(eType)) {
      if (requestParams?.eStatus !== eType) {
        handleMultipleDelete()
        setTestimonialList(listTestimonialList.filter((item) => !aIds.includes(item._id)))
      }
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

  const [bulkAction, { loading: bulkLoading }] = useMutation(BULK_TESTIMONIAL_UPDATE, {
    onCompleted: (data) => {
      if (data && data.bulkTestimonialUpdate) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.bulkTestimonialUpdate?.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })

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
            if (data && data.bulkTestimonialUpdate) handleBulkResponse([id], 'd')
          }
        },
        {
          label: labels.no
        }
      ]
    })
  }

  function handleAPIResponse(data) {
    if (data && data?.listTestimonials?.aResults) {
      setSelectedCategory(
        data.listTestimonials?.aResults.map((item) => {
          return {
            _id: item._id,
            value: false
          }
        })
      )
      totalRecord.current = data.listTestimonials.nTotal
      setTestimonialList(data.listTestimonials?.aResults)
    }
  }

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    return {
      eStatus: data?.eStatus || 'a',
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 10,
      sSortBy: data.sSortBy || 'dCreated',
      nOrder: Number(data.nOrder) || -1,
      sSearch: data.sSearch || ''
    }
  }

  function getActionColumns() {
    const data = params.current
    const clm = [
      { name: 'Title', internalName: 'sTitle' },
      { name: 'Created Date', internalName: 'dCreated' },
      { name: 'Client Name', internalName: 'sClientName' }
    ]
    return clm.map((e) => {
      if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder ? Number(data.nOrder) : -1 }
      return e
    })
  }

  function handleBtnEvent(eventName) {
    switch (eventName) {
      case 'newTestimonial':
        history.push(allRoutes.addTestimonial)
        break
      default:
        break
    }
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

  function handlePageEvent(page) {
    setRequestParams({ ...requestParams, nSkip: page })
    appendParams({ nSkip: page })
  }

  async function handleStatusChange({ target }) {
    const { data } = await bulkAction({ variables: { input: { aId: [target.name], eStatus: target.checked ? 'a' : 'i' } } })
    if (data?.bulkTestimonialUpdate) handleBulkResponse([target.name], target.checked ? 'a' : 'i')
  }

  function changeTab(name) {
    tabs.current = tabs.current.map((e) => ({ ...e, active: e.internalName === name }))
  }

  function handleTabChange(name) {
    changeTab(name)
    if (name === 'active') {
      setRequestParams({
        ...requestParams,
        eStatus: 'a',
        nSkip: 1
      })
      appendParams({ eStatus: 'a', nSkip: 1 })
    } else if (name === 'inActive') {
      setRequestParams({
        ...requestParams,
        eStatus: 'i',
        nSkip: 1
      })
      appendParams({ eStatus: 'i', nSkip: 1 })
    } else if (name === 'delete') {
      setRequestParams({
        ...requestParams,
        eStatus: 'd',
        nSkip: 1
      })
      appendParams({ eStatus: 'd', nSkip: 1 })
    }
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
          if (data?.bulkTestimonialUpdate) {
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
          if (data?.bulkTestimonialUpdate) {
            handleBulkResponse(
              category.filter((item) => item.value === undefined && item).map((e) => e._id),
              value
            )
          }
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
      default:
        break
    }
  }

  useEffect(() => {
    return history.listen((e) => {
      params.current = parseParams(e.search)
      changeTab(getActiveTabName(e.search))
      setRequestParams(getRequestParams(e.search))
    })
  }, [history])

  function getActiveTabName(e) {
    const data = e ? parseParams(e) : params.current
    if (data?.eStatus === 'i') {
      return 'inActive'
    } else if (data?.eStatus === 'a') {
      return 'active'
    } else return 'delete'
  }

  async function handleMultipleDelete() {
    if (listTestimonialList?.length === 0) {
      const lastPage = Math.ceil(totalRecord / requestParams?.nLimit)
      handlePageEvent(lastPage - 1)
    } else {
      const { data } = await refetch()
      handleAPIResponse(data)
    }
  }

  return (
    <>
      <TopBar
        buttons={[
          { text: 'New Testimonial', icon: 'icon-add', type: 'primary', clickEventName: 'newTestimonial', isAllowedTo: 'CREATE_TESTIMONIAL' }
        ]}
        btnEvent={handleBtnEvent}
      />
      <DataTable
        className="category-list"
        columns={columns.current}
        bulkAction={bulkActionDropDown}
        tabs={tabs.current}
        tabEvent={handleTabChange}
        totalRecord={totalData.current}
        headerEvent={(name, value) => handleHeaderEvent(name, value)}
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
        checkbox={!!userPermission.filter((p) => bulkActionPermission.includes(p)).length}
        actionColumn
        selectAllEvent={handleCheckbox}
        pageChangeEvent={handlePageEvent}
        pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
        selectAllValue={selectedCategory}
        onDelete={handleDelete}
      >
        {listTestimonialList?.map((testimonial, index) => {
          return <TestimonialRow
           key={testimonial._id}
           data={testimonial}
           index={index}
           selected={selectedCategory}
           onSelect={handleCheckbox}
           bulkPermission={bulkActionPermission}
           eStatus={requestParams.eStatus}
           onStatusChange={handleStatusChange}
           onDelete={handleDelete}
             />
        })}
      </DataTable>
    </>
  )
}

Testimonials.propTypes = {
  userPermission: PropTypes.array
}

export default Testimonials
