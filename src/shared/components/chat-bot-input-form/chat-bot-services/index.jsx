/* eslint-disable no-unused-vars */
import React, { useContext } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { Button, Form, Spinner, Row, Col, InputGroup } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { useMutation, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { useHistory } from 'react-router'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { GET_CHATBOT_INPUT_META } from 'graph-ql/chat-bot-input/query'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { EDIT_CHATBOT_INPUT } from 'graph-ql/chat-bot-input/mutation'
import { allRoutes } from 'shared/constants/AllRoutes'

export default function ServiceForm() {
  const { eType } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const history = useHistory()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isValid }
    // getValues
  } = useForm({
    mode: 'all',
    defaultValues: {
      oChatBotInput: {
        aData: [''] // default value for aData
      }
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'oChatBotInput.aData'
  })

  useQuery(GET_CHATBOT_INPUT_META, {
    variables: { input: { eType: 's' } },
    onCompleted: (data) => {
      if (data?.getChatBotInputMeta?.oData) {
        const d = data?.getChatBotInputMeta?.oData
        reset({
          oChatBotInput: {
            aData: d?.aData,
            aMessage: d?.aMessage,
            eType: d?.eType
          }
        })
      }
    }
  })

  const [edit, { loading }] = useMutation(EDIT_CHATBOT_INPUT, {
    onCompleted: (data) => {
      if (data?.editChatBotInputMeta) {
        history.push({ pathname: allRoutes.chatBot, search: '?tab=service', state: { tab: 'service' } })
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data?.editChatBotInputMeta?.sMessage, type: TOAST_TYPE.Success }
        })
      }
    }
  })

  function onSubmit(d) {
    edit({ variables: { input: d?.oChatBotInput } })
  }
  return (
    <Row>
      <Col sm="8">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('eType')} value={eType} />
          <Row>
            <Col xs={12}>
              <Form.Label>Services</Form.Label>
            </Col>
            {fields.map((field, index) => (
              <Col sm="4" key={field.id}>
                <Form.Group className="form-group">
                  <InputGroup>
                    <Form.Control
                      type={'text'}
                      className={errors?.oChatBotInput?.aData?.[index] && 'error'}
                      {...register(`oChatBotInput.aData[${index}]`, { required: validationErrors.required })}
                    />
                    {fields?.length > 1 && (
                      <Button onClick={() => remove(index)} variant="link" className="icon-right">
                        <i className="icon-delete"></i>
                      </Button>
                    )}
                  </InputGroup>
                </Form.Group>
              </Col>
            ))}
          </Row>
          <div>
            <Button onClick={() => append('')} variant="link" className="square add-media hover-none btn-sm">
              <i className="icon-add" />
              Add More
            </Button>
          </div>
          <Button variant="primary" type="submit" className="m-2" disabled={!isValid || loading}>
            <FormattedMessage id="update" />
            {loading && <Spinner animation="border" size="sm" />}
          </Button>
        </Form>
      </Col>
    </Row>
  )
}
