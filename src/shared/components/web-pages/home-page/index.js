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

function getDefaultImpactCard() {
  return {
    sTitle: '',
    sDescription: '',
    sNumber: ''
  }
}

function getDefaultSector() {
  return {
    sTitle: '',
    sSlug: '',
    sDescription: '',
    sMediaUrl: '',
    eMediaType: 'i',
    oMedia: getDefaultImage()
  }
}

function getDefaultLinkCard() {
  return {
    sTitle: '',
    sDescription: '',
    sRedirectUrl: '',
    eTarget: '_self',
    oImg: getDefaultImage()
  }
}

function getDefaultWhyProclinkCard() {
  return {
    ...getDefaultLinkCard(),
    eMediaType: 'i',
    sMediaUrl: ''
  }
}

function getDefaultProductCard() {
  return {
    sProductName: '',
    sTitle: '',
    sDescription: '',
    sRedirectUrl: '',
    eTarget: '_self',
    eMediaType: 'i',
    sMediaUrl: '',
    oImg: getDefaultImage()
  }
}

function getDefaultLogo() {
  return {
    oImg: getDefaultImage()
  }
}

function getDefaultInsightCard() {
  return {
    sBadge: '',
    sTitle: '',
    sRedirectUrl: '',
    oImg: getDefaultImage()
  }
}

function getDefaultTestimonial() {
  return {
    sName: '',
    sRole: '',
    sQuote: '',
    oImg: getDefaultImage()
  }
}

function getDefaultHomePage() {
  return {
    oHPB: {
      sMediaUrl: '',
      eMediaType: 'v',
      oVideo: getDefaultVideo(),
      sEyebrow: '',
      sTitle: '',
      sDescription: '',
      aCta: [getDefaultCta(), getDefaultCta()]
    },
    oMID: {
      sTitle: '',
      sDescription: '',
      oImg: getDefaultImage(),
      oVideo: getDefaultVideo()
    },
    oICD: {
      aCard: [getDefaultImpactCard()]
    },
    oSSC: {
      sMainDescription: '',
      aSector: [getDefaultSector()]
    },
    oSC: {
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultLinkCard()]
    },
    oPC: {
      sTitle: '',
      sDescription: '',
      sProductName: '',
      eMediaType: 'i',
      aCard: [getDefaultProductCard()]
    },
    oPS: {
      sBadge: '',
      sTitle: '',
      sDescription: '',
      aCta: [getDefaultCta()]
    },
    oTL: {
      sTitle: '',
      aLogo: [getDefaultLogo()]
    },
    oINS: {
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultInsightCard()]
    },
    oCB: {
      sTitle: '',
      sDescription: '',
      oImg: getDefaultImage(),
      aCta: [getDefaultCta()]
    },
    oTS: {
      sTitle: '',
      sDescription: '',
      aTestimonial: [getDefaultTestimonial()]
    },
    oWP: {
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultWhyProclinkCard()]
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

function normalizePageComponent(component = {}) {
  return normalizePageComponentForForm(component)
}

function normalizeLinkCard(card = {}) {
  return {
    ...getDefaultLinkCard(),
    ...card,
    eTarget: card?.eTarget || '_self',
    oImg: normalizeImage(card?.oImg)
  }
}

function normalizeWhyProclinkCard(card = {}) {
  const mediaUrl = card?.sMediaUrl || card?.oImg?.sUrl || card?.oMedia?.sUrl || card?.sUrl || ''

  return {
    ...getDefaultWhyProclinkCard(),
    ...card,
    eTarget: card?.eTarget || '_self',
    eMediaType: normalizeProductMediaType(card?.eMediaType),
    sMediaUrl: mediaUrl,
    oImg: {
      ...normalizeImage(card?.oImg || card?.oMedia),
      sUrl: mediaUrl
    }
  }
}

function normalizeProductCard(card = {}) {
  const mediaUrl = card?.sMediaUrl || card?.oImg?.sUrl || card?.sUrl || ''

  return {
    ...getDefaultProductCard(),
    ...card,
    eTarget: card?.eTarget || '_self',
    eMediaType: normalizeProductMediaType(card?.eMediaType),
    sMediaUrl: mediaUrl,
    oImg: {
      ...normalizeImage(card?.oImg),
      sUrl: mediaUrl
    }
  }
}

function normalizeProductMediaType(value = '') {
  if (value === 'v' || value === 'video') return 'v'
  return 'i'
}

function normalizeBannerMediaType(value) {
  if (value === 'i' || value === 'image') return 'i'
  if (value === 'v' || value === 'video') return 'v'

  return 'v'
}

function normalizeTestimonial(testimonial = {}) {
  return {
    ...getDefaultTestimonial(),
    ...testimonial,
    oImg: normalizeImage(testimonial?.oImg)
  }
}

function normalizeSectorMediaType(value = '') {
  if (value === 'i' || value === 'image') return 'i'
  if (value === 'v' || value === 'video') return 'v'

  return 'i'
}

function normalizeSector(sector = {}) {
  const mediaUrl = sector?.sMediaUrl || sector?.oMedia?.sUrl || sector?.oImg?.sUrl || sector?.sUrl || ''

  return {
    ...getDefaultSector(),
    sTitle: sector?.sTitle || '',
    sSlug: sector?.sSlug || '',
    sDescription: sector?.sDescription || '',
    sMediaUrl: mediaUrl,
    eMediaType: normalizeSectorMediaType(sector?.eMediaType),
    oMedia: {
      ...normalizeImage(sector?.oMedia || sector?.oImg),
      sUrl: mediaUrl
    }
  }
}

function normalizeHomePage(homePage = {}) {
  const data = removeTypenameKey(homePage) || {}
  const homeBannerMediaUrl = data?.oHPB?.oVideo?.sUrl || data?.oHPB?.sMediaUrl || data?.oHPB?.sVideoUrl || ''

  return normalizePageNamespaceComponents({
    ...getDefaultHomePage(),
    ...data,
    oHPB: {
      ...getDefaultHomePage().oHPB,
      ...(data?.oHPB || {}),
      sMediaUrl: homeBannerMediaUrl,
      eMediaType: normalizeBannerMediaType(data?.oHPB?.eMediaType),
      oVideo: normalizeVideo(data?.oHPB?.oVideo || data?.oHPB?.sMediaUrl || data?.oHPB?.sVideoUrl),
      aCta: normalizeFixedArray(data?.oHPB?.aCta, 2, getDefaultCta, (cta = {}) => ({
        sLabel: cta?.sLabel || '',
        sUrl: cta?.sUrl || ''
      }))
    },
    oMID: {
      ...getDefaultHomePage().oMID,
      ...(data?.oMID || {}),
      oImg: normalizeImage(data?.oMID?.oImg),
      oVideo: normalizeVideo(data?.oMID?.oVideo)
    },
    oICD: {
      aCard: normalizeArray(data?.oICD?.aCard, getDefaultImpactCard, (card = {}) => ({
        sTitle: card?.sTitle || '',
        sDescription: card?.sDescription || '',
        sNumber: card?.sNumber || ''
      }))
    },
    oSSC: {
      sMainDescription: data?.oSSC?.sMainDescription || '',
      aSector: normalizeArray(data?.oSSC?.aSector, getDefaultSector, normalizeSector)
    },
    oSC: {
      sTitle: data?.oSC?.sTitle || '',
      sDescription: data?.oSC?.sDescription || '',
      aCard: normalizeArray(data?.oSC?.aCard, getDefaultLinkCard, normalizeLinkCard)
    },
    oPC: {
      sTitle: data?.oPC?.sTitle || '',
      sDescription: data?.oPC?.sDescription || '',
      sProductName: data?.oPC?.sProductName || '',
      eMediaType: normalizeProductMediaType(data?.oPC?.eMediaType),
      aCard: normalizeArray(data?.oPC?.aCard, getDefaultProductCard, normalizeProductCard)
    },
    oPS: {
      sBadge: data?.oPS?.sBadge || '',
      sTitle: data?.oPS?.sTitle || '',
      sDescription: data?.oPS?.sDescription || '',
      aCta: normalizeArray(data?.oPS?.aCta, getDefaultCta, (cta = {}) => ({
        sLabel: cta?.sLabel || '',
        sUrl: cta?.sUrl || ''
      }))
    },
    oTL: {
      sTitle: data?.oTL?.sTitle || '',
      aLogo: normalizeArray(data?.oTL?.aLogo, getDefaultLogo, (logo = {}) => ({
        oImg: normalizeImage(logo?.oImg)
      }))
    },
    oINS: {
      sTitle: data?.oINS?.sTitle || '',
      sDescription: data?.oINS?.sDescription || '',
      aCard: normalizeArray(data?.oINS?.aCard, getDefaultInsightCard, (card = {}) => ({
        sBadge: card?.sBadge || '',
        sTitle: card?.sTitle || '',
        sRedirectUrl: card?.sRedirectUrl || '',
        oImg: normalizeImage(card?.oImg)
      }))
    },
    oCB: {
      sTitle: data?.oCB?.sTitle || '',
      sDescription: data?.oCB?.sDescription || '',
      oImg: normalizeImage(data?.oCB?.oImg),
      aCta: normalizeFixedArray(data?.oCB?.aCta, 1, getDefaultCta, (cta = {}) => ({
        sLabel: cta?.sLabel || '',
        sUrl: cta?.sUrl || ''
      }))
    },
    oTS: {
      sTitle: data?.oTS?.sTitle || '',
      sDescription: data?.oTS?.sDescription || '',
      aTestimonial: normalizeArray(data?.oTS?.aTestimonial, getDefaultTestimonial, normalizeTestimonial)
    },
    oWP: {
      sTitle: data?.oWP?.sTitle || '',
      sDescription: data?.oWP?.sDescription || '',
      aCard: normalizeArray(data?.oWP?.aCard, getDefaultWhyProclinkCard, normalizeWhyProclinkCard)
    },
    aComponent: (Array.isArray(data?.aComponent) ? data.aComponent : []).map(normalizePageComponent)
  }, 'h')
}

function normalizeComponentSelection(component = {}) {
  return normalizeComponentSelectionForPayload(component)
}

function cleanCtas(items = [], limit) {
  const nextItems = (Array.isArray(items) ? items : [])
    .map((item) => ({
      sLabel: item?.sLabel || '',
      sUrl: item?.sUrl || ''
    }))
    .filter((item) => item.sLabel || item.sUrl)

  return typeof limit === 'number' ? nextItems.slice(0, limit) : nextItems
}

function normalizeHomePageForSubmit(homePage = {}) {
  const data = removeTypenameKey(homePage) || {}
  const homeBannerMediaUrl = data?.oHPB?.oVideo?.sUrl || data?.oHPB?.sMediaUrl || ''

  return {
    ...data,
    oHPB: {
      sMediaUrl: homeBannerMediaUrl,
      eMediaType: normalizeBannerMediaType(data?.oHPB?.eMediaType),
      sEyebrow: data?.oHPB?.sEyebrow || '',
      sTitle: data?.oHPB?.sTitle || '',
      sDescription: data?.oHPB?.sDescription || '',
      aCta: cleanCtas(data?.oHPB?.aCta, 2)
    },
    oMID: {
      ...data?.oMID,
      oImg: normalizeImage(data?.oMID?.oImg),
      oVideo: data?.oMID?.oVideo?.sUrl ? normalizeVideo(data?.oMID?.oVideo) : {}
    },
    oPS: {
      ...data?.oPS,
      aCta: cleanCtas(data?.oPS?.aCta, 1)
    },
    oCB: {
      ...data?.oCB,
      oImg: normalizeImage(data?.oCB?.oImg),
      aCta: cleanCtas(data?.oCB?.aCta, 1)
    },
    oTS: {
      ...data?.oTS,
      aTestimonial: (Array.isArray(data?.oTS?.aTestimonial) ? data?.oTS?.aTestimonial : []).map((testimonial = {}) => ({
        sName: testimonial?.sName || '',
        sRole: testimonial?.sRole || '',
        sQuote: testimonial?.sQuote || '',
        oImg: normalizeImage(testimonial?.oImg)
      }))
    },
    aComponent: (Array.isArray(data?.aComponent) ? data.aComponent : []).map(normalizeComponentSelection).filter(Boolean)
  }
}

const editorSectionPrefix = 'home-page-editor'

function HomePage({ pageData }) {
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

  const selectedComponents = watch('oHomePage.aComponent') || []
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
      ePageType: pageData?.ePageType || 'h',
      oImg: pageData?.oImg ? removeTypeName(pageData?.oImg) : getDefaultImage(),
      oHomePage: normalizeHomePage(pageData?.oHomePage),
      oSeo: {
        ...removeTypeName(pageData?.oSeo),
        aKeywords: pageData?.oSeo?.aKeywords ? pageData?.oSeo?.aKeywords.join(', ') : '',
        oFB: pageData?.oSeo?.oFB ? removeTypeName(pageData?.oSeo?.oFB) : {},
        oTwitter: pageData?.oSeo?.oTwitter ? removeTypeName(pageData?.oSeo?.oTwitter) : {}
      }
    }
  }

  function onSubmit(data) {
    const duplicateDataKeys = findDuplicatePageComponentDataKeys(data?.oHomePage?.aComponent, data?.ePageType || 'h')
    if (duplicateDataKeys.length) {
      setError('oHomePage.aComponent', {
        type: 'validate',
        message: 'Selected components contain duplicate data sections. Remove duplicate component types before saving.'
      })
      return
    }

    const nextData = {
      ...data,
      oHomePage: buildPageNamespacePayload(normalizeHomePageForSubmit(data?.oHomePage), data?.ePageType || 'h')
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
          error={errors?.oHomePage?.aComponent}
          name="oHomePage.aComponent"
          ePageComponentType={pageData?.ePageType || 'h'}
          includeAllComponentTypes
          variant="sticky"
        />
        <Row>
          <Col lg="9">
            <div className="d-lg-none mb-3">
              <EditorSectionNavigator sections={sections} activeSectionId={activeSectionId} onJump={handleJumpToSection} mobileMode />
            </div>
            <AddPageComponentsList name="oHomePage.aComponent" namespace="oHomePage" pageType={pageData?.ePageType || 'h'} anchorPrefix={editorSectionPrefix} />
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

HomePage.propTypes = {
  pageData: PropTypes.object.isRequired
}

export default HomePage
