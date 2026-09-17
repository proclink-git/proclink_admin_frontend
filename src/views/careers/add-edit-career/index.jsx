import React, { useContext, useEffect, useState } from 'react'
import Select from 'react-select'
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@apollo/client'
import { useHistory, useParams } from 'react-router'
import { FormattedMessage, useIntl } from 'react-intl'

import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import { allRoutes } from 'shared/constants/AllRoutes'
import { CAREER_STATUS, ONLY_NUMBER, TOAST_TYPE, URL_REGEX } from 'shared/constants'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { removeTypenameKey, toBackendPagination } from 'shared/utils'
import { CREATE_CAREER_OPENING, EDIT_CAREER_OPENING } from 'graph-ql/career/mutation'
import { GET_CAREER_OPENING, LIST_LOCATIONS } from 'graph-ql/career/query'
import { ToastrContext } from 'shared/components/toastr'
import { CAREER_LOCATION_LIST_LIMIT, getCareerLocationOption, getCareerLocationOptions } from 'shared/utils/career-location'

function getDefaultCareer() {
  return {
    sTitle: '',
    sDescription: '',
    iLocationId: null,
    nExperienceYears: '',
    sRedirectUrl: '',
    eStatus: CAREER_STATUS[0],
    aTags: ['']
  }
}

function getStatusOption(value) {
  return CAREER_STATUS.find((item) => item.value === value) || (value === 'd' ? { label: 'Deleted', value: 'd' } : CAREER_STATUS[0])
}

function normalizeCareerForForm(data = {}, locationOptions = []) {
  const career = removeTypenameKey(data) || {}

  return {
    ...career,
    iLocationId: getCareerLocationOption(career.iLocationId || career.eLocation || career.oLocation?.sName, locationOptions),
    eStatus: getStatusOption(career.eStatus),
    nExperienceYears: career?.nExperienceYears?.toString() || '',
    aTags: Array.isArray(career.aTags) && career.aTags.length ? career.aTags : ['']
  }
}

function normalizeCareerForSubmit(data = {}) {
  return {
    sTitle: data?.sTitle?.trim() || '',
    sDescription: data?.sDescription?.trim() || '',
    iLocationId: data?.iLocationId?.value || data?.iLocationId || '',
    nExperienceYears: Number(data?.nExperienceYears) || 0,
    sRedirectUrl: data?.sRedirectUrl?.trim() || '',
    eStatus: data?.eStatus?.value || data?.eStatus || CAREER_STATUS[0].value,
    aTags: (Array.isArray(data?.aTags) ? data.aTags : []).map((tag) => String(tag || '').trim()).filter(Boolean)
  }
}

function AddEditCareer() {
  const { id } = useParams()
  const history = useHistory()
  const { dispatch } = useContext(ToastrContext)
  const [careerData, setCareerData] = useState()
  const [locationOptions, setLocationOptions] = useState([])
  const close = useIntl().formatMessage({ id: 'close' })
  const methods = useForm({
    mode: 'all',
    defaultValues: getDefaultCareer()
  })
  const {
    register,
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { errors }
  } = methods
  const value = getValues()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'aTags'
  })

  const { loading: locationLoading } = useQuery(LIST_LOCATIONS, {
    variables: { input: toBackendPagination(1, CAREER_LOCATION_LIST_LIMIT) },
    onCompleted: (data) => {
      setLocationOptions(getCareerLocationOptions(data?.listLocations?.aResults))
    }
  })

  useQuery(GET_CAREER_OPENING, {
    variables: { input: { _id: id } },
    skip: !id,
    onCompleted: (data) => {
      if (data?.getCareerOpening) {
        setCareerData(data.getCareerOpening)
      }
    }
  })

  useEffect(() => {
    if (id && careerData) {
      reset(normalizeCareerForForm(careerData, locationOptions))
    }
  }, [careerData, id, locationOptions, reset])

  const [createCareer, { loading }] = useMutation(CREATE_CAREER_OPENING, {
    onCompleted: (data) => {
      if (data?.createCareerOpening) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.createCareerOpening.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
        history.push(allRoutes.careers)
      }
    }
  })

  const [editCareer, { loading: editLoading }] = useMutation(EDIT_CAREER_OPENING, {
    onCompleted: (data) => {
      if (data?.editCareerOpening) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editCareerOpening.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
        history.push(allRoutes.careers)
      }
    }
  })

  function onSubmit(data) {
    const input = normalizeCareerForSubmit(data)

    if (id) {
      editCareer({ variables: { input: { ...input, _id: id } } })
    } else {
      createCareer({ variables: { input } })
    }
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Row>
        <Col lg={8}>
          <CountInput
            maxWord={120}
            currentLength={value?.sTitle?.length}
            placeholder={useIntl().formatMessage({ id: 'writeHere' })}
            type="text"
            register={register('sTitle', {
              required: validationErrors.required,
              maxLength: { value: 120, message: validationErrors.maxLength(120) }
            })}
            error={errors}
            className={errors.sTitle && 'error'}
            name="sTitle"
            label="Title*"
          />
          <CountInput
            textarea
            rows={6}
            maxWord={2000}
            currentLength={value?.sDescription?.length}
            placeholder={useIntl().formatMessage({ id: 'writeHere' })}
            register={register('sDescription', {
              required: validationErrors.required,
              maxLength: { value: 2000, message: validationErrors.maxLength(2000) }
            })}
            error={errors}
            className={errors.sDescription && 'error'}
            name="sDescription"
            label="Description*"
          />
          <CommonInput
            type="text"
            register={register}
            errors={errors}
            className={errors?.sRedirectUrl && 'error'}
            name="sRedirectUrl"
            label="Redirect URL"
            required
            validation={{ pattern: { value: URL_REGEX, message: validationErrors.url } }}
          />
          <Row>
            <Col md={6}>
              <Form.Group className="form-group">
                <Form.Label>Location*</Form.Label>
                <Controller
                  name="iLocationId"
                  control={control}
                  rules={{ required: validationErrors.required }}
                  render={({ field: { onChange, value, ref } }) => (
                    <Select
                      ref={ref}
                      value={value}
                      options={locationOptions}
                      className={`react-select ${errors?.iLocationId && 'error'}`}
                      classNamePrefix="select"
                      isSearchable
                      isLoading={locationLoading}
                      onChange={onChange}
                    />
                  )}
                />
                {errors?.iLocationId && <Form.Control.Feedback type="invalid">{errors.iLocationId.message}</Form.Control.Feedback>}
              </Form.Group>
            </Col>
            <Col md={6}>
              <CommonInput
                type="text"
                register={register}
                errors={errors}
                className={errors?.nExperienceYears && 'error'}
                name="nExperienceYears"
                label="Experience Years"
                required
                validation={{ pattern: { value: ONLY_NUMBER, message: validationErrors.number } }}
              />
            </Col>
          </Row>
        </Col>
        <Col lg={4}>
          <div className="sticky-column">
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
                    options={CAREER_STATUS}
                    className={`react-select ${errors?.eStatus && 'error'}`}
                    classNamePrefix="select"
                    isSearchable={false}
                    onChange={onChange}
                  />
                )}
              />
              {errors?.eStatus && <Form.Control.Feedback type="invalid">{errors.eStatus.message}</Form.Control.Feedback>}
            </Form.Group>
            <Form.Group className="form-group">
              <Form.Label>Tags</Form.Label>
              {fields.map((field, index) => (
                <InputArrayBox
                  key={field.id}
                  className="mb-3"
                  actions={
                    <>
                      {index + 1 === fields.length && (
                        <Button type="button" onClick={() => append('')} variant="link" size="sm" className="square icon-btn">
                          <i className="icon-add d-block" />
                        </Button>
                      )}
                      {fields.length > 1 && (
                        <Button type="button" onClick={() => remove(index)} variant="link" size="sm" className="square icon-btn">
                          <i className="icon-delete d-block" />
                        </Button>
                      )}
                    </>
                  }
                >
                  <CommonInput
                    type="text"
                    register={register}
                    errors={errors}
                    name={`aTags[${index}]`}
                    label={`Tag ${index + 1}`}
                    disableDefaultMaxLength
                  />
                </InputArrayBox>
              ))}
            </Form.Group>
          </div>
        </Col>
        <Col xs={12} className="text-end d-flex align-items-center justify-content-end">
          <Button variant="primary" type="submit" className="m-2" disabled={loading || editLoading}>
            <FormattedMessage id={id ? 'update' : 'add'} />
            {(loading || editLoading) && <Spinner animation="border" size="sm" />}
          </Button>
        </Col>
      </Row>
    </Form>
  )
}

export default AddEditCareer
