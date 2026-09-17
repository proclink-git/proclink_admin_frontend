import React, { useContext, useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useHistory, useParams } from 'react-router-dom'
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
import { AUTHOR_BULK_OPERATION, UPDATE_AUTHOR_STATUS } from 'graph-ql/author/mutation'
import { LIST_AUTHORS_PAGE } from 'graph-ql/author/query'
import AuthorRow from 'shared/components/author-page/author-list-row'

function ListAuthors({ userPermission }) {
  const history = useHistory()
  const { categoryType } = useParams()
  const params = useRef(parseParams(location.search))
  const { dispatch } = useContext(ToastrContext)
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const [categoryList, setCategoryList] = useState([])
  const [selectedCategory, setSelectedCategory] = useState([])
  const totalRecord = useRef(0)
  const tabs = useRef([
    { name: 'Active', internalName: 'active', active: requestParams?.eStatus === 'a' },
    { name: 'inactive', internalName: 'inActive', active: requestParams?.eStatus === 'i' }
  ])
  const columns = useRef(getActionColumns())
  const bulkActionDropDown = [
    { label: 'Delete All', value: 'd', isAllowedTo: 'UPDATE_AUTHOR_STATUS' },
    { label: 'Active  All', value: 'a', isAllowedTo: 'UPDATE_AUTHOR_STATUS' },
    { label: 'Deactivate All', value: 'i', isAllowedTo: 'UPDATE_AUTHOR_STATUS' }
  ]
  const bulkActionPermission = bulkActionDropDown.map((e) => e.isAllowedTo)

  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteAllItem' }),
    deleteConfirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteThisItem' })
  }

  const { loading, refetch } = useQuery(LIST_AUTHORS_PAGE, {
    variables: { input: requestParams },
    onCompleted: (data) => {
      handleApiResponse(data)
    }
  })

  const [bulkAction, { loading: bulkLoading }] = useMutation(AUTHOR_BULK_OPERATION, {
    onCompleted: (data) => {
      if (data && data.bulkAuthorUpdate) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.bulkAuthorUpdate.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })
  const [updateAuthorStatus, { loading: statusLoading }] = useMutation(UPDATE_AUTHOR_STATUS)

  useEffect(() => {
    return history.listen((e) => {
      params.current = parseParams(e.search)
      changeTab(getActiveTabName(e.search))
      setRequestParams(getRequestParams(e.search))
    })
  }, [history])

  function handleApiResponse(data) {
    if (data && data?.listAuthors?.aResults) {
      setSelectedCategory(
        data.listAuthors?.aResults.map((item) => {
          return {
            _id: item._id,
            value: false
          }
        })
      )
      totalRecord.current = data.listAuthors.nTotal
      setCategoryList(data.listAuthors?.aResults)
    }
  }

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    return {
      eHeaderCategoryType: categoryType,
      eAuthorType: categoryType === 'b' ? 'a' : 's',
      eStatus: data.eStatus || 'a',
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 10,
      sSortBy: data.sSortBy || 'dCreated',
      nOrder: Number(data.nOrder) || -1,
      sSearch: data.sSearch || ''
    }
  }

  function handleBtnEvent(eventName) {
    switch (eventName) {
      case 'newAuthor':
        history.push(allRoutes.authorsCreate(categoryType))
        break
      default:
        break
    }
  }

  function getActionColumns() {
    const data = params.current
    const clm = [
      { name: <FormattedMessage id="name" />, internalName: 'sName', type: 0 },
      { name: 'Email', internalName: 'sEmail' }
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
      const nextList = categoryList.filter((item) => !aIds.includes(item._id))
      totalRecord.current = Math.max(totalRecord.current - aIds.length, 0)

      if (!nextList.length && totalRecord.current > 0) {
        setSelectedCategory([])
        handleMultipleDelete()
        return
      }

      setCategoryList(nextList)
      setSelectedCategory(selectedCategory.filter((item) => !aIds.includes(item._id)).map((item) => ({ ...item, value: false })))
      return
    }

    if (['a', 'i'].includes(eType) && requestParams?.eStatus !== eType) {
      const nextList = categoryList.filter((item) => !aIds.includes(item._id))
      totalRecord.current = Math.max(totalRecord.current - aIds.length, 0)

      if (!nextList.length && totalRecord.current > 0) {
        handleMultipleDelete()
      } else {
        setCategoryList(nextList)
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

  async function handleHeaderEvent(name, value) {
    switch (name) {
      case 'bulkAction': {
        const category = selectedCategory.map((a) => ({ ...a }))
        const obj = {
          bulkIds: category.filter((item) => item.value && delete item.value),
          eStatus: value
        }
        const selectedIds = obj.bulkIds.map((id) => {
          return id._id
        })

        if (obj.eStatus === 'd') {
          const message = await deleteAuthors(selectedIds)
          if (message) {
            dispatch({
              type: 'SHOW_TOAST',
              payload: { message, type: TOAST_TYPE.Success, btnTxt: labels.close }
            })
            handleBulkResponse(selectedIds, value)
          }
        } else if (['a', 'i'].includes(obj.eStatus)) {
          const { data } = await bulkAction({
            variables: {
              input: {
                aId: selectedIds,
                eStatus: obj.eStatus
              }
            }
          })
          if (data?.bulkAuthorUpdate) {
            handleBulkResponse(
              category.filter((item) => item.value === undefined && item).map((e) => e._id),
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

  async function deleteAuthors(ids = []) {
    if (!ids.length) return ''

    try {
      const responses = await Promise.all(
        ids.map((_id) => updateAuthorStatus({
          variables: {
            input: {
              _id,
              eStatus: 'd'
            }
          }
        }))
      )
      const successResponse = responses.find((response) => response?.data?.updateAuthorStatus)

      return successResponse?.data?.updateAuthorStatus?.sMessage || 'Author deleted successfully.'
    } catch (error) {
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: error?.message || 'Unable to delete author.', type: TOAST_TYPE.Error, btnTxt: labels.close }
      })
    }

    return ''
  }

  function handleDelete(id) {
    confirmAlert({
      title: labels.confirmationTitle,
      message: labels.deleteConfirmationMessage,
      customUI: CustomAlert,
      buttons: [
        {
          label: labels.yes,
          onClick: async () => {
            const message = await deleteAuthors([id])

            if (message) {
              dispatch({
                type: 'SHOW_TOAST',
                payload: { message, type: TOAST_TYPE.Success, btnTxt: labels.close }
              })
              handleBulkResponse([id], 'd')
            }
          }
        },
        {
          label: labels.no
        }
      ]
    })
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
    const { data } = await bulkAction({ variables: { input: { aId: [target.name], eStatus: target.checked ? 'a' : 'i' } } })
    if (data?.bulkAuthorUpdate) handleBulkResponse([target.name], target.checked ? 'a' : 'i')
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
    const remainingLastPage = Math.max(Math.ceil(totalRecord.current / requestParams?.nLimit), 1)

    if (requestParams.nSkip > remainingLastPage) {
      handlePageEvent(remainingLastPage)
      return
    }

    const { data } = await refetch()
    handleApiResponse(data)
  }

  return (
    <>
      <TopBar
        buttons={[
          {
            text: 'Create Author',
            icon: 'icon-add',
            type: 'primary',
            clickEventName: 'newAuthor',
            isAllowedTo: ['CREATE_BLOG_AUTHOR']
          }
        ]}
        btnEvent={handleBtnEvent}
      />
      <DataTable
        className="category-list"
        columns={columns.current}
        bulkAction={bulkActionDropDown}
        sortEvent={handleSort}
        totalRecord={totalRecord.current}
        isLoading={loading || bulkLoading || statusLoading}
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
        // tabs={tabs.current}
        tabEvent={handleTabChange}
        checkbox={!!userPermission.filter((p) => bulkActionPermission.includes(p)).length}
        actionColumn
      >
        {categoryList.map((tag, index) => {
          return (
            <AuthorRow
              key={tag?._id}
              index={index}
              data={tag}
              selected={selectedCategory}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onSelect={handleCheckbox}
              bulkPermission={bulkActionPermission}
              // actionPermission={actionPermission.current}
            />
          )
        })}
      </DataTable>
    </>
  )
}
ListAuthors.propTypes = {
  userPermission: PropTypes.array
}
export default ListAuthors
