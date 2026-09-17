import React, { useContext, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import { useMarkFormClean } from 'shared/components/unsaved-changes'
import AddPageComponentsList from 'shared/components/add-page-components/list'
import AddPageComponents from 'shared/components/add-page-components'
import AddCategory from 'shared/components/add-category'
import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CountInput from 'shared/components/count-input'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { GET_HEADER_CATEGORY, UPDATE_HEADER_CATEGORY } from 'graph-ql/management/category'
import { removeTypenameKey } from 'shared/utils'
import {
  getDefaultRecommendedEditorialCard,
  getDefaultUpcomingWebinarCard
} from 'shared/components/page-components/dynamic/header-category-static/utils'
import {
  getPageComponentBasePath,
  getPageComponentDataKey,
  getPageComponentDefaultValue,
  getPageComponentStorageKey,
  mergeDefaultFormValue,
  normalizeComponentSelectionForPayload,
  normalizePageComponentForForm,
  normalizePageNamespaceComponents
} from 'shared/components/page-components/registry'
import ImageDimensionNote from 'shared/components/image-dimension-note'

const HEADER_CATEGORY_COMPONENT_EXCLUSIONS = {
  we: ['bwe']
}

function getDefaultImage() {
  return {
    sText: '',
    sCaption: '',
    sAttribute: '',
    sUrl: ''
  }
}

function getDefaultCta() {
  return {
    sLabel: '',
    sUrl: ''
  }
}

function getDefaultHeaderCategory(type = '') {
  const headerCategoryComponents = {
    oFCA: {
      sSectionTitle: '',
      sHeadline: '',
      sDescription: '',
      oImg: getDefaultImage(),
      aTags: [''],
      oCta: getDefaultCta()
    },
    oCB: {
      sTitle: '',
      sDescription: '',
      oImg: getDefaultImage(),
      aCta: [getDefaultCta()]
    },
    oUWB: {
      sSectionTitle: '',
      aCard: [getDefaultUpcomingWebinarCard()]
    },
    oREC: {
      sSectionTitle: '',
      aCard: [getDefaultRecommendedEditorialCard()]
    },
    oListingCopy: {
      sListingTitle: '',
      sListingDescription: ''
    }
  }

  return {
    sName: '',
    sSubTitle: '',
    sContent: '',
    eHeaderCategoryType: type,
    oImg: getDefaultImage(),
    oIcon: getDefaultImage(),
    aComponent: [],
    ...headerCategoryComponents,
    oComponents: headerCategoryComponents
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

function normalizeDateTimeDisplay(value) {
  if (!value) return ''

  const date = value instanceof Date ? value : new Date(isNaN(Number(value)) ? value : Number(value))

  return Number.isNaN(date.getTime()) ? '' : date.toISOString()
}

function normalizeUpcomingWebinarCard(card = {}) {
  return {
    oImg: normalizeImage(card?.oImg),
    sTitle: card?.sTitle || '',
    sTag: card?.sTag || '',
    sAuthorName: card?.sAuthorName || '',
    sAuthorDesignation: card?.sAuthorDesignation || '',
    oAuthorImg: normalizeImage(card?.oAuthorImg),
    sRedirectionUrl: card?.sRedirectionUrl || '',
    eTarget: card?.eTarget || '_self',
    dDateTimeDisplay: normalizeDateTimeDisplay(card?.dDateTimeDisplay)
  }
}

function normalizeRecommendedEditorialCard(card = {}) {
  return {
    sEyebrow: card?.sEyebrow || '',
    sTitle: card?.sTitle || '',
    sDescription: card?.sDescription || '',
    oImg: normalizeImage(card?.oImg)
  }
}

function normalizeArray(items, fallbackFactory, normalizeItem = (item) => item) {
  const nextItems = (Array.isArray(items) ? items : []).map((item) => normalizeItem(removeTypenameKey(item)))
  return nextItems.length ? nextItems : [fallbackFactory()]
}

function normalizeFixedArray(items, count, fallbackFactory, normalizeItem = (item) => item) {
  const nextItems = (Array.isArray(items) ? items : []).slice(0, count).map((item) => normalizeItem(removeTypenameKey(item)))

  while (nextItems.length < count) {
    nextItems.push(fallbackFactory())
  }

  return nextItems
}

function normalizeTextArray(items, fallbackCount = 1) {
  const nextItems = (Array.isArray(items) ? items : []).map((item) => String(item || ''))

  while (nextItems.length < fallbackCount) {
    nextItems.push('')
  }

  return nextItems
}

function normalizePageComponent(component = {}) {
  return normalizePageComponentForForm(component)
}

function normalizeComponentSelection(component = {}) {
  return normalizeComponentSelectionForPayload(component)
}

function filterHeaderCategoryComponents(components = [], type = '') {
  const excludedTypes = HEADER_CATEGORY_COMPONENT_EXCLUSIONS[type] || []

  return (Array.isArray(components) ? components : []).filter((component) => !excludedTypes.includes(component?.eType))
}

function hasFormValueChanged(currentValue, nextValue) {
  return JSON.stringify(currentValue || null) !== JSON.stringify(nextValue || null)
}

function cleanHeaderCategoryComponentPayloadValue(component = {}, value = {}) {
  const dataKey = getPageComponentDataKey(component)

  switch (dataKey) {
    case 'oFCA':
      return {
        sSectionTitle: value?.sSectionTitle || '',
        sHeadline: value?.sHeadline || '',
        sDescription: value?.sDescription || '',
        oImg: normalizeImage(value?.oImg),
        aTags: (Array.isArray(value?.aTags) ? value.aTags : []).map((tag) => String(tag || '').trim()).filter(Boolean),
        oCta: normalizeCta(value?.oCta)
      }
    case 'oCB':
      return {
        sTitle: value?.sTitle || '',
        sDescription: value?.sDescription || '',
        oImg: normalizeImage(value?.oImg),
        aCta: normalizeFixedArray(value?.aCta, 1, getDefaultCta, normalizeCta)
      }
    case 'oUWB':
      return {
        sSectionTitle: value?.sSectionTitle || '',
        aCard: (Array.isArray(value?.aCard) ? value.aCard : [])
          .map(normalizeUpcomingWebinarCard)
          .filter(
            (card) =>
              card?.sTitle ||
              card?.sTag ||
              card?.sAuthorName ||
              card?.sAuthorDesignation ||
              card?.sRedirectionUrl ||
              card?.dDateTimeDisplay ||
              card?.oImg?.sUrl ||
              card?.oAuthorImg?.sUrl
          )
      }
    case 'oREC':
      return {
        sSectionTitle: value?.sSectionTitle || '',
        aCard: (Array.isArray(value?.aCard) ? value.aCard : [])
          .map(normalizeRecommendedEditorialCard)
          .filter((card) => card?.sEyebrow || card?.sTitle || card?.sDescription || card?.oImg?.sUrl)
      }
    case 'oListingCopy':
      return {
        sListingTitle: value?.sListingTitle || '',
        sListingDescription: value?.sListingDescription || ''
      }
    default:
      return removeTypenameKey(value) || {}
  }
}

function getHeaderCategoryComponentValue(data = {}, component = {}) {
  const dataKey = getPageComponentDataKey(component)
  const storageKey = getPageComponentStorageKey(component, 'hc')
  const candidateKeys = [storageKey, dataKey].filter((key, index, keys) => key && keys.indexOf(key) === index)

  for (const key of candidateKeys) {
    if (data?.oComponents?.[key] !== undefined) return data.oComponents[key]
    if (data?.[key] !== undefined) return data[key]
  }

  return undefined
}

function buildHeaderCategoryComponentsPayload(components = [], normalizedData = {}) {
  return (Array.isArray(components) ? components : []).reduce((oComponents, component) => {
    const dataKey = getPageComponentDataKey(component)
    const storageKey = getPageComponentStorageKey(component, 'hc')
    if (!dataKey || !storageKey) return oComponents

    const componentValue = getHeaderCategoryComponentValue(normalizedData, component)
    oComponents[storageKey] = cleanHeaderCategoryComponentPayloadValue(component, componentValue || {})

    return oComponents
  }, {})
}

function normalizeHeaderCategoryFormData(value = {}, fallbackType = '') {
  const data = removeTypenameKey(value) || {}
  const defaultData = getDefaultHeaderCategory(data?.eHeaderCategoryType || fallbackType)
  const sourceComponents = removeTypenameKey(data?.oComponents || {}) || {}
  const getComponentValue = (key) => (sourceComponents?.[key] !== undefined ? sourceComponents[key] : data?.[key])

  return normalizePageNamespaceComponents({
    ...defaultData,
    ...data,
    sName: data?.sName || '',
    sSubTitle: data?.sSubTitle || '',
    sContent: data?.sContent || '',
    eHeaderCategoryType: data?.eHeaderCategoryType || fallbackType,
    oImg: normalizeImage(data?.oImg),
    oIcon: normalizeImage(data?.oIcon),
    aComponent: filterHeaderCategoryComponents(data?.aComponent, data?.eHeaderCategoryType || fallbackType).map(normalizePageComponent),
    oComponents: {
      ...sourceComponents,
      oFCA: {
        sSectionTitle: getComponentValue('oFCA')?.sSectionTitle || '',
        sHeadline: getComponentValue('oFCA')?.sHeadline || '',
        sDescription: getComponentValue('oFCA')?.sDescription || '',
        oImg: normalizeImage(getComponentValue('oFCA')?.oImg),
        aTags: normalizeTextArray(getComponentValue('oFCA')?.aTags),
        oCta: normalizeCta(getComponentValue('oFCA')?.oCta)
      },
      oCB: {
        sTitle: getComponentValue('oCB')?.sTitle || '',
        sDescription: getComponentValue('oCB')?.sDescription || '',
        oImg: normalizeImage(getComponentValue('oCB')?.oImg),
        aCta: normalizeFixedArray(getComponentValue('oCB')?.aCta, 1, getDefaultCta, normalizeCta)
      },
      oUWB: {
        sSectionTitle: getComponentValue('oUWB')?.sSectionTitle || '',
        aCard: normalizeArray(getComponentValue('oUWB')?.aCard, getDefaultUpcomingWebinarCard, normalizeUpcomingWebinarCard)
      },
      oREC: {
        sSectionTitle: getComponentValue('oREC')?.sSectionTitle || '',
        aCard: normalizeArray(getComponentValue('oREC')?.aCard, getDefaultRecommendedEditorialCard, normalizeRecommendedEditorialCard)
      },
      oListingCopy: {
        sListingTitle: getComponentValue('oListingCopy')?.sListingTitle || '',
        sListingDescription: getComponentValue('oListingCopy')?.sListingDescription || ''
      }
    }
  }, 'hc')
}

function normalizeHeaderCategoryForSubmit(value = {}, fallbackType = '') {
  const rawData = removeTypenameKey(value) || {}
  const eHeaderCategoryType = rawData?.eHeaderCategoryType || fallbackType
  const aComponent = filterHeaderCategoryComponents(rawData?.aComponent, eHeaderCategoryType).map(normalizeComponentSelection).filter(Boolean)

  const nextValue = {
    sName: rawData?.sName || '',
    sSubTitle: rawData?.sSubTitle || '',
    sContent: rawData?.sContent || '',
    eHeaderCategoryType,
    oImg: normalizeImage(rawData?.oImg),
    oIcon: normalizeImage(rawData?.oIcon),
    aComponent,
    oComponents: buildHeaderCategoryComponentsPayload(aComponent, rawData)
  }

  return nextValue
}

function HeaderCategoryEdit() {
  const { categoryType } = useParams()
  const methods = useForm({
    mode: 'all',
    defaultValues: getDefaultHeaderCategory(categoryType)
  })
  const { dispatch } = useContext(ToastrContext)
  const markFormClean = useMarkFormClean()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    getValues,
    clearErrors,
    control,
    watch
  } = methods
  const selectedComponents = watch('aComponent') || []

  const { loading: isFetching } = useQuery(GET_HEADER_CATEGORY, {
    variables: { input: { eHeaderCategoryType: categoryType } },
    onCompleted: (data) => {
      if (data?.getHeaderCategory) {
        reset(normalizeHeaderCategoryFormData(data.getHeaderCategory, categoryType))
      }
    }
  })

  const [editHeaderCategory, { loading: isSaving }] = useMutation(UPDATE_HEADER_CATEGORY, {
    onCompleted: (data) => {
      if (data?.editHeaderCategory) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editHeaderCategory.sMessage, type: TOAST_TYPE.Success }
        })
        markFormClean(reset, getValues)
      }
    }
  })

  function onSubmit(value) {
    clearErrors('aComponent')

    const inputValue = normalizeHeaderCategoryForSubmit(value, categoryType)
    editHeaderCategory({ variables: { input: inputValue } })
  }

  useEffect(() => {
    selectedComponents.forEach((component) => {
      const componentBasePath = getPageComponentBasePath(component, '', 'hc')
      if (!componentBasePath) return

      const currentValue = getValues(componentBasePath)
      const nextValue = mergeDefaultFormValue(currentValue, getPageComponentDefaultValue(component))

      if (hasFormValueChanged(currentValue, nextValue)) {
        setValue(componentBasePath, nextValue, { shouldDirty: false, shouldValidate: false })
      }
    })
  }, [selectedComponents, getValues, setValue])

  return (
    <FormProvider {...methods}>
      <Form className="page-component-editor-form page-component-editor-form--has-sticky-picker" onSubmit={handleSubmit(onSubmit)}>
        <AddPageComponents
          control={control}
          error={errors?.aComponent}
          name="aComponent"
          ePageComponentType="p"
          includeAllWithoutPermission
          variant="sticky"
        />
        <Row>
          <Col sm="8">
            <div className="mb-4">
              <Form.Label className="text-uppercase small text-muted mb-3">Header Category Basics</Form.Label>
              <input type="hidden" {...register('eHeaderCategoryType')} />
              <input type="hidden" {...register('sSubTitle')} />
              <input type="hidden" {...register('oIcon.sUrl')} />
              <input type="hidden" {...register('oIcon.sText')} />
              <input type="hidden" {...register('oIcon.sCaption')} />
              <input type="hidden" {...register('oIcon.sAttribute')} />
              <AddCategory register={register} errors={errors} control={control} nameChanged={() => {}} showSubTitle={false} />
              <CountInput
                type="textarea"
                textarea
                rows={5}
                register={register('sContent', { required: validationErrors.required })}
                error={errors}
                className={errors?.sContent && 'error'}
                name="sContent"
                label="Content*"
              />
            </div>

            <AddPageComponentsList name="aComponent" namespace="" pageType="hc" />
          </Col>

          <Col sm="4" className="add-article">
            <div className="sticky-column">
              <ImageDimensionNote width={1920} height={560} subject="header image" />
              <CategoryPlayerTeamImage
                galleryType="pb"
                title="Header Image"
                name="oImg"
                register={register}
                setValue={setValue}
                values={getValues()}
                errors={errors}
                clearErrors={clearErrors}
                hideAttribution
              />
            </div>
          </Col>
        </Row>

        <div className="btn-bottom add-border mt-4">
          <Button variant="primary" type="submit" className="m-2" disabled={isSaving || isFetching}>
            Update
            {(isSaving || isFetching) && <Spinner animation="border" size="sm" />}
          </Button>
        </div>
      </Form>
    </FormProvider>
  )
}

export default HeaderCategoryEdit
