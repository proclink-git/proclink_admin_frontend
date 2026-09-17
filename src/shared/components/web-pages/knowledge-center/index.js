/* eslint-disable no-unused-vars */
import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { Button, Form, Col, Row, Spinner, InputGroup } from 'react-bootstrap'
import { useMutation } from '@apollo/client'
import { useHistory, useParams } from 'react-router-dom'
import { useIntl } from 'react-intl'

import CommonSEO from 'shared/components/common-seo'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { allRoutes } from 'shared/constants/AllRoutes'
import { removeTypeName } from 'shared/utils'
import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { EDIT_PAGE } from 'graph-ql/pages/mutation'
import CountInput from 'shared/components/count-input'
import PageUpdateActions from 'shared/components/web-pages/page-update-actions'

function KnowledgeCenter({ pageData }) {
  const history = useHistory()
  const [cmsData, setCmsData] = useState(pageData)
  const { id } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const close = useIntl().formatMessage({ id: 'close' })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    setValue,
    control,
    getValues
  } = useForm({
    mode: 'all',
    defaultValues: getFormValue()
  })
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

  function getFormValue() {
    return {
      sPageTitle: pageData?.sPageTitle,
      sPageDescription: pageData?.sPageDescription,
      ePageType: pageData?.ePageType,
      aHighlightText: pageData?.aHighlightText,
      oImg: removeTypeName(pageData?.oImg),
      oSeo: {
        ...removeTypeName(pageData?.oSeo),
        aKeywords: pageData?.oSeo?.aKeywords ? pageData?.oSeo?.aKeywords.join(', ') : '',
        oFB: pageData?.oSeo?.oFB ? removeTypeName(pageData?.oSeo?.oFB) : '',
        oTwitter: pageData?.oSeo?.oTwitter ? removeTypeName(pageData?.oSeo?.oTwitter) : ''
      }
    }
  }

  const title = useWatch({
    control,
    name: 'sPageTitle',
    defaultValue: ''
  })

  const titleLength = (title?.replace('##', '') || '').length
  const maxHighlightLength = Math.max(0, 75 - titleLength)

  const onAddSeo = (data) => {
    prepareSeoData(data)
  }
  function handleUpdateData(data) {
    setCmsData(data)
  }

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'aHighlightText'
  })

  return (
    <>
      <Form onSubmit={handleSubmit(onAddSeo)}>
        <PageUpdateActions loading={editSeoLoader} />
        <Row>
          <Col sm="8">

            <CountInput
              type="text"
              register={register('sPageDescription', { maxLength: { value: 200, message: validationErrors.maxLength(200) } })}
              maxWord={200}
              currentLength={values?.sPageDescription?.length || 0}
              error={errors}
              className={errors?.sPageDescription && 'error'}
              name="sPageDescription"
              label="Page Title"
            />
            <Row>
              <Col xs={12}>
                <Form.Label className="text-uppercase">Highlight Text</Form.Label>
              </Col>
              {fields.map((field, i) => (
                <Col key={field.id} sm="4">
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
              label="Page Sub Title"
            />
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
    </>
  )
}
KnowledgeCenter.propTypes = {
  pageData: PropTypes.object.isRequired
}
export default KnowledgeCenter
