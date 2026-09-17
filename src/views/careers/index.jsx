import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { useHistory } from 'react-router'
import { confirmAlert } from 'react-confirm-alert'
import { FormattedMessage, useIntl } from 'react-intl'

import CareerFilter from 'shared/components/career-filter'
import CareerRow from 'shared/components/career-row'
import CustomAlert from 'shared/components/alert'
import DataTable from 'shared/components/data-table'
import Drawer from 'shared/components/drawer'
import TopBar from 'shared/components/top-bar'
import { allRoutes } from 'shared/constants/AllRoutes'
import { TOAST_TYPE } from 'shared/constants'
import { appendParams, parseParams, setSortType, toBackendPagination } from 'shared/utils'
import { LIST_CAREER_OPENINGS, LIST_LOCATIONS } from 'graph-ql/career/query'
import { UPDATE_CAREER_OPENING_STATUS } from 'graph-ql/career/mutation'
import { ToastrContext } from 'shared/components/toastr'
import { CAREER_LOCATION_LIST_LIMIT, getCareerLocationOptions } from 'shared/utils/career-location'

function getNullableNumber(value) {
  if (value === '' || value === null || value === undefined) return null
  return Number(value)
}

function getCareerListInput(input = {}) {
  const { nSkip, nLimit } = toBackendPagination(input.nSkip, Number(input.nLimit) || 10)

  return {
    nSkip,
    nLimit,
    iLocationId: input.iLocationId || null,
    nOrder: Number(input.nOrder) || null,
    sSearch: input.sSearch || null,
    nExperienceFilterMin: getNullableNumber(input.nExperienceFilterMin),
    nExperienceFilterMax: getNullableNumber(input.nExperienceFilterMax),
    eStatus: input.eStatus === 'all' ? null : input.eStatus || 'a'
  }
}

function Careers() {
  const history = useHistory()
  const params = useRef(parseParams(location.search))
  const { dispatch } = useContext(ToastrContext)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const [careerList, setCareerList] = useState([])
  const [locations, setLocations] = useState([])
  const [selectedCareer, setSelectedCareer] = useState([])
  const totalRecord = useRef(0)
  const columns = useRef(getActionColumns())
  const locationOptions = useMemo(() => getCareerLocationOptions(locations, { includeInactive: true, includeDeleted: true }), [locations])
  const activeLocationOptions = useMemo(() => getCareerLocationOptions(locations), [locations])
  const tabs = useRef([
    { name: 'All', internalName: 'all', active: requestParams?.eStatus === 'all' },
    { name: 'Active', internalName: 'active', active: requestParams?.eStatus === 'a' },
    { name: 'inactive', internalName: 'inActive', active: requestParams?.eStatus === 'i' },
    { name: 'Trash', internalName: 'trash', active: requestParams?.eStatus === 'd' }
  ])

  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteAllItem' })
  }

  const bulkActionDropDown = [
    { label: 'Delete All', value: 'd' },
    { label: 'Active All', value: 'a' },
    { label: 'Deactivate All', value: 'i' }
  ]

  const { loading, refetch } = useQuery(LIST_CAREER_OPENINGS, {
    variables: { input: getCareerListInput(requestParams) },
    onCompleted: (data) => {
      handleApiResponse(data)
    }
  })

  useQuery(LIST_LOCATIONS, {
    variables: { input: toBackendPagination(1, CAREER_LOCATION_LIST_LIMIT) },
    onCompleted: (data) => {
      setLocations(data?.listLocations?.aResults || [])
    }
  })

  const [updateStatus, { loading: statusLoading }] = useMutation(UPDATE_CAREER_OPENING_STATUS)

  useEffect(() => {
    return history.listen((e) => {
      params.current = parseParams(e.search)
      changeTab(getActiveTabName(e.search))
      setRequestParams(getRequestParams(e.search))
    })
  }, [history])

  function handleApiResponse(data) {
    if (data?.listCareerOpenings?.aResults) {
      setSelectedCareer(
        data.listCareerOpenings.aResults.map((item) => {
          return {
            _id: item._id,
            value: false
          }
        })
      )
      totalRecord.current = data.listCareerOpenings.nTotal
      setCareerList(data.listCareerOpenings.aResults)
    }
  }

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    return {
      eStatus: data?.eStatus || 'a',
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 10,
      nOrder: Number(data.nOrder) || -1,
      sSearch: data.sSearch || '',
      iLocationId: data.iLocationId || null,
      nExperienceFilterMin: data.nExperienceFilterMin || '',
      nExperienceFilterMax: data.nExperienceFilterMax || ''
    }
  }

  function getActionColumns() {
    const data = params.current
    const clm = [
      { name: 'Title', internalName: 'sTitle' },
      { name: 'Location', internalName: 'iLocationId' },
      { name: 'Experience', internalName: 'nExperienceYears' },
      { name: 'Created Date', internalName: 'dCreated', type: Number(data.nOrder) || -1 },
      { name: 'Submitted By', internalName: 'iSubmittedBy.sFName' }
    ]
    return clm.map((column) => {
      if (column.internalName === 'dCreated') return { ...column, type: Number(data.nOrder) || -1 }
      return column
    })
  }

  function handleBtnEvent(eventName) {
    switch (eventName) {
      case 'newCareer':
        history.push(allRoutes.addCareer)
        break
      case 'careerLocations':
        history.push(allRoutes.careerLocations)
        break
      default:
        break
    }
  }

  function changeTab(name) {
    tabs.current = tabs.current.map((item) => ({ ...item, active: item.internalName === name }))
  }

  function getActiveTabName(e) {
    const data = e ? parseParams(e) : params.current
    if (data?.eStatus === 'all') return 'all'
    if (data?.eStatus === 'i') return 'inActive'
    if (data?.eStatus === 'd') return 'trash'
    return 'active'
  }

  function handleTabChange(name) {
    changeTab(name)
    const statusByTab = {
      all: 'all',
      active: 'a',
      inActive: 'i',
      trash: 'd'
    }
    const eStatus = statusByTab[name] || 'a'
    setRequestParams({ ...requestParams, eStatus, nSkip: 1 })
    appendParams({ eStatus, nSkip: 1 })
  }

  function handleSort(field) {
    columns.current = setSortType(columns.current, field.internalName)
    const nOrder = field.type === 0 ? -1 : field.type
    setRequestParams({ ...requestParams, nOrder })
    appendParams({ nOrder })
  }

  function handlePageEvent(page) {
    setRequestParams({ ...requestParams, nSkip: page })
    appendParams({ nSkip: page })
  }

  function handleCheckbox({ target }) {
    if (target.name === 'selectAll') {
      setSelectedCareer(
        selectedCareer.map((item) => {
          item.value = target.checked
          return item
        })
      )
    } else if (target.checked) {
      setSelectedCareer(
        selectedCareer.map((item) => {
          if (item._id === target.name) item.value = true
          return item
        })
      )
    } else {
      setSelectedCareer(
        selectedCareer.map((item) => {
          if (item._id === target.name) item.value = false
          return item
        })
      )
    }
  }

  async function refetchAfterMutation(affectedCount = 1) {
    if (careerList.length <= affectedCount && requestParams.nSkip > 1) {
      handlePageEvent(requestParams.nSkip - 1)
      return
    }

    const { data } = await refetch()
    handleApiResponse(data)
  }

  async function updateCareerStatus(ids, eStatus) {
    const results = await Promise.all(
      ids.map((_id) => updateStatus({
        variables: {
          input: {
            _id,
            eStatus
          }
        }
      }))
    )
    const message = results.find((result) => result?.data?.updateCareerOpeningStatus)?.data?.updateCareerOpeningStatus?.sMessage

    if (message) {
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message, type: TOAST_TYPE.Success, btnTxt: labels.close }
      })
      await refetchAfterMutation(ids.length)
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
          onClick: () => updateCareerStatus([id], 'd')
        },
        {
          label: labels.no
        }
      ]
    })
  }

  async function handleStatusChange({ target }) {
    await updateCareerStatus([target.name], target.checked ? 'a' : 'i')
  }

  async function handleHeaderEvent(name, value) {
    switch (name) {
      case 'bulkAction': {
        const ids = selectedCareer.filter((item) => item.value).map((item) => item._id)
        await updateCareerStatus(ids, value)
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
        setIsFilterOpen(true)
        break
      default:
        break
    }
  }

  function handleFilterChange(e) {
    setRequestParams({
      ...requestParams,
      nSkip: 1,
      iLocationId: e.data.iLocationId,
      nExperienceFilterMin: e.data.nExperienceFilterMin,
      nExperienceFilterMax: e.data.nExperienceFilterMax
    })
    appendParams({
      nSkip: 1,
      iLocationId: e.data.iLocationId,
      nExperienceFilterMin: e.data.nExperienceFilterMin,
      nExperienceFilterMax: e.data.nExperienceFilterMax
    })
    setIsFilterOpen(false)
  }

  return (
    <>
      <TopBar
        buttons={[
          { text: 'Locations', icon: 'icon-language', type: 'outline-secondary', clickEventName: 'careerLocations' },
          { text: 'New Career', icon: 'icon-add', type: 'primary', clickEventName: 'newCareer' }
        ]}
        btnEvent={handleBtnEvent}
      />
      <DataTable
        className="category-list"
        columns={columns.current}
        bulkAction={bulkActionDropDown}
        sortEvent={handleSort}
        totalRecord={totalRecord.current}
        isLoading={loading || statusLoading}
        header={{
          left: {
            bulkAction: true,
            rows: true
          },
          right: {
            search: true,
            filter: true
          }
        }}
        headerEvent={(name, value) => handleHeaderEvent(name, value)}
        selectAllEvent={handleCheckbox}
        pageChangeEvent={handlePageEvent}
        pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
        selectAllValue={selectedCareer}
        tabs={tabs.current}
        tabEvent={handleTabChange}
        checkbox
        actionColumn
      >
        {careerList.map((career, index) => (
          <CareerRow
            key={career?._id}
            index={index}
            data={career}
            selected={selectedCareer}
            locationOptions={locationOptions}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onSelect={handleCheckbox}
          />
        ))}
      </DataTable>
      <Drawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title={<FormattedMessage id="filter" />}>
        <CareerFilter filterChange={handleFilterChange} defaultValue={requestParams} locationOptions={activeLocationOptions} />
      </Drawer>
    </>
  )
}

export default Careers
