import React, { useContext } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { useHistory } from 'react-router'
import { useParams } from 'react-router-dom'

import { EDIT_PAGE_COMPONENT } from 'graph-ql/page-components/mutation'
import { GET_PAGE_COMPONENT } from 'graph-ql/page-components/query'
import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import { ToastrContext } from 'shared/components/toastr'
import TitleFormatHint from 'shared/components/title-format-hint'
import { TOAST_TYPE } from 'shared/constants'
import { allRoutes } from 'shared/constants/AllRoutes'
import { validationErrors } from 'shared/constants/ValidationErrors'

const defaultComponentInput = {
  sComponentTitle: '',
  sTitle: '',
  sDescription: '',
  oImg: {
    sUrl: '',
    sText: '',
    sCaption: '',
    sAttribute: ''
  }
}

export default function MultipleImageDescription() {
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
    formState: { errors }
  } = useForm({
    mode: 'all',
    defaultValues: {
      oComponentInput: defaultComponentInput
    }
  })

  const value = watch()

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
            oImg: component?.oImg || defaultComponentInput.oImg
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
    <Row>
      <Col sm="8">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('eType')} value={eType} />
          <CommonInput
            type="text"
            register={register}
            errors={errors}
            className={errors?.oComponentInput?.sComponentTitle && 'error'}
            name="oComponentInput.sComponentTitle"
            label="Component Title"
            required
            disableDefaultMaxLength
          />
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
            rows={10}
            currentLength={value?.oComponentInput?.sDescription?.length}
            register={register('oComponentInput.sDescription', {
              required: validationErrors.required
            })}
            error={errors}
            className={errors?.oComponentInput?.sDescription && 'error'}
            name="oComponentInput.sDescription"
            label="Description*"
          />
          <Button variant="primary" type="submit" className="m-2" disabled={loading}>
            <FormattedMessage id="update" />
            {loading && <Spinner animation="border" size="sm" />}
          </Button>
        </Form>
      </Col>
      <Col sm="4" className="add-article">
        <CategoryPlayerTeamImage
          galleryType="pb"
          title="Image*"
          name="oComponentInput.oImg"
          register={register}
          setValue={setValue}
          values={getValues()}
          errors={errors}
          clearErrors={clearErrors}
          required
        />
      </Col>
    </Row>
  )
}
