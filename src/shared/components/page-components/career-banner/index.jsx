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
import { removeTypenameKey } from 'shared/utils'

function getDefaultImage() {
  return {
    sUrl: '',
    sText: '',
    sCaption: '',
    sAttribute: ''
  }
}

function normalizeCareerBanner(component = {}) {
  const primaryCta = Array.isArray(component?.aCta) ? component?.aCta?.[0] : undefined

  return {
    sComponentTitle: component?.sComponentTitle || '',
    sTitle: component?.sTitle || '',
    sDescription: component?.sDescription || '',
    oImg: {
      ...getDefaultImage(),
      ...(component?.oImg || {})
    },
    aCta: [
      {
        sLabel: primaryCta?.sLabel || '',
        sUrl: primaryCta?.sUrl || ''
      }
    ]
  }
}

function buildCareerBannerPayload(data = {}) {
  const oComponentInput = data?.oComponentInput || {}
  const primaryCta = {
    sLabel: oComponentInput?.aCta?.[0]?.sLabel || '',
    sUrl: oComponentInput?.aCta?.[0]?.sUrl || ''
  }

  return {
    eType: data?.eType,
    oComponentInput: {
      sComponentTitle: oComponentInput?.sComponentTitle || '',
      sTitle: oComponentInput?.sTitle || '',
      sDescription: oComponentInput?.sDescription || '',
      oImg: oComponentInput?.oImg || getDefaultImage(),
      aCta: primaryCta?.sLabel || primaryCta?.sUrl ? [primaryCta] : []
    }
  }
}

export default function CareerBanner() {
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
      oComponentInput: normalizeCareerBanner()
    }
  })

  const value = watch()
  const formValues = value?.oComponentInput || {}

  useQuery(GET_PAGE_COMPONENT, {
    variables: { input: { eType } },
    onCompleted: (data) => {
      if (data?.getComponent?.oComponent) {
        const component = removeTypenameKey(data?.getComponent?.oComponent)
        reset({
          oComponentInput: normalizeCareerBanner(component)
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
    edit({ variables: { input: buildCareerBannerPayload(data) } })
  }

  return (
    <Row>
      <Col sm="8">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('eType')} value={eType} />
          <CountInput
            type="text"
            currentLength={formValues?.sTitle?.length}
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
            rows={8}
            currentLength={formValues?.sDescription?.length}
            register={register('oComponentInput.sDescription', {
              required: validationErrors.required
            })}
            error={errors}
            className={errors?.oComponentInput?.sDescription && 'error'}
            name="oComponentInput.sDescription"
            label="Description*"
          />
          <CountInput
            type="text"
            currentLength={formValues?.aCta?.[0]?.sLabel?.length}
            register={register('oComponentInput.aCta[0].sLabel', {
              required: validationErrors.required
            })}
            error={errors}
            className={errors?.oComponentInput?.aCta?.[0]?.sLabel && 'error'}
            name="oComponentInput.aCta[0].sLabel"
            label="Button Label*"
          />
          <CommonInput
            type="text"
            register={register}
            errors={errors}
            className={errors?.oComponentInput?.aCta?.[0]?.sUrl && 'error'}
            name="oComponentInput.aCta[0].sUrl"
            label="Button Link*"
            required
            disableDefaultMaxLength
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
          hideAttribution
          required
        />
      </Col>
    </Row>
  )
}
