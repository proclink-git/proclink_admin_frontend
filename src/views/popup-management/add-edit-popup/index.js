import React, { forwardRef, useContext } from 'react'
import Select from 'react-select'
import { Button, Col, Form, InputGroup, Row, Spinner } from 'react-bootstrap'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import DatePicker from 'react-datepicker'
import { useMutation, useQuery } from '@apollo/client'
import { useParams, useHistory } from 'react-router'

import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { ONLY_NUMBER, ONLY_NUMBER_EXCEPT_0, POPUP_TYPE, TOAST_TYPE } from 'shared/constants'
import EventPopup from 'shared/components/popup-components/event-popup'
import GeneralPopup from 'shared/components/popup-components/general-popup'
import RecommendationsPopup from 'shared/components/popup-components/recommendations-popup'
import DownloadablePopup from 'shared/components/popup-components/downloadable-popup'
import SurveyPopup from 'shared/components/popup-components/survey-popup'
import ExitPopup from 'shared/components/popup-components/exit-popup'
import { CREATE_POPUP, EDIT_POPUP } from 'graph-ql/popup-managment/mutation'
import useReactSelect from 'shared/hooks/useReactSelect'
import { LIST_SEO_FOR_POPUP } from 'graph-ql/settings/seo'
import { ToastrContext } from 'shared/components/toastr'
import { allRoutes } from 'shared/constants/AllRoutes'
import { GET_POPUP_BY_ID } from 'graph-ql/popup-managment/query'
import { removeTypenameKey } from 'shared/utils'
import InputArrayBox from 'shared/components/input-array-box'

export default function AddEditPopup() {
  const { id } = useParams()
  const history = useHistory()
  const { dispatch } = useContext(ToastrContext)
  const methods = useForm({ mode: 'onChange' })
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
    getValues
  } = methods
  const watchPopupType = watch('ePopupType')
  const bIsPermanent = watch('bIsPermanent')
  const dStartDate = watch('dStartDate')
  const bIsForAllPages = watch('bIsForAllPages')

  const value = getValues()

  const {
    onApiResponce,
    handleScroll,
    handleSearch,
    loading: seoLoading,
    items
  } = useReactSelect({
    query: LIST_SEO_FOR_POPUP,
    requestParams: {
      nLimit: 20,
      nOrder: -1,
      nSkip: 1,
      sSearch: '',
      sSortBy: 'dCreated'
    },
    responceCallBack: (data) => {
      onApiResponce(data?.listSeoForPopup?.aResults)
    }
  })

  useQuery(GET_POPUP_BY_ID, {
    variables: { input: { _id: id } },
    skip: !id,
    onCompleted: (data) => {
      if (data?.getPopup?.oData) {
        setFormValues(removeTypenameKey(data?.getPopup?.oData))
      } else {
        console.log('unexpected Fetched Data:', data)
      }
    }
  })

  const [create, { loading }] = useMutation(CREATE_POPUP, {
    onCompleted: (data) => {
      if (data.addPopup) {
        history.push(`${allRoutes.popupList}?ePopupType=${watchPopupType?.value}`)
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data?.addPopup?.sMessage, type: TOAST_TYPE.Success }
        })
      }
    }
  })
  const [edit, { loading: editLoading }] = useMutation(EDIT_POPUP, {
    onCompleted: (data) => {
      if (data?.editPopup) {
        history.push(`${allRoutes.popupList}?ePopupType=${watchPopupType?.value}`)
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data?.addPopup?.sMessage, type: TOAST_TYPE.Success }
        })
      }
    }
  })

  function getPopupComponent() {
    switch (watchPopupType?.value) {
      case 'e':
        return <EventPopup />
      case 'g':
        return <GeneralPopup />
      case 'cr':
        return <RecommendationsPopup />
      case 'dc':
        return <DownloadablePopup />
      case 's':
        return <SurveyPopup />
      case 'ei':
        return <ExitPopup />
      default:
        return null
    }
  }

  function setFormValues(d) {
    if (!d) return
    const formData = { ...d }
    const commonData = {
      ...formData,
      ePopupType: POPUP_TYPE.find((item) => item.value === formData?.ePopupType),
      dStartDate: formData?.dStartDate ? new Date(formData.dStartDate) : new Date(),
      dEndDate: formData?.dEndDate ? new Date(formData.dEndDate) : new Date(),
      bIsPermanent: formData?.bIsPermanent || false,
      bIsForAllPages: formData?.bIsForAllPages || false,
      sPopupTitle: formData?.sPopupTitle || '',
      nDelay: formData?.nDelay?.toString() || '0',
      nFrequency: formData?.nFrequency?.toString() || '0',
      aSeoId: formData?.aSeoId || []
    }

    switch (formData?.ePopupType) {
      case 'g':
        commonData.oGeneralPopup = {
          sHeading: formData?.oGeneralPopup?.sHeading || '',
          sSupportingLine: formData?.oGeneralPopup?.sSupportingLine || '',
          sCTAText: formData?.oGeneralPopup?.sCTAText || ''
        }
        break
      case 'e':
        if (formData?.oEventPopup) {
          commonData.oEventPopup = {
            ...formData.oEventPopup,
            dEventDate: formData.oEventPopup.dEventDate ? new Date(formData.oEventPopup.dEventDate) : null
          }
        }
        break
      case 'dc':
        if (formData?.oDownloadableContentPopup?.oWhitePaper?._id) {
          commonData.oDownloadableContentPopup = {
            ...formData.oDownloadableContentPopup,
            iWhitePaperId: formData.oDownloadableContentPopup.oWhitePaper
          }
          delete commonData.oDownloadableContentPopup.oWhitePaper
        }
        break
      case 'cr':
        if (formData?.oContentRecommendationPopup?.oContentData?.eType) {
          const { oContentRecommendationPopup } = formData
          const contentType = oContentRecommendationPopup.oContentData.eType
          const contentTypeMap = {
            ar: 'oArticle',
            s: 'oService',
            i: 'oIndustry'
          }
          const contentKey = contentTypeMap[contentType]
          if (contentKey && oContentRecommendationPopup[contentKey]) {
            commonData.oContentRecommendationPopup = {
              ...oContentRecommendationPopup,
              oContentData: {
                eType: contentType,
                iId: oContentRecommendationPopup[contentKey]?._id,
                sSlug: oContentRecommendationPopup[contentKey]?.oSeo?.sSlug
              }
            }
            delete commonData.oContentRecommendationPopup.oArticle
            delete commonData.oContentRecommendationPopup.oService
            delete commonData.oContentRecommendationPopup.oIndustry
          }
        }
        break
      case 's':
        if (formData?.oSurveyPopup) {
          commonData.oSurveyPopup = {
            sCTAText: formData.oSurveyPopup.sCTAText || '',
            aQuestion: formData.oSurveyPopup.aQuestion?.map(q => ({
              ...q,
              aOptions: q.aOptions || []
            })) || []
          }
        }
        break
      case 'ei':
        if (formData?.oExitIntentPopup) {
          commonData.oExitIntentPopup = {
            ...formData.oExitIntentPopup
          }
        }
        break
    }
    if (formData?.oBannerImage) {
      commonData.oBannerImage = {
        sUrl: formData.oBannerImage.sUrl || '',
        sText: formData.oBannerImage.sText || ''
      }
    }
    console.log('Setting form values:', commonData)
    reset(commonData)
  }

  function onSubmit(d) {
    const data = {
      ...d,
      ePopupType: d.ePopupType.value,
      dStartDate: new Date(d.dStartDate).getTime(),
      dEndDate: new Date(d.dEndDate).getTime(),
      nDelay: parseInt(d?.nDelay),
      nFrequency: parseInt(d?.nFrequency),
      aSeoId: d?.aSeoId?.map((item) => item._id)
    }
    if (data?.oEventPopup?.dEventDate) {
      data.oEventPopup.dEventDate = new Date(data?.oEventPopup?.dEventDate).getTime()
    }
    if (data?.oContentRecommendationPopup?.oContentData) {
      data.oContentRecommendationPopup.oContentData = {
        eType: data.oContentRecommendationPopup.oContentData.eType,
        iId: data.oContentRecommendationPopup.oContentData.iId
      }
    }
    if (data?.oDownloadableContentPopup?.iWhitePaperId) {
      data.oDownloadableContentPopup.iWhitePaperId = data?.oDownloadableContentPopup?.iWhitePaperId?._id
    }
    if (id) {
      edit({ variables: { input: { _id: id, ...data } } })
    } else {
      create({ variables: { input: data } })
    }
  }
  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Row className="align-items-end">
          <Col md={9}>
            <CountInput
              type="text"
              maxWord={500}
              currentLength={value?.sPopupTitle?.length}
              register={register('sPopupTitle', {
                required: validationErrors.required,
                maxLength: { value: 500, message: validationErrors.maxLength(500) }
              })}
              error={errors}
              className={errors?.sPopupTitle && 'error'}
              name="sPopupTitle"
              label="Title*"
            />
          </Col>
          <Col md={3}>
            <Form.Group className="form-group">
              <Form.Label>Popup Type*</Form.Label>
              <Controller
                name="ePopupType"
                control={control}
                rules={{ required: validationErrors.required }}
                render={({ field: { onChange, value, ref } }) => (
                  <Select
                    ref={ref}
                    value={value}
                    options={POPUP_TYPE}
                    className={`react-select ${errors?.ePopupType && 'error'}`}
                    classNamePrefix="select"
                    isSearchable={false}
                    // isDisabled={!!id}
                    onChange={onChange}
                  />
                )}
              />
              {errors?.ePopupType && <Form.Control.Feedback type="invalid">{errors.ePopupType.message}</Form.Control.Feedback>}
            </Form.Group>
          </Col>

          <Col md={6}>
            <InputArrayBox className="me-0 mb-4">
              <Row className="gutter-9">
                <Col xs={12}>
                  <Form.Check
                    type="checkbox"
                    id="bIsPermanent"
                    name="bIsPermanent"
                    defaultChecked={false}
                    className="form-check"
                    label="Is Permanent"
                    {...register('bIsPermanent')}
                  />
                </Col>
                <Col md={6}>
                  <Form.Group className="form-group mb-0">
                    <Form.Label className="d-block">Start Date*</Form.Label>
                    <Controller
                      name="dStartDate"
                      control={control}
                      rules={{ required: validationErrors.required }}
                      render={({ field: { onChange, value = '' } }) => (
                        <DatePicker
                          selected={value}
                          dateFormat="dd-MM-yyyy h:mm aa"
                          minDate={new Date()}
                          onChange={onChange}
                          showTimeSelect
                          timeIntervals={15}
                          withPortal
                          customInput={<ExampleCustomInput icon="visibility" error={errors?.dStartDate} />}
                        />
                      )}
                    />
                    {errors?.dStartDate && <Form.Control.Feedback type="invalid">{errors.dStartDate.message}</Form.Control.Feedback>}
                  </Form.Group>
                </Col>
                {!bIsPermanent && (
                  <Col md={6}>
                    <Form.Group className="form-group mb-0">
                      <Form.Label className="d-block">End Date*</Form.Label>
                      <Controller
                        name="dEndDate"
                        control={control}
                        rules={{ required: validationErrors.required }}
                        render={({ field: { onChange, value = '' } }) => (
                          <DatePicker
                            selected={value}
                            dateFormat="dd-MM-yyyy h:mm aa"
                            minDate={dStartDate || new Date()}
                            onChange={onChange}
                            showTimeSelect
                            timeIntervals={15}
                            withPortal
                            customInput={<ExampleCustomInput icon="visibility" error={errors?.dEndDate} />}
                          />
                        )}
                      />
                      {errors?.dEndDate && <Form.Control.Feedback type="invalid">{errors.dEndDate.message}</Form.Control.Feedback>}
                    </Form.Group>
                  </Col>
                )}
              </Row>
            </InputArrayBox>
          </Col>
          {
            watchPopupType?.value !== 'ei' &&
            <>
              <Col md={3}>
                <CommonInput
                  type="text"
                  altText="In Numbers"
                  register={register}
                  errors={errors}
                  className={errors?.nFrequency && 'error'}
                  name="nFrequency"
                  label="Frequency"
                  required
                  validation={{ pattern: { value: ONLY_NUMBER_EXCEPT_0, message: validationErrors.number } }}
                />
              </Col>
              <Col md={3}>
                <CommonInput
                  altText="In seconds"
                  type="text"
                  register={register}
                  errors={errors}
                  className={errors?.nDelay && 'error'}
                  name="nDelay"
                  label="Delay"
                  required
                  validation={{ pattern: { value: ONLY_NUMBER, message: validationErrors.number } }}
                />
              </Col>
            </>
          }

          <Col xs={12}>
            <Form.Group className="form-group mb-0">
                <Form.Check
                    type="checkbox"
                    id="bIsForAllPages"
                    name="bIsForAllPages"
                    defaultChecked={false}
                    className="form-check"
                    label="For All Pages ?"
                    {...register('bIsForAllPages')}
                  />
             {!bIsForAllPages && <div>
              <Form.Label>Select Pages*</Form.Label>
              <Controller
                name="aSeoId"
                rules={{ required: validationErrors.required }}
                control={control}
                render={({ field: { onChange, value = [], ref } }) => {
                  return (
                    <Select
                      ref={ref}
                      isLoading={seoLoading}
                      value={value}
                      options={items}
                      getOptionLabel={(option) => option.sSlug}
                      getOptionValue={(option) => option._id}
                      className={`react-select ${errors?.aSeoId && 'error'}`}
                      classNamePrefix="select"
                      onInputChange={handleSearch}
                      isSearchable
                      closeMenuOnSelect={false}
                      isMulti
                      onMenuScrollToBottom={handleScroll}
                      onChange={onChange}
                    />
                  )
                }}
              />
              </div>}
              {errors?.aSeoId && <Form.Control.Feedback type="invalid">{errors.aSeoId.message}</Form.Control.Feedback>}
            </Form.Group>
          </Col>
          <Col xs={12}>
            {watchPopupType && <hr />}
            {getPopupComponent()}
          </Col>
          <Col xs={12} className="text-end d-flex align-items-center justify-content-end">
            <Button variant="primary" type="submit" className="m-2" disabled={loading || editLoading}>
              {id ? 'Update' : 'Add'}
              {(loading || editLoading) && <Spinner animation="border" size="sm" />}
            </Button>
          </Col>
        </Row>
      </Form>
    </FormProvider>
  )
}

// eslint-disable-next-line react/prop-types
const ExampleCustomInput = forwardRef(({ value, onClick, icon, error }, ref) => (
  <InputGroup>
    <Form.Control value={value} type="text" ref={ref} onClick={onClick} className={error && 'error'} readOnly />
  </InputGroup>
))
ExampleCustomInput.displayName = ExampleCustomInput
