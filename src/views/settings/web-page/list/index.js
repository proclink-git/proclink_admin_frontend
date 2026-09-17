import React, { useContext, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { useHistory } from 'react-router'
import { useIntl } from 'react-intl'
import { confirmAlert } from 'react-confirm-alert'

import DataTable from 'shared/components/data-table'
import TopBar from 'shared/components/top-bar'
import CustomAlert from 'shared/components/alert'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import { appendParams, parseParams } from 'shared/utils'
import { allRoutes } from 'shared/constants/AllRoutes'
import { GET_PAGES_LIST } from 'graph-ql/pages/query'
import { DELETE_PAGE } from 'graph-ql/pages/mutation'
import PageRow from 'shared/components/page-row'

function isAlreadyDeletedError(errors) {
  const raw = errors?.[0]?.message || ''
  try {
    const parsed = JSON.parse(raw)
    return /already deleted/i.test(parsed?.message || raw)
  } catch (error) {
    return /already deleted/i.test(raw)
  }
}

function ListPage() {
  const history = useHistory()
  const { dispatch } = useContext(ToastrContext)
  const params = useRef(parseParams(location.search))
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const totalData = useRef(null)
  const [listTestimonialList, setTestimonialList] = useState([])
  const columns = useRef(getActionColumns())
  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteThisPage' })
  }

  const { loading, refetch } = useQuery(GET_PAGES_LIST, {
    variables: { input: requestParams },
    onCompleted: (data) => {
      totalData.current = data?.listPage?.nTotal
      setTestimonialList(data?.listPage?.aResults)
    }
  })

  const [deletePage, { loading: deleteLoading }] = useMutation(DELETE_PAGE, {
    onCompleted: (data) => {
      if (data?.deletePage) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.deletePage.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    return {
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 20,
      sSortBy: data.sSortBy || 'dCreated',
      nOrder: Number(data.nOrder) || -1,
      sSearch: data.sSearch || ''
    }
  }

  function getActionColumns() {
    const data = params.current
    const clm = [
      { name: 'Title', internalName: 'sTitle' },
      { name: 'Slug', internalName: 'oSeo.sSlug' }
    ]
    return clm.map((e) => {
      if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder ? Number(data.nOrder) : -1 }
      return e
    })
  }

  function handleBtnEvent(eventName) {
    switch (eventName) {
      case 'newPage':
        history.push(allRoutes.createPage)
        break
      default:
        break
    }
  }

  async function refreshPageList() {
    const { data } = await refetch()
    if (data?.listPage) {
      totalData.current = data.listPage.nTotal
      setTestimonialList(data.listPage.aResults)
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
            const { data, errors } = await deletePage({ variables: { input: { _id: id } } })
            if (data?.deletePage || isAlreadyDeletedError(errors)) {
              await refreshPageList()
            }
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
      case 'rows':
        setRequestParams({ ...requestParams, nLimit: Number(value), nSkip: 1 })
        appendParams({ nLimit: value, nSkip: 1 })
        break
      case 'search':
        setRequestParams({ ...requestParams, nSkip: 1, sSearch: value })
        appendParams({ sSearch: value, nSkip: 1 })
        break
      default:
        break
    }
  }

  function handlePageEvent(page) {
    setRequestParams({ ...requestParams, nSkip: page })
    appendParams({ nSkip: page })
  }

  useEffect(() => {
    const data = parseParams(location.search)
    if (!data.nLimit) {
      appendParams({ nLimit: 20 })
      params.current = parseParams(location.search)
      setRequestParams(getRequestParams(location.search))
    }
  }, [])

  useEffect(() => {
    return history.listen((e) => {
      params.current = parseParams(e.search)
      setRequestParams(getRequestParams(e.search))
    })
  }, [history])

  return (
    <>
      <TopBar
        buttons={[{ text: 'New Page', icon: 'icon-add', type: 'primary', clickEventName: 'newPage', isAllowedTo: ['CREATE_PAGE', 'EDIT_PAGE'] }]}
        btnEvent={handleBtnEvent}
      />
      <DataTable
        className="category-list"
        columns={columns.current}
        totalRecord={totalData.current}
        headerEvent={handleHeaderEvent}
        isLoading={loading || deleteLoading}
        header={{
          left: {
            rows: true
          },
          right: {
            search: true
          }
        }}
        actionColumn
        pageChangeEvent={handlePageEvent}
        pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
      >
        {listTestimonialList?.map((testimonial) => {
          return <PageRow key={testimonial._id} data={testimonial} onDelete={handleDelete} />
        })}
      </DataTable>
    </>
  )
}

export default ListPage
