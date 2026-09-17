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

function getDefaultTestimonial() {
  return {
    sName: '',
    sRole: '',
    sQuote: '',
    oImg: {
      sUrl: '',
      sText: '',
      sCaption: '',
      sAttribute: ''
    }
  }
}

export default function TestimonialsSection() {
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
        aTestimonial: [getDefaultTestimonial()]
      }
    }
  })

  const values = watch()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'oComponentInput.aTestimonial'
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
            aTestimonial: component?.aTestimonial?.length ? removeTypenameKey(component?.aTestimonial) : [getDefaultTestimonial()]
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
        currentLength={values?.oComponentInput?.sTitle?.length}
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
        currentLength={values?.oComponentInput?.sDescription?.length}
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
                <Button type="button" onClick={() => append(getDefaultTestimonial())} variant="link" size="sm" className="square icon-btn">
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
          <Form.Label>Testimonial {index + 1}</Form.Label>
          <Row>
            <Col sm="8">
              <CountInput
                type="text"
                currentLength={values?.oComponentInput?.aTestimonial?.[index]?.sName?.length}
                register={register(`oComponentInput.aTestimonial[${index}].sName`, {
                  required: validationErrors.required
                })}
                error={errors}
                className={errors?.oComponentInput?.aTestimonial?.[index]?.sName && 'error'}
                name={`oComponentInput.aTestimonial[${index}].sName`}
                label="Name*"
              />
              <CountInput
                type="text"
                currentLength={values?.oComponentInput?.aTestimonial?.[index]?.sRole?.length}
                register={register(`oComponentInput.aTestimonial[${index}].sRole`, {
                  required: validationErrors.required
                })}
                error={errors}
                className={errors?.oComponentInput?.aTestimonial?.[index]?.sRole && 'error'}
                name={`oComponentInput.aTestimonial[${index}].sRole`}
                label="Role*"
              />
              <CountInput
                type="textarea"
                textarea
                rows={6}
                currentLength={values?.oComponentInput?.aTestimonial?.[index]?.sQuote?.length}
                register={register(`oComponentInput.aTestimonial[${index}].sQuote`, {
                  required: validationErrors.required
                })}
                error={errors}
                className={errors?.oComponentInput?.aTestimonial?.[index]?.sQuote && 'error'}
                name={`oComponentInput.aTestimonial[${index}].sQuote`}
                label="Quote*"
              />
            </Col>
            <Col sm="4" className="add-article">
              <CategoryPlayerTeamImage
                galleryType="pb"
                title="Portrait*"
                name={`oComponentInput.aTestimonial[${index}].oImg`}
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
