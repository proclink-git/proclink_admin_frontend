import React, { useContext, useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useHistory, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'
import { confirmAlert } from 'react-confirm-alert'

import CategorySimpleParentItemRow from 'shared/components/category-simple-parent-item-row'
import TopBar from 'shared/components/top-bar'
import DataTable from 'shared/components/data-table'
import CustomAlert from 'shared/components/alert'
import { allRoutes } from 'shared/constants/AllRoutes'
import { ToastrContext } from 'shared/components/toastr'
import { HEADER_CATEGORY_SLUG_ADMIN, TOAST_TYPE } from 'shared/constants'
import { setSortType, parseParams, appendParams } from 'shared/utils'
import { GET_CATEGORY_LIST, BULK_OPERATION } from 'graph-ql/management/category'

function Categories({ userPermission }) {
  const { categoryType } = useParams()
  const history = useHistory()
  const params = useRef(parseParams(location.search))
  const { dispatch } = useContext(ToastrContext)
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const [categoryList, setCategoryList] = useState([])
  const [selectedCategory, setSelectedCategory] = useState([])
  const totalRecord = useRef(0)

  const columns = useRef(getActionColumns())
  const bulkActionDropDown = [
    {
      label: 'Delete All',
      value: 'd',
      isAllowedTo: [
        'DELETE_BLOG_CATEGORY',
        'DELETE_WEBINAR_CATEGORY',
        'DELETE_PODCAST_CATEGORY',
        'DELETE_WHITEPAPER_CATEGORY',
        'DELETE_RESEARCH_REPORT_CATEGORY',
        'DELETE_VIDEO_LISTING_CATEGORY',
        'DELETE_CASE_STUDY_CATEGORY',
        'DELETE_NEWS_EVENTS_CATEGORY',
        'DELETE_MEDIA_GALLERY_CATEGORY',
        'VIEW_MEDIA_GALLERY'
      ]
    },
    { label: 'Active  All', value: 'a', isAllowedTo: 'CHANGE_STATUS_CATEGORY' },
    { label: 'Deactivate All', value: 'i', isAllowedTo: 'CHANGE_STATUS_CATEGORY' }
  ]
  const bulkActionPermission = bulkActionDropDown.flatMap((item) =>
    item.isAllowedTo ? (Array.isArray(item.isAllowedTo) ? item.isAllowedTo : [item.isAllowedTo]) : []
  )

  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: 'Are you sure you want to delete?'
  }

  const { loading, refetch } = useQuery(GET_CATEGORY_LIST, {
    variables: { input: requestParams },
    onCompleted: (data) => {
      handleApiResponse(data)
    }
  })

  const [bulkAction, { loading: bulkLoading }] = useMutation(BULK_OPERATION, {
    onCompleted: (data) => {
      if (data && data.bulkCategoryUpdate) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.bulkCategoryUpdate.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })

  useEffect(() => {
    return history.listen((e) => {
      params.current = parseParams(e.search)
      setRequestParams(getRequestParams(e.search))
    })
  }, [history])

  function handleApiResponse(data) {
    if (data && data?.getCategory.aResults) {
      setSelectedCategory(
        data.getCategory.aResults.map((item) => {
          return {
            _id: item._id,
            value: false
          }
        })
      )
      totalRecord.current = data.getCategory.nTotal
      setCategoryList(data.getCategory.aResults)
    }
  }

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    return {
      eHeaderCategoryType: categoryType,
      eType: 's',
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 10,
      sSortBy: data.sSortBy || 'dCreated',
      nOrder: Number(data.nOrder) || -1,
      sSearch: data.sSearch || ''
    }
  }

  function handleBtnEvent(eventName) {
    switch (eventName) {
      case 'newCategory':
        history.push(allRoutes.addCategory(categoryType, HEADER_CATEGORY_SLUG_ADMIN[categoryType]))
        break
      default:
        break
    }
  }

  function getActionColumns() {
    const data = params.current
    const clm = [
      { name: <FormattedMessage id="name" />, internalName: 'sName', type: 0 },
      // { name: <FormattedMessage id="slug" />, internalName: 'sSlug' },
      { name: <FormattedMessage id="displayOrder" defaultMessage="Display Order" />, internalName: 'nPriority', type: 0 },
      { name: <FormattedMessage id="createdBy" />, internalName: 'oSubAdmin.sFName' }
    ]
    return clm.map((e) => {
      if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder ? Number(data.nOrder) : -1 }
      return e
    })
  }

  function handleBulkResponse(aIds, eType) {
    if (eType === 'd') {
      if (requestParams?.nLimit / 2 >= categoryList?.length || requestParams?.nLimit / 2 <= aIds?.length) {
        handleMultipleDelete()
      } else {
        setCategoryList(categoryList.filter((item) => !aIds.includes(item._id)))
      }
    } else if (['a', 'i'].includes(eType)) {
      setCategoryList(
        categoryList.map((item) => {
          if (aIds.includes(item._id)) return { ...item, eStatus: eType }
          return item
        })
      )
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

  function handleDelete(id) {
    confirmAlert({
      title: labels.confirmationTitle,
      message: labels.confirmationMessage,
      customUI: CustomAlert,
      buttons: [
        {
          label: labels.yes,
          onClick: async () => {
            const { data } = await bulkAction({ variables: { input: { aId: [id], eHeaderCategoryType: categoryType, eStatus: 'd' } } })
            if (data) handleBulkResponse([id], 'd')
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
                eStatus: obj.eStatus,
                eHeaderCategoryType: categoryType
              }
            }
          })
          if (data) {
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
                eStatus: obj.eStatus,
                eHeaderCategoryType: categoryType
              }
            }
          })
          if (data) {
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
    columns.current = setSortType(columns.current, field.internalName)
  }

  function handlePageEvent(page) {
    setRequestParams({ ...requestParams, nSkip: page })
    appendParams({ nSkip: page })
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

  async function handleStatusChange({ target }) {
    const { data } = await bulkAction({
      variables: { input: { aId: [target.name], eStatus: target.checked ? 'a' : 'i', eHeaderCategoryType: categoryType } }
    })
    if (data) handleBulkResponse([target.name], target.checked ? 'i' : 'a')
  }

  async function handleMultipleDelete() {
    if (categoryList?.length === 0) {
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
        buttons={[
          {
            text: 'New Category',
            icon: 'icon-add',
            type: 'primary',
            clickEventName: 'newCategory',
            isAllowedTo: [
              'ADD_BLOG_CATEGORY',
              'ADD_WEBINAR_CATEGORY',
              'ADD_PODCAST_CATEGORY',
              'ADD_WHITEPAPER_CATEGORY',
              'ADD_RESEARCH_REPORT_CATEGORY',
              'ADD_VIDEO_LISTING_CATEGORY',
              'ADD_CASE_STUDY_CATEGORY',
              'ADD_NEWS_EVENTS_CATEGORY',
              'ADD_MEDIA_GALLERY_CATEGORY',
              'VIEW_MEDIA_GALLERY'
            ]
          }
        ]}
        btnEvent={handleBtnEvent}
      />
      <DataTable
        // className="category-list"
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
        selectAllValue={selectedCategory}
        checkbox={!!userPermission.filter((p) => bulkActionPermission.includes(p)).length}
        actionColumn
      >
        {categoryList.map((category, index) => {
          return (
            <CategorySimpleParentItemRow
              key={category._id}
              index={index}
              category={category}
              selectedCategory={selectedCategory}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onSelect={handleCheckbox}
              bulkPermission={bulkActionPermission}
            />
          )
        })}
      </DataTable>
    </>
  )
}
Categories.propTypes = {
  userPermission: PropTypes.array
}
export default Categories
