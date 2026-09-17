import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useHistory } from 'react-router'
import { useQuery } from '@apollo/client'
import { FormattedMessage } from 'react-intl'

import DataTable from 'shared/components/data-table'
import { setSortType, parseParams, appendParams } from 'shared/utils'
import PageComponentsRow from 'shared/components/page-components/row'
import { GET_COMPONENTS_LIST } from 'graph-ql/page-components/query'

function ComponentsList({ userPermission }) {
  const history = useHistory()
  const params = useRef(parseParams(location.search))
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const [categoryList, setCategoryList] = useState([])
  const totalRecord = useRef(0)

  const columns = useRef(getActionColumns())

  const { loading } = useQuery(GET_COMPONENTS_LIST, {
    variables: { input: requestParams },
    onCompleted: (data) => {
      handleApiResponse(data)
    }
  })

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

  function handleApiResponse(data) {
    if (data && data?.listComponents.aResults) {
      totalRecord.current = data.listComponents.nTotal
      setCategoryList(data.listComponents.aResults)
    }
  }

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    return {
      eComponentType: 'pw',
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 20,
      sSortBy: data.sSortBy || '_id',
      nOrder: Number(data.nOrder) || -1,
      sSearch: data.sSearch || ''
    }
  }

  function getActionColumns() {
    const data = params.current
    const clm = [{ name: <FormattedMessage id="name" />, internalName: 'sName' }]
    return clm.map((e) => {
      if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder ? Number(data.nOrder) : -1 }
      return e
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

  return (
    <>
      <DataTable
        className="category-list"
        columns={columns.current}
        sortEvent={handleSort}
        totalRecord={totalRecord.current}
        isLoading={loading}
        header={{
          left: {
            bulkAction: false,
            rows: true
          },
          right: {
            search: true
          }
        }}
        headerEvent={(name, value) => handleHeaderEvent(name, value)}
        pageChangeEvent={handlePageEvent}
        pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
        actionColumn
      >
        <tr>
          <td colSpan={2}>
            <div className="g-3 row">
              {categoryList.map((category) => {
                return <PageComponentsRow key={category._id} data={category} />
              })}
            </div>
          </td>
        </tr>
      </DataTable>
    </>
  )
}
ComponentsList.propTypes = {
  userPermission: PropTypes.array
}
export default ComponentsList
