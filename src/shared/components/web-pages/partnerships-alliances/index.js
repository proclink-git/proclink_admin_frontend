import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { FormProvider, useForm } from 'react-hook-form'
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap'
import { useMutation } from '@apollo/client'
import { useHistory, useParams } from 'react-router-dom'
import { useIntl } from 'react-intl'

import CommonSEO from 'shared/components/common-seo'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { allRoutes } from 'shared/constants/AllRoutes'
import { removeTypeName, removeTypenameKey } from 'shared/utils'
import { EDIT_PAGE } from 'graph-ql/pages/mutation'
import AddPageComponentsList from 'shared/components/add-page-components/list'
import AddPageComponents from 'shared/components/add-page-components'
import EditorSectionNavigator from 'shared/components/editor-section-navigator'
import useEditorSectionNavigation from 'shared/components/editor-section-navigator/use-editor-section-navigation'
import { buildEditorSections, getEditorStaticSectionId } from 'shared/components/editor-section-navigator/utils'
import PageUpdateActions from 'shared/components/web-pages/page-update-actions'
import { useAllowUnsavedChangesNavigation } from 'shared/components/unsaved-changes'
import {
  buildPageNamespacePayload,
  findDuplicatePageComponentDataKeys,
  normalizeComponentSelectionForPayload,
  normalizePageComponentForForm,
  normalizePageNamespaceComponents
} from 'shared/components/page-components/registry'

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

function getDefaultLogo() {
  return {
    sName: '',
    oImg: getDefaultImage()
  }
}

function getDefaultFaqItem() {
  return {
    sQuestion: '',
    sAnswer: ''
  }
}

function getDefaultPartnershipsAlliancesPage() {
  return {
    oPAA: {
      sTitle: '',
      sDescription: '',
      oImg: getDefaultImage()
    },
    oPAL: {
      aLogo: [getDefaultLogo()]
    },
    oFAQ: {
      sTitle: '',
      sDescription: '',
      aFaq: [getDefaultFaqItem()]
    },
    oCB: {
      sTitle: '',
      sDescription: '',
      oImg: getDefaultImage(),
      aCta: [getDefaultCta()]
    },
    aComponent: []
  }
}

function normalizeImage(value = {}) {
  return {
    ...getDefaultImage(),
    ...(removeTypenameKey(value) || {})
  }
}

function normalizeArray(items, fallbackFactory, normalizeItem = (item) => item) {
  const nextItems = (Array.isArray(items) ? items : []).map((item) => normalizeItem(removeTypenameKey(item)))

  return nextItems.length ? nextItems : [fallbackFactory()]
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

function normalizeCta(cta = {}) {
  return {
    sLabel: cta?.sLabel || '',
    sUrl: cta?.sUrl || ''
  }
}

function normalizeLogo(logo = {}) {
  return {
    ...getDefaultLogo(),
    ...logo,
    oImg: normalizeImage(logo?.oImg)
  }
}

function normalizeFaqItem(faq = {}) {
  return {
    ...getDefaultFaqItem(),
    ...faq
  }
}

function normalizePageComponent(component = {}) {
  return normalizePageComponentForForm(component)
}

function normalizeComponentSelection(component = {}) {
  return normalizeComponentSelectionForPayload(component)
}

function cleanCtas(items = [], limit) {
  const nextItems = (Array.isArray(items) ? items : [])
    .map(normalizeCta)
    .filter((item) => item.sLabel || item.sUrl)

  return typeof limit === 'number' ? nextItems.slice(0, limit) : nextItems
}

function normalizePartnershipsAlliancesPage(partnershipsAlliancesPage = {}) {
  const data = removeTypenameKey(partnershipsAlliancesPage) || {}

  return normalizePageNamespaceComponents({
    ...getDefaultPartnershipsAlliancesPage(),
    ...data,
    oPAA: {
      sTitle: data?.oPAA?.sTitle || '',
      sDescription: data?.oPAA?.sDescription || '',
      oImg: normalizeImage(data?.oPAA?.oImg)
    },
    oPAL: {
      aLogo: normalizeArray(data?.oPAL?.aLogo, getDefaultLogo, normalizeLogo)
    },
    oFAQ: {
      sTitle: data?.oFAQ?.sTitle || '',
      sDescription: data?.oFAQ?.sDescription || '',
      aFaq: normalizeArray(data?.oFAQ?.aFaq, getDefaultFaqItem, normalizeFaqItem)
    },
    oCB: {
      sTitle: data?.oCB?.sTitle || '',
      sDescription: data?.oCB?.sDescription || '',
      oImg: normalizeImage(data?.oCB?.oImg),
      aCta: normalizeFixedArray(data?.oCB?.aCta, 1, getDefaultCta, normalizeCta)
    },
    aComponent: (Array.isArray(data?.aComponent) ? data.aComponent : []).map(normalizePageComponent)
  }, 'pa')
}

function normalizePartnershipsAlliancesPageForSubmit(partnershipsAlliancesPage = {}) {
  const data = removeTypenameKey(partnershipsAlliancesPage) || {}

  return {
    ...data,
    oPAA: {
      sTitle: data?.oPAA?.sTitle || '',
      sDescription: data?.oPAA?.sDescription || '',
      oImg: normalizeImage(data?.oPAA?.oImg)
    },
    oPAL: {
      aLogo: (Array.isArray(data?.oPAL?.aLogo) ? data.oPAL.aLogo : [])
        .map(normalizeLogo)
        .filter((logo) => logo?.sName || logo?.oImg?.sUrl)
    },
    oFAQ: {
      sTitle: data?.oFAQ?.sTitle || '',
      sDescription: data?.oFAQ?.sDescription || '',
      aFaq: (Array.isArray(data?.oFAQ?.aFaq) ? data.oFAQ.aFaq : [])
        .map(normalizeFaqItem)
        .filter((faq) => faq?.sQuestion || faq?.sAnswer)
    },
    oCB: {
      ...data?.oCB,
      oImg: normalizeImage(data?.oCB?.oImg),
      aCta: cleanCtas(data?.oCB?.aCta, 1)
    },
    aComponent: (Array.isArray(data?.aComponent) ? data.aComponent : []).map(normalizeComponentSelection).filter(Boolean)
  }
}

const editorSectionPrefix = 'partnerships-alliances-page-editor'

function PartnershipsAlliances({ pageData }) {
  const history = useHistory()
  const allowUnsavedChangesNavigation = useAllowUnsavedChangesNavigation()
  const [cmsData, setCmsData] = useState(pageData)
  const { id } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const close = useIntl().formatMessage({ id: 'close' })
  const methods = useForm({ mode: 'all', defaultValues: getFormValue() })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    setValue,
    control,
    getValues,
    watch
  } = methods

  const selectedComponents = watch('oPartnershipsAlliancesPage.aComponent') || []
  const sections = buildEditorSections({
    seoLabel: 'SEO',
    components: selectedComponents,
    anchorPrefix: editorSectionPrefix,
    includeBasics: false
  })
  const seoSectionId = getEditorStaticSectionId(editorSectionPrefix, 'seo')
  const { activeSectionId, handleJumpToSection } = useEditorSectionNavigation(sections)

  const [EditMutation, { loading: editSeoLoader }] = useMutation(EDIT_PAGE, {
    onCompleted: (data) => {
      if (data?.editPage) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editPage.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
        allowUnsavedChangesNavigation()
        history.push(allRoutes.listPage)
      }
    }
  })

  function prepareSeoData(value) {
    EditMutation({ variables: { input: { ...value, _id: id } } })
  }

  function getFormValue() {
    return {
      sTitle: pageData?.sTitle || '',
      sPageTitle: pageData?.sPageTitle || '',
      sPageDescription: pageData?.sPageDescription || '',
      ePageType: pageData?.ePageType || 'pa',
      oImg: pageData?.oImg ? removeTypeName(pageData?.oImg) : getDefaultImage(),
      oPartnershipsAlliancesPage: normalizePartnershipsAlliancesPage(pageData?.oPartnershipsAlliancesPage),
      oSeo: {
        ...removeTypeName(pageData?.oSeo),
        aKeywords: pageData?.oSeo?.aKeywords ? pageData?.oSeo?.aKeywords.join(', ') : '',
        oFB: pageData?.oSeo?.oFB ? removeTypeName(pageData?.oSeo?.oFB) : {},
        oTwitter: pageData?.oSeo?.oTwitter ? removeTypeName(pageData?.oSeo?.oTwitter) : {}
      }
    }
  }

  function onSubmit(data) {
    const duplicateDataKeys = findDuplicatePageComponentDataKeys(data?.oPartnershipsAlliancesPage?.aComponent, data?.ePageType || 'pa')
    if (duplicateDataKeys.length) {
      setError('oPartnershipsAlliancesPage.aComponent', {
        type: 'validate',
        message: 'Selected components contain duplicate data sections. Remove duplicate component types before saving.'
      })
      return
    }

    const nextData = {
      ...data,
      oPartnershipsAlliancesPage: buildPageNamespacePayload(normalizePartnershipsAlliancesPageForSubmit(data?.oPartnershipsAlliancesPage), data?.ePageType || 'pa')
    }

    prepareSeoData(nextData)
  }

  function handleUpdateData(data) {
    setCmsData(data)
  }

  return (
    <FormProvider {...methods}>
      <Form className="page-component-editor-form page-component-editor-form--has-sticky-picker" onSubmit={handleSubmit(onSubmit)}>
        <AddPageComponents
          control={control}
          error={errors?.oPartnershipsAlliancesPage?.aComponent}
          name="oPartnershipsAlliancesPage.aComponent"
          ePageComponentType={pageData?.ePageType || 'pa'}
          includeAllComponentTypes
          variant="sticky"
        />
        <Row>
          <Col lg="9">
            <div className="d-lg-none mb-3">
              <EditorSectionNavigator sections={sections} activeSectionId={activeSectionId} onJump={handleJumpToSection} mobileMode />
            </div>
            <AddPageComponentsList
              name="oPartnershipsAlliancesPage.aComponent"
              namespace="oPartnershipsAlliancesPage"
              pageType={pageData?.ePageType || 'pa'}
              anchorPrefix={editorSectionPrefix}
            />
            <div id={seoSectionId} className="editor-section-target mt-4">
              <Form.Label className="text-uppercase small text-muted mb-3">SEO</Form.Label>
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
                hidden
                hideCustomSlug
                defaultData={cmsData}
                onUpdateData={handleUpdateData}
              />
            </div>
          </Col>
          <Col lg="3" className="add-article">
            <div className="sticky-column">
              <div className="d-none d-lg-block">
                <EditorSectionNavigator sections={sections} activeSectionId={activeSectionId} onJump={handleJumpToSection} />
              </div>
              <div className="mt-3">
                <PageUpdateActions loading={editSeoLoader} />
              </div>
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

PartnershipsAlliances.propTypes = {
  pageData: PropTypes.object.isRequired
}

export default PartnershipsAlliances
