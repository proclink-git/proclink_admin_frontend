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

function getDefaultVideo() {
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

function getDefaultContactSocialLink() {
  return {
    eType: '',
    sUrl: ''
  }
}

function getDefaultContactField() {
  return {
    sLabel: '',
    sPlaceholder: '',
    bRequired: false
  }
}

function getDefaultContactInfo() {
  return {
    sTitle: '',
    sContact: '',
    sEmail: ''
  }
}

function getDefaultContactUsPage() {
  return {
    oHPB: {
      sMediaUrl: '',
      eMediaType: 'v',
      oVideo: getDefaultVideo(),
      sEyebrow: '',
      sTitle: '',
      sDescription: '',
      aCta: []
    },
    oCUF: {
      sTitle: '',
      sDescription: '',
      sPhoneNumber: '',
      sEmail: '',
      aSocialLinks: [getDefaultContactSocialLink()],
      sDropdownLabel: '',
      aDropdownOptions: [''],
      aField: [getDefaultContactField()],
      oCta: getDefaultCta()
    },
    oCB: {
      sTitle: '',
      sDescription: '',
      oImg: getDefaultImage(),
      aCta: [getDefaultCta()]
    },
    oCCC: {
      aContact: [getDefaultContactInfo()]
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

function normalizeVideo(value = {}) {
  if (typeof value === 'string') {
    return {
      ...getDefaultVideo(),
      sUrl: value
    }
  }

  return {
    ...getDefaultVideo(),
    ...(removeTypenameKey(value) || {})
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

function normalizeArray(items, fallbackFactory, normalizeItem = (item) => item) {
  const nextItems = (Array.isArray(items) ? items : []).map((item) => normalizeItem(removeTypenameKey(item)))

  return nextItems.length ? nextItems : [fallbackFactory()]
}

function normalizeTextArray(items = []) {
  const nextItems = (Array.isArray(items) ? items : []).map((item) => String(item || ''))

  return nextItems.length ? nextItems : ['']
}

function normalizePageComponent(component = {}) {
  return normalizePageComponentForForm(component)
}

function normalizeComponentSelection(component = {}) {
  return normalizeComponentSelectionForPayload(component)
}

function normalizeBannerMediaType(value) {
  if (value === 'i' || value === 'image') return 'i'
  if (value === 'v' || value === 'video') return 'v'

  return 'v'
}

function normalizeCta(cta = {}) {
  return {
    sLabel: cta?.sLabel || '',
    sUrl: cta?.sUrl || ''
  }
}

function normalizeContactSocialLink(link = {}) {
  return {
    eType: link?.eType || '',
    sUrl: link?.sUrl || ''
  }
}

function normalizeContactField(field = {}) {
  return {
    sLabel: field?.sLabel || '',
    sPlaceholder: field?.sPlaceholder || '',
    bRequired: Boolean(field?.bRequired)
  }
}

function normalizeContactInfo(contact = {}) {
  return {
    sTitle: contact?.sTitle || '',
    sContact: contact?.sContact || '',
    sEmail: contact?.sEmail || ''
  }
}

function cleanCtas(items = [], limit) {
  const nextItems = (Array.isArray(items) ? items : [])
    .map(normalizeCta)
    .filter((item) => item.sLabel || item.sUrl)

  return typeof limit === 'number' ? nextItems.slice(0, limit) : nextItems
}

function normalizeContactUsPage(contactPage = {}) {
  const data = removeTypenameKey(contactPage) || {}
  const heroMediaUrl = data?.oHPB?.oVideo?.sUrl || data?.oHPB?.sMediaUrl || data?.oHPB?.sVideoUrl || ''

  return normalizePageNamespaceComponents({
    ...getDefaultContactUsPage(),
    ...data,
    oHPB: {
      ...getDefaultContactUsPage().oHPB,
      ...(data?.oHPB || {}),
      sMediaUrl: heroMediaUrl,
      eMediaType: normalizeBannerMediaType(data?.oHPB?.eMediaType),
      oVideo: normalizeVideo(data?.oHPB?.oVideo || data?.oHPB?.sMediaUrl || data?.oHPB?.sVideoUrl),
      aCta: cleanCtas(data?.oHPB?.aCta, 2)
    },
    oCUF: {
      ...getDefaultContactUsPage().oCUF,
      ...(data?.oCUF || {}),
      aSocialLinks: normalizeArray(data?.oCUF?.aSocialLinks, getDefaultContactSocialLink, normalizeContactSocialLink),
      aDropdownOptions: normalizeTextArray(data?.oCUF?.aDropdownOptions),
      aField: normalizeArray(data?.oCUF?.aField, getDefaultContactField, normalizeContactField),
      oCta: normalizeCta(data?.oCUF?.oCta)
    },
    oCB: {
      sTitle: data?.oCB?.sTitle || '',
      sDescription: data?.oCB?.sDescription || '',
      oImg: normalizeImage(data?.oCB?.oImg),
      aCta: normalizeFixedArray(data?.oCB?.aCta, 1, getDefaultCta, normalizeCta)
    },
    oCCC: {
      aContact: normalizeArray(data?.oCCC?.aContact, getDefaultContactInfo, normalizeContactInfo)
    },
    aComponent: (Array.isArray(data?.aComponent) ? data.aComponent : []).map(normalizePageComponent)
  }, 'cu')
}

function normalizeContactUsPageForSubmit(contactPage = {}) {
  const data = removeTypenameKey(contactPage) || {}
  const heroMediaUrl = data?.oHPB?.oVideo?.sUrl || data?.oHPB?.sMediaUrl || ''

  return {
    ...data,
    oHPB: {
      sMediaUrl: heroMediaUrl,
      eMediaType: normalizeBannerMediaType(data?.oHPB?.eMediaType),
      sEyebrow: data?.oHPB?.sEyebrow || '',
      sTitle: data?.oHPB?.sTitle || '',
      sDescription: data?.oHPB?.sDescription || '',
      aCta: cleanCtas(data?.oHPB?.aCta, 2)
    },
    oCUF: {
      sTitle: data?.oCUF?.sTitle || '',
      sDescription: data?.oCUF?.sDescription || '',
      sPhoneNumber: data?.oCUF?.sPhoneNumber || '',
      sEmail: data?.oCUF?.sEmail || '',
      aSocialLinks: (Array.isArray(data?.oCUF?.aSocialLinks) ? data.oCUF.aSocialLinks : [])
        .map(normalizeContactSocialLink)
        .filter((link) => link?.eType || link?.sUrl),
      sDropdownLabel: data?.oCUF?.sDropdownLabel || '',
      aDropdownOptions: (Array.isArray(data?.oCUF?.aDropdownOptions) ? data.oCUF.aDropdownOptions : [])
        .map((item) => String(item || '').trim())
        .filter(Boolean),
      aField: (Array.isArray(data?.oCUF?.aField) ? data.oCUF.aField : [])
        .map(normalizeContactField)
        .filter((field) => field?.sLabel || field?.sPlaceholder || field?.bRequired),
      oCta: normalizeCta(data?.oCUF?.oCta)
    },
    oCB: {
      ...data?.oCB,
      oImg: normalizeImage(data?.oCB?.oImg),
      aCta: cleanCtas(data?.oCB?.aCta, 1)
    },
    oCCC: {
      aContact: (Array.isArray(data?.oCCC?.aContact) ? data.oCCC.aContact : [])
        .map(normalizeContactInfo)
        .filter((contact) => contact?.sTitle || contact?.sContact || contact?.sEmail)
    },
    aComponent: (Array.isArray(data?.aComponent) ? data.aComponent : []).map(normalizeComponentSelection).filter(Boolean)
  }
}

const editorSectionPrefix = 'contact-page-editor'

function ContactUs({ pageData }) {
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

  const selectedComponents = watch('oContactUsPage.aComponent') || []
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
      ePageType: pageData?.ePageType || 'cu',
      oImg: pageData?.oImg ? removeTypeName(pageData?.oImg) : getDefaultImage(),
      oContactUsPage: normalizeContactUsPage(pageData?.oContactUsPage),
      oSeo: {
        ...removeTypeName(pageData?.oSeo),
        aKeywords: pageData?.oSeo?.aKeywords ? pageData?.oSeo?.aKeywords.join(', ') : '',
        oFB: pageData?.oSeo?.oFB ? removeTypeName(pageData?.oSeo?.oFB) : {},
        oTwitter: pageData?.oSeo?.oTwitter ? removeTypeName(pageData?.oSeo?.oTwitter) : {}
      }
    }
  }

  function onSubmit(data) {
    const duplicateDataKeys = findDuplicatePageComponentDataKeys(data?.oContactUsPage?.aComponent, data?.ePageType || 'cu')
    if (duplicateDataKeys.length) {
      setError('oContactUsPage.aComponent', {
        type: 'validate',
        message: 'Selected components contain duplicate data sections. Remove duplicate component types before saving.'
      })
      return
    }

    const nextData = {
      ...data,
      oContactUsPage: buildPageNamespacePayload(normalizeContactUsPageForSubmit(data?.oContactUsPage), data?.ePageType || 'cu')
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
          error={errors?.oContactUsPage?.aComponent}
          name="oContactUsPage.aComponent"
          ePageComponentType={pageData?.ePageType || 'cu'}
          includeAllComponentTypes
          variant="sticky"
        />
        <Row>
          <Col lg="9">
            <div className="d-lg-none mb-3">
              <EditorSectionNavigator sections={sections} activeSectionId={activeSectionId} onJump={handleJumpToSection} mobileMode />
            </div>
            <AddPageComponentsList name="oContactUsPage.aComponent" namespace="oContactUsPage" pageType={pageData?.ePageType || 'cu'} anchorPrefix={editorSectionPrefix} />
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

ContactUs.propTypes = {
  pageData: PropTypes.object.isRequired
}

export default ContactUs
