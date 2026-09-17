import React, { useContext, useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Form, Col, Row, Spinner } from 'react-bootstrap'
import { useMutation, useLazyQuery } from '@apollo/client'
import { useHistory, useParams } from 'react-router-dom'
import { FormattedMessage, useIntl } from 'react-intl'

import AddEditSeo from 'shared/components/add-edit-seo'
import CommonSEO from 'shared/components/common-seo'
import UpdateCache from 'shared/components/cache/updateCache'
import AddCache from 'shared/components/cache/addCache'
import { TOAST_TYPE, META_ROBOTS } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { allRoutes } from 'shared/constants/AllRoutes'
import { removeTypeName } from 'shared/utils'
import { GET_SEO_BY_ID, EDIT_SEO, ADD_SEO, GET_SEO_BY_SLUG } from 'graph-ql/settings/seo'
import { GENERATE_PRE_SIGNED } from 'graph-ql/generate-pre-signed-url'
import { getPreSignedData, uploadImage } from 'shared/functions/PreSignedData'
import { UPDATE_SEO } from 'graph-ql/add-update-seo/mutation'

function AddEditSeoView() {
  const history = useHistory()
  const [seoData, setSeoData] = useState({})
  const { id, type } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const { updateCacheData } = UpdateCache()
  const { addCacheData } = AddCache()
  const [isDisabled, setIsDisabled] = useState(false)
  const existSeoId = useRef()
  const existSeoType = useRef()
  const close = useIntl().formatMessage({ id: 'close' })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: seoErrors },
    setError,
    clearErrors,
    setValue,
    control,
    watch,
    getValues
  } = useForm({
    mode: 'all',
    defaultValues: {
      oFB: { sPicture: '' },
      oTwitter: { sPicture: '' },
      sCustomSlug: ''
    }
  })
  const [generatePreSignedUrl] = useMutation(GENERATE_PRE_SIGNED)

  const [getSeo, { data: seoDataId }] = useLazyQuery(GET_SEO_BY_ID, {
    onCompleted: (data) => {
      if (data && data.getSeoById) {
        setSeoData(data.getSeoById)
        setSeoValue(data.getSeoById)
      }
    }
  })
  const [getSeoBySlug] = useLazyQuery(GET_SEO_BY_SLUG, {
    onCompleted: (data) => {
      if (data && data.getSeoBySlug) {
        setSeoData(data.getSeoBySlug)
        setSeoValue(data.getSeoBySlug)
        setIsDisabled(true)
        existSeoId.current = data.getSeoBySlug.iId
        existSeoType.current = data.getSeoBySlug.eType
      }
    }
  })

  const [editSeoMutation, { loading: editSeoLoader }] = useMutation(EDIT_SEO, {
    onCompleted: (data) => {
      if (data && data.updateSeo) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.updateSeo.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
        history.push(allRoutes.seo)
      }
    },
    update: (cache, { data }) => {
      if (data.updateSeo) {
        updateCacheData(GET_SEO_BY_ID, { input: { _id: id } }, data.updateSeo.oData, 'getSeoById')
      }
    }
  })

  const [updateSeoMutation, { loading: updateSeoLoader }] = useMutation(UPDATE_SEO, {
    onCompleted: (data) => {
      if (data && data.editSeo) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editSeo.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
        history.push(allRoutes.seo)
      }
    },
    update: (cache, { data }) => {
      if (data.editSeo) {
        updateSeoMutation && updateCacheData(GET_SEO_BY_ID, { input: { _id: id } }, data.editSeo.oData, 'getSeoById')
      }
    }
  })

  const [addSeoMutation, { loading }] = useMutation(ADD_SEO, {
    onCompleted: (data) => {
      if (data && data.addSeo) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.addSeo.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
        history.push(allRoutes.seo)
      }
    },
    update: (cache, { data }) => {
      data && data.addSeo && addCacheData(GET_SEO_BY_ID, { input: { _id: data.addSeo.oData._id } }, data.addSeo.oData, 'getSeoById')
    }
  })

  useEffect(() => {
    id && getSeo({ variables: { input: { _id: id } } })
  }, [id])

  async function prepareSeoData(value) {
    const inputValue = {
      seoInput: {
        aKeywords: value?.oSeo?.aKeywords,
        oFB: value?.oSeo?.oFB,
        oTwitter: value?.oSeo?.oTwitter,
        sCUrl: value?.oSeo?.sCUrl,
        sDescription: value?.oSeo?.sDescription,
        sRobots: value?.oSeo?.sRobots,
        sSlug: value?.customSlug,
        sTitle: value?.oSeo?.sTitle,
        eType: seoData?.eType || 'cu'
      }
    }
    const formData = inputValue.seoInput
    if (
      (formData.oFB?.fSUrl && formData.oFB.fSUrl[0] instanceof File) ||
      (formData.oTwitter?.fSUrl && formData.oTwitter.fSUrl[0] instanceof File)
    ) {
      const { value, data: latestFormData } = getPreSignedData(formData)
      const allData = latestFormData
      const { data } = await generatePreSignedUrl({ variables: { generatePreSignedUrlInput: value } })
      if (data && data.generatePreSignedUrl) {
        const uploadData = []
        const urls = data.generatePreSignedUrl
        urls.forEach((e) => {
          if (e.sType === 'fb') {
            uploadData.push({ sUploadUrl: e.sUploadUrl, file: allData.oFB.fSUrl[0] })
            allData.oFB.sUrl = e.sS3Url
          } else {
            uploadData.push({ sUploadUrl: e.sUploadUrl, file: allData.oTwitter.fSUrl[0] })
            allData.oTwitter.sUrl = e.sS3Url
          }
        })
        uploadImage(uploadData)
          .then((res) => {
            addUpdateSeo({
              ...allData
            })
          })
          .catch((err) => {
            console.error('err', err)
          })
      }
    } else {
      addUpdateSeo({
        ...formData
      })
    }
  }
  function addUpdateSeo(value) {
    const data = { ...value, oFB: { ...value.oFB }, oTwitter: { ...value.oTwitter } }
    data.aKeywords = data.aKeywords ? data.aKeywords.split(',').map((w) => w.trim()) : []
    if (!data.sRobots) data.sRobots = META_ROBOTS[0]
    delete data.fb
    delete data.twitter
    delete data.oFB.fSUrl
    delete data.oTwitter.fSUrl
    if (existSeoType.current === 'st' || existSeoType.current === 'cu' || id) {
      editSeoMutation({ variables: { input: data } })
    } else if (existSeoId.current) {
      updateSeoMutation({ variables: { input: { ...data, iId: existSeoId.current } } })
    } else {
      addSeoMutation({ variables: { input: data } })
    }
  }
  function setSeoValue(value) {
    reset({
      customSlug: value?.sSlug,
      oSeo: {
        sTitle: value?.sTitle,
        sSlug: value?.sSlug,
        sDescription: value?.sDescription,
        aKeywords: value?.aKeywords ? value.aKeywords.join(', ') : '',
        sCUrl: value?.sCUrl,
        sRobots: value?.sRobots,
        oFB: value.oFB ? removeTypeName(value.oFB) : '',
        oTwitter: value.oTwitter ? removeTypeName(value.oTwitter) : ''
      }
    })
  }

  const onAddSeo = (data) => {
    prepareSeoData(data)
  }

  function handleUpdateData(data) {
    setSeoData(data)
  }
  return (
    <>
      <Form onSubmit={handleSubmit(onAddSeo)}>
        <Row>
          <Col sm="8">
            <AddEditSeo
              data={seoDataId && seoDataId?.getSeoById}
              register={register}
              errors={seoErrors}
              setValue={setValue}
              control={control}
              watch={watch}
              reset={reset}
              values={getValues()}
              getSeoBySlug={getSeoBySlug}
              disabled={isDisabled}
            />
            <CommonSEO
              register={register}
              errors={seoErrors}
              values={getValues()}
              setError={setError}
              clearErrors={clearErrors}
              previewURL={seoData?.oFB?.sUrl || seoData?.oTwitter?.sUrl}
              fbImg={seoData?.oFB?.sUrl}
              twitterImg={seoData?.oTwitter?.sUrl}
              setValue={setValue}
              control={control}
              id={id}
              slugType="cu"
              hidden
              defaultData={seoData}
              hideCustomSlug
              disabled={type === 'detail-seo'}
              onUpdateData={(e) => handleUpdateData(e)}
            />
          </Col>
          {type !== 'detail-seo' && (
            <div className="btn-bottom add-border mt-4 ">
              <Button variant="primary" type="submit" className="m-2" disabled={loading || editSeoLoader || updateSeoLoader}>
                <FormattedMessage id={id || existSeoType.current ? 'update' : 'add'} />
                {(loading || editSeoLoader || updateSeoLoader) && <Spinner animation="border" size="sm" />}
              </Button>
            </div>
          )}
        </Row>
      </Form>
    </>
  )
}

export default AddEditSeoView
