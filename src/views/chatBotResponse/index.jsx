import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useQuery } from '@apollo/client'
import { FormattedMessage } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { LIST_CHATBOT_RESPONSE } from 'graph-ql/chat-bot-input/query'
import ChatBotItemRow from 'shared/components/chatBot-item-row'
import DataTable from 'shared/components/data-table'
import { setSortType, parseParams, appendParams } from 'shared/utils'
import useExportLeads, { LEAD_EXPORT_TYPE, buildExportLeadsInput } from 'shared/hooks/useExportLeads'
// import Drawer from 'shared/components/drawer'
// import FeedbackContactFilter from 'shared/components/feedback-contact-filter'

function ChatBotResponse({ userPermission }) {
  const history = useHistory()
  const params = useRef(parseParams(location.search))
  const [selectedFeedback, setSelectedFeedback] = useState([])
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const totalRecord = useRef(0)
  const [feedbackList, setFeedbackList] = useState([])
  const { handleExport, loading: isExporting } = useExportLeads()
  // const [isFilterOpen, setIsFilterOpen] = useState(false)
  const columns = useRef([
    { name: <FormattedMessage id="name" />, internalName: 'sName', type: 0 },
    { name: <FormattedMessage id="email" />, internalName: 'sEmail', type: 0 },
    { name: <FormattedMessage id="phoneNumber" />, internalName: 'sPhoneNumber', type: 0 },
    { name: 'Industry', internalName: 'sIndustry', type: 0 },
    { name: 'Service', internalName: 'sService', type: 0 }
  ])

  const { loading } = useQuery(LIST_CHATBOT_RESPONSE, {
    variables: { input: requestParams },
    onCompleted: (data) => {
      if (data && data?.listChatBotResponse?.aResults) {
        setSelectedFeedback(
          data.listChatBotResponse.aResults.map((item) => {
            return {
              _id: item._id,
              value: false
            }
          })
        )
        totalRecord.current = data.listChatBotResponse.nTotal
        setFeedbackList(data?.listChatBotResponse?.aResults)
      }
    }
  })

  useEffect(() => {
    const data = setSortType(columns.current, requestParams.sSortBy)
    columns.current = data
  }, [requestParams])

  useEffect(() => {
    return history.listen((e) => {
      params.current = parseParams(e.search)
      setRequestParams(getRequestParams(e.search))
      // changeTab(getActiveTabName(e.search))
    })
  }, [history])

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    return {
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 10,
      sSortBy: data.sSortBy || 'dCreated',
      nOrder: Number(data.nOrder) || -1,
      sSearch: data.sSearch || ''
    }
  }

  function getExportInput() {
    return buildExportLeadsInput(LEAD_EXPORT_TYPE.CHATBOT, {
      sSearch: requestParams.sSearch,
      sSortBy: requestParams.sSortBy,
      nOrder: requestParams.nOrder,
      dStartDate: requestParams.dStartDate,
      dEndDate: requestParams.dEndDate
    })
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
      case 'download':
        handleExport(getExportInput())
        break
      // case 'filter':
      //   setIsFilterOpen(value)
      //   break
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
      setRequestParams({ ...requestParams, sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
      appendParams({ sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
    }
  }

  return (
    <>
      <DataTable
        className="inquiry-table"
        columns={columns.current}
        sortEvent={handleSort}
        // tabs={tabs}
        // tabEvent={handleTabChange}
        totalRecord={totalRecord.current}
        isLoading={loading}
        header={{
          left: {
            bulkAction: false,
            rows: true
          },
          right: {
            search: true,
            download: true,
            downloadDisabled: isExporting
            // filter: true
          }
        }}
        headerEvent={(name, value) => handleHeaderEvent(name, value)}
        pageChangeEvent={handlePageEvent}
        selectAllValue={selectedFeedback}
        pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
      >
        {feedbackList?.map((feedback, index) => {
          return <ChatBotItemRow key={feedback._id} index={index} feedback={feedback} selectedFeedback={selectedFeedback} />
        })}
        {/* <Drawer
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(!isFilterOpen)}
          title={useIntl().formatMessage({ id: 'filterStatus' })}
        >
          <FeedbackContactFilter filterChange={handleFilterChange} />
        </Drawer> */}
      </DataTable>
    </>
  )
}

ChatBotResponse.propTypes = {
  userPermission: PropTypes.array
}
export default ChatBotResponse
