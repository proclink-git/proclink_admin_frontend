import React, { useEffect, useRef, useState } from 'react'
import { useQuery } from '@apollo/client'
import { useHistory } from 'react-router'

import DataTable from 'shared/components/data-table'
import TopBar from 'shared/components/top-bar'
import { appendParams, parseParams } from 'shared/utils'
import { allRoutes } from 'shared/constants/AllRoutes'
import { GET_PAGES_LIST } from 'graph-ql/pages/query'
import PageRow from 'shared/components/page-row'

function ListPage() {
  const history = useHistory()
  const params = useRef(parseParams(location.search))
  const [requestParams, setRequestParams] = useState(getRequestParams())
  // const { dispatch } = useContext(ToastrContext)
  const totalData = useRef(null)
  const [listTestimonialList, setTestimonialList] = useState([])
  const columns = useRef(getActionColumns())

  const { loading } = useQuery(GET_PAGES_LIST, {
    variables: { input: requestParams },
    onCompleted: (data) => {
      totalData.current = data?.listPage?.nTotal
      setTestimonialList(data?.listPage?.aResults)
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
        isLoading={loading}
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
          return <PageRow key={testimonial._id} data={testimonial} />
        })}
      </DataTable>
    </>
  )
}

export default ListPage
