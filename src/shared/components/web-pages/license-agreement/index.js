import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { useFieldArray, useForm } from 'react-hook-form'
import { Button, Form, Col, Row, Spinner } from 'react-bootstrap'
import { useMutation } from '@apollo/client'
import { useHistory, useParams } from 'react-router-dom'
import { useIntl } from 'react-intl'

import CommonSEO from 'shared/components/common-seo'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { allRoutes } from 'shared/constants/AllRoutes'
import { removeTypeName, removeTypenameKey } from 'shared/utils'
import CommonInput from 'shared/components/common-input'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { EDIT_PAGE } from 'graph-ql/pages/mutation'
import InputArrayBox from 'shared/components/input-array-box'
import CountInput from 'shared/components/count-input'
import PageUpdateActions from 'shared/components/web-pages/page-update-actions'

function LicenseAgreement({ pageData }) {
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
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'oLicenseAgreement.aAccordion'
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
    return {
      sPageTitle: pageData?.sPageTitle,
      sPageDescription: pageData?.sPageDescription,
      ePageType: pageData?.ePageType,
      oImg: removeTypeName(pageData?.oImg),
      oLicenseAgreement: removeTypenameKey(pageData?.oLicenseAgreement),
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
  return (
    <>
      <Form onSubmit={handleSubmit(onAddSeo)}>
        <PageUpdateActions loading={editSeoLoader} />
        <Row>
          <Col sm="8">
            <CountInput
              type="text"
              register={register('sPageTitle', {
                required: validationErrors.required,
                maxLength: { value: 100, message: validationErrors.maxLength(100) }
              })}
              maxWord={100}
              currentLength={values?.sPageTitle?.length}
              error={errors}
              className={errors?.sPageTitle && 'error'}
              name="sPageTitle"
              label="Page Title*"
            />
            <CountInput
              type="textarea"
              register={register('sPageDescription', {
                maxLength: { value: 200, message: validationErrors.maxLength(200) }
              })}
              maxWord={200}
              currentLength={values?.sPageDescription?.length}
              error={errors}
              className={errors?.sPageDescription && 'error'}
              name="sPageDescription"
              label="Page Sub Title"
            />
            <CommonInput
              type="text"
              register={register}
              errors={errors}
              className={errors?.oLicenseAgreement?.sTitle && 'error'}
              name="oLicenseAgreement.sTitle"
              label="Title"
              // required
            />
            <CommonInput
              type="textarea"
              register={register}
              errors={errors}
              className={errors?.oLicenseAgreement?.sDescription && 'error'}
              name="oLicenseAgreement.sDescription"
              label="Description"
              // required
            />
            {fields.map((field, index) => (
              <InputArrayBox
                key={field.id}
                className="mb-3"
                actions={
                  <>
                    <Button onClick={() => append({ sTitle: '', sDescription: '' })} variant="link" size="sm" className="square icon-btn">
                      <i className="icon-add d-block" />
                    </Button>
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
                  className={errors?.oLicenseAgreement?.aAccordion?.[index]?.sTitle && 'error'}
                  name={`oLicenseAgreement.aAccordion.[${index}].sTitle`}
                  label="Title"
                  required
                />
                <CommonInput
                  type="textarea"
                  register={register}
                  errors={errors}
                  className={errors?.oLicenseAgreement?.aAccordion?.[index]?.sDescription && 'error'}
                  displayClass="mb-0"
                  name={`oLicenseAgreement.aAccordion.[${index}].sDescription`}
                  label="Description"
                  // validation={{ minLength: { value: 50, message: validationErrors.minLength(50) } }}
                  required
                />
              </InputArrayBox>
            ))}
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
              hideCustomSlug
              hidden
              defaultData={cmsData}
              onUpdateData={(e) => handleUpdateData(e)}
            />
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
LicenseAgreement.propTypes = {
  pageData: PropTypes.object.isRequired
}
export default LicenseAgreement
