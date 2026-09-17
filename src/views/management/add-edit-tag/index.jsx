import React, { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Form, Col, Spinner, Row } from 'react-bootstrap'
import { useMutation, useLazyQuery } from '@apollo/client'
import { useHistory, useParams } from 'react-router-dom'
import { FormattedMessage, useIntl } from 'react-intl'

import AddTag from 'shared/components/tags'
import CommonSEO from 'shared/components/common-seo'
import { ADD_TAG_MUTATION, EDIT_TAG_MUTATION } from 'graph-ql/management/tag/mutation'
import { GET_TAG_BY_ID } from 'graph-ql/management/tag/query'
import { KNOWLEDGE_CENTER_URL, TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { allRoutes } from 'shared/constants/AllRoutes'
import { removeTypeName, removeTypenameKey } from 'shared/utils'
import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'

function AddEditTag() {
  const history = useHistory()
  const [name, setName] = useState()
  const [tagData, setTagData] = useState()
  const { id } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const close = useIntl().formatMessage({ id: 'close' })
  const [defaultURL] = useState(`${KNOWLEDGE_CENTER_URL}tag/`)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: tagErrors },
    setError,
    clearErrors,
    setValue,
    control,
    getValues: tagSEOValue
  } = useForm({
    mode: 'all',
    defaultValues: {
      oSeo: {
        eType: 'gt',
        oFB: { sUrl: '' },
        oTwitter: { sUrl: '' }
      }
    }
  })

  const [getTag] = useLazyQuery(GET_TAG_BY_ID, {
    onCompleted: (data) => {
      if (data && data.getTagById) {
        setTagData(data.getTagById)
        !tagData && setTagValue(removeTypenameKey(data.getTagById))
      }
    }
  })

  const [AddTagMutation, { loading }] = useMutation(ADD_TAG_MUTATION, {
    onCompleted: (data) => {
      if (data && data.addTag) {
        history.push(`${allRoutes.tags}?getTagsPaginationInput=i&nSkip=1`)
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.addTag.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
      }
    }
  })

  const [EditTagMutation, { loading: editTagLoader }] = useMutation(EDIT_TAG_MUTATION, {
    onCompleted: (data) => {
      if (data && data.editTag) {
        history.push(allRoutes.tags)
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editTag.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
      }
    }
  })

  useEffect(() => {
    id && getTag({ variables: { input: { _id: id } } })
  }, [id])

  function prepareTagData(value) {
    const data = JSON.parse(JSON.stringify(value))
    const inputValue = {
      sName: data.sName,
      sContent: data.sContent,
      sSubTitle: data?.sSubTitle,
      oImg: value.oImg
    }
    delete data.oSeo._id
    delete data.oSeo.iId
    data.oSeo = {
      ...data?.oSeo,
      sSlug: defaultURL ? defaultURL + data?.oSeo?.sSlug : data?.oSeo?.sSlug
    }
    if (id) {
      EditTagMutation({ variables: { input: { tagsInput: inputValue, _id: id, oSeo: data?.oSeo } } })
    } else {
      AddTagMutation({ variables: { input: { tagsInput: inputValue, oSeo: data?.oSeo } } })
    }
  }

  const onAddTag = (data) => {
    prepareTagData(data)
  }

  function setTagValue(value) {
    reset({
      sName: value?.sName,
      sContent: value?.sContent,
      sSubTitle: value?.sSubTitle,
      oImg: removeTypeName(value.oImg),
      oSeo: {
        ...value?.oSeo,
        sSlug: value?.oSeo?.sSlug?.substring(value.oSeo.sSlug.lastIndexOf('/') + 1),
        aKeywords: value?.oSeo?.aKeywords ? value.oSeo.aKeywords.join(', ') : ''
      }
    })
  }

  function handleUpdateData(data) {
    setTagData(data)
  }
  return (
    <>
      <Form onSubmit={handleSubmit(onAddTag)}>
        <Row>
          <Col sm="8">
            <AddTag register={register} errors={tagErrors} control={control} nameChanged={(e) => !id && !name && setName(e)} name={name} />
            <CommonSEO
              register={register}
              errors={tagErrors}
              values={tagSEOValue()}
              setError={setError}
              clearErrors={clearErrors}
              previewURL={tagData?.oSeo?.oFB?.sUrl || tagData?.oSeo?.oTwitter?.sUrl || tagData?.oImg?.sUrl}
              fbImg={tagData?.oSeo?.oFB?.sUrl}
              twitterImg={tagData?.oSeo?.oTwitter?.sUrl}
              setValue={setValue}
              control={control}
              id={id}
              slugType={'gt'}
              slug={name && defaultURL ? `${defaultURL}${name}` : name || undefined}
              hidden
              categoryURL={defaultURL}
              defaultData={tagData}
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
                values={tagSEOValue()}
                errors={tagErrors}
                required
                // imgUrl={categoryData?.oImg?.sUrl}
              />
            </div>
          </Col>
          <div className="btn-bottom add-border mt-4">
            <Button variant="primary" type="submit" disabled={loading || editTagLoader}>
              <FormattedMessage id={id ? 'update' : 'add'} />
              {(loading || editTagLoader) && <Spinner animation="border" size="sm" />}
            </Button>
          </div>
        </Row>
      </Form>
    </>
  )
}

export default AddEditTag
