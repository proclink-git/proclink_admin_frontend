import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useMutation, useQuery } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import { confirmAlert } from 'react-confirm-alert'

import { BULK_INQUIRY_DELETE, DELETE_INQUIRY, GET_INQUIRY_LIST } from 'graph-ql/help/inquiry'
import FeedbackItemRow from 'shared/components/feedback-item-row'
import DataTable from 'shared/components/data-table'
import { parseParams, appendParams, toBackendPagination } from 'shared/utils'
import Drawer from 'shared/components/drawer'
import FeedbackContactFilter from 'shared/components/feedback-contact-filter'
import CustomAlert from 'shared/components/alert'
import { ToastrContext } from 'shared/components/toastr'
import { DEFAULT_INQUIRY_STATE, INQUIRY_TABS, getInquiryFields, getValidInquiryType } from 'shared/constants/inquiry'
import { TOAST_TYPE, excludeDeletedLeads, getActiveLeadStates } from 'shared/constants'
import useExportLeads, { LEAD_EXPORT_TYPE, buildExportLeadsInput } from 'shared/hooks/useExportLeads'

function Inquiry({ userPermission }) {
  const history = useHistory()
  const intl = useIntl()
  const { dispatch } = useContext(ToastrContext)
  const params = useRef(parseParams(location.search))
  const [selectedFeedback, setSelectedFeedback] = useState([])
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const inquiryListInput = useMemo(() => getInquiryListInput(requestParams), [requestParams])
  const totalRecord = useRef(0)
  const [feedbackList, setFeedbackList] = useState([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [tabs, setTabs] = useState(getTabs(requestParams.eHeaderCategoryType))
  const { handleExport, loading: isExporting } = useExportLeads()
  const canDelete = !!userPermission?.includes('VIEW_INQUIRY')
  const bulkActionDropDown = [{ label: <FormattedMessage id="deleteSelected" />, value: 'd', isAllowedTo: 'VIEW_INQUIRY' }]
  const bulkActionPermission = ['VIEW_INQUIRY']
  const columns = useMemo(() => {
    return getInquiryFields(requestParams.eHeaderCategoryType).map((field) => ({
      ...field,
      name: field.label,
      type: requestParams.sSortBy === field.internalName ? requestParams.nOrder : 0
    }))
  }, [requestParams.eHeaderCategoryType, requestParams.sSortBy, requestParams.nOrder])
  const labels = {
    close: intl.formatMessage({ id: 'close' }),
    yes: intl.formatMessage({ id: 'yes' }),
    no: intl.formatMessage({ id: 'no' }),
    confirmationTitle: intl.formatMessage({ id: 'confirmation' }),
    deleteInquiryMessage: intl.formatMessage({ id: 'deleteThisInquiry' })
  }

  const { loading, refetch } = useQuery(GET_INQUIRY_LIST, {
    variables: { input: inquiryListInput },
    onCompleted: (data) => {
      if (data && data?.ListInquiry?.aResults) {
        const results = excludeDeletedLeads(data.ListInquiry.aResults)
        setSelectedFeedback(
          results.map((item) => {
            return {
              _id: item._id,
              value: false
            }
          })
        )
        totalRecord.current = data.ListInquiry.nTotal
        setFeedbackList(results)
      }
    }
  })

  const [deleteInquiry, { loading: deleteLoading }] = useMutation(DELETE_INQUIRY, {
    onCompleted: (data) => {
      if (data?.deleteInquiry?.sMessage) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.deleteInquiry.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
        refetch()
      }
    }
  })

  const [bulkInquiryDelete, { loading: bulkLoading }] = useMutation(BULK_INQUIRY_DELETE, {
    onCompleted: (data) => {
      if (data?.bulkInquiryDelete?.sMessage) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.bulkInquiryDelete.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
        refetch()
      }
    }
  })

  useEffect(() => {
    return history.listen((e) => {
      params.current = parseParams(e.search)
      setRequestParams(getRequestParams(e.search))
      changeTab(getActiveTabName(e.search))
    })
  }, [history])

  useEffect(() => {
    params.current?.eHeaderCategoryType?.length && changeTab(getActiveTabName())
  }, [])

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    return {
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 20,
      sSortBy: data.sSortBy || 'dCreated',
      nOrder: Number(data.nOrder) || -1,
      sSearch: data.sSearch || '',
      eHeaderCategoryType: getInquiryType(data.eHeaderCategoryType),
      aState: getInquiryState(data?.aState)
    }
  }

  function getTabs(activeTab) {
    return INQUIRY_TABS.map((tab) => ({ ...tab, active: tab.internalName === activeTab }))
  }

  function getInquiryType(value) {
    return getValidInquiryType(value)
  }

  function getInquiryState(value) {
    return getActiveLeadStates(value, DEFAULT_INQUIRY_STATE)
  }

  function getInquiryListInput(input) {
    const { nSkip, nLimit } = toBackendPagination(input.nSkip, Number(input.nLimit) || 20)
    const { sSearch, ...listInput } = input

    const nextInput = {
      ...listInput,
      nLimit,
      nSkip,
      aState: getInquiryState(input.aState),
      eHeaderCategoryType: getInquiryType(input.eHeaderCategoryType)
    }

    if (sSearch) nextInput.sSearch = sSearch

    return nextInput
  }

  function getExportInput() {
    return buildExportLeadsInput(LEAD_EXPORT_TYPE.INQUIRY, {
      eHeaderCategoryType: getInquiryType(requestParams.eHeaderCategoryType),
      aState: getInquiryState(requestParams.aState),
      sSearch: requestParams.sSearch,
      sSortBy: requestParams.sSortBy,
      nOrder: requestParams.nOrder,
      dStartDate: requestParams.dStartDate,
      dEndDate: requestParams.dEndDate
    })
  }

  function getSelectedIds(selected = []) {
    return selected.filter((item) => item.value).map((item) => item._id)
  }

  function handleDeleted(aIds = []) {
    setFeedbackList((list) => list.filter((item) => !aIds.includes(item._id)))
    setSelectedFeedback((selected) => selected.filter((item) => !aIds.includes(item._id)).map((item) => ({ ...item, value: false })))
    totalRecord.current = Math.max(0, totalRecord.current - aIds.length)
  }

  function handleCheckbox({ target }) {
    if (target.name === 'selectAll') {
      setSelectedFeedback(
        selectedFeedback.map((item) => {
          item.value = target.checked
          return item
        })
      )
    } else {
      setSelectedFeedback(
        selectedFeedback.map((item) => {
          if (item._id === target.name) item.value = target.checked
          return item
        })
      )
    }
  }

  async function handleHeaderEvent(name, value) {
    switch (name) {
      case 'bulkAction': {
        const aId = getSelectedIds(selectedFeedback)
        if (!aId.length) break
        const { data } = await bulkInquiryDelete({ variables: { input: { aId } } })
        if (data?.bulkInquiryDelete) handleDeleted(aId)
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
      case 'download':
        handleExport(getExportInput())
        break
      default:
        break
    }
  }

  function handleDelete(id, onSuccess) {
    confirmAlert({
      title: labels.confirmationTitle,
      message: labels.deleteInquiryMessage,
      customUI: CustomAlert,
      buttons: [
        {
          label: labels.yes,
          onClick: async () => {
            const { data } = await deleteInquiry({ variables: { input: { _id: id } } })
            if (data?.deleteInquiry) {
              handleDeleted([id])
              onSuccess?.()
            }
          }
        },
        {
          label: labels.no
        }
      ]
    })
  }

  function handlePageEvent(page) {
    setRequestParams({ ...requestParams, nSkip: page })
    appendParams({ nSkip: page })
  }

  function handleSort(field) {
    if (field.internalName !== 'sSlug') {
      const nOrder = requestParams.sSortBy === field.internalName && requestParams.nOrder === -1 ? 1 : -1
      setRequestParams({ ...requestParams, sSortBy: field.internalName, nOrder })
      appendParams({ sSortBy: field.internalName, nOrder })
    }
  }

  function handleTabChange(name) {
    const nextType = getInquiryType(name)
    const nextSort = getTabSortParams(nextType)
    setRequestParams({ ...requestParams, ...nextSort, eHeaderCategoryType: nextType, nSkip: 1 })
    appendParams({ ...nextSort, eHeaderCategoryType: nextType, nSkip: 1 })
    changeTab(nextType)
  }

  function changeTab(name) {
    setTabs((prevTabs) =>
      prevTabs.map((e) => {
        return { ...e, active: e.internalName === name }
      })
    )
  }

  function getActiveTabName(e) {
    const data = e ? parseParams(e) : params.current
    return getInquiryType(data.eHeaderCategoryType)
  }

  function handleFilterChange({ data }) {
    const selectedState = getInquiryState(data?.aState)
    setRequestParams({ ...requestParams, nSkip: 1, aState: selectedState })
    appendParams({ nSkip: 1, aState: selectedState })
    setIsFilterOpen(!isFilterOpen)
  }

  function getTabSortParams(type) {
    const hasCurrentSort = getInquiryFields(type).some((field) => field.internalName === requestParams.sSortBy)
    return hasCurrentSort ? { sSortBy: requestParams.sSortBy, nOrder: requestParams.nOrder } : { sSortBy: 'dCreated', nOrder: -1 }
  }

  return (
    <>
      <DataTable
        className="inquiry-table"
        columns={columns}
        sortEvent={handleSort}
        tabs={tabs}
        tabEvent={handleTabChange}
        totalRecord={totalRecord.current}
        isLoading={loading || deleteLoading || bulkLoading}
        bulkAction={bulkActionDropDown}
        header={{
          left: {
            bulkAction: canDelete,
            rows: true
          },
          right: {
            search: true,
            filter: true,
            download: true,
            downloadDisabled: isExporting
          }
        }}
        headerEvent={(name, value) => handleHeaderEvent(name, value)}
        pageChangeEvent={handlePageEvent}
        selectAllEvent={handleCheckbox}
        selectAllValue={selectedFeedback}
        checkbox={canDelete}
        pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
        actionColumn
      >
        {feedbackList?.map((feedback, index) => {
          return (
            <FeedbackItemRow
              key={feedback._id}
              index={index}
              feedback={feedback}
              columns={columns}
              selectedFeedback={selectedFeedback}
              bulkPermission={bulkActionPermission}
              onSelect={handleCheckbox}
              onDelete={handleDelete}
            />
          )
        })}
        <Drawer
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(!isFilterOpen)}
          title={intl.formatMessage({ id: 'filterStatus' })}
        >
          <FeedbackContactFilter filterChange={handleFilterChange} />
        </Drawer>
      </DataTable>
    </>
  )
}

Inquiry.propTypes = {
  userPermission: PropTypes.array
}
export default Inquiry
