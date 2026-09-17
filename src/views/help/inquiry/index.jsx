import React, { useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useQuery } from '@apollo/client'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { GET_INQUIRY_LIST } from 'graph-ql/help/inquiry'
import FeedbackItemRow from 'shared/components/feedback-item-row'
import DataTable from 'shared/components/data-table'
import { parseParams, appendParams, toBackendPagination } from 'shared/utils'
import Drawer from 'shared/components/drawer'
import FeedbackContactFilter from 'shared/components/feedback-contact-filter'
import { DEFAULT_INQUIRY_STATE, INQUIRY_TABS, getInquiryFields, getValidInquiryType } from 'shared/constants/inquiry'

function Inquiry({ userPermission }) {
  const history = useHistory()
  const intl = useIntl()
  const params = useRef(parseParams(location.search))
  const [selectedFeedback, setSelectedFeedback] = useState([])
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const inquiryListInput = useMemo(() => getInquiryListInput(requestParams), [requestParams])
  const totalRecord = useRef(0)
  const [feedbackList, setFeedbackList] = useState([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [tabs, setTabs] = useState(getTabs(requestParams.eHeaderCategoryType))
  const columns = useMemo(() => {
    return getInquiryFields(requestParams.eHeaderCategoryType).map((field) => ({
      ...field,
      name: field.label,
      type: requestParams.sSortBy === field.internalName ? requestParams.nOrder : 0
    }))
  }, [requestParams.eHeaderCategoryType, requestParams.sSortBy, requestParams.nOrder])

  const { loading } = useQuery(GET_INQUIRY_LIST, {
    variables: { input: inquiryListInput },
    onCompleted: (data) => {
      if (data && data?.ListInquiry?.aResults) {
        setSelectedFeedback(
          data.ListInquiry.aResults.map((item) => {
            return {
              _id: item._id,
              value: false
            }
          })
        )
        totalRecord.current = data.ListInquiry.nTotal
        setFeedbackList(data?.ListInquiry?.aResults)
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
    return Array.isArray(value) && value.length ? value : DEFAULT_INQUIRY_STATE
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

  async function handleHeaderEvent(name, value) {
    switch (name) {
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
    const selectedState = data?.aState || []
    if (selectedState.length !== 0) {
      setRequestParams({ ...requestParams, nSkip: 1, aState: selectedState })
      appendParams({ nSkip: 1, aState: selectedState })
    } else {
      setRequestParams({ ...requestParams, nSkip: 1, aState: DEFAULT_INQUIRY_STATE })
      appendParams({ nSkip: 1, aState: [] })
    }
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
        isLoading={loading}
        header={{
          left: {
            bulkAction: false,
            rows: true
          },
          right: {
            search: true,
            filter: true
          }
        }}
        headerEvent={(name, value) => handleHeaderEvent(name, value)}
        pageChangeEvent={handlePageEvent}
        selectAllValue={selectedFeedback}
        pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
        actionColumn
      >
        {feedbackList?.map((feedback, index) => {
          return <FeedbackItemRow key={feedback._id} index={index} feedback={feedback} columns={columns} selectedFeedback={selectedFeedback} />
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
