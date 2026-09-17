/* eslint-disable no-unused-vars */
import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { Button, Form, Col, Row, Spinner, InputGroup, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { useMutation } from '@apollo/client'
import { useHistory, useParams } from 'react-router-dom'
import { useIntl } from 'react-intl'

import CommonSEO from 'shared/components/common-seo'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { allRoutes } from 'shared/constants/AllRoutes'
import { removeTypeName, removeTypenameKey } from 'shared/utils'
import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { EDIT_PAGE } from 'graph-ql/pages/mutation'
import SecurityGlobal, { globalSecurityFields } from './security-global'
import PhysicalInfra, { physicalInfraFields } from './physical-infra'
import PhysicalObjectives, { physicalObjectivesFields } from './physical-objectives'
import SecurityControl, { securityControlFields } from './security-control'
import DataSecurity, { dataSecurityFields } from './data-security'
import PABSPolicy, { PABSPolicyFields } from './PABS-policy'
import TabSection, { tabSectionFields } from './tab-section'
import CountInput from 'shared/components/count-input'
import TestimonialsComponent from 'shared/components/page-components/dynamic/testimonials'
import PageUpdateActions from 'shared/components/web-pages/page-update-actions'

function Security({ pageData }) {
  const history = useHistory()
  const [cmsData, setCmsData] = useState(pageData)
  const { id } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const close = useIntl().formatMessage({ id: 'close' })

  const methods = useForm({
    mode: 'all',
    defaultValues: getFormValue()
  })
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    setValue,
    control,
    getValues
  } = methods
  const values = getValues()

  const [EditMutation, { loading: editSeoLoader }] = useMutation(EDIT_PAGE, {
    onCompleted: (data) => {
      if (data && data.editPage) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editPage.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
        history.push(allRoutes.listPage)
      }
    }
  })

  async function prepareSeoData(value) {
    EditMutation({ variables: { input: { ...value, _id: id } } })
  }

  function getGlobalData() {
    if (pageData?.oSecurity?.oGlobal?.aCard?.length) {
      return { sTitle: pageData?.oSecurity?.oGlobal?.sTitle, aCard: removeTypenameKey(pageData?.oSecurity?.oGlobal?.aCard) }
    } else {
      return { sTitle: pageData?.oSecurity?.oGlobal?.sTitle, aCard: [globalSecurityFields] }
    }
  }
  function getPhysicalInfra() {
    const obj = {
      sTitle: pageData?.oSecurity?.oPhysicalInfra?.sTitle || '',
      sDescription: pageData?.oSecurity?.oPhysicalInfra?.sDescription || '',
      aCard: [physicalInfraFields]
    }
    if (pageData?.oSecurity?.oPhysicalInfra?.aCard?.length) {
      obj.aCard = removeTypenameKey(pageData?.oSecurity?.oPhysicalInfra?.aCard)
    }
    return obj
  }
  function getPhysicalObjectives() {
    const obj = {
      sTitle: pageData?.oSecurity?.oPhysicalObjectives?.sTitle || '',
      sDescription: pageData?.oSecurity?.oPhysicalObjectives?.sDescription || '',
      aCard: [physicalObjectivesFields],
      oImg: removeTypeName(pageData?.oSecurity?.oPhysicalObjectives?.oImg)
    }
    if (pageData?.oSecurity?.oPhysicalObjectives?.aCard?.length) {
      obj.aCard = removeTypenameKey(pageData?.oSecurity?.oPhysicalObjectives?.aCard)
    }
    return obj
  }
  function getSecurityControl() {
    const obj = {
      sTitle: pageData?.oSecurity?.oSecurityControl?.sTitle || '',
      aCard: [securityControlFields]
    }
    if (pageData?.oSecurity?.oSecurityControl?.aCard?.length) {
      obj.aCard = removeTypenameKey(pageData?.oSecurity?.oSecurityControl?.aCard)
    }
    return obj
  }
  function getAccessToClient() {
    const obj = {
      sTitle: pageData?.oSecurity?.oAccessToClient?.sTitle || '',
      aDescription: [' ']
    }
    if (pageData?.oSecurity?.oAccessToClient?.aDescription?.length) {
      obj.aDescription = removeTypenameKey(pageData?.oSecurity?.oAccessToClient?.aDescription)
    }
    return obj
  }
  function getDataSecurity() {
    const obj = {
      sTitle: pageData?.oSecurity?.oDataSecurity?.sTitle || '',
      aCard: [dataSecurityFields]
    }
    if (pageData?.oSecurity?.oDataSecurity?.aCard?.length) {
      obj.aCard = removeTypenameKey(pageData?.oSecurity?.oDataSecurity?.aCard)
    }
    return obj
  }
  function getPABSPolicy() {
    const obj = {
      sTitle: pageData?.oSecurity?.oPABSPolicy?.sTitle || '',
      oImg: removeTypeName(pageData?.oSecurity?.oPABSPolicy?.oImg),
      aData: [PABSPolicyFields]
    }
    if (pageData?.oSecurity?.oPABSPolicy?.aData?.length) {
      obj.aData = removeTypenameKey(pageData?.oSecurity?.oPABSPolicy?.aData)
    }
    return obj
  }
  function getTabSection() {
    if (pageData?.oSecurity?.oTabSection?.aTab?.length) {
      return {
        aTab: removeTypenameKey(pageData?.oSecurity?.oTabSection?.aTab),
        sTitle: pageData?.oSecurity?.oTabSection?.sTitle
      }
    } else {
      return [tabSectionFields]
    }
  }

  function getFormValue() {
    return {
      aHighlightText: pageData?.aHighlightText,
      sPageTitle: pageData?.sPageTitle,
      sPageDescription: pageData?.sPageDescription,
      ePageType: pageData?.ePageType,
      oImg: removeTypeName(pageData?.oImg),
      oSecurity: {
        // oGlobal: getGlobalData(),
        oPhysicalInfra: getPhysicalInfra(),
        oPhysicalObjectives: getPhysicalObjectives(),
        oSecurityControl: getSecurityControl(),
        oAccessToClient: getAccessToClient(),
        oDataSecurity: getDataSecurity(),
        oPABSPolicy: getPABSPolicy(),
        oTabSection: getTabSection(),
        sTestimonialComponentTitle: pageData?.oSecurity?.sTestimonialComponentTitle,
        sTestimonialComponentDescription: pageData?.oSecurity?.sTestimonialComponentDescription,
        aTestimonial: pageData?.oSecurity?.aTestimonial
      },
      oSeo: {
        ...removeTypeName(pageData?.oSeo),
        aKeywords: pageData?.oSeo?.aKeywords ? pageData?.oSeo?.aKeywords.join(', ') : '',
        oFB: pageData?.oSeo?.oFB ? removeTypeName(pageData?.oSeo?.oFB) : '',
        oTwitter: pageData?.oSeo?.oTwitter ? removeTypeName(pageData?.oSeo?.oTwitter) : ''
      }
    }
  }

  const onSubmit = (data) => {
    prepareSeoData(data)
    const d = { ...data }
    d.oSecurity.aTestimonial = d?.oSecurity?.aTestimonial?.map((e) => e?._id)
  }
  function handleUpdateData(data) {
    setCmsData(data)
  }
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'aHighlightText'
  })

  const title = useWatch({
    control,
    name: 'sPageTitle',
    defaultValue: ''
  })

  const titleLength = (title?.replace('##', '') || '').length
  const maxHighlightLength = Math.max(0, 75 - titleLength)
  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <PageUpdateActions loading={editSeoLoader} />
        <Row>
          <Col sm="8">
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id={'title-tooltip'}>For the highlight text, you have to add ## in description</Tooltip>}
            >
              <div>
                <CountInput
                  type="text"
                  register={register('sPageTitle', {
                    required: validationErrors.required,
                    maxLength: { value: 150, message: validationErrors.maxLength(150) }
                  })}
                  maxWord={150}
                  currentLength={values?.sPageTitle?.length}
                  error={errors}
                  className={errors?.sPageTitle && 'error'}
                  name="sPageTitle"
                  label="H1"
                />
              </div>
            </OverlayTrigger>
            <Row>
              <Col xs={12}>
                <Form.Label className="text-uppercase">Highlight Text</Form.Label>
              </Col>
              {fields.map((field, i) => (
                <Col key={field.id} sm="4">
                  <Form.Group className="form-group">
                    <InputGroup>
                      <CountInput
                        type="text"
                        register={register(`aHighlightText.[${i}]`, {
                          required: validationErrors.required,
                          maxLength: {
                            value: maxHighlightLength,
                            message: validationErrors.maxLength(maxHighlightLength)
                          }
                        })}
                        maxWord={maxHighlightLength}
                        currentLength={values.aHighlightText[i].length}
                        error={errors}
                        className={errors?.aHighlightText?.[i] && 'error'}
                        name={`aHighlightText.[${i}]`}
                      />
                      {fields?.length > 1 && (
                        <Button onClick={() => remove(i)} variant="link" className="icon-right">
                          <i className="icon-delete"></i>
                        </Button>
                      )}
                    </InputGroup>
                  </Form.Group>
                </Col>
              ))}
              <Col xs={12}>
                <Button onClick={() => append('')} variant="link" className="square add-media hover-none btn-sm">
                  <i className="icon-add" />
                  Add More
                </Button>
              </Col>
            </Row>
            <CountInput
              type="textarea"
              register={register('sPageDescription', {
                required: validationErrors.required,
                maxLength: { value: 200, message: validationErrors.maxLength(200) }
              })}
              maxWord={200}
              currentLength={values?.sPageDescription?.length}
              error={errors}
              className={errors?.sPageDescription && 'error'}
              name="sPageDescription"
              label="Short Title"
            />
            {/* <SecurityGlobal /> */}
            <PhysicalInfra />
            <PhysicalObjectives />
            <TabSection />
            <SecurityControl />
            <PABSPolicy />
            <DataSecurity />
            <TestimonialsComponent testimonialsName="oSecurity.aTestimonial" testimonialComponentTitle="oSecurity.sTestimonialComponentTitle" testimonialComponentDescription="oSecurity.sTestimonialComponentDescription" />
            <input type="hidden" value="p" {...register('oSeo.eType')} />
            <CommonSEO
              register={register}
              errors={errors}
              values={getValues()}
              setError={setError}
              clearErrors={clearErrors}
              previewURL={cmsData?.oImg?.sUrl || cmsData?.oSeo?.oFB?.sUrl || cmsData?.oSeo?.oTwitter?.sUrl}
              fbImg={cmsData?.oSeo?.oFB?.sUrl}
              twitterImg={cmsData?.oSeo?.oTwitter?.sUrl}
              setValue={setValue}
              control={control}
              id={id}
              slugType={'p'}
              // slug={name}
              hidden
              hideCustomSlug
              defaultData={cmsData}
              onUpdateData={(e) => handleUpdateData(e)}
            />
          </Col>
          <Col sm="4" className="add-article">
            <div className="sticky-column">
              <CategoryPlayerTeamImage
                galleryType="pb"
                name="oImg"
                register={register}
                setValue={setValue}
                // onDelete={handleDeleteImg}
                values={getValues()}
                errors={errors}
                required
                imgUrl={cmsData?.oImg?.sUrl}
              />
            </div>
          </Col>
        </Row>
        <div className="btn-bottom add-border mt-4 ">
          <Button variant="primary" type="submit" className="m-2" disabled={editSeoLoader}>
            Update
            {editSeoLoader && <Spinner animation="border" size="sm" />}
          </Button>
        </div>
      </Form>
    </FormProvider>
  )
}
Security.propTypes = {
  pageData: PropTypes.object.isRequired
}
export default Security
