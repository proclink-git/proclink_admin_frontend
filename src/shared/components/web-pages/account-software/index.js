import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { Button, Form, Col, Row, Spinner, InputGroup } from 'react-bootstrap'
import { useMutation } from '@apollo/client'
import { useHistory, useParams } from 'react-router-dom'
import { useIntl } from 'react-intl'

import CommonSEO from 'shared/components/common-seo'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { allRoutes } from 'shared/constants/AllRoutes'
import { removeTypeName, removeTypenameKey } from 'shared/utils'
import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CommonInput from 'shared/components/common-input'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { EDIT_PAGE } from 'graph-ql/pages/mutation'
import EditorSectionNavigator from 'shared/components/editor-section-navigator'
import useEditorSectionNavigation from 'shared/components/editor-section-navigator/use-editor-section-navigation'
import { getEditorStaticSectionId } from 'shared/components/editor-section-navigator/utils'
import InputArrayBox from 'shared/components/input-array-box'
import ASIcon from './as-icons'
import CountInput from 'shared/components/count-input'
import PageUpdateActions from 'shared/components/web-pages/page-update-actions'

const editorSectionPrefix = 'services-page-editor'

function AccountSoftware({ pageData }) {
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'oAccountingSoftware.aData'
  })

  const { fields: highlightFields, append: highlightAppend, remove: highlightRemove } = useFieldArray({
    control,
    name: 'aHighlightText'
  })

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

  function getFormValue() {
    function getDate() {
      const d = removeTypenameKey(pageData?.oAccountingSoftware?.aData)
      if (d?.length) {
        return d?.map((i) => ({
          ...i,
          aIcon: i?.aIcon?.length ? i?.aIcon : [{ sUrl: '', sText: '' }]
        }))
      } else {
        return [{ sTitle: '', aIcon: [{ sUrl: '', sText: '' }] }]
      }
    }

    return {
      aHighlightText: pageData?.aHighlightText,
      sPageTitle: pageData?.sPageTitle,
      sPageDescription: pageData?.sPageDescription,
      ePageType: pageData?.ePageType,
      oImg: removeTypeName(pageData?.oImg),
      oAccountingSoftware: { aData: getDate() },
      oSeo: {
        ...removeTypeName(pageData?.oSeo),
        aKeywords: pageData?.oSeo?.aKeywords ? pageData?.oSeo?.aKeywords.join(', ') : '',
        oFB: pageData?.oSeo?.oFB ? removeTypeName(pageData?.oSeo?.oFB) : '',
        oTwitter: pageData?.oSeo?.oTwitter ? removeTypeName(pageData?.oSeo?.oTwitter) : ''
      }
    }
  }

  const onAddSeo = (data) => {
    prepareSeoData(data)
  }
  function handleUpdateData(data) {
    setCmsData(data)
  }

  const title = useWatch({
    control,
    name: 'sPageTitle',
    defaultValue: ''
  })

  const titleLength = (title?.replace('##', '') || '').length
  const maxHighlightLength = Math.max(0, 75 - titleLength)
  const watchedSections = useWatch({
    control,
    name: 'oAccountingSoftware.aData',
    defaultValue: values?.oAccountingSoftware?.aData || []
  }) || []
  const basicsSectionId = getEditorStaticSectionId(editorSectionPrefix, 'basics')
  const seoSectionId = getEditorStaticSectionId(editorSectionPrefix, 'seo')
  const sections = [
    {
      id: basicsSectionId,
      label: 'Page Basics'
    },
    ...fields.map((field, index) => ({
      id: getEditorStaticSectionId(editorSectionPrefix, `section-${field.id}`),
      label: watchedSections?.[index]?.sTitle?.trim() || `Section ${index + 1}`
    })),
    {
      id: seoSectionId,
      label: 'SEO'
    }
  ]
  const { activeSectionId, handleJumpToSection } = useEditorSectionNavigation(sections)

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(onAddSeo)}>
        <PageUpdateActions loading={editSeoLoader} />
        <Row>
          <Col sm="8">
            <div className="d-sm-none mb-3">
              <EditorSectionNavigator sections={sections} activeSectionId={activeSectionId} onJump={handleJumpToSection} mobileMode />
            </div>
            <div id={basicsSectionId} className="editor-section-target">
              <Form.Label className="text-uppercase small text-muted mb-3">Page Basics</Form.Label>
              <CountInput
                type="text"
                register={register('sPageTitle', {
                  required: validationErrors.required,
                  maxLength: { value: 100, message: validationErrors.maxLength(100) }
                })}
                maxWord={100}
                currentLength={values?.sPageTitle?.length || 0}
                error={errors}
                className={errors?.sPageTitle && 'error'}
                name="sPageTitle"
                label="Page Title*"
              />
              <Row>
                <Col xs={12}>
                  <Form.Label className="text-uppercase">Highlight Text</Form.Label>
                </Col>
                {highlightFields.map((field, i) => (
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
                          <Button onClick={() => highlightRemove(i)} variant="link" className="icon-right">
                            <i className="icon-delete"></i>
                          </Button>
                        )}
                      </InputGroup>
                    </Form.Group>
                  </Col>
                ))}
                <Col xs={12}>
                  <Button onClick={() => highlightAppend('')} variant="link" className="square add-media hover-none btn-sm">
                    <i className="icon-add" />
                    Add More
                  </Button>
                </Col>
              </Row>
              <CountInput
                type="text"
                register={register('sPageDescription', { maxLength: { value: 200, message: validationErrors.maxLength(200) } })}
                maxWord={200}
                currentLength={values?.sPageDescription?.length || 0}
                error={errors}
                className={errors?.sPageDescription && 'error'}
                name="sPageDescription"
                label="Page Sub Title"
              />
            </div>
            {fields?.map((item, index) => (
              <div
                key={item.id}
                id={getEditorStaticSectionId(editorSectionPrefix, `section-${item.id}`)}
                className="editor-section-target"
              >
                <InputArrayBox
                  actions={
                    <>
                      {index + 1 === fields.length && (
                        <Button
                          onClick={() => append({ sTitle: '', aIcon: [{ sUrl: '', sText: '' }] })}
                          variant="link"
                          size="sm"
                          className="square icon-btn"
                        >
                          <i className="icon-add d-block" />
                        </Button>
                      )}
                      {fields.length > 1 && (
                        <Button onClick={() => remove(index)} variant="link" size="sm" className="square icon-btn">
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
                    className={errors?.oAccountingSoftware?.aData?.[index]?.sTitle && 'error'}
                    validation={{ maxLength: { value: 100, message: validationErrors.maxLength(100) } }}
                    name={`oAccountingSoftware.aData[${index}].sTitle`}
                    label="Section Title"
                    required
                  />
                  <ASIcon parentIndex={index} />
                </InputArrayBox>
              </div>
            ))}
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
                // slug={name}
                hidden
                hideCustomSlug
                defaultData={cmsData}
                onUpdateData={(e) => handleUpdateData(e)}
              />
            </div>
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
              <div className="d-none d-sm-block mt-3">
                <EditorSectionNavigator sections={sections} activeSectionId={activeSectionId} onJump={handleJumpToSection} />
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
AccountSoftware.propTypes = {
  pageData: PropTypes.object.isRequired
}
export default AccountSoftware
