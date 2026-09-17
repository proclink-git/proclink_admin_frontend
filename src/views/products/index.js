import React, { useContext, useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useHistory } from 'react-router'
import { useQuery, useMutation } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'
import { confirmAlert } from 'react-confirm-alert'

import TopBar from 'shared/components/top-bar'
import DataTable from 'shared/components/data-table'
import CustomAlert from 'shared/components/alert'
import { allRoutes } from 'shared/constants/AllRoutes'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import { setSortType, parseParams, appendParams } from 'shared/utils'
import { LIST_PRODUCTS } from 'graph-ql/products/query'
import ProductRow from 'shared/components/product/product-row'
import { BULK_OPERATION_PRODUCTS } from 'graph-ql/products/mutation'

const PRODUCT_CREATE_PERMISSIONS = ['CREATE_PRODUCT', 'CREATE_SERVICE', 'ADD_INDUSTRY']
const PRODUCT_UPDATE_PERMISSIONS = ['UPDATE_PRODUCT_STATUS', 'UPDATE_SERVICE_STATUS', 'UPDATE_INDUSTRY_STATUS']

function Products({ userPermission }) {
  const history = useHistory()
  const params = useRef(parseParams(location.search))
  const { dispatch } = useContext(ToastrContext)
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const [productList, setProductList] = useState([])
  const [selectedProduct, setSelectedProduct] = useState([])
  const totalRecord = useRef(0)
  const tabs = useRef([
    { name: 'Active', internalName: 'active', active: requestParams?.eStatus === 'a' },
    { name: 'inactive', internalName: 'inActive', active: requestParams?.eStatus === 'i' }
  ])
  const columns = useRef(getActionColumns())
  const bulkActionDropDown = [
    { label: 'Delete All', value: 'd', isAllowedTo: PRODUCT_UPDATE_PERMISSIONS },
    { label: 'Active  All', value: 'a', isAllowedTo: PRODUCT_UPDATE_PERMISSIONS },
    { label: 'Deactivate All', value: 'i', isAllowedTo: PRODUCT_UPDATE_PERMISSIONS }
  ]
  const bulkActionPermission = bulkActionDropDown.flatMap((e) => e.isAllowedTo)

  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteAllItem' })
  }

  const { loading, refetch } = useQuery(LIST_PRODUCTS, {
    variables: { input: requestParams },
    onCompleted: (data) => {
      handleApiResponse(data)
    }
  })

  const [bulkAction, { loading: bulkLoading }] = useMutation(BULK_OPERATION_PRODUCTS, {
    onCompleted: (data) => {
      if (data && data.bulkProductUpdate) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.bulkProductUpdate?.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
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
    if (data && data?.listProduct?.aResults) {
      setSelectedProduct(
        data.listProduct?.aResults.map((item) => {
          return {
            _id: item._id,
            value: false
          }
        })
      )
      totalRecord.current = data.listProduct.nTotal
      setProductList(data.listProduct?.aResults)
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

  function handleBtnEvent(eventName) {
    switch (eventName) {
      case 'newProduct':
        history.push(allRoutes.createProduct)
        break
      default:
        break
    }
  }

  function getActionColumns() {
    const data = params.current
    const clm = [
      { name: 'H1', internalName: 'sDescription', type: 0 },
      { name: <FormattedMessage id="slug" />, internalName: 'sSlug' }
    ]
    return clm.map((e) => {
      if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder ? Number(data.nOrder) : -1 }
      return e
    })
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
    }
  }

  function changeTab(name) {
    tabs.current = tabs.current.map((e) => ({ ...e, active: e.internalName === name }))
  }

  function handleBulkResponse(aIds, eType) {
    if (eType === 'd') {
      if (requestParams?.nLimit / 2 >= productList?.length || requestParams?.nLimit / 2 <= aIds?.length) {
        handleMultipleDelete()
      } else {
        setProductList(productList.filter((item) => !aIds.includes(item._id)))
      }
    } else if (['a', 'i'].includes(eType)) {
      if (requestParams?.eStatus !== eType) {
        if (productList?.length === 1 || requestParams?.nLimit / 2 >= productList?.length || requestParams?.nLimit / 2 <= aIds?.length) {
          handleMultipleDelete()
          return true
        }
        setProductList(productList.filter((item) => !aIds.includes(item._id)))
      }
    }
    setSelectedProduct(
      selectedProduct.map((item) => {
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
            if (data && data.bulkProductUpdate) handleBulkResponse([id], 'd')
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
        const product = selectedProduct.map((a) => ({ ...a }))
        const obj = {
          bulkIds: product.filter((item) => item.value && delete item.value),
          eStatus: value
        }
        if (['d', 'a', 'i'].includes(obj.eStatus)) {
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
          if (data?.bulkProductUpdate) {
            handleBulkResponse(
              product.filter((item) => item.value === undefined && item).map((e) => e._id),
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
      setSelectedProduct(
        selectedProduct.map((item) => {
          item.value = target.checked
          return item
        })
      )
    } else if (target.checked) {
      setSelectedProduct(
        selectedProduct.map((item) => {
          if (item._id === target.name) item.value = true
          return item
        })
      )
    } else {
      setSelectedProduct(
        selectedProduct.map((item) => {
          if (item._id === target.name) item.value = false
          return item
        })
      )
    }
  }

  async function handleStatusChange({ target }) {
    const { data } = await bulkAction({ variables: { input: { aId: [target.name], eStatus: target.checked ? 'a' : 'i' } } })
    if (data?.bulkProductUpdate) handleBulkResponse([target.name], target.checked ? 'a' : 'i')
  }

  function getActiveTabName(e) {
    const data = e ? parseParams(e) : params.current
    if (data?.eStatus === 'i') {
      return 'inActive'
    } else {
      return 'active'
    }
  }

  async function handleMultipleDelete() {
    if (productList?.length === 0) {
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
        buttons={[{ text: 'New Product', icon: 'icon-add', type: 'primary', clickEventName: 'newProduct', isAllowedTo: PRODUCT_CREATE_PERMISSIONS }]}
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
        selectAllValue={selectedProduct}
        tabs={tabs.current}
        tabEvent={handleTabChange}
        checkbox={!!userPermission.filter((p) => bulkActionPermission.includes(p)).length}
        actionColumn
      >
        {productList.map((d, index) => {
          return (
            <ProductRow
              key={d?._id}
              index={index}
              data={d}
              selected={selectedProduct}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onSelect={handleCheckbox}
              bulkPermission={bulkActionPermission}
              eStatus={requestParams.eStatus}
            />
          )
        })}
      </DataTable>
    </>
  )
}

Products.propTypes = {
  userPermission: PropTypes.array
}

export default Products
