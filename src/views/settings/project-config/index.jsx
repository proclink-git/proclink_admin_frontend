import React, { useContext } from 'react'
import { Button, Col, Form, InputGroup, Row, Spinner } from 'react-bootstrap'
import { useFieldArray, useForm } from 'react-hook-form'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { EDIT_PROJECT_CONFIG } from 'graph-ql/settings/project-config/mutation'
import { GET_PROJECT_CONFIG } from 'graph-ql/settings/project-config/query'
import { useMutation, useQuery } from '@apollo/client'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { FormattedMessage } from 'react-intl'

const ProjectConfig = () => {
  const { dispatch } = useContext(ToastrContext)
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({ defaultValues: { aEmail: [''] } })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'aEmail'
  })

  const { loading } = useQuery(GET_PROJECT_CONFIG, {
    variables: { input: { eType: 'm' } },
    onCompleted: (data) => {
      setValue('aEmail', data?.getProjectConfig?.oData?.aEmail)
    }
  })

  const [add, { loading: editLoading }] = useMutation(EDIT_PROJECT_CONFIG, {
    onCompleted: (data) => {
      if (data?.editProjectConfig) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data?.editProjectConfig?.sMessage, type: TOAST_TYPE.Success }
        })
      }
    }
  })

  function onSubmit(data) {
    Object.assign(data, { eType: 'm' })
    add({ variables: { input: data } })
  }

  return (
    <>
      {loading && <Spinner animation="border" size="sm" />}
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Row className="gutter-9">
          <Col xs={12}>
            <Form.Label className="text-uppercase">Email</Form.Label>
          </Col>
          {fields.map((field, index) => (
            <Col sm="4" key={field.id}>
              <Form.Group className="form-group">
                <InputGroup>
                  <Form.Control
                    type={'text'}
                    className={errors?.aEmail?.[index] && 'error'}
                    {...register(`aEmail.[${index}]`, { required: validationErrors.required })}
                  />
                  {fields?.length > 1 && (
                    <Button type="button" onClick={() => remove(index)} variant="link" className="icon-right">
                      <i className="icon-delete"></i>
                    </Button>
                  )}
                </InputGroup>
              </Form.Group>
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

export default ProjectConfig
