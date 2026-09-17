import React, { useContext } from 'react'
import { Button, Col, Form, InputGroup, Row, Spinner } from 'react-bootstrap'
import { useFieldArray, useForm } from 'react-hook-form'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { ADD_MARQUEE } from 'graph-ql/settings/marquee/mutation'
import { GET_MARQUEE } from 'graph-ql/settings/marquee/query'
import { useMutation, useQuery } from '@apollo/client'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { FormattedMessage } from 'react-intl'
import { removeTypenameKey } from 'shared/utils'

const Marquee = () => {
  const { dispatch } = useContext(ToastrContext)
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({ defaultValues: { aMarquee: [''] } })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'aMarquee'
  })

  const { loading } = useQuery(GET_MARQUEE, {
    onCompleted: (data) => {
      const temp = removeTypenameKey(data?.getMarquee?.oData)
      setValue('aMarquee', temp?.aMarquee)
    }
  })

  const [add, { loading: editLoading }] = useMutation(ADD_MARQUEE, {
    onCompleted: (data) => {
      if (data?.addMarquee) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data?.addMarquee?.sMessage, type: TOAST_TYPE.Success }
        })
      }
    }
  })

  function onSubmit(data) {
    add({ variables: { input: data } })
  }

  return (
    <>
      {loading && <Spinner animation="border" size="sm" />}
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Row className="gutter-9">
          <Col xs={12}>
            <Form.Label className="text-uppercase">Marquee</Form.Label>
          </Col>
          {fields.map((field, index) => (
            <Col sm="12" key={field.id}>
              <Row>
                <Col sm="6">
                <Form.Group className="form-group">
                  <Form.Control
                    placeholder='Text'
                    type={'text'}
                    className={errors?.aMarquee?.[index] && 'error'}
                    {...register(`aMarquee.[${index}].sTitle`, { required: validationErrors.required })}
                  />
              </Form.Group>
                </Col>
                <Col sm="6">
                <Form.Group className="form-group">
                <InputGroup>
                  <Form.Control
                    placeholder='URL'
                    type={'text'}
                    className={errors?.aMarquee?.[index] && 'error'}
                    {...register(`aMarquee.[${index}].sUrl`)}
                  />
                  {fields?.length > 1 && (
                    <Button type="button" onClick={() => remove(index)} variant="link" className="icon-right">
                      <i className="icon-delete"></i>
                    </Button>
                  )}
                </InputGroup>
              </Form.Group>
                </Col>
              </Row>
            </Col>
          ))}
          <Col xs={12}>
            <Button onClick={() => append(null)} variant="link" className="square add-media hover-none btn-sm">
              <i className="icon-add" />
              Add More
            </Button>
          </Col>
        </Row>
        <Button type="submit" variant="primary" className="m-2" onClick={handleSubmit(onSubmit)} disabled={editLoading}>
          {editLoading ? <Spinner animation="border" size="sm" /> : <FormattedMessage id="update" />}
        </Button>
      </Form>
    </>
  )
}

export default Marquee
