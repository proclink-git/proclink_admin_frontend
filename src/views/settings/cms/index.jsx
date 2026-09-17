import React, { useState, useEffect, useContext, useMemo, useRef } from 'react'
import PropTypes from 'prop-types'
import { useHistory } from 'react-router'
import { useMutation, useQuery } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'
import { confirmAlert } from 'react-confirm-alert'

import { LIST_CMS, BULK_OPERATION } from 'graph-ql/settings/cms'
import DataTable from 'shared/components/data-table'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import { setSortType, parseParams, appendParams, toBackendPagination } from 'shared/utils'
import CmsItemRow from 'shared/components/cms-item-row'
import TopBar from 'shared/components/top-bar'
import { allRoutes } from 'shared/constants/AllRoutes'
import CustomAlert from 'shared/components/alert'

function Cms({ userPermission }) {
  const history = useHistory()
  const params = useRef(parseParams(location.search))
  const { dispatch } = useContext(ToastrContext)
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const cmsListInput = useMemo(() => getCmsListInput(requestParams), [requestParams])
  const [cmsList, setCmsList] = useState([])
  const totalRecord = useRef(0)
  const [selectedCms, setSelectedCms] = useState([])
  const columns = useRef([
    { name: <FormattedMessage id="title" />, internalName: 'sName', type: 0 },
    { name: <FormattedMessage id="slug" />, internalName: 'sCountry', type: 0 }
  ])
  // const actionPermission = ['EDIT_CMS_PAGE', 'DELETE_CMS_PAGE']
  const bulkActionDropDown = [{ label: <FormattedMessage id="deleteAll" />, value: 'd', isAllowedTo: 'DELETE_CMS_PAGE' }]
  const bulkActionPermission = bulkActionDropDown.map((e) => e.isAllowedTo)

  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteThisItem' })
  }

  const { loading, refetch } = useQuery(LIST_CMS, {
    variables: {
      input: cmsListInput
    },
    onCompleted: (data) => {
      if (data && data?.listCMSPage?.aResults) {
        setSelectedCms(
          data.listCMSPage.aResults.map((item) => {
            return {
              _id: item._id,
              value: false
            }
          })
        )
        totalRecord.current = data.listCMSPage.nTotal
        setCmsList(data.listCMSPage.aResults)
      }
    }
  })
  const [bulkAction, { loading: bulkLoading }] = useMutation(BULK_OPERATION, {
    onCompleted: (data) => {
      if (data && data.bulkUpdateCMSPage) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.bulkUpdateCMSPage.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
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
      eStatus: data.eStatus || 'a'
    }
  }

  function getCmsListInput(input) {
    const { nSkip, nLimit } = toBackendPagination(input.nSkip, Number(input.nLimit) || 10)

    return {
      ...input,
      nLimit,
      nSkip,
      eStatus: input.eStatus || 'a'
    }
  }
  function handleBulkResponse(aIds, eType) {
    if (eType === 'd') {
      setCmsList(cmsList.filter((item) => !aIds.includes(item._id)))
      setSelectedCms(selectedCms.filter((item) => !aIds.includes(item._id)))
    }
    setSelectedCms(
      selectedCms.map((item) => {
        return {
          ...item,
          value: false
        }
      })
    )
  }
  function handleCheckbox({ target }) {
    if (target.name === 'selectAll') {
      setSelectedCms(
        selectedCms.map((item) => {
          item.value = target.checked
          return item
        })
      )
    } else {
      if (target.checked) {
        setSelectedCms(
          selectedCms.map((item) => {
            if (item._id === target.name) item.value = true
            return item
          })
        )
      } else {
        setSelectedCms(
          selectedCms.map((item) => {
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
        const cms = selectedCms.map((a) => ({ ...a }))
        const obj = {
          aId: cms.filter((item) => item.value && delete item.value),
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
            cms.filter((item) => item.value === undefined && item).map((e) => e._id),
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
    if (data && data.bulkUpdateCMSPage) handleBulkResponse([target.name], target.checked ? 'i' : 'a')
  }
  function handleBtnEvent(eventName) {
    switch (eventName) {
      case 'newCms':
        history.push(allRoutes.addCms)
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
            if (data && data.bulkUpdateCMSPage) handleBulkResponse([id], 'd')
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
            clickEventName: 'newCms',
            isAllowedTo: 'CREATE_CMS_PAGE'
          }
        ]}
        btnEvent={handleBtnEvent}
      />
      <DataTable
        className="cms-list"
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
        selectAllValue={selectedCms}
        pageChangeEvent={handlePageEvent}
        checkbox={!!userPermission.filter((p) => bulkActionPermission.includes(p)).length}
        actionColumn
      >
        {cmsList.map((cms, index) => {
          return (
            <CmsItemRow
              key={cms._id}
              index={index}
              cms={cms}
              selectedCms={selectedCms}
              onDelete={handleDelete}
              onSelect={handleCheckbox}
              bulkPermission={bulkActionPermission}
              // actionPermission={actionPermission}
              onStatusChange={handleStatusChange}
            />
          )
        })}
      </DataTable>
    </>
  )
}
Cms.propTypes = {
  userPermission: PropTypes.array
}
export default Cms
