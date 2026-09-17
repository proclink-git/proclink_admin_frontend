import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useMutation, useQuery } from '@apollo/client'
import { useHistory } from 'react-router-dom'
import { FormattedMessage, useIntl } from 'react-intl'
import { confirmAlert } from 'react-confirm-alert'

import { BULK_CONTACT_DELETE, DELETE_CONTACT, GET_CONTACTS_LIST } from 'graph-ql/help/contacts'
import ContactItemRow from 'shared/components/contact-item-row'
import DataTable from 'shared/components/data-table'
import CustomAlert from 'shared/components/alert'
import { ToastrContext } from 'shared/components/toastr'
import { setSortType, parseParams, appendParams, toBackendPagination } from 'shared/utils'
import { TOAST_TYPE, excludeDeletedLeads, getActiveLeadStates } from 'shared/constants'
import useExportLeads, { LEAD_EXPORT_TYPE, buildExportLeadsInput } from 'shared/hooks/useExportLeads'

const DEFAULT_CONTACT_STATE = ['r', 'ur']

function getContactState(value) {
  return getActiveLeadStates(value, DEFAULT_CONTACT_STATE)
}

function isUnreadTab(aState) {
  const states = getContactState(aState)
  return states.length === 1 && states[0] === 'ur'
}

function isReadTab(aState) {
  const states = getContactState(aState)
  return states.length === 1 && states[0] === 'r'
}

function getActiveTabNameFromState(aState) {
  if (isReadTab(aState)) return 'read'
  if (isUnreadTab(aState)) return 'unRead'
  return 'all'
}

function Contacts({ userPermission }) {
  const history = useHistory()
  const intl = useIntl()
  const { dispatch } = useContext(ToastrContext)
  const params = useRef(parseParams(location.search))
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const contactListInput = useMemo(() => getContactListInput(requestParams), [requestParams])
  const [contactList, setContactList] = useState([])
  const [selectedContact, setSelectedContact] = useState([])
  const totalRecord = useRef(0)
  const { handleExport, loading: isExporting } = useExportLeads()
  const canDelete = !!userPermission?.includes('DELETE_CONTACT')
  const bulkActionDropDown = [{ label: <FormattedMessage id="deleteSelected" />, value: 'd', isAllowedTo: 'DELETE_CONTACT' }]
  const bulkActionPermission = ['DELETE_CONTACT']
  const [tabs, setTabs] = useState([
    { name: 'All', internalName: 'all', active: getActiveTabNameFromState(requestParams?.aState) === 'all' },
    { name: 'UnRead', internalName: 'unRead', active: isUnreadTab(requestParams?.aState) },
    { name: 'Read', internalName: 'read', active: isReadTab(requestParams?.aState) }
  ])
  const columns = useRef([
    { name: <FormattedMessage id="name" />, internalName: 'sFullName', type: 0 },
    { name: 'Company Name', internalName: 'sCompanyName', type: 0 },
    { name: <FormattedMessage id="phoneNumber" />, internalName: 'sPhoneNumber', type: 0 },
    { name: 'Discussion Topic', internalName: 'sDiscussionTopic', type: 0 },
    { name: 'Email', internalName: 'sEmail', type: 0 },
    { name: 'Page URL', internalName: 'sUrl', type: 0 }
  ])
  const labels = {
    close: intl.formatMessage({ id: 'close' }),
    yes: intl.formatMessage({ id: 'yes' }),
    no: intl.formatMessage({ id: 'no' }),
    confirmationTitle: intl.formatMessage({ id: 'confirmation' }),
    deleteContactMessage: intl.formatMessage({ id: 'deleteThisContact' })
  }

  const { loading, refetch } = useQuery(GET_CONTACTS_LIST, {
    variables: { input: contactListInput },
    onCompleted: (data) => {
      if (data && data?.getContacts?.aResults) {
        const results = excludeDeletedLeads(data.getContacts.aResults)
        totalRecord.current = data.getContacts.nTotal
        setSelectedContact(
          results.map((item) => {
            return {
              _id: item._id,
              value: false
            }
          })
        )
        setContactList(results)
      }
    }
  })

  const [deleteContact, { loading: deleteLoading }] = useMutation(DELETE_CONTACT, {
    onCompleted: (data) => {
      if (data?.deleteContact?.sMessage) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.deleteContact.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
        refetch()
      }
    }
  })

  const [bulkContactDelete, { loading: bulkLoading }] = useMutation(BULK_CONTACT_DELETE, {
    onCompleted: (data) => {
      if (data?.bulkContactDelete?.sMessage) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.bulkContactDelete.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
        refetch()
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
      aState: getContactState(data?.aState)
    }
  }

  function getContactListInput(input) {
    const { nSkip, nLimit } = toBackendPagination(input.nSkip, Number(input.nLimit) || 10)
    const { sSearch, ...listInput } = input

    const nextInput = {
      ...listInput,
      nLimit,
      nSkip,
      aState: getContactState(input.aState)
    }

    if (sSearch) nextInput.sSearch = sSearch

    return nextInput
  }

  function getExportInput() {
    return buildExportLeadsInput(LEAD_EXPORT_TYPE.CONTACT, {
      aState: getContactState(requestParams.aState),
      sSearch: requestParams.sSearch,
      bMarketingOpt: requestParams.bMarketingOpt,
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
    setContactList((list) => list.filter((item) => !aIds.includes(item._id)))
    setSelectedContact((selected) => selected.filter((item) => !aIds.includes(item._id)).map((item) => ({ ...item, value: false })))
    totalRecord.current = Math.max(0, totalRecord.current - aIds.length)
  }

  function handleCheckbox({ target }) {
    if (target.name === 'selectAll') {
      setSelectedContact(
        selectedContact.map((item) => {
          item.value = target.checked
          return item
        })
      )
    } else {
      setSelectedContact(
        selectedContact.map((item) => {
          if (item._id === target.name) item.value = target.checked
          return item
        })
      )
    }
  }

  async function handleHeaderEvent(name, value) {
    switch (name) {
      case 'bulkAction': {
        const aId = getSelectedIds(selectedContact)
        if (!aId.length) break
        const { data } = await bulkContactDelete({ variables: { input: { aId } } })
        if (data?.bulkContactDelete) handleDeleted(aId)
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
      message: labels.deleteContactMessage,
      customUI: CustomAlert,
      buttons: [
        {
          label: labels.yes,
          onClick: async () => {
            const { data } = await deleteContact({ variables: { input: { _id: id } } })
            if (data?.deleteContact) {
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
      setRequestParams({ ...requestParams, sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
      appendParams({ sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
    }
  }
  function handleTabChange(name) {
    if (name === 'unRead') {
      setRequestParams({ ...requestParams, aState: ['ur'], nSkip: 1 })
      appendParams({ aState: ['ur'], nSkip: 1 })
    } else if (name === 'read') {
      setRequestParams({ ...requestParams, aState: ['r'], nSkip: 1 })
      appendParams({ aState: ['r'], nSkip: 1 })
    } else {
      setRequestParams({ ...requestParams, aState: DEFAULT_CONTACT_STATE, nSkip: 1 })
      appendParams({ aState: DEFAULT_CONTACT_STATE, nSkip: 1 })
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
    return getActiveTabNameFromState(data?.aState)
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
        isLoading={loading || deleteLoading || bulkLoading}
        bulkAction={bulkActionDropDown}
        header={{
          left: {
            bulkAction: canDelete,
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
        selectAllEvent={handleCheckbox}
        selectAllValue={selectedContact}
        checkbox={canDelete}
        pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
        actionColumn
      >
        {contactList?.map((contact, index) => {
          return (
            <ContactItemRow
              key={contact._id}
              index={index}
              contact={contact}
              selectedContact={selectedContact}
              bulkPermission={bulkActionPermission}
              onSelect={handleCheckbox}
              onDelete={handleDelete}
            />
          )
        })}
      </DataTable>
    </>
  )
}

Contacts.propTypes = {
  userPermission: PropTypes.array
}
export default Contacts
