import React, { useContext, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useMutation, useQuery } from '@apollo/client'
import { useHistory } from 'react-router'
import { confirmAlert } from 'react-confirm-alert'
import { Button, Form, Spinner } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import Select from 'react-select'
import moment from 'moment'
import { FormattedMessage, useIntl } from 'react-intl'

import CustomAlert from 'shared/components/alert'
import CommonInput from 'shared/components/common-input'
import DataTable from 'shared/components/data-table'
import Drawer from 'shared/components/drawer'
import ToolTip from 'shared/components/tooltip'
import TopBar from 'shared/components/top-bar'
import { TOAST_TYPE } from 'shared/constants'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { appendParams, parseParams, toBackendPagination } from 'shared/utils'
import { LIST_LOCATIONS } from 'graph-ql/career/query'
import { CREATE_LOCATION, UPDATE_LOCATION } from 'graph-ql/career/mutation'
import { ToastrContext } from 'shared/components/toastr'

const LOCATION_STATUS = [
  { label: 'Active', value: 'a' },
  { label: 'Inactive', value: 'i' }
]

const LOCATION_STATUS_LABEL = {
  a: 'Active',
  i: 'Inactive',
  d: 'Deleted'
}

function getLocationListInput(input = {}) {
  const { nSkip, nLimit } = toBackendPagination(input.nSkip, Number(input.nLimit) || 10)

  return {
    nSkip,
    nLimit
  }
}

function getStatusOption(value) {
  return LOCATION_STATUS.find((item) => item.value === value) || (value === 'd' ? { label: 'Deleted', value: 'd' } : LOCATION_STATUS[0])
}

function formatDate(value) {
  if (!value) return '-'

  const timestamp = Number(value)
  return moment(Number.isNaN(timestamp) ? value : timestamp).format('ddd MMM DD YYYY')
}

function LocationForm({ defaultValue, loading, onSubmit }) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm({
    mode: 'all',
    defaultValues: {
      sName: '',
      eStatus: LOCATION_STATUS[0]
    }
  })
  const isEdit = !!defaultValue?._id

  useEffect(() => {
    reset({
      sName: defaultValue?.sName || '',
      eStatus: getStatusOption(defaultValue?.eStatus)
    })
  }, [defaultValue, reset])

  function handleSave(data) {
    onSubmit({
      sName: data?.sName?.trim() || '',
      eStatus: data?.eStatus?.value || data?.eStatus || LOCATION_STATUS[0].value
    })
  }

  return (
    <Form onSubmit={handleSubmit(handleSave)} autoComplete="off">
      <CommonInput
        type="text"
        register={register}
        errors={errors}
        className={errors?.sName && 'error'}
        name="sName"
        label="Location Name"
        required
        validation={{ maxLength: { value: 120, message: validationErrors.maxLength(120) } }}
      />
      {isEdit && (
        <Form.Group className="form-group">
          <Form.Label>Status*</Form.Label>
          <Controller
            name="eStatus"
            control={control}
            rules={{ required: validationErrors.required }}
            render={({ field: { onChange, value, ref } }) => (
              <Select
                ref={ref}
                value={value}
                options={LOCATION_STATUS}
                className={`react-select ${errors?.eStatus && 'error'}`}
                classNamePrefix="select"
                isSearchable={false}
                onChange={onChange}
              />
            )}
          />
          {errors?.eStatus && <Form.Control.Feedback type="invalid">{errors.eStatus.message}</Form.Control.Feedback>}
        </Form.Group>
      )}
      <div className="text-end">
        <Button variant="primary" type="submit" disabled={loading}>
          <FormattedMessage id={isEdit ? 'update' : 'add'} />
          {loading && <Spinner animation="border" size="sm" />}
        </Button>
      </div>
    </Form>
  )
}

function CareerLocations() {
  const history = useHistory()
  const params = useRef(parseParams(location.search))
  const { dispatch } = useContext(ToastrContext)
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const [locationList, setLocationList] = useState([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState(null)
  const totalRecord = useRef(0)
  const columns = useRef([
    { name: 'Name', internalName: 'sName' },
    { name: 'Status', internalName: 'eStatus' },
    { name: 'Created Date', internalName: 'dCreated' }
  ])

  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteAllItem' })
  }

  const { loading, refetch } = useQuery(LIST_LOCATIONS, {
    variables: { input: getLocationListInput(requestParams) },
    onCompleted: (data) => {
      handleApiResponse(data)
    }
  })

  const [createLocation, { loading: createLoading }] = useMutation(CREATE_LOCATION)
  const [updateLocation, { loading: updateLoading }] = useMutation(UPDATE_LOCATION)

  useEffect(() => {
    return history.listen((e) => {
      params.current = parseParams(e.search)
      setRequestParams(getRequestParams(e.search))
    })
  }, [history])

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    return {
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 10
    }
  }

  function handleApiResponse(data) {
    totalRecord.current = data?.listLocations?.nTotal || 0
    setLocationList(data?.listLocations?.aResults || [])
  }

  function handleBtnEvent(eventName) {
    if (eventName === 'newLocation') {
      setEditingLocation(null)
      setIsDrawerOpen(true)
    }
  }

  function handlePageEvent(page) {
    setRequestParams({ ...requestParams, nSkip: page })
    appendParams({ nSkip: page })
  }

  function handleHeaderEvent(name, value) {
    if (name === 'rows') {
      setRequestParams({ ...requestParams, nLimit: Number(value), nSkip: 1 })
      appendParams({ nLimit: value, nSkip: 1 })
    }
  }

  async function refetchAfterMutation(affectedCount = 0) {
    if (locationList.length <= affectedCount && requestParams.nSkip > 1) {
      handlePageEvent(requestParams.nSkip - 1)
      return
    }

    const { data } = await refetch()
    handleApiResponse(data)
  }

  function showSuccessToast(message) {
    if (!message) return

    dispatch({
      type: 'SHOW_TOAST',
      payload: { message, type: TOAST_TYPE.Success, btnTxt: labels.close }
    })
  }

  async function submitLocation(data) {
    if (editingLocation?._id) {
      const response = await updateLocation({
        variables: {
          input: {
            _id: editingLocation._id,
            sName: data.sName,
            eStatus: data.eStatus
          }
        }
      })
      showSuccessToast(response?.data?.updateLocation?.sMessage)
    } else {
      const response = await createLocation({
        variables: {
          input: {
            sName: data.sName
          }
        }
      })
      showSuccessToast(response?.data?.createLocation?.sMessage)
    }

    setIsDrawerOpen(false)
    setEditingLocation(null)
    await refetchAfterMutation()
  }

  async function updateLocationStatus(locationItem, eStatus) {
    const response = await updateLocation({
      variables: {
        input: {
          _id: locationItem._id,
          sName: locationItem.sName,
          eStatus
        }
      }
    })
    showSuccessToast(response?.data?.updateLocation?.sMessage)
    await refetchAfterMutation(eStatus === 'd' ? 1 : 0)
  }

  function handleDelete(locationItem) {
    confirmAlert({
      title: labels.confirmationTitle,
      message: labels.confirmationMessage,
      customUI: CustomAlert,
      buttons: [
        {
          label: labels.yes,
          onClick: () => updateLocationStatus(locationItem, 'd')
        },
        {
          label: labels.no
        }
      ]
    })
  }

  function closeDrawer() {
    setIsDrawerOpen(false)
    setEditingLocation(null)
  }

  return (
    <>
      <TopBar buttons={[{ text: 'New Location', icon: 'icon-add', type: 'primary', clickEventName: 'newLocation' }]} btnEvent={handleBtnEvent} />
      <DataTable
        className="category-list"
        columns={columns.current}
        totalRecord={totalRecord.current}
        isLoading={loading || createLoading || updateLoading}
        header={{
          left: {
            rows: true
          },
          right: {}
        }}
        headerEvent={handleHeaderEvent}
        pageChangeEvent={handlePageEvent}
        pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
        actionColumn
      >
        {locationList.map((locationItem) => (
          <tr key={locationItem?._id}>
            <td>
              <p className="title">{locationItem?.sName}</p>
            </td>
            <td>{LOCATION_STATUS_LABEL[locationItem?.eStatus] || '-'}</td>
            <td>{formatDate(locationItem?.dCreated)}</td>
            <td>
              {/* <ToolTip toolTipMessage={<FormattedMessage id="toggle" />}>
                <Form.Check
                  type="switch"
                  name={locationItem?._id}
                  className="d-inline-block me-1"
                  checked={locationItem?.eStatus === 'a'}
                  onChange={({ target }) => updateLocationStatus(locationItem, target.checked ? 'a' : 'i')}
                />
              </ToolTip> */}
              <ToolTip toolTipMessage={<FormattedMessage id="edit" />}>
                <Button
                  variant="link"
                  className="square icon-btn"
                  onClick={() => {
                    setEditingLocation(locationItem)
                    setIsDrawerOpen(true)
                  }}
                >
                  <i className="icon-create d-block" />
                </Button>
              </ToolTip>
              <ToolTip toolTipMessage={<FormattedMessage id="delete" />}>
                <Button variant="link" className="square icon-btn" onClick={() => handleDelete(locationItem)}>
                  <i className="icon-delete d-block" />
                </Button>
              </ToolTip>
            </td>
          </tr>
        ))}
      </DataTable>
      <Drawer isOpen={isDrawerOpen} onClose={closeDrawer} title={editingLocation?._id ? 'Edit Location' : 'New Location'}>
        <LocationForm defaultValue={editingLocation} loading={createLoading || updateLoading} onSubmit={submitLocation} />
      </Drawer>
    </>
  )
}

LocationForm.propTypes = {
  defaultValue: PropTypes.object,
  loading: PropTypes.bool,
  onSubmit: PropTypes.func
}

export default CareerLocations
