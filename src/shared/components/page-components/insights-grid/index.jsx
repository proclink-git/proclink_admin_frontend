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
    sBadge: '',
    sTitle: '',
    sRedirectUrl: '',
    oImg: getDefaultImage()
  }
}

function getDefaultCards() {
  return Array.from({ length: 8 }, () => getDefaultCard())
}

function normalizeCard(card = {}) {
  return {
    sBadge: card?.sBadge || '',
    sTitle: card?.sTitle || '',
    sRedirectUrl: card?.sRedirectUrl || '',
    oImg: {
      ...getDefaultImage(),
      ...(card?.oImg || {})
    }
  }
}

function normalizeComponent(component = {}) {
  return {
    sComponentTitle: component?.sComponentTitle || '',
    sTitle: component?.sTitle || '',
    sDescription: component?.sDescription || '',
    aCard: component?.aCard?.length ? component?.aCard?.map(normalizeCard) : getDefaultCards()
  }
}

export default function InsightsGrid() {
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
  const formValues = value?.oComponentInput || {}

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
    edit({ variables: { input: data } })
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
          <Col sm="6" key={field.id} className="mb-3">
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
              <CountInput
                type="text"
                currentLength={formValues?.aCard?.[index]?.sBadge?.length}
                register={register(`oComponentInput.aCard[${index}].sBadge`)}
                error={errors}
                className={errors?.oComponentInput?.aCard?.[index]?.sBadge && 'error'}
                name={`oComponentInput.aCard[${index}].sBadge`}
                label="Badge"
              />
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
              <div className="add-article">
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
              </div>
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
