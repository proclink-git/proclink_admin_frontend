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
    oImg: getDefaultImage()
  }
}

function getDefaultCards() {
  return Array.from({ length: 4 }, () => getDefaultCard())
}

function normalizeCard(card = {}) {
  return {
    sTitle: card?.sTitle || '',
    sDescription: card?.sDescription || '',
    sRedirectUrl: card?.sRedirectUrl || '',
    eTarget: card?.eTarget || '_self',
    oImg: {
      ...getDefaultImage(),
      ...(card?.oImg || {})
    }
  }
}

function normalizeIndustryHero(component = {}) {
  return {
    sComponentTitle: component?.sComponentTitle || '',
    sTitle: component?.sTitle || '',
    sDescription: component?.sDescription || '',
    sImageTitle: component?.sImageTitle || '',
    oImg: {
      ...getDefaultImage(),
      ...(component?.oImg || {})
    },
    aCard: component?.aCard?.length ? component?.aCard?.map(normalizeCard) : getDefaultCards()
  }
}

function buildIndustryHeroPayload(data = {}) {
  const oComponentInput = data?.oComponentInput || {}
  const aCard = Array.isArray(oComponentInput?.aCard) ? oComponentInput.aCard.map(normalizeCard).filter((card) => card?.sTitle || card?.sDescription || card?.sRedirectUrl || card?.oImg?.sUrl) : []

  return {
    eType: data?.eType,
    oComponentInput: {
      sComponentTitle: oComponentInput?.sComponentTitle || '',
      sTitle: oComponentInput?.sTitle || '',
      sDescription: oComponentInput?.sDescription || '',
      sImageTitle: oComponentInput?.sImageTitle || '',
      oImg: {
        ...getDefaultImage(),
        ...(oComponentInput?.oImg || {})
      },
      aCard
    }
  }
}

export default function IndustryHeroComponent() {
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
      oComponentInput: normalizeIndustryHero()
    }
  })

  const values = watch()
  const previewData = values?.oComponentInput || {}

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'oComponentInput.aCard'
  })

  useQuery(GET_PAGE_COMPONENT, {
    variables: { input: { eType } },
    onCompleted: (data) => {
      if (data?.getComponent?.oComponent) {
        const component = removeTypenameKey(data?.getComponent?.oComponent)
        reset({
          oComponentInput: normalizeIndustryHero(component)
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
    edit({ variables: { input: buildIndustryHeroPayload(data) } })
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <input type="hidden" {...register('eType')} value={eType} />

      <InputArrayBox className="mb-4 p-3">
        <Form.Label className="fw-bold mb-3">Hero Content</Form.Label>
        <Row>
          <Col lg="8">
            <CountInput
              type="text"
              currentLength={previewData?.sTitle?.length}
              register={register('oComponentInput.sTitle', {
                required: validationErrors.required
              })}
              error={errors}
              className={errors?.oComponentInput?.sTitle && 'error'}
              name="oComponentInput.sTitle"
              label="Hero Title*"
            />
            <TitleFormatHint subject="hero title" />
            <CountInput
              type="textarea"
              textarea
              rows={6}
              currentLength={previewData?.sDescription?.length}
              register={register('oComponentInput.sDescription', {
                required: validationErrors.required
              })}
              error={errors}
              className={errors?.oComponentInput?.sDescription && 'error'}
              name="oComponentInput.sDescription"
              label="Hero Description*"
            />
            <CountInput
              type="text"
              currentLength={previewData?.sImageTitle?.length}
              register={register('oComponentInput.sImageTitle', {
                required: validationErrors.required
              })}
              error={errors}
              className={errors?.oComponentInput?.sImageTitle && 'error'}
              name="oComponentInput.sImageTitle"
              label="Image Title*"
            />
          </Col>
          <Col lg="4" className="add-article">
            <CategoryPlayerTeamImage
              galleryType="pb"
              title="Hero Image*"
              name="oComponentInput.oImg"
              register={register}
              setValue={setValue}
              values={getValues()}
              errors={errors}
              clearErrors={clearErrors}
              hideAttribution
              required
            />
          </Col>
        </Row>
      </InputArrayBox>

      <Row className="gutter-9">
        {fields.map((field, index) => (
          <Col lg="6" key={field.id} className="mb-3">
            <InputArrayBox
              className="h-100"
              actions={
                <>
                  {index + 1 === fields.length && (
                    <Button type="button" onClick={() => append(getDefaultCard())} variant="link" size="sm" className="square icon-btn">
                      <i className="icon-add d-block" />
                    </Button>
                  )}
                  {fields.length > 1 && (
                    <Button type="button" onClick={() => remove(index)} variant="link" size="sm" className="square icon-btn">
                      <i className="icon-delete d-block" />
                    </Button>
                  )}
                </>
              }
            >
              <Form.Label>Card {index + 1}</Form.Label>
              <Row>
                <Col sm="8">
                  <CountInput
                    type="text"
                    currentLength={previewData?.aCard?.[index]?.sTitle?.length}
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
                    currentLength={previewData?.aCard?.[index]?.sDescription?.length}
                    register={register(`oComponentInput.aCard[${index}].sDescription`, {
                      required: validationErrors.required
                    })}
                    error={errors}
                    className={errors?.oComponentInput?.aCard?.[index]?.sDescription && 'error'}
                    name={`oComponentInput.aCard[${index}].sDescription`}
                    label="Description*"
                  />
                  <input type="hidden" {...register(`oComponentInput.aCard[${index}].eTarget`)} value={previewData?.aCard?.[index]?.eTarget || '_self'} />
                </Col>
                <Col sm="4" className="add-article">
                  <CategoryPlayerTeamImage
                    galleryType="pb"
                    title={`Icon / Image ${index + 1}*`}
                    name={`oComponentInput.aCard[${index}].oImg`}
                    register={register}
                    setValue={setValue}
                    values={getValues()}
                    errors={errors}
                    clearErrors={clearErrors}
                    hideAttribution
                    required
                  />
                </Col>
              </Row>
            </InputArrayBox>
          </Col>
        ))}
      </Row>

      <Button variant="primary" type="submit" className="m-2" disabled={loading}>
        <FormattedMessage id="update" />
        {loading && <Spinner animation="border" size="sm" />}
      </Button>
    </Form>
  )
}
