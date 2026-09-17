import React, { useContext } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { useFieldArray, useForm } from 'react-hook-form'
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { useHistory } from 'react-router'
import { useParams } from 'react-router-dom'

import { EDIT_PAGE_COMPONENT } from 'graph-ql/page-components/mutation'
import { GET_PAGE_COMPONENT } from 'graph-ql/page-components/query'
import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import { ToastrContext } from 'shared/components/toastr'
import TitleFormatHint from 'shared/components/title-format-hint'
import { TOAST_TYPE } from 'shared/constants'
import { allRoutes } from 'shared/constants/AllRoutes'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { removeTypenameKey } from 'shared/utils'

function getDefaultImage() {
  return {
    sUrl: '',
    sText: '',
    sCaption: '',
    sAttribute: ''
  }
}

function getDefaultCard() {
  return {
    sTitle: '',
    sDescription: '',
    sRedirectUrl: '',
    eTarget: '_self',
    eMediaType: 'i',
    sMediaUrl: '',
    oImg: getDefaultImage()
  }
}

function getDefaultCards() {
  return Array.from({ length: 4 }, () => getDefaultCard())
}

function normalizeCard(card = {}) {
  const mediaUrl = card?.sMediaUrl || card?.oImg?.sUrl || card?.oMedia?.sUrl || card?.sUrl || ''

  return {
    sTitle: card?.sTitle || '',
    sDescription: card?.sDescription || '',
    sRedirectUrl: card?.sRedirectUrl || '',
    eTarget: card?.eTarget || '_self',
    eMediaType: normalizeMediaType(card?.eMediaType),
    sMediaUrl: mediaUrl,
    oImg: {
      ...getDefaultImage(),
      ...(card?.oImg || card?.oMedia || {}),
      sUrl: mediaUrl
    }
  }
}

function normalizeMediaType(value = '') {
  if (value === 'v' || value === 'video') return 'v'
  return 'i'
}

function normalizeComponent(component = {}) {
  return {
    sComponentTitle: component?.sComponentTitle || '',
    sTitle: component?.sTitle || '',
    sDescription: component?.sDescription || '',
    aCard: component?.aCard?.length ? component.aCard.map(normalizeCard) : getDefaultCards()
  }
}

export default function WhyProclink() {
  const { eType } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const history = useHistory()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    clearErrors,
    control,
    formState: { errors }
  } = useForm({
    mode: 'all',
    defaultValues: {
      oComponentInput: normalizeComponent()
    }
  })

  const value = watch()
  const previewComponent = value?.oComponentInput || {}

  const { fields } = useFieldArray({
    control,
    name: 'oComponentInput.aCard'
  })

  useQuery(GET_PAGE_COMPONENT, {
    variables: { input: { eType } },
    onCompleted: (data) => {
      if (data?.getComponent?.oComponent) {
        const component = removeTypenameKey(data?.getComponent?.oComponent)
        reset({
          oComponentInput: normalizeComponent(component)
        })
      }
    }
  })

  const [edit, { loading }] = useMutation(EDIT_PAGE_COMPONENT, {
    onCompleted: (data) => {
      if (data?.editComponent) {
        history.push(allRoutes.pageComponents)
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data?.editComponent?.sMessage, type: TOAST_TYPE.Success }
        })
      }
    }
  })

  function onSubmit(data) {
    edit({
      variables: {
        input: {
          ...data,
          oComponentInput: normalizeComponent(data?.oComponentInput)
        }
      }
    })
  }

  function handleCardMediaTypeChange(index, mediaType) {
    const cardPath = `oComponentInput.aCard[${index}]`

    setValue(`${cardPath}.eMediaType`, mediaType, { shouldDirty: true })
    setValue(`${cardPath}.sMediaUrl`, '', { shouldDirty: true })
    setValue(`${cardPath}.oImg`, getDefaultImage(), { shouldDirty: true })
    clearErrors([`${cardPath}.sMediaUrl`, `${cardPath}.oImg`])
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <input type="hidden" {...register('eType')} value={eType} />
      <CountInput
        type="text"
        currentLength={previewComponent?.sTitle?.length}
        register={register('oComponentInput.sTitle', {
          required: validationErrors.required
        })}
        error={errors}
        className={errors?.oComponentInput?.sTitle && 'error'}
        name="oComponentInput.sTitle"
        label="Title*"
      />
      <TitleFormatHint subject="title" />
      <CountInput
        type="textarea"
        textarea
        rows={6}
        currentLength={previewComponent?.sDescription?.length}
        register={register('oComponentInput.sDescription', {
          required: validationErrors.required
        })}
        error={errors}
        className={errors?.oComponentInput?.sDescription && 'error'}
        name="oComponentInput.sDescription"
        label="Description*"
      />

      {fields.map((field, index) => (
        <InputArrayBox key={field.id}>
          <Form.Label>Card {index + 1}</Form.Label>
          <Row>
            <Col sm="8">
              <CountInput
                type="text"
                currentLength={previewComponent?.aCard?.[index]?.sTitle?.length}
                register={register(`oComponentInput.aCard[${index}].sTitle`, {
                  required: validationErrors.required
                })}
                error={errors}
                className={errors?.oComponentInput?.aCard?.[index]?.sTitle && 'error'}
                name={`oComponentInput.aCard[${index}].sTitle`}
                label="Card Title*"
              />
              <CountInput
                type="textarea"
                textarea
                rows={6}
                currentLength={previewComponent?.aCard?.[index]?.sDescription?.length}
                register={register(`oComponentInput.aCard[${index}].sDescription`, {
                  required: validationErrors.required
                })}
                error={errors}
                className={errors?.oComponentInput?.aCard?.[index]?.sDescription && 'error'}
                name={`oComponentInput.aCard[${index}].sDescription`}
                label="Description*"
              />
              <input type="hidden" {...register(`oComponentInput.aCard[${index}].eTarget`)} value={previewComponent?.aCard?.[index]?.eTarget || '_self'} />
              <input type="hidden" {...register(`oComponentInput.aCard[${index}].sMediaUrl`)} />
            </Col>
            <Col sm="4" className="add-article">
              <Form.Group className="form-group">
                <Form.Label>Media Type</Form.Label>
                <Form.Select
                  {...register(`oComponentInput.aCard[${index}].eMediaType`)}
                  onChange={(event) => handleCardMediaTypeChange(index, event.target.value)}
                >
                  <option value="i">Image</option>
                  <option value="v">Video</option>
                </Form.Select>
              </Form.Group>
              <CategoryPlayerTeamImage
                key={`oComponentInput.aCard[${index}].oImg-${normalizeMediaType(previewComponent?.aCard?.[index]?.eMediaType)}`}
                galleryType="pb"
                title={normalizeMediaType(previewComponent?.aCard?.[index]?.eMediaType) === 'v' ? 'Video*' : 'Image*'}
                name={`oComponentInput.aCard[${index}].oImg`}
                register={register}
                setValue={setValue}
                urlFieldName={`oComponentInput.aCard[${index}].sMediaUrl`}
                onDelete={() => setValue(`oComponentInput.aCard[${index}].sMediaUrl`, '')}
                values={getValues()}
                errors={errors}
                clearErrors={clearErrors}
                hideAttribution
                required
                mediaType={normalizeMediaType(previewComponent?.aCard?.[index]?.eMediaType) === 'v' ? 'video' : 'image'}
              />
            </Col>
          </Row>
        </InputArrayBox>
      ))}

      <Button variant="primary" type="submit" className="m-2" disabled={loading}>
        <FormattedMessage id="update" />
        {loading && <Spinner animation="border" size="sm" />}
      </Button>
    </Form>
  )
}
