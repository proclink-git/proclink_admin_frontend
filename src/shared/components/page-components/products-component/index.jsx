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

function getDefaultCard() {
  return {
    sProductName: '',
    sTitle: '',
    sDescription: '',
    sRedirectUrl: '',
    eTarget: '_self',
    oImg: {
      sUrl: '',
      sText: '',
      sCaption: '',
      sAttribute: ''
    }
  }
}

export default function ProductsComponent() {
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
      oComponentInput: {
        sComponentTitle: '',
        sTitle: '',
        sDescription: '',
        aCard: [getDefaultCard()]
      }
    }
  })

  const value = watch()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'oComponentInput.aCard'
  })

  useQuery(GET_PAGE_COMPONENT, {
    variables: { input: { eType } },
    onCompleted: (data) => {
      if (data?.getComponent?.oComponent) {
        const component = data?.getComponent?.oComponent
        reset({
          oComponentInput: {
            sComponentTitle: component?.sComponentTitle || '',
            sTitle: component?.sTitle || '',
            sDescription: component?.sDescription || '',
            aCard: component?.aCard?.length ? removeTypenameKey(component?.aCard) : [getDefaultCard()]
          }
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
        currentLength={value?.oComponentInput?.sTitle?.length}
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
        currentLength={value?.oComponentInput?.sDescription?.length}
        register={register('oComponentInput.sDescription', {
          required: validationErrors.required
        })}
        error={errors}
        className={errors?.oComponentInput?.sDescription && 'error'}
        name="oComponentInput.sDescription"
        label="Description*"
      />

      {fields.map((field, index) => (
        <InputArrayBox
          key={field.id}
          actions={
            <>
              {index + 1 === fields.length && (
                <Button onClick={() => append(getDefaultCard())} variant="link" size="sm" className="square icon-btn">
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
          <Form.Label>Card {index + 1}</Form.Label>
          <Row>
            <Col sm="8">
              <CountInput
                type="text"
                currentLength={value?.oComponentInput?.aCard?.[index]?.sProductName?.length}
                register={register(`oComponentInput.aCard[${index}].sProductName`, {
                  required: validationErrors.required
                })}
                error={errors}
                className={errors?.oComponentInput?.aCard?.[index]?.sProductName && 'error'}
                name={`oComponentInput.aCard[${index}].sProductName`}
                label="Product Name*"
              />
              <CountInput
                type="text"
                currentLength={value?.oComponentInput?.aCard?.[index]?.sTitle?.length}
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
                currentLength={value?.oComponentInput?.aCard?.[index]?.sDescription?.length}
                register={register(`oComponentInput.aCard[${index}].sDescription`, {
                  required: validationErrors.required
                })}
                error={errors}
                className={errors?.oComponentInput?.aCard?.[index]?.sDescription && 'error'}
                name={`oComponentInput.aCard[${index}].sDescription`}
                label="Description*"
              />
              <CommonInput
                type="text"
                register={register}
                errors={errors}
                className={errors?.oComponentInput?.aCard?.[index]?.sRedirectUrl && 'error'}
                name={`oComponentInput.aCard[${index}].sRedirectUrl`}
                label="Redirect Url"
                required
                disableDefaultMaxLength
              />
            </Col>
            <Col sm="4" className="add-article">
              <CategoryPlayerTeamImage
                galleryType="pb"
                title="Image*"
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
      ))}

      <Button variant="primary" type="submit" className="m-2" disabled={loading}>
        <FormattedMessage id="update" />
        {loading && <Spinner animation="border" size="sm" />}
      </Button>
    </Form>
  )
}
