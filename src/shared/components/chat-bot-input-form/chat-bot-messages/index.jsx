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
import { removeTypenameKey } from 'shared/utils'

export default function MessageForm() {
  const { eType } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const history = useHistory()

  const aPredefinedMessage = {
    w: 'Welcome message 1',
    w2: 'Welcome message 2',
    nkm: 'No Keyword match',
    km: 'Keyword match',
    fsm1: 'Form success message 1',
    fsm2: 'Form success message 2',
    is: 'Industries success message',
    ss: 'Services success message'
  }

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isValid },
    getValues
  } = useForm({
    mode: 'all',
    defaultValues: {
      oChatBotInput: {
        aMessage: [] // default value for aMessage
      }
    }
  })

  const { fields } = useFieldArray({
    control,
    name: 'oChatBotInput.aMessage'
  })

  useQuery(GET_CHATBOT_INPUT_META, {
    variables: { input: { eType: 'm' } },
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
        history.push({ pathname: allRoutes.chatBot, search: '?tab=message', state: { tab: 'message' } })
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data?.editChatBotInputMeta?.sMessage, type: TOAST_TYPE.Success }
        })
      }
    }
  })

  function onSubmit(d) {
    const oInput = d?.oChatBotInput
    oInput.aMessage = removeTypenameKey(oInput.aMessage)
    edit({ variables: { input: d?.oChatBotInput } })
  }
  return (
    <Row>
      <Col sm="8">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('eType')} value={eType} />
          <Row>
            <Col xs={12}>
              <Form.Label>Messages</Form.Label>
            </Col>
            {fields.map((field, index) => (
              <Row key={field.id}>
                <input type="hidden" {...register(`oChatBotInput.aMessage[${index}].eEvent`)} />
                <Col sm="4">
                  <Form.Group className="form-group">
                    <InputGroup>
                      <Form.Control
                        type={'text'}
                        disabled
                        value={aPredefinedMessage[getValues(`oChatBotInput.aMessage[${index}].eEvent`)]}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col sm="8" key={field.id}>
                  <Form.Group className="form-group">
                    <InputGroup>
                      <Form.Control
                        type={'text'}
                        className={errors?.oChatBotInput?.aMessage?.[index]?.sMessage && 'error'}
                        {...register(`oChatBotInput.aMessage[${index}].sMessage`, { required: validationErrors.required })}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
            ))}
          </Row>
          <Button variant="primary" type="submit" className="m-2" disabled={!isValid || loading}>
            <FormattedMessage id="update" />
            {loading && <Spinner animation="border" size="sm" />}
          </Button>
        </Form>
      </Col>
    </Row>
  )
}
