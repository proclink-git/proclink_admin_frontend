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
import {
  getDefaultAboutStatement,
  getDefaultBeliefItem,
  getDefaultCredibilityCard,
  getDefaultCta,
  getDefaultImage,
  getDefaultLeadershipCard,
  getDefaultMissionVisionItem,
  getDefaultOperationalInsightItem,
  getDefaultPictureFutureLines,
  PICTURE_FUTURE_LINE_COUNT,
  getDefaultWhoWeAreItem
} from 'shared/components/page-components/dynamic/about-page-static/utils'

function getDefaultAboutUs() {
  return {
    oAUH: {
      sTitle: '',
      aStatement: [getDefaultAboutStatement()]
    },
    oWWA: {
      sTitle: '',
      sDescription: '',
      aItem: [getDefaultWhoWeAreItem()]
    },
    oCAP: {
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultCredibilityCard()]
    },
    oWYP: {
      sTitle: '',
      sContent: '',
      sMediaUrl: '',
      sThumbnailUrl: '',
      eMediaType: 'v',
      oMedia: getDefaultImage(),
      oThumbnail: getDefaultImage()
    },
    oOIA: {
      sTitle: '',
      sDescription: '',
      aItem: [getDefaultOperationalInsightItem()]
    },
    oWBE: {
      sTitle: '',
      sDescription: '',
      oCta: getDefaultCta(),
      aItem: [getDefaultBeliefItem()]
    },
    oALP: {
      sTitle: '',
      sDescription: '',
      aCard: [getDefaultLeadershipCard()]
    },
    oHWC: {
      sTitle: '',
      sDescription: '',
      oImg: getDefaultImage(),
      sLeftContent: '',
      sRightContent: ''
    },
    oOMV: {
      sTitle: '',
      sDescription: '',
      aItem: [getDefaultMissionVisionItem()]
    },
    oPTF: {
      sTitle: '',
      aLine: getDefaultPictureFutureLines()
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

function normalizeTextArray(items = [], minItems = 1) {
  const nextItems = (Array.isArray(items) ? items : []).map((item) => String(item || ''))

  while (nextItems.length < minItems) {
    nextItems.push('')
  }

  return nextItems
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

function normalizeBannerMediaType(value) {
  if (value === 'i' || value === 'image') return 'i'
  if (value === 'v' || value === 'video') return 'v'

  return 'v'
}

function normalizePageComponent(component = {}) {
  return normalizePageComponentForForm(component)
}

function normalizeComponentSelection(component = {}) {
  return normalizeComponentSelectionForPayload(component)
}

function normalizeAboutStatement(statement = {}) {
  return {
    ...getDefaultAboutStatement(),
    ...statement
  }
}

function normalizeWhoWeAreItem(item = {}) {
  return {
    ...getDefaultWhoWeAreItem(),
    ...item,
    oImg: normalizeImage(item?.oImg)
  }
}

function normalizeCredibilityCard(card = {}) {
  return {
    ...getDefaultCredibilityCard(),
    ...card,
    sLabel: card?.sLabel || ''
  }
}

function normalizeOperationalInsightItem(item = {}) {
  return {
    ...getDefaultOperationalInsightItem(),
    ...item,
    oImg: normalizeImage(item?.oImg)
  }
}

function normalizeBeliefItem(item = {}) {
  return {
    ...getDefaultBeliefItem(),
    ...item
  }
}

function normalizeLeadershipCard(card = {}) {
  return {
    ...getDefaultLeadershipCard(),
    ...card,
    eTarget: card?.eTarget || '_self',
    oImg: normalizeImage(card?.oImg),
    oPopupImg: normalizeImage(card?.oPopupImg)
  }
}

function normalizeLeadershipCardForSubmit(card = {}) {
  const nextCard = normalizeLeadershipCard(card)
  return {
    ...nextCard,
    oPopupImg: nextCard?.oPopupImg?.sUrl ? nextCard.oPopupImg : null
  }
}

function normalizeMissionVisionItem(item = {}) {
  return {
    ...getDefaultMissionVisionItem(),
    ...item,
    oImg: normalizeImage(item?.oImg)
  }
}

function cleanTextArray(items = []) {
  return (Array.isArray(items) ? items : []).map((item) => String(item || '').trim()).filter(Boolean)
}

function cleanCtas(items = [], limit) {
  const nextItems = (Array.isArray(items) ? items : [])
    .map(normalizeCta)
    .filter((item) => item.sLabel || item.sUrl)

  return typeof limit === 'number' ? nextItems.slice(0, limit) : nextItems
}

function normalizeAboutUs(aboutUs = {}) {
  const data = removeTypenameKey(aboutUs) || {}
  const defaults = getDefaultAboutUs()
  const mediaUrl = data?.oWYP?.sMediaUrl || ''
  const thumbnailUrl = data?.oWYP?.sThumbnailUrl || ''

  return normalizePageNamespaceComponents({
    ...defaults,
    ...data,
    oAUH: {
      sTitle: data?.oAUH?.sTitle || '',
      aStatement: normalizeArray(data?.oAUH?.aStatement, getDefaultAboutStatement, normalizeAboutStatement)
    },
    oWWA: {
      sTitle: data?.oWWA?.sTitle || '',
      sDescription: data?.oWWA?.sDescription || '',
      aItem: normalizeArray(data?.oWWA?.aItem, getDefaultWhoWeAreItem, normalizeWhoWeAreItem)
    },
    oCAP: {
      sTitle: data?.oCAP?.sTitle || '',
      sDescription: data?.oCAP?.sDescription || '',
      aCard: normalizeArray(data?.oCAP?.aCard, getDefaultCredibilityCard, normalizeCredibilityCard)
    },
    oWYP: {
      sTitle: data?.oWYP?.sTitle || '',
      sContent: data?.oWYP?.sContent || '',
      sMediaUrl: mediaUrl,
      sThumbnailUrl: thumbnailUrl,
      eMediaType: normalizeBannerMediaType(data?.oWYP?.eMediaType),
      oMedia: normalizeImage({ sUrl: mediaUrl }),
      oThumbnail: normalizeImage({ sUrl: thumbnailUrl })
    },
    oOIA: {
      sTitle: data?.oOIA?.sTitle || '',
      sDescription: data?.oOIA?.sDescription || '',
      aItem: normalizeArray(data?.oOIA?.aItem, getDefaultOperationalInsightItem, normalizeOperationalInsightItem)
    },
    oWBE: {
      sTitle: data?.oWBE?.sTitle || '',
      sDescription: data?.oWBE?.sDescription || '',
      oCta: normalizeCta(data?.oWBE?.oCta),
      aItem: normalizeArray(data?.oWBE?.aItem, getDefaultBeliefItem, normalizeBeliefItem)
    },
    oALP: {
      sTitle: data?.oALP?.sTitle || '',
      sDescription: data?.oALP?.sDescription || '',
      aCard: normalizeArray(data?.oALP?.aCard, getDefaultLeadershipCard, normalizeLeadershipCard)
    },
    oHWC: {
      sTitle: data?.oHWC?.sTitle || '',
      sDescription: data?.oHWC?.sDescription || '',
      oImg: normalizeImage(data?.oHWC?.oImg),
      sLeftContent: data?.oHWC?.sLeftContent || '',
      sRightContent: data?.oHWC?.sRightContent || ''
    },
    oOMV: {
      sTitle: data?.oOMV?.sTitle || '',
      sDescription: data?.oOMV?.sDescription || '',
      aItem: normalizeArray(data?.oOMV?.aItem, getDefaultMissionVisionItem, normalizeMissionVisionItem)
    },
    oPTF: {
      sTitle: data?.oPTF?.sTitle || '',
      aLine: normalizeTextArray(data?.oPTF?.aLine, PICTURE_FUTURE_LINE_COUNT)
    },
    oCB: {
      sTitle: data?.oCB?.sTitle || '',
      sDescription: data?.oCB?.sDescription || '',
      oImg: normalizeImage(data?.oCB?.oImg),
      aCta: normalizeFixedArray(data?.oCB?.aCta, 1, getDefaultCta, normalizeCta)
    },
    aComponent: (Array.isArray(data?.aComponent) ? data.aComponent : []).map(normalizePageComponent)
  }, 'au')
}

function normalizeAboutUsForSubmit(aboutUs = {}) {
  const data = removeTypenameKey(aboutUs) || {}
  const hasMediaObject = Boolean(data?.oWYP?.oMedia)
  const hasThumbnailObject = Boolean(data?.oWYP?.oThumbnail)
  const whyProclinkMediaType = normalizeBannerMediaType(data?.oWYP?.eMediaType)

  return {
    ...data,
    oAUH: {
      sTitle: data?.oAUH?.sTitle || '',
      aStatement: (Array.isArray(data?.oAUH?.aStatement) ? data.oAUH.aStatement : [])
        .map(normalizeAboutStatement)
        .filter((statement) => statement?.sTitle || statement?.sDescription)
    },
    oWWA: {
      sTitle: data?.oWWA?.sTitle || '',
      sDescription: data?.oWWA?.sDescription || '',
      aItem: (Array.isArray(data?.oWWA?.aItem) ? data.oWWA.aItem : [])
        .map(normalizeWhoWeAreItem)
        .filter((item) => item?.sDescription || item?.oImg?.sUrl)
    },
    oCAP: {
      sTitle: data?.oCAP?.sTitle || '',
      sDescription: data?.oCAP?.sDescription || '',
      aCard: (Array.isArray(data?.oCAP?.aCard) ? data.oCAP.aCard : [])
        .map(normalizeCredibilityCard)
        .filter((card) => card?.sLabel || card?.sDescription)
    },
    oWYP: {
      sTitle: data?.oWYP?.sTitle || '',
      sContent: data?.oWYP?.sContent || '',
      sMediaUrl: hasMediaObject ? data?.oWYP?.oMedia?.sUrl || '' : data?.oWYP?.sMediaUrl || '',
      sThumbnailUrl: whyProclinkMediaType === 'v' ? (hasThumbnailObject ? data?.oWYP?.oThumbnail?.sUrl || '' : data?.oWYP?.sThumbnailUrl || '') : '',
      eMediaType: whyProclinkMediaType
    },
    oOIA: {
      sTitle: data?.oOIA?.sTitle || '',
      sDescription: data?.oOIA?.sDescription || '',
      aItem: (Array.isArray(data?.oOIA?.aItem) ? data.oOIA.aItem : [])
        .map(normalizeOperationalInsightItem)
        .filter((item) => item?.sTitle || item?.sDescription || item?.oImg?.sUrl)
    },
    oWBE: {
      sTitle: data?.oWBE?.sTitle || '',
      sDescription: data?.oWBE?.sDescription || '',
      oCta: normalizeCta(data?.oWBE?.oCta),
      aItem: (Array.isArray(data?.oWBE?.aItem) ? data.oWBE.aItem : [])
        .map(normalizeBeliefItem)
        .filter((item) => item?.sTitle || item?.sDescription)
    },
    oALP: {
      sTitle: data?.oALP?.sTitle || '',
      sDescription: data?.oALP?.sDescription || '',
      aCard: (Array.isArray(data?.oALP?.aCard) ? data.oALP.aCard : [])
        .map(normalizeLeadershipCardForSubmit)
        .filter((card) => card?.sName || card?.sDesignation || card?.sDescription || card?.sRedirectUrl || card?.oImg?.sUrl || card?.oPopupImg?.sUrl)
    },
    oHWC: {
      sTitle: data?.oHWC?.sTitle || '',
      sDescription: data?.oHWC?.sDescription || '',
      oImg: normalizeImage(data?.oHWC?.oImg),
      sLeftContent: data?.oHWC?.sLeftContent || '',
      sRightContent: data?.oHWC?.sRightContent || ''
    },
    oOMV: {
      sTitle: data?.oOMV?.sTitle || '',
      sDescription: data?.oOMV?.sDescription || '',
      aItem: (Array.isArray(data?.oOMV?.aItem) ? data.oOMV.aItem : [])
        .map(normalizeMissionVisionItem)
        .filter((item) => item?.sTitle || item?.sContent || item?.oImg?.sUrl)
    },
    oPTF: {
      sTitle: data?.oPTF?.sTitle || '',
      aLine: cleanTextArray(data?.oPTF?.aLine)
    },
    oCB: {
      sTitle: data?.oCB?.sTitle || '',
      sDescription: data?.oCB?.sDescription || '',
      oImg: normalizeImage(data?.oCB?.oImg),
      aCta: cleanCtas(data?.oCB?.aCta, 1)
    },
    aComponent: (Array.isArray(data?.aComponent) ? data.aComponent : []).map(normalizeComponentSelection).filter(Boolean)
  }
}

const editorSectionPrefix = 'about-page-editor'

function AboutUs({ pageData }) {
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

  const selectedComponents = watch('oAboutUs.aComponent') || []
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
      ePageType: pageData?.ePageType || 'au',
      oImg: pageData?.oImg ? removeTypeName(pageData?.oImg) : getDefaultImage(),
      oAboutUs: normalizeAboutUs(pageData?.oAboutUs),
      oSeo: {
        ...removeTypeName(pageData?.oSeo),
        aKeywords: pageData?.oSeo?.aKeywords ? pageData?.oSeo?.aKeywords.join(', ') : '',
        oFB: pageData?.oSeo?.oFB ? removeTypeName(pageData?.oSeo?.oFB) : {},
        oTwitter: pageData?.oSeo?.oTwitter ? removeTypeName(pageData?.oSeo?.oTwitter) : {}
      }
    }
  }

  function onSubmit(data) {
    const duplicateDataKeys = findDuplicatePageComponentDataKeys(data?.oAboutUs?.aComponent, data?.ePageType || 'au')
    if (duplicateDataKeys.length) {
      setError('oAboutUs.aComponent', {
        type: 'validate',
        message: 'Selected components contain duplicate data sections. Remove duplicate component types before saving.'
      })
      return
    }

    const nextData = {
      ...data,
      oAboutUs: buildPageNamespacePayload(normalizeAboutUsForSubmit(data?.oAboutUs), data?.ePageType || 'au')
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
          error={errors?.oAboutUs?.aComponent}
          name="oAboutUs.aComponent"
          ePageComponentType={pageData?.ePageType || 'au'}
          includeAllComponentTypes
          variant="sticky"
        />
        <Row>
          <Col lg="9">
            <div className="d-lg-none mb-3">
              <EditorSectionNavigator sections={sections} activeSectionId={activeSectionId} onJump={handleJumpToSection} mobileMode />
            </div>
            <AddPageComponentsList name="oAboutUs.aComponent" namespace="oAboutUs" pageType={pageData?.ePageType || 'au'} anchorPrefix={editorSectionPrefix} />
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

AboutUs.propTypes = {
  pageData: PropTypes.object.isRequired
}

export default AboutUs
