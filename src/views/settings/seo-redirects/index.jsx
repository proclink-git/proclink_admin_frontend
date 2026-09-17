import React, { useState, useEffect, useContext, useRef } from 'react'
import PropTypes from 'prop-types'
import { useHistory } from 'react-router'
import { useMutation, useQuery } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'
import { confirmAlert } from 'react-confirm-alert'

import CustomAlert from 'shared/components/alert'
import TopBar from 'shared/components/top-bar'
import DataTable from 'shared/components/data-table'
import Drawer from 'shared/components/drawer'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import { setSortType, parseParams, appendParams } from 'shared/utils'
import SeoRedirectsItemRow from 'shared/components/seo-redirects-item-row'
import AddEditSeoRedirects from 'shared/components/add-edit-seo-redirects'
import { LIST_SEO_REDIRECT, BULK_OPERATION } from 'graph-ql/settings/seo-redirects'
import SeoRedirectsFilter from 'shared/components/seo-redirects-filters'

function SeoRedirects({ userPermission }) {
  const history = useHistory()
  const params = useRef(parseParams(location.search))
  const { dispatch } = useContext(ToastrContext)
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const [seoRedirectList, setSeoRedirectList] = useState([])
  const totalRecord = useRef(0)
  const [selectedSeoRedirect, setSelectedSeoRedirect] = useState([])
  const [openAddEdit, setOpenAddEdit] = useState(false)
  const [id, setId] = useState('')

  const [columns, setColumns] = useState(getActionColumns())
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const actionColumnPermission = ['LIST_SEO_REDIRECT', 'DELETE_SEO_REDIRECT']
  const bulkActionDropDown = [{ label: 'Delete All', value: 'd', isAllowedTo: 'DELETE_SEO_REDIRECT' }]
  const bulkActionPermission = bulkActionDropDown.map((e) => e.isAllowedTo)

  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteThisItem' })
  }
  const { loading, refetch } = useQuery(LIST_SEO_REDIRECT, {
    variables: {
      input: requestParams
    },
    onCompleted: (data) => {
      if (data && data?.getSeoRedirect?.aResults) {
        totalRecord.current = data.getSeoRedirect.nTotal
        setSelectedSeoRedirect(
          data.getSeoRedirect.aResults.map((item) => {
            return {
              _id: item._id,
              value: false
            }
          })
        )
        setSeoRedirectList(data.getSeoRedirect.aResults)
      }
    }
  })

  const [bulkAction, { loading: bulkLoading }] = useMutation(BULK_OPERATION, {
    onCompleted: (data) => {
      if (data && data.bulkSeoRedirectUpdate) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.bulkSeoRedirectUpdate.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
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

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    return {
      aCode: data?.aCodeFilters?.map(Number) || [],
      nLimit: Number(data.nLimit) || 10,
      nOrder: Number(data.nOrder) || -1,
      nSkip: Number(data.nSkip) || 1,
      sSearch: data.sSearch || '',
      sSortBy: data.sSortBy || 'dCreated'
    }
  }

  function getActionColumns(name) {
    const data = params.current
    const clm = [
      { name: <FormattedMessage id="type" />, internalName: 'eCode', type: 0 },
      { name: <FormattedMessage id="oldUrl" />, internalName: 'sOldUrl', type: 0 },
      { name: <FormattedMessage id="newUrl" />, internalName: 'sNewUrl', type: 0 }
    ]
    return clm.map((e) => {
      if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder === 1 ? -1 : 1 }
      return e
    })
  }

  async function handleAddEdit(data, eType) {
    if (eType === 'add') {
      setSeoRedirectList([data, ...seoRedirectList])
    } else if (eType === 'edit') {
      setSeoRedirectList(
        seoRedirectList.map((item) => {
          if (data._id.includes(item._id)) {
            return {
              ...item,
              sNewUrl: data.sNewUrl,
              sOldUrl: data.sOldUrl,
              eCode: data.eCode
            }
          }
          return item
        })
      )
    } else {
      setSeoRedirectList(seoRedirectList.filter((item) => !data._id.includes(item._id)))
    }
    setSelectedSeoRedirect(
      selectedSeoRedirect.map((item) => {
        return {
          ...item,
          value: false
        }
      })
    )
  }
  function handleCheckbox({ target }) {
    if (target.name === 'selectAll') {
      setSelectedSeoRedirect(
        selectedSeoRedirect.map((item) => {
          item.value = target.checked
          return item
        })
      )
    } else {
      if (target.checked) {
        setSelectedSeoRedirect(
          selectedSeoRedirect.map((item) => {
            if (item._id === target.name) item.value = true
            return item
          })
        )
      } else {
        setSelectedSeoRedirect(
          selectedSeoRedirect.map((item) => {
            if (item._id === target.name) item.value = false
            return item
          })
        )
      }
    }
  }

  async function handleHeaderEvent(name, value) {
    switch (name) {
      case 'bulkAction':
        {
          const seoRedirect = selectedSeoRedirect.map((a) => ({ ...a }))
          const obj = {
            aId: seoRedirect.filter((item) => item.value && delete item.value),
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
              seoRedirect.filter((item) => item.value === undefined && item).map((e) => e._id),
              value
            )
          }
        }
        break
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
            if (data && data.bulkSeoRedirectUpdate) handleBulkResponse([id], 'd')
          }
        },
        {
          label: labels.no
        }
      ]
    })
    setSelectedSeoRedirect(
      selectedSeoRedirect.map((item) => {
        return {
          ...item,
          value: false
        }
      })
    )
  }
  function handleBulkResponse(aIds, eType) {
    if (eType === 'd') {
      setSeoRedirectList(seoRedirectList.filter((item) => !aIds.includes(item._id)))
    }
    setSelectedSeoRedirect(
      selectedSeoRedirect.map((item) => {
        return {
          _id: item._id,
          value: false
        }
      })
    )
  }

  function handleFilterChange(e) {
    setRequestParams({ ...requestParams, nSkip: 1, aCode: e.data.aCodeFilters })
    appendParams({ aCodeFilters: e.data.aCodeFilters ? e.data.aCodeFilters : [], nSkip: 1 })
    setIsFilterOpen(!isFilterOpen)
  }

  function handleSort(field) {
    setRequestParams({ ...requestParams, sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
    appendParams({ sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
    const data = setSortType(columns, field.internalName)
    setColumns(data)
  }
  function handlePageEvent(page) {
    setRequestParams({ ...requestParams, nSkip: page })
    appendParams({ nSkip: page })
  }
  function handleBtnEvent(eventName) {
    switch (eventName) {
      case 'addNewSeoRedirect':
        setOpenAddEdit(true)
        setId('')
        break
      default:
        break
    }
  }
  function onEdit(val) {
    setId(val)
    setOpenAddEdit(true)
  }
  function closeDrawer() {
    setOpenAddEdit(!openAddEdit)
  }
  function onCloseAddEdit() {
    setOpenAddEdit(false)
    setId('')
  }
  return (
    <>
      <Drawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(!isFilterOpen)}
        title={useIntl().formatMessage({ id: 'filterSeoRedirect' })}
      >
        <SeoRedirectsFilter filterChange={handleFilterChange} defaultValue={requestParams.aCode} />
      </Drawer>
      <TopBar
        buttons={[
          {
            text: useIntl().formatMessage({ id: 'addRedirect' }),
            icon: 'icon-add',
            type: 'primary',
            clickEventName: 'addNewSeoRedirect',
            isAllowedTo: 'ADD_SEO_REDIRECT'
          }
        ]}
        btnEvent={handleBtnEvent}
      />
      <DataTable
        className="player-list"
        columns={columns}
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
            search: true,
            filter: true
          }
        }}
        headerEvent={(name, value) => handleHeaderEvent(name, value)}
        pageChangeEvent={handlePageEvent}
        pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
        selectAllValue={selectedSeoRedirect}
        selectAllEvent={handleCheckbox}
        checkbox={!!userPermission.filter((p) => bulkActionPermission.includes(p)).length}
        actionColumn={!!userPermission.filter((p) => bulkActionPermission.includes(p)).length}
      >
        {seoRedirectList.map((seoRedirect, index) => {
          return (
            <SeoRedirectsItemRow
              key={seoRedirect._id}
              index={index}
              seoRedirect={seoRedirect}
              selectedSeoRedirect={selectedSeoRedirect}
              onSelect={handleCheckbox}
              bulkPermission={bulkActionPermission}
              actionPermission={actionColumnPermission}
              onEdit={onEdit}
              onDelete={handleDelete}
            />
          )
        })}
      </DataTable>
      <Drawer
        isOpen={openAddEdit}
        onClose={() => onCloseAddEdit()}
        title={id ? useIntl().formatMessage({ id: 'editRedirect' }) : useIntl().formatMessage({ id: 'addRedirect' })}
      >
        <AddEditSeoRedirects id={id} closeDrawer={closeDrawer} handleAddEdit={handleAddEdit} />
      </Drawer>
    </>
  )
}
SeoRedirects.propTypes = {
  userPermission: PropTypes.array
}
export default SeoRedirects
