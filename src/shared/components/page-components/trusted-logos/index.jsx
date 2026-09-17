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

function getDefaultLogo() {
  return {
    oImg: {
      sUrl: '',
      sText: '',
      sCaption: '',
      sAttribute: ''
    }
  }
}

export default function TrustedLogos() {
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
        aLogo: [getDefaultLogo()]
      }
    }
  })

  const values = watch()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'oComponentInput.aLogo'
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
            aLogo: component?.aLogo?.length ? removeTypenameKey(component?.aLogo) : [getDefaultLogo()]
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

      <Row>
        <Col sm="8">
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
        </Col>
      </Row>

      <Row className="gutter-9">
        {fields.map((field, index) => (
          <Col sm="4" key={field.id} className="add-article mb-3">
            <InputArrayBox
              className="h-100"
              actions={
                <>
                  {index + 1 === fields.length && (
                    <Button type="button" onClick={() => append(getDefaultLogo())} variant="link" size="sm" className="square icon-btn">
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
              <Form.Label>Logo {index + 1}</Form.Label>
              <CategoryPlayerTeamImage
                galleryType="mrlogo"
                title={`Logo ${index + 1}*`}
                name={`oComponentInput.aLogo[${index}].oImg`}
                register={register}
                setValue={setValue}
                values={getValues()}
                errors={errors}
                clearErrors={clearErrors}
                hideAttribution
                required
              />
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
