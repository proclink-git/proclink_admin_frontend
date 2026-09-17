import React, { useContext, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Button, Form, Col, Row, Spinner } from 'react-bootstrap'
import { useMutation, useLazyQuery } from '@apollo/client'
import { useHistory, useParams } from 'react-router-dom'
import { FormattedMessage, useIntl } from 'react-intl'

import AddEditCms from 'shared/components/add-edit-cms'
import CommonSEO from 'shared/components/common-seo'
import AddPageComponents from 'shared/components/add-page-components'
import AddPageComponentsList from 'shared/components/add-page-components/list'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { allRoutes } from 'shared/constants/AllRoutes'
import { removeTypeName, removeTypenameKey, wrapTable } from 'shared/utils'
import { GET_CMS_BY_ID, EDIT_CMS, ADD_CMS } from 'graph-ql/settings/cms'
import { useAllowUnsavedChangesNavigation } from 'shared/components/unsaved-changes'
import { ensurePageComponentInstanceId, normalizeComponentSelectionForPayload } from 'shared/components/page-components/registry'

const CMS_COMPONENT_PAGE_TYPE = 'cms'
const CMS_ALLOWED_COMPONENT_TYPES = ['cb']
const CMS_COMPONENT_TITLES = {
  cb: 'Career Banner'
}

function getDefaultImage() {
  return {
    sUrl: '',
    sText: '',
    sCaption: '',
    sAttribute: ''
  }
}

function getDefaultCta() {
  return {
    sLabel: '',
    sUrl: ''
  }
}

function normalizeImage(value = {}) {
  return {
    ...getDefaultImage(),
    ...(removeTypenameKey(value) || {})
  }
}

function normalizeCta(value = {}) {
  return {
    sLabel: value?.sLabel || '',
    sUrl: value?.sUrl || ''
  }
}

function normalizeFixedArray(items, count, fallbackFactory, normalizeItem = (item) => item) {
  const nextItems = (Array.isArray(items) ? items : [])
    .slice(0, count)
    .map((item) => normalizeItem(removeTypenameKey(item)))

  while (nextItems.length < count) {
    nextItems.push(fallbackFactory())
  }

  return nextItems
}

function normalizeCmsComponent(component = {}) {
  const normalizedComponent = ensurePageComponentInstanceId(component)
  const componentId = normalizedComponent?.iId?._id || normalizedComponent?.iId || normalizedComponent?._id || ''
  const eType = normalizedComponent?.eType || normalizedComponent?.iId?.eType || ''
  const sComponentTitle =
    normalizedComponent?.iId?.sComponentTitle || normalizedComponent?.sComponentTitle || CMS_COMPONENT_TITLES[eType] || eType
  const eComponentType = normalizedComponent?.eComponentType || normalizedComponent?.iId?.eComponentType || ''

  return {
    _id: componentId,
    iId: componentId ? { _id: componentId, sComponentTitle, eComponentType, eType } : normalizedComponent?.iId,
    eType,
    eComponentType,
    instanceId: normalizedComponent.instanceId,
    sComponentTitle,
    sPreviewUrl: normalizedComponent?.sPreviewUrl || normalizedComponent?.iId?.sPreviewUrl || ''
  }
}

function normalizeComponentSelection(component = {}) {
  return normalizeComponentSelectionForPayload(component)
}

function hasSelectedComponent(components = [], type) {
  return (Array.isArray(components) ? components : []).some((component) => (component?.eType || component?.iId?.eType) === type)
}

function cleanCtas(items = [], limit) {
  const nextItems = (Array.isArray(items) ? items : [])
    .map(normalizeCta)
    .filter((item) => item.sLabel || item.sUrl)

  return typeof limit === 'number' ? nextItems.slice(0, limit) : nextItems
}

function normalizeCareerBanner(value = {}) {
  return {
    sTitle: value?.sTitle || '',
    sDescription: value?.sDescription || '',
    oImg: normalizeImage(value?.oImg),
    aCta: normalizeFixedArray(value?.aCta, 1, getDefaultCta, normalizeCta)
  }
}

function normalizeCareerBannerForSubmit(value = {}) {
  return {
    sTitle: value?.sTitle || '',
    sDescription: value?.sDescription || '',
    oImg: normalizeImage(value?.oImg),
    aCta: cleanCtas(value?.aCta, 1)
  }
}

function normalizeKeywords(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean)
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function cleanSocialSeo(value) {
  return {
    sTitle: value?.sTitle || '',
    sDescription: value?.sDescription || '',
    sUrl: value?.sUrl || ''
  }
}

function normalizeSeoForSubmit(value = {}) {
  const seo = removeTypenameKey(value) || {}

  return {
    sTitle: seo?.sTitle || '',
    sSlug: seo?.sSlug || '',
    sDescription: seo?.sDescription || '',
    aKeywords: normalizeKeywords(seo?.aKeywords),
    sCUrl: seo?.sCUrl || '',
    sRobots: seo?.sRobots || '',
    oFB: cleanSocialSeo(seo?.oFB),
    oTwitter: cleanSocialSeo(seo?.oTwitter),
    eType: seo?.eType || 'cms'
  }
}

function AddEditCmsView() {
  const history = useHistory()
  const allowUnsavedChangesNavigation = useAllowUnsavedChangesNavigation()
  const [cmsData, setCmsData] = useState()
  const { id } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const [name, setName] = useState()
  const close = useIntl().formatMessage({ id: 'close' })

  const methods = useForm({
    mode: 'all'
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: seoErrors },
    setError,
    clearErrors,
    setValue,
    control,
    getValues
  } = methods

  const [getCms, { data: seoDataId }] = useLazyQuery(GET_CMS_BY_ID, {
    onCompleted: (data) => {
      if (data && data.getCMSPageById) {
        setCmsData(data.getCMSPageById)
        !cmsData && setCmsValue(data.getCMSPageById)
      }
    }
  })

  const [EditCmsMutation, { loading: editSeoLoader }] = useMutation(EDIT_CMS, {
    onCompleted: (data) => {
      if (data && data.editCMSPage) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editCMSPage.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
        allowUnsavedChangesNavigation()
        history.push(allRoutes.cms)
      }
    }
  })

  const [AddCmsMutation, { loading }] = useMutation(ADD_CMS, {
    onCompleted: (data) => {
      if (data && data.addCMSPage) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.addCMSPage.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
        allowUnsavedChangesNavigation()
        history.push(allRoutes.cms)
      }
    }
  })

  useEffect(() => {
    id && getCms({ variables: { input: { _id: id } } })
  }, [id])

  async function prepareSeoData(value) {
    const aComponents = (Array.isArray(value?.aComponents) ? value.aComponents : []).map(normalizeComponentSelection).filter(Boolean)
    const inputValue = {
      sTitle: value?.sTitle,
      sDescription: value?.sDescription,
      sContent: wrapTable(value?.sContent || ''),
      aComponents,
      oSeo: normalizeSeoForSubmit(value?.oSeo)
    }
    if (hasSelectedComponent(aComponents, 'cb')) inputValue.oCB = normalizeCareerBannerForSubmit(value?.oCB)
    if (id) {
      EditCmsMutation({ variables: { input: { _id: id, oInput: inputValue } } })
    } else {
      AddCmsMutation({ variables: { input: { oInput: inputValue } } })
    }
  }

  function setCmsValue(value) {
    reset({
      sTitle: value?.sTitle,
      sDescription: value?.sDescription || '',
      sContent: value?.sContent,
      oImg: removeTypeName(value?.oImg),
      aComponents: (Array.isArray(value?.aComponents) ? value.aComponents : []).map(normalizeCmsComponent),
      oCB: normalizeCareerBanner(value?.oCB),
      oSeo: {
        ...removeTypeName(value?.oSeo),
        aKeywords: value?.oSeo?.aKeywords ? value?.oSeo?.aKeywords.join(', ') : '',
        oFB: value?.oSeo?.oFB ? removeTypeName(value?.oSeo?.oFB) : '',
        oTwitter: value?.oSeo?.oTwitter ? removeTypeName(value?.oSeo?.oTwitter) : ''
      }
    })
  }

  const onAddSeo = (data) => {
    prepareSeoData(data)
  }
  function handleUpdateData(data) {
    setCmsData(data)
  }
  return (
    <FormProvider {...methods}>
      <Form className="page-component-editor-form page-component-editor-form--has-sticky-picker" onSubmit={handleSubmit(onAddSeo)}>
        <AddPageComponents
          control={control}
          error={seoErrors?.aComponents}
          name="aComponents"
          ePageComponentType={CMS_COMPONENT_PAGE_TYPE}
          allowedComponentTypes={CMS_ALLOWED_COMPONENT_TYPES}
          includeAllComponentTypes
          variant="sticky"
        />
        <Row>
          <Col md="12">
            <AddEditCms
              data={seoDataId && seoDataId?.getCMSPageById}
              register={register}
              errors={seoErrors}
              control={control}
              reset={reset}
              nameChanged={(e) => setName(e)}
            />
            <AddPageComponentsList name="aComponents" staticComponentGroup="articleDetail" />
            <input type="hidden" value="cms" {...register('oSeo.eType')} />
            <CommonSEO
              register={register}
              errors={seoErrors}
              values={getValues()}
              setError={setError}
              clearErrors={clearErrors}
              previewURL={cmsData?.oSeo?.oFB?.sUrl || cmsData?.oSeo?.oTwitter?.sUrl}
              fbImg={cmsData?.oSeo?.oFB?.sUrl}
              twitterImg={cmsData?.oSeo?.oTwitter?.sUrl}
              setValue={setValue}
              control={control}
              id={id}
              slugType={'cms'}
              slug={name}
              hidden
              defaultData={cmsData}
              onUpdateData={(e) => handleUpdateData(e)}
            />

            <div className="btn-bottom add-border mt-4 ">
              <Button variant="primary" type="submit" className="m-2" disabled={loading || editSeoLoader}>
                <FormattedMessage id={id ? 'update' : 'add'} />
                {(loading || editSeoLoader) && <Spinner animation="border" size="sm" />}
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </FormProvider>
  )
}

export default AddEditCmsView
