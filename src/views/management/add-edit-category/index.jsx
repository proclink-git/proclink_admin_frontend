import React, { useContext, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Form, Col, Spinner, Row } from 'react-bootstrap'
import { useHistory, useParams } from 'react-router-dom'
import { FormattedMessage, useIntl } from 'react-intl'
import { useMutation, useLazyQuery } from '@apollo/client'

import { HEADER_CATEGORY_SLUG_ADMIN, TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { ADD_CATEGORY_MUTATION, GET_CATEGORY_BY_ID, EDIT_CATEGORY_MUTATION } from 'graph-ql/management/category'
import { validationErrors } from 'shared/constants/ValidationErrors'
import CommonInput from 'shared/components/common-input'

function AddEditCategory() {
  const history = useHistory()
  const intl = useIntl()

  const { id, categoryType } = useParams()

  const { dispatch } = useContext(ToastrContext)
  const close = intl.formatMessage({ id: 'close' })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: categoryErrors }
  } = useForm({ mode: 'all' })

  const [getCategory] = useLazyQuery(GET_CATEGORY_BY_ID, {
    onCompleted: (data) => {
      if (data && data.getCategoryById) {
        setCategoryValue(data.getCategoryById)
      }
    }
  })

  const [AddCategoryMutation, { loading }] = useMutation(ADD_CATEGORY_MUTATION, {
    onCompleted: (data) => {
      if (data && data.addCategory) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.addCategory.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
        history.push(`/${HEADER_CATEGORY_SLUG_ADMIN[categoryType]}/categories/${categoryType}`)
      }
    }
  })

  const [EditCategoryMutation, { loading: editCategoryLoader }] = useMutation(EDIT_CATEGORY_MUTATION, {
    onCompleted: (data) => {
      if (data && data.editCategory) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editCategory.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
        history.push(`/${HEADER_CATEGORY_SLUG_ADMIN[categoryType]}/categories/${categoryType}`)
      }
    }
  })

  useEffect(() => {
    id && getCategory({ variables: { input: { _id: id, eHeaderCategoryType: categoryType } } })
  }, [id])

  function onAddCategory(formValue) {
    prepareCategoryData(formValue)
  }

  function prepareCategoryData(value) {
    const inputValue = {
      sName: value.sName,
      nPriority: value.nPriority,
      eType: 's',
      eHeaderCategoryType: categoryType
    }
    if (id) {
      EditCategoryMutation({ variables: { input: { categoryInput: inputValue, _id: id } } })
    } else {
      AddCategoryMutation({ variables: { input: { categoryInput: inputValue } } })
    }
  }

  function setCategoryValue(value) {
    reset({
      sName: value?.sName,
      nPriority: value?.nPriority
    })
  }

  return (
    <>
      <Form onSubmit={handleSubmit(onAddCategory)}>
        <Row>
          <Col sm="8">
            <CommonInput
              placeholder={intl.formatMessage({ id: 'writeHere' })}
              type="text"
              register={register}
              errors={categoryErrors}
              className={categoryErrors.sName && 'error'}
              name="sName"
              label="name"
              validation={{ maxLength: { value: 40, message: validationErrors.maxLength(40) } }}
              required
            />
            <Form.Group className="form-group w-100">
              <Form.Label>
                <FormattedMessage id="displayOrder" defaultMessage="Display Order" />*
              </Form.Label>
              <Form.Text className="d-block text-muted mb-2">
                <FormattedMessage
                  id="displayOrderHelp"
                  defaultMessage="Display order is the order in which the category will be displayed on the website.  Lower numbers appear first. Use 1 for the top position."
                />
              </Form.Text>
              <Form.Control
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                placeholder={intl.formatMessage({ id: 'displayOrderPlaceholder', defaultMessage: 'Enter display order' })}
                className={categoryErrors.nPriority && 'error'}
                isInvalid={!!categoryErrors.nPriority}
                {...register('nPriority', {
                  required: validationErrors.required,
                  min: { value: 1, message: 'Display order must be greater than or equal to 1' },
                  validate: (value) => Number.isInteger(value) || 'Display order must be a whole number',
                  setValueAs: (value) => (value === '' ? undefined : Number(value))
                })}
              />
              {categoryErrors.nPriority?.message && (
                <Form.Control.Feedback type="invalid">{categoryErrors.nPriority.message}</Form.Control.Feedback>
              )}
            </Form.Group>
            <div className="d-flex flex-column flex-md-row align-items-center">
              <Button variant="primary" type="submit" className="m-2" disabled={loading || editCategoryLoader}>
                <FormattedMessage id={id ? 'update' : 'add'} />
                {(loading || editCategoryLoader) && <Spinner animation="border" size="sm" />}
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </>
  )
}

export default AddEditCategory
