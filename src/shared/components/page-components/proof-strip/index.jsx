import React, { useContext } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { useHistory } from 'react-router'
import { useParams } from 'react-router-dom'

import { EDIT_PAGE_COMPONENT } from 'graph-ql/page-components/mutation'
import { GET_PAGE_COMPONENT } from 'graph-ql/page-components/query'
import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import { ToastrContext } from 'shared/components/toastr'
import TitleFormatHint from 'shared/components/title-format-hint'
import { TOAST_TYPE } from 'shared/constants'
import { allRoutes } from 'shared/constants/AllRoutes'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { removeTypenameKey } from 'shared/utils'

function getDefaultCta() {
  return {
    sLabel: '',
    sUrl: ''
  }
}

function normalizeProofStripCta(aCta = []) {
  const primaryCta = Array.isArray(aCta) ? aCta[0] : undefined

  return {
    sLabel: primaryCta?.sLabel || '',
    sUrl: primaryCta?.sUrl || ''
  }
}

function buildProofStripPayload(data = {}) {
  const oComponentInput = data?.oComponentInput || {}
  const primaryCta = {
    sLabel: oComponentInput?.aCta?.[0]?.sLabel || '',
    sUrl: oComponentInput?.aCta?.[0]?.sUrl || ''
  }

  return {
    eType: data?.eType,
    oComponentInput: {
      sComponentTitle: oComponentInput?.sComponentTitle || '',
      sBadge: oComponentInput?.sBadge || '',
      sTitle: oComponentInput?.sTitle || '',
      sDescription: oComponentInput?.sDescription || '',
      aCta: primaryCta?.sLabel || primaryCta?.sUrl ? [primaryCta] : []
    }
  }
}

export default function ProofStrip() {
  const { eType } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const history = useHistory()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    mode: 'all',
    defaultValues: {
      oComponentInput: {
        sComponentTitle: '',
        sBadge: '',
        sTitle: '',
        sDescription: '',
        aCta: [getDefaultCta()]
      }
    }
  })

  const values = watch()
  const previewData = values?.oComponentInput || {}

  useQuery(GET_PAGE_COMPONENT, {
    variables: { input: { eType } },
    onCompleted: (data) => {
      if (data?.getComponent?.oComponent) {
        const component = data?.getComponent?.oComponent
        reset({
          oComponentInput: {
            sComponentTitle: component?.sComponentTitle || '',
            sBadge: component?.sBadge || '',
            sTitle: component?.sTitle || '',
            sDescription: component?.sDescription || '',
            aCta: [normalizeProofStripCta(removeTypenameKey(component?.aCta || []))]
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
    edit({ variables: { input: buildProofStripPayload(data) } })
  }

  return (
    <Row>
      <Col sm="8">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('eType')} value={eType} />
          <CountInput
            type="text"
            currentLength={previewData?.sComponentTitle?.length}
            register={register('oComponentInput.sComponentTitle', {
              required: validationErrors.required
            })}
            error={errors}
            name="oComponentInput.sComponentTitle"
            label="Component Title*"
          />
          <CountInput
            type="text"
            currentLength={previewData?.sBadge?.length}
            register={register('oComponentInput.sBadge', {
              required: validationErrors.required
            })}
            error={errors}
            name="oComponentInput.sBadge"
            label="Badge*"
          />
          <CountInput
            type="text"
            currentLength={previewData?.sTitle?.length}
            register={register('oComponentInput.sTitle', {
              required: validationErrors.required
            })}
            error={errors}
            name="oComponentInput.sTitle"
            label="Headline*"
          />
          <TitleFormatHint subject="headline" />
          <CountInput
            type="textarea"
            textarea
            rows={6}
            currentLength={previewData?.sDescription?.length}
            register={register('oComponentInput.sDescription', {
              required: validationErrors.required
            })}
            error={errors}
            name="oComponentInput.sDescription"
            label="Description*"
          />
          <CountInput
            type="text"
            currentLength={previewData?.aCta?.[0]?.sLabel?.length}
            register={register('oComponentInput.aCta[0].sLabel', {
              required: validationErrors.required
            })}
            error={errors}
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
    </Row>
  )
}
