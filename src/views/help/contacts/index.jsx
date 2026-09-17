import React, { useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useQuery } from '@apollo/client'
import { useHistory } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

import { GET_CONTACTS_LIST } from 'graph-ql/help/contacts'
import ContactItemRow from 'shared/components/contact-item-row'
import DataTable from 'shared/components/data-table'
import { setSortType, parseParams, appendParams, toBackendPagination } from 'shared/utils'
import useExportLeads, { LEAD_EXPORT_TYPE, buildExportLeadsInput } from 'shared/hooks/useExportLeads'

function Contacts({ userPermission }) {
  const history = useHistory()
  const params = useRef(parseParams(location.search))
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const contactListInput = useMemo(() => getContactListInput(requestParams), [requestParams])
  const [contactList, setContactList] = useState([])
  const totalRecord = useRef(0)
  const { handleExport, loading: isExporting } = useExportLeads()
  const [tabs, setTabs] = useState([
    { name: 'UnRead', internalName: 'unRead', active: requestParams?.aState?.toString() === 'ur' },
    { name: 'Read', internalName: 'read', active: requestParams?.aState?.toString() === 'r' }
  ])
  const columns = useRef([
    { name: <FormattedMessage id="name" />, internalName: 'sFullName', type: 0 },
    { name: 'Company Name', internalName: 'sCompanyName', type: 0 },
    { name: <FormattedMessage id="phoneNumber" />, internalName: 'sPhoneNumber', type: 0 },
    { name: 'Discussion Topic', internalName: 'sDiscussionTopic', type: 0 },
    { name: 'Email', internalName: 'sEmail', type: 0 },
    { name: 'Page URL', internalName: 'sUrl', type: 0 }
  ])

  const { loading } = useQuery(GET_CONTACTS_LIST, {
    variables: { input: contactListInput },
    onCompleted: (data) => {
      if (data && data?.getContacts?.aResults) {
        totalRecord.current = data.getContacts.nTotal
        setContactList(data?.getContacts?.aResults)
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
      changeTab(getActiveTabName(e.search))
    })
  }, [history])

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    return {
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 10,
      sSortBy: data.sSortBy || 'dCreated',
      nOrder: Number(data.nOrder) || -1,
      sSearch: data.sSearch || '',
      aState: getContactState(data?.aState) || 'ur'
    }
  }

  function getContactState(value) {
    return Array.isArray(value) ? value[0] : value
  }

  function getContactListInput(input) {
    const { nSkip, nLimit } = toBackendPagination(input.nSkip, Number(input.nLimit) || 10)

    return {
      ...input,
      nLimit,
      nSkip,
      aState: getContactState(input.aState) || 'ur'
    }
  }

  function getExportInput() {
    return buildExportLeadsInput(LEAD_EXPORT_TYPE.CONTACT, {
      aState: getContactState(requestParams.aState) || 'ur',
      sSearch: requestParams.sSearch,
      bMarketingOpt: requestParams.bMarketingOpt,
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
  function handleTabChange(name) {
    if (name === 'unRead') {
      setRequestParams({ ...requestParams, aState: 'ur', nSkip: 1 })
      appendParams({ aState: 'ur', nSkip: 1 })
    } else if (name === 'read') {
      setRequestParams({ ...requestParams, aState: 'r', nSkip: 1 })
      appendParams({ aState: 'r', nSkip: 1 })
    }
    changeTab(name)
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
    if (data?.aState?.length) {
      if (data.aState.toString() === 'r') {
        return 'read'
      } else if (data.aState.toString() === 'ur') {
        return 'unRead'
      }
    } else return 'unRead'
  }

  return (
    <>
      <DataTable
        className="inquiry-table"
        columns={columns.current}
        sortEvent={handleSort}
        totalRecord={totalRecord.current}
        tabs={tabs}
        tabEvent={handleTabChange}
        isLoading={loading}
        header={{
          left: {
            bulkAction: false,
            rows: true
          },
          right: {
            search: true,
            filter: false,
            download: true,
            downloadDisabled: isExporting
          }
        }}
        headerEvent={(name, value) => handleHeaderEvent(name, value)}
        pageChangeEvent={handlePageEvent}
        pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
        actionColumn
      >
        {contactList?.map((contact) => {
          return <ContactItemRow key={contact._id} contact={contact} />
        })}
      </DataTable>
    </>
  )
}

Contacts.propTypes = {
  userPermission: PropTypes.array
}
export default Contacts
