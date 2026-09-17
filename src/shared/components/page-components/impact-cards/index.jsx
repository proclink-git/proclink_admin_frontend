import React, { useContext } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { useFieldArray, useForm } from 'react-hook-form'
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { useHistory } from 'react-router'
import { useParams } from 'react-router-dom'

import { EDIT_PAGE_COMPONENT } from 'graph-ql/page-components/mutation'
import { GET_PAGE_COMPONENT } from 'graph-ql/page-components/query'
import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import { allRoutes } from 'shared/constants/AllRoutes'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { removeTypenameKey } from 'shared/utils'

function getDefaultCard() {
  return {
    sNumber: '',
    sTitle: '',
    sDescription: ''
  }
}

export default function ImpactCards() {
  const { eType } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const history = useHistory()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors }
  } = useForm({
    mode: 'all',
    defaultValues: {
      oComponentInput: {
        sComponentTitle: '',
        aCard: [getDefaultCard()]
      }
    }
  })

  const value = watch()

  const { fields } = useFieldArray({
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

      <Row>
        {fields.map((field, index) => (
          <Col sm="6" key={field.id}>
            <InputArrayBox className="mt-3">
              <Form.Label>Card {index + 1}</Form.Label>
              <CountInput
                type="text"
                currentLength={value?.oComponentInput?.aCard?.[index]?.sTitle?.length}
                register={register(`oComponentInput.aCard[${index}].sTitle`, {
                  required: validationErrors.required
                })}
                error={errors}
                className={errors?.oComponentInput?.aCard?.[index]?.sTitle && 'error'}
                name={`oComponentInput.aCard[${index}].sTitle`}
                label="Title*"
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
                className={errors?.oComponentInput?.aCard?.[index]?.sNumber && 'error'}
                name={`oComponentInput.aCard[${index}].sNumber`}
                label="Number"
                required
                disableDefaultMaxLength
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
