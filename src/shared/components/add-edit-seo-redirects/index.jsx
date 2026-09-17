import React, { useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Form, Button } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import { useMutation, useLazyQuery } from '@apollo/client'
import { useForm, Controller } from 'react-hook-form'
import Select from 'react-select'

import { validationErrors } from 'shared/constants/ValidationErrors'
import { TOAST_TYPE, SEO_REDIRECTS_TYPE_BY_CODE, URL_PREFIX, CUSTOM_URL_WITH_SLASH } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { EDIT_SEO_REDIRECT, ADD_SEO_REDIRECT, GET_SEO_REDIRECT_BY_ID } from 'graph-ql/settings/seo-redirects'
import { getSeoRedirectTypeByCode } from 'shared/utils'
import Loading from '../loading'
import CommonInput from '../common-input'

function AddEditSeoRedirects({ id, closeDrawer, handleAddEdit }) {
  const { dispatch } = useContext(ToastrContext)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    getValues,
    clearErrors,
    watch
  } = useForm({ defaultValues: { eCode: '', sNewUrl: '', sOldUrl: '' } })
  const close = useIntl().formatMessage({ id: 'close' })
  const values = getValues()
  const oldUrl = watch('sOldUrl')

  const [AddSeoRedirectMutation, { loading: addSeoRedirectLoader }] = useMutation(ADD_SEO_REDIRECT, {
    onCompleted: (data) => {
      if (data && data.addSeoRedirect) {
        closeDrawer()
        handleAddEdit(data.addSeoRedirect.oData, 'add')
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.addSeoRedirect.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
        reset({
          sNewUrl: '',
          sOldUrl: '',
          eCode: ''
        })
      }
    }
  })

  const [EditSeoRedirectMutation, { loading: editSeoRedirectLoader }] = useMutation(EDIT_SEO_REDIRECT, {
    onCompleted: (data) => {
      if (data && data.editSeoRedirect) {
        closeDrawer()
        handleAddEdit(data.editSeoRedirect.oData, 'edit')
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editSeoRedirect.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
        reset({
          sNewUrl: '',
          sOldUrl: '',
          eCode: ''
        })
      }
    }
  })

  const [getSeoRedirectById, { loading: getSeoRedirectByIdLoader }] = useLazyQuery(GET_SEO_REDIRECT_BY_ID, {
    onCompleted: (data) => {
      if (data && data.getSeoRedirectById) {
        setSeoRedirectData(data.getSeoRedirectById)
      }
    }
  })

  useEffect(() => {
    if (id) {
      getSeoRedirectById({ variables: { input: { _id: id } } })
    }
    if (!id) {
      reset({
        sNewUrl: '',
        sOldUrl: '',
        eCode: ''
      })
    }
  }, [id])

  function onSubmit(val) {
    const inputValue = {
      eCode: Number(val?.eCode.value),
      sNewUrl: val?.sNewUrl,
      sOldUrl: val?.sOldUrl
    }
    if (id) {
      EditSeoRedirectMutation({ variables: { input: { oInput: inputValue, _id: id } } })
    } else {
      AddSeoRedirectMutation({ variables: { input: { oInput: inputValue } } })
    }
  }

  function setSeoRedirectData(value) {
    const eCodeValue = value?.eCode
    const eCode = { label: getSeoRedirectTypeByCode(eCodeValue).label, value: eCodeValue }
    reset({
      eCode,
      sNewUrl: value?.sNewUrl,
      sOldUrl: value?.sOldUrl
    })
  }
  function handleBlurOldUrl(e) {
    if (values.sNewUrl && e.target.value && values.sNewUrl !== e.target.value) {
      clearErrors('sNewUrl')
    }
  }
  return (
    <>
      {(getSeoRedirectByIdLoader || editSeoRedirectLoader || addSeoRedirectLoader) && <Loading />}
      <Form className="user-filter" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <div className="top-d-button">
          <Button variant="success" type="submit" className="square" size="sm">
            <FormattedMessage id="done" />
          </Button>
        </div>
        <Form.Group className="form-group">
          <Form.Label>
            <FormattedMessage id="type" />*
          </Form.Label>
          <Controller
            name="eCode"
            control={control}
            {...register('eCode', {
              required: validationErrors.required
            })}
            render={({ field: { onChange, value = [], ref } }) => (
              <Select
                ref={ref}
                value={value || getValues().eCode}
                options={SEO_REDIRECTS_TYPE_BY_CODE}
                className={`react-select ${errors?.eCode && 'error'}`}
                classNamePrefix="select"
                onChange={(e) => {
                  onChange(e)
                }}
              />
            )}
          />
          {errors.eCode && <Form.Control.Feedback type="invalid">{errors.eCode.message}</Form.Control.Feedback>}
        </Form.Group>

        <CommonInput
          type="text"
          register={register}
          urlPrifix={URL_PREFIX}
          errors={errors}
          onBlur={handleBlurOldUrl}
          className={errors?.sOldUrl && 'error'}
          validation={{ pattern: { value: CUSTOM_URL_WITH_SLASH, message: validationErrors.customURL } }}
          name="sOldUrl"
          label="oldUrl"
          required
        />

        <CommonInput
          type="text"
          register={register}
          urlPrifix={URL_PREFIX}
          errors={errors}
          className={errors?.sNewUrl && 'error'}
          validation={{
            validate: (value) => (oldUrl ? value !== oldUrl || validationErrors.oldAndNewUrlCanNotBeSame : true),
            pattern: { value: CUSTOM_URL_WITH_SLASH, message: validationErrors.customURL }
          }}
          name="sNewUrl"
          label="newUrl"
          required
        />
      </Form>
    </>
  )
}
AddEditSeoRedirects.propTypes = {
  getSeoBySlug: PropTypes.func,
  disabled: PropTypes.bool,
  closeDrawer: PropTypes.func,
  id: PropTypes.string,
  handleAddEdit: PropTypes.func
}

export default AddEditSeoRedirects
