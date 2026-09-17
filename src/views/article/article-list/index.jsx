import React, { useState, useEffect, useRef, useContext } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/client'
import { Accordion } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import moment from 'moment'
import PropTypes from 'prop-types'

import TopBar from 'shared/components/top-bar'
import DataTable from 'shared/components/data-table'
import { allRoutes } from 'shared/constants/AllRoutes'
import { parseParams, appendParams, setSortType } from 'shared/utils'
import ArticleItemRowAll from 'shared/components/article-item-row/article-item-row-all'
import Drawer from 'shared/components/drawer'
import ArticleFilter from 'shared/components/article-filters'
import { LIST_ARTICLE, COUNT_ARTICLES } from 'graph-ql/article/query'
import { BULK_DELETE_ARTICLE } from 'graph-ql/article/mutation'
import { HEADER_CATEGORY_SLUG_ADMIN, TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'

function ArticleLIst({ userPermission }) {
  const history = useHistory()
  const { categoryType } = useParams()
  const params = useRef(parseParams(location.search))
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const { dispatch } = useContext(ToastrContext)
  const [articleList, setArticleList] = useState([])
  const [selectedArticle, setSelectedArticle] = useState([])
  const totalRecord = useRef(0)
  const articleCount = useRef()
  const columns = useRef(getActionColumns())
  const [bulkDropDown, setBulkDropDown] = useState([{ label: 'Trash All', value: 't' }])

  const oUpdateArticleStatusPermissions = {
    b: 'UPDATE_BLOG_STATUS',
    w: 'UPDATE_WEBINAR_STATUS',
    p: 'UPDATE_PODCAST_STATUS',
    wp: 'UPDATE_WHITEPAPER_STATUS',
    rr: userPermission?.includes('UPDATE_RESEARCH_REPORT_STATUS') ? 'UPDATE_RESEARCH_REPORT_STATUS' : 'UPDATE_WHITEPAPER_STATUS',
    vl: userPermission?.includes('UPDATE_VIDEO_LISTING_STATUS') ? 'UPDATE_VIDEO_LISTING_STATUS' : 'UPDATE_WEBINAR_STATUS',
    cs: 'UPDATE_CASE_STUDY_STATUS',
    cu: 'UPDATE_NEWS_EVENTS_STATUS',
    ne: 'UPDATE_NEWS_EVENTS_STATUS'
  }

  const tempBulkActionDropDown = [
    { label: 'Delete All', value: 'd', isAllowedTo: oUpdateArticleStatusPermissions[categoryType] },
    { label: 'Trash All', value: 't', isAllowedTo: oUpdateArticleStatusPermissions[categoryType] }
  ]
  const allStateDropDown = [{ label: 'Trash All', value: 't', isAllowedTo: oUpdateArticleStatusPermissions[categoryType] }]

  const trashStateDropDown = [{ label: 'Delete All', value: 'd', isAllowedTo: oUpdateArticleStatusPermissions[categoryType] }]

  const bulkActionPermission = tempBulkActionDropDown.map((e) => e.isAllowedTo)
  const currentTab = requestParams.aState?.toString()
  const [tabs, setTabs] = useState([
    { name: `${useIntl().formatMessage({ id: 'Mine' })}`, internalName: 'mine', active: currentTab === 'mine' },
    { name: `${useIntl().formatMessage({ id: 'all' })}`, internalName: 'all', active: currentTab === 'all' },
    { name: `${useIntl().formatMessage({ id: 'published' })}`, internalName: 'published', active: currentTab === 'pub' },
    { name: `${useIntl().formatMessage({ id: 'pending' })}`, internalName: 'pending', active: currentTab === 'p' },
    // { name: `${useIntl().formatMessage({ id: 'scheduled' })}`, internalName: 'scheduled', active: false },
    { name: `${useIntl().formatMessage({ id: 'changes' })}`, internalName: 'changes', active: currentTab === 'cr,cs' },
    // { name: `${useIntl().formatMessage({ id: 'draft' })}`, internalName: 'draft', active: currentTab === 'd' },
    // { name: `${useIntl().formatMessage({ id: 'rejected' })}`, internalName: 'rejected', active: currentTab === 'r' },
    { name: `${useIntl().formatMessage({ id: 'trash' })}`, internalName: 'trash', active: currentTab === 't' }
  ])

  function handleApiResponse(data) {
    if (data && data?.listArticle?.aResults) {
      setSelectedArticle(
        data?.listArticle?.aResults.map((item) => {
          return {
            _id: item._id,
            value: false
          }
        })
      )
      totalRecord.current = data?.listArticle?.nTotal
      setArticleList(data?.listArticle?.aResults)
    }
  }

  async function handleMultipleDelete() {
    if (articleList?.length === 0) {
      const lastPage = Math.ceil(totalRecord / requestParams?.nLimit)
      handlePageEvent(lastPage - 1)
    } else {
      const { data } = await refetch()
      handleApiResponse(data)
    }
  }

  function handleBulkResponse(aIds, eType) {
    if (eType === 'd') {
      if (requestParams?.nLimit / 2 >= articleList?.length || requestParams?.nLimit / 2 <= aIds?.length) {
        handleMultipleDelete()
      } else {
        setArticleList(articleList.filter((item) => !aIds.includes(item._id)))
      }
    }
    if (eType === 't') {
      if (requestParams?.nLimit / 2 >= articleList?.length || requestParams?.nLimit / 2 <= aIds?.length) {
        handleMultipleDelete()
      } else {
        setArticleList(articleList.filter((item) => !aIds.includes(item._id)))
      }
    }
    setSelectedArticle(
      selectedArticle.map((item) => {
        return {
          ...item,
          value: false
        }
      })
    )
  }

  const { loading, refetch: listRefetch } = useQuery(LIST_ARTICLE, {
    variables: { input: requestParams },
    onCompleted: (data) => {
      if (data && data?.listArticle.aResults) {
        handleApiResponse(data)
      }
    }
  })

  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteAllItem' })
  }

  const [bulkAction, { loading: bulkLoading }] = useMutation(BULK_DELETE_ARTICLE, {
    onCompleted: (data) => {
      if (data && data.bulkArticleDelete) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.bulkArticleDelete?.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
        listRefetch()
        refetch()
      }
    }
  })

  const { refetch } = useQuery(COUNT_ARTICLES, {
    variables: { input: { eType: categoryType } },
    onCompleted: (data) => {
      if (data && data?.getArticleCounts) {
        articleCount.current = data?.getArticleCounts
        setTabs(
          tabs.map((e) => {
            if (e.internalName === 'all') {
              return { ...e, count: data?.getArticleCounts.nAll > 0 ? data?.getArticleCounts.nAll : '0' }
            } else if (e.internalName === 'pending') {
              return { ...e, count: data?.getArticleCounts.nPending > 0 ? data?.getArticleCounts.nPending : '0' }
            } else if (e.internalName === 'scheduled') {
              return { ...e, count: data?.getArticleCounts.nScheduled > 0 ? data?.getArticleCounts.nScheduled : '0' }
            } else if (e.internalName === 'changes') {
              return {
                ...e,
                count: (data?.getArticleCounts.nChangeSubmitted + data?.getArticleCounts.nChangeRequested).toString()
              }
            } else if (e.internalName === 'draft') {
              return { ...e, count: data?.getArticleCounts.nDraft > 0 ? data?.getArticleCounts.nDraft : '0' }
            } else if (e.internalName === 'published') {
              return { ...e, count: data?.getArticleCounts.nPublished > 0 ? data?.getArticleCounts.nPublished : '0' }
            } else if (e.internalName === 'rejected') {
              return { ...e, count: data?.getArticleCounts.nRejected > 0 ? data?.getArticleCounts.nRejected : '0' }
            } else if (e.internalName === 'mine') {
              return { ...e, count: data?.getArticleCounts.nMine > 0 ? data?.getArticleCounts.nMine : '0' }
            } else {
              return { ...e, count: data?.getArticleCounts.nTrash > 0 ? data?.getArticleCounts.nTrash : '0' }
            }
          })
        )
      }
    }
  })

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    const publishedDateFilter = data.aPublishDate ? data.aPublishDate.split('-') : []
    if (publishedDateFilter?.length) {
      publishedDateFilter.push(moment(publishedDateFilter[0]).set({ hour: 0, minute: 0 }).format())
      publishedDateFilter.push(moment(publishedDateFilter[1]).set({ hour: 23, minute: 59 }).format())
    }
    return {
      eHeaderCategoryType: categoryType,
      aState: data?.aState || ['mine'],
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 10,
      sSortBy: data.sSortBy || 'dCreated',
      nOrder: Number(data.nOrder) || -1,
      sSearch: data.sSearch || '',
      aPublishDate: publishedDateFilter,
      aCategoryFilters: data.aCategoryFilters || [],
      aAuthorsFilters: data.aAuthorsFilters || [],
      aWriterFilters: data.aWriterFilters || []
    }
  }

  function handleBtnEvent(eventName) {
    switch (eventName) {
      case 'newArticle':
        history.push(allRoutes.addPost(categoryType, HEADER_CATEGORY_SLUG_ADMIN[categoryType]))
        break
      default:
        break
    }
  }

  async function handleHeaderEvent(name, value) {
    switch (name) {
      case 'bulkAction': {
        const category = selectedArticle.map((a) => ({ ...a }))
        const obj = {
          bulkIds: category.filter((item) => item.value && delete item.value),
          eStatus: value,
          eHeaderCategoryType: categoryType
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
          if (data?.bulkServiceUpdate) {
            handleBulkResponse(
              category.filter((item) => item.value === undefined && item).map((e) => e._id),
              value
            )
          }
        }
        if (obj.eStatus === 't') {
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
          if (data?.bulkServiceUpdate) {
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
      case 'filter':
        setIsFilterOpen(value)
        break
      default:
        break
    }
  }

  function getActionColumns() {
    const data = params.current
    const clm = [
      { name: <FormattedMessage id="title" />, internalName: 'sTitle', type: 0 },
      { name: 'Creator', internalName: 'author' },
      { name: 'Content Writer', internalName: 'keyword' },
      { name: <FormattedMessage id="categories" />, internalName: 'categories', type: 0 }
    ]
    return clm.map((e) => {
      if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder === 1 ? -1 : 1 }
      return e
    })
  }

  function handleTabChange(name) {
    if (name === 'all') {
      setRequestParams({ ...requestParams, aState: ['all'], nSkip: 1 })
      appendParams({ aState: 'all', nSkip: 1 })
      setBulkDropDown(allStateDropDown)
    } else if (name === 'pending') {
      setRequestParams({ ...requestParams, aState: ['p'], nSkip: 1 })
      appendParams({ aState: 'p', nSkip: 1 })
      setBulkDropDown(allStateDropDown)
    } else if (name === 'scheduled') {
      setRequestParams({ ...requestParams, aState: ['s'], nSkip: 1 })
      appendParams({ aState: 's', nSkip: 1 })
      setBulkDropDown(allStateDropDown)
    } else if (name === 'changes') {
      setRequestParams({ ...requestParams, aState: ['cr', 'cs'], nSkip: 1 })
      appendParams({ aState: ['cr', 'cs'], nSkip: 1 })
      setBulkDropDown(allStateDropDown)
    } else if (name === 'draft') {
      setRequestParams({ ...requestParams, aState: ['d'], nSkip: 1 })
      appendParams({ aState: 'd', nSkip: 1 })
      setBulkDropDown(allStateDropDown)
    } else if (name === 'published') {
      setRequestParams({ ...requestParams, aState: ['pub'], nSkip: 1 })
      appendParams({ aState: 'pub', nSkip: 1 })
      setBulkDropDown(allStateDropDown)
    } else if (name === 'rejected') {
      setRequestParams({ ...requestParams, aState: ['r'], nSkip: 1 })
      appendParams({ aState: 'r', nSkip: 1 })
      setBulkDropDown(allStateDropDown)
    } else if (name === 'trash') {
      setRequestParams({ ...requestParams, aState: ['t'], nSkip: 1 })
      appendParams({ aState: 't', nSkip: 1 })
      setBulkDropDown(trashStateDropDown)
    } else if (name === 'mine') {
      setRequestParams({ ...requestParams, aState: ['mine'], nSkip: 1 })
      appendParams({ aState: 'mine', nSkip: 1 })
      setBulkDropDown(allStateDropDown)
    }
    refetch()
    changeTab(name)
  }

  function changeTab(name) {
    setTabs(
      tabs.map((e) => {
        return { ...e, active: e.internalName === name }
      })
    )
  }

  function getActiveTabName(e) {
    const data = e ? parseParams(e) : params.current
    if (data?.aState?.length) {
      if (data.aState.toString() === 'all') {
        return 'all'
      } else if (data.aState.toString() === 'p') {
        return 'pending'
      } else if (data.aState.toString() === 's') {
        return 'scheduled'
      } else if (data.aState.toString() === 'd') {
        return 'draft'
      } else if (data.aState.toString() === 'cr,cs') {
        return 'changes'
      } else if (data.aState.toString() === 'pub') {
        return 'published'
      } else if (data.aState.toString() === 'r') {
        return 'rejected'
      } else if (data.aState.toString() === 't') {
        return 'trash'
      } else if (data.aState.toString() === 'mine') {
        return 'mine'
      }
    }
  }

  function handleSort(field) {
    if (field.internalName === 'sTitle') {
      const data = setSortType(columns.current, field.internalName)
      columns.current = data
      setRequestParams({ ...requestParams, sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
      appendParams({ sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
    }
  }

  function handleFilterChange(e) {
    let startDate, endDate
    if (e.data.aPublishDate) {
      const publishDate = e?.data?.aPublishDate?.split('-')
      // startDate = new Date(publishDate[0])
      startDate = moment(publishDate[0]).set({ hour: 0, minute: 0 }).format()
      // endDate = new Date(publishDate[1])
      endDate = moment(publishDate[1]).set({ hour: 23, minute: 59 }).format()
    }
    setRequestParams({
      ...requestParams,
      nSkip: 1,
      aWriterFilters: e.data.aWriterFilters,
      aCategoryFilters: e.data.aCategoryFilters,
      aPublishDate: e.data.aPublishDate ? [startDate, endDate] : [],
      aAuthorsFilters: e.data.aAuthorsFilters
    })
    appendParams({
      nSkip: 1,
      aWriterFilters: e.data.aWriterFilters,
      aCategoryFilters: e.data.aCategoryFilters,
      aPublishDate: e.data.aPublishDate,
      aAuthorsFilters: e.data.aAuthorsFilters
    })
    setIsFilterOpen(!isFilterOpen)
  }

  function handlePageEvent(page) {
    setRequestParams({ ...requestParams, nSkip: page })
    appendParams({ nSkip: page })
  }

  function handleCheckbox({ target }) {
    if (target.name === 'selectAll') {
      setSelectedArticle(
        selectedArticle.map((item) => {
          item.value = target.checked
          return item
        })
      )
    } else {
      if (target.checked) {
        setSelectedArticle(
          selectedArticle.map((item) => {
            if (item._id === target.name) item.value = true
            return item
          })
        )
      } else {
        setSelectedArticle(
          selectedArticle.map((item) => {
            if (item._id === target.name) item.value = false
            return item
          })
        )
      }
    }
  }

  function handleStatusChange(id) {
    setArticleList(articleList.filter((a) => a._id !== id))
    refetch()
  }

  useEffect(() => {
    return history.listen((e) => {
      params.current = parseParams(e.search)
      setRequestParams(getRequestParams(e.search))
      changeTab(getActiveTabName(e.search))
    })
  }, [history])

  return (
    <>
      <TopBar
        buttons={[
          {
            text: 'Create',
            icon: 'icon-add',
            type: 'primary',
            clickEventName: 'newArticle',
            isAllowedTo: [
              'CREATE_BLOG',
              'CREATE_WEBINAR',
              'CREATE_PODCAST',
              'CREATE_WHITEPAPER',
              'CREATE_RESEARCH_REPORT',
              'CREATE_VIDEO_LISTING',
              'CREATE_CASE_STUDY',
              'CREATE_NEWS_EVENTS'
            ]
          }
        ]}
        btnEvent={handleBtnEvent}
      />
      <Accordion>
        <DataTable
          className="category-list"
          columns={columns.current}
          sortEvent={handleSort}
          totalRecord={totalRecord.current}
          isLoading={loading || bulkLoading}
          header={{
            left: {
              bulkAction: !!userPermission.filter((p) => bulkActionPermission.includes(p)).length,
              rows: true
            },
            right: { search: true }
          }}
          headerEvent={(name, value) => handleHeaderEvent(name, value)}
          pageChangeEvent={handlePageEvent}
          pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
          tabs={tabs}
          tabEvent={handleTabChange}
          checkbox={!!userPermission.filter((p) => bulkActionPermission.includes(p)).length}
          bulkAction={bulkDropDown}
          selectAllEvent={handleCheckbox}
          selectAllValue={selectedArticle}
        >
          {articleList?.map((article, index) => {
            return (
              <ArticleItemRowAll
                key={article._id}
                index={index}
                article={article}
                onChange={handleStatusChange}
                selected={selectedArticle}
                onStatusChange={handleStatusChange}
                onSelect={handleCheckbox}
                bulkPermission={bulkActionPermission}
                eStatus={requestParams.eStatus}
              />
            )
          })}
        </DataTable>
      </Accordion>
      <Drawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(!isFilterOpen)} title={useIntl().formatMessage({ id: 'filter' })}>
        <ArticleFilter filterChange={handleFilterChange} defaultValue={requestParams} />
      </Drawer>
    </>
  )
}

ArticleLIst.propTypes = {
  userPermission: PropTypes.array
}

export default ArticleLIst
