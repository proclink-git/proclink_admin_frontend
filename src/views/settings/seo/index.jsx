import React, { useState, useEffect, useContext, useRef } from 'react'
import PropTypes from 'prop-types'
import { useHistory } from 'react-router'
import { useMutation, useQuery } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'
import { confirmAlert } from 'react-confirm-alert'

import { LIST_SEO, BULK_OPERATION } from 'graph-ql/settings/seo'
import DataTable from 'shared/components/data-table'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import { setSortType, parseParams, appendParams } from 'shared/utils'
import SeoItemRow from 'shared/components/seo-item-row'
import TopBar from 'shared/components/top-bar'
import { allRoutes } from 'shared/constants/AllRoutes'
import CustomAlert from 'shared/components/alert'

function Seo({ userPermission }) {
  const history = useHistory()
  const params = useRef(parseParams(location.search))
  const { dispatch } = useContext(ToastrContext)
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const [seoList, setSeoList] = useState([])
  const totalRecord = useRef(0)
  const [selectedSeo, setSelectedSeo] = useState([])
  const columns = useRef([
    { name: <FormattedMessage id="title" />, internalName: 'sName', type: 0 },
    { name: <FormattedMessage id="keywords" />, internalName: 'sCountry', type: 0 },
    { name: <FormattedMessage id="lastUpdatedBy" />, internalName: 'sDescription', type: 0 }
  ])
  const actionPermission = ['EDIT_SEO']
  const bulkActionDropDown = [
    { label: <FormattedMessage id="activeAll" />, value: 'a', isAllowedTo: 'UPDATE_SEO_STATUS' },
    { label: <FormattedMessage id="deactivateAll" />, value: 'i', isAllowedTo: 'UPDATE_SEO_STATUS' },
    { label: <FormattedMessage id="deleteAll" />, value: 'd', isAllowedTo: 'DELETE_SEO' }
  ]
  const bulkActionPermission = bulkActionDropDown.map((e) => e.isAllowedTo)

  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteThisItem' })
  }

  const { loading, refetch } = useQuery(LIST_SEO, {
    variables: {
      input: requestParams
    },
    onCompleted: (data) => {
      if (data && data?.listSeo?.aResults) {
        setSelectedSeo(
          data.listSeo.aResults.map((item) => {
            return {
              _id: item._id,
              value: false
            }
          })
        )
        totalRecord.current = data.listSeo.nTotal
        setSeoList(data.listSeo.aResults)
      }
    }
  })
  const [bulkAction, { loading: bulkLoading }] = useMutation(BULK_OPERATION, {
    onCompleted: (data) => {
      if (data && data.bulkSeoUpdate) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.bulkSeoUpdate.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
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
      sSearch: data.sSearch || ''
    }
  }
  function handleBulkResponse(aIds, eType) {
    if (eType === 'd') {
      setSeoList(seoList.filter((item) => !aIds.includes(item._id)))
      setSelectedSeo(selectedSeo.filter((item) => !aIds.includes(item._id)))
    } else {
      setSeoList(
        seoList.map((item) => {
          if (aIds.includes(item._id)) return { ...item, eStatus: eType }
          return item
        })
      )
    }
    setSelectedSeo(
      selectedSeo.map((item) => {
        return {
          ...item,
          value: false
        }
      })
    )
  }
  function handleCheckbox({ target }) {
    if (target.name === 'selectAll') {
      setSelectedSeo(
        selectedSeo.map((item) => {
          item.value = target.checked
          return item
        })
      )
    } else {
      if (target.checked) {
        setSelectedSeo(
          selectedSeo.map((item) => {
            if (item._id === target.name) item.value = true
            return item
          })
        )
      } else {
        setSelectedSeo(
          selectedSeo.map((item) => {
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
        const seo = selectedSeo.map((a) => ({ ...a }))
        const obj = {
          aId: seo.filter((item) => item.value && delete item.value),
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
            seo.filter((item) => item.value === undefined && item).map((e) => e._id),
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
      default:
        break
    }
  }

  async function onIsApprove(target, type) {
    if (type === 'approved') {
      const { data: approveData } = await bulkAction({ variables: { input: { aId: [target], eStatus: 'a' } } })
      if (approveData && approveData.bulkSeoUpdate) handleBulkResponse([target], 'approved')
    } else {
      const { data } = await bulkAction({ variables: { input: { aId: [target], eStatus: 'i' } } })
      if (data && data.bulkSeoUpdate) handleBulkResponse([target], 'dec')
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
    if (data && data.bulkSeoUpdate) handleBulkResponse([target.name], target.checked ? 'i' : 'a')
  }
  function handleBtnEvent(eventName) {
    switch (eventName) {
      case 'newSeo':
        history.push(allRoutes.addSeo)
        break
      default:
        break
    }
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
            if (data && data.bulkSeoUpdate) handleBulkResponse([id], 'd')
          }
        },
        {
          label: labels.no
        }
      ]
    })
  }
  return (
    <>
      <TopBar
        buttons={[
          {
            text: useIntl().formatMessage({ id: 'addNew' }),
            icon: 'icon-add',
            type: 'primary',
            clickEventName: 'newSeo',
            isAllowedTo: 'ADD_SEO'
          }
        ]}
        btnEvent={handleBtnEvent}
      />
      <DataTable
        className="tags-list"
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
            search: true
          }
        }}
        headerEvent={(name, value) => handleHeaderEvent(name, value)}
        selectAllEvent={handleCheckbox}
        pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
        selectAllValue={selectedSeo}
        pageChangeEvent={handlePageEvent}
        checkbox={!!userPermission.filter((p) => bulkActionPermission.includes(p)).length}
        actionColumn={!!userPermission.filter((p) => actionPermission.includes(p)).length}
      >
        {seoList.map((seo, index) => {
          return (
            <SeoItemRow
              key={seo._id}
              index={index}
              seo={seo}
              selectedSeo={selectedSeo}
              onDelete={handleDelete}
              onSelect={handleCheckbox}
              onIsApprove={onIsApprove}
              bulkPermission={bulkActionPermission}
              actionPermission={actionPermission}
              onStatusChange={handleStatusChange}
            />
          )
        })}
      </DataTable>
    </>
  )
}
Seo.propTypes = {
  userPermission: PropTypes.array
}
export default Seo
