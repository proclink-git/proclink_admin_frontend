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
import CommonInput from 'shared/components/common-input'
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
    sButtonText: '',
    eTarget: '_self',
    oImg: getDefaultImage()
  }
}

function getDefaultCards() {
  return Array.from({ length: 5 }, () => getDefaultCard())
}

function normalizeCard(card = {}) {
  return {
    sTitle: card?.sTitle || '',
    sDescription: card?.sDescription || '',
    sRedirectUrl: card?.sRedirectUrl || '',
    sButtonText: card?.sButtonText || '',
    eTarget: card?.eTarget || '_self',
    oImg: {
      ...getDefaultImage(),
      ...(card?.oImg || {})
    }
  }
}

function normalizeIndustryStack(component = {}) {
  return {
    sComponentTitle: component?.sComponentTitle || '',
    sTitle: component?.sTitle || '',
    sDescription: component?.sDescription || '',
    aCard: component?.aCard?.length ? component?.aCard?.map(normalizeCard) : getDefaultCards()
  }
}

function buildIndustryStackPayload(data = {}) {
  const oComponentInput = data?.oComponentInput || {}
  const aCard = Array.isArray(oComponentInput?.aCard) ? oComponentInput.aCard.map(normalizeCard).filter((card) => card?.sTitle || card?.sDescription || card?.sRedirectUrl || card?.sButtonText || card?.oImg?.sUrl) : []

  return {
    eType: data?.eType,
    oComponentInput: {
      sComponentTitle: oComponentInput?.sComponentTitle || '',
      sTitle: oComponentInput?.sTitle || '',
      sDescription: oComponentInput?.sDescription || '',
      aCard
    }
  }
}

export default function IndustryStackComponent() {
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
      oComponentInput: normalizeIndustryStack()
    }
  })

  const values = watch()
  const formValues = values?.oComponentInput || {}

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
          oComponentInput: normalizeIndustryStack(component)
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
    edit({ variables: { input: buildIndustryStackPayload(data) } })
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <input type="hidden" {...register('eType')} value={eType} />

      <CountInput
        type="text"
        currentLength={formValues?.sTitle?.length}
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
        currentLength={formValues?.sDescription?.length}
        register={register('oComponentInput.sDescription', {
          required: validationErrors.required
        })}
        error={errors}
        className={errors?.oComponentInput?.sDescription && 'error'}
        name="oComponentInput.sDescription"
        label="Description*"
      />

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
                    currentLength={formValues?.aCard?.[index]?.sTitle?.length}
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
                    currentLength={formValues?.aCard?.[index]?.sDescription?.length}
                    register={register(`oComponentInput.aCard[${index}].sDescription`, {
                      required: validationErrors.required
                    })}
                    error={errors}
                    className={errors?.oComponentInput?.aCard?.[index]?.sDescription && 'error'}
                    name={`oComponentInput.aCard[${index}].sDescription`}
                    label="Description*"
                  />
                  <CountInput
                    type="text"
                    currentLength={formValues?.aCard?.[index]?.sButtonText?.length}
                    register={register(`oComponentInput.aCard[${index}].sButtonText`, {
                      required: validationErrors.required
                    })}
                    error={errors}
                    className={errors?.oComponentInput?.aCard?.[index]?.sButtonText && 'error'}
                    name={`oComponentInput.aCard[${index}].sButtonText`}
                    label="Button Text*"
                  />
                  <CommonInput
                    type="text"
                    register={register}
                    errors={errors}
                    className={errors?.oComponentInput?.aCard?.[index]?.sRedirectUrl && 'error'}
                    name={`oComponentInput.aCard[${index}].sRedirectUrl`}
                    label="Redirect Url*"
                    required
                    disableDefaultMaxLength
                  />
                  <input type="hidden" {...register(`oComponentInput.aCard[${index}].eTarget`)} value={formValues?.aCard?.[index]?.eTarget || '_self'} />
                </Col>
                <Col sm="4" className="add-article">
                  <CategoryPlayerTeamImage
                    galleryType="pb"
                    title={`Image ${index + 1}*`}
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
