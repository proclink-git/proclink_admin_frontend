import React, { useContext } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { Button, Form, Spinner } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { useMutation, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { useHistory } from 'react-router'

import { GET_PAGE_COMPONENT } from 'graph-ql/page-components/query'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { EDIT_PAGE_COMPONENT } from 'graph-ql/page-components/mutation'
import { allRoutes } from 'shared/constants/AllRoutes'
import InputArrayBox from 'shared/components/input-array-box'
import { buildHomeBannerPayload, HomeBannerRow, normalizeHomeBannerComponent } from './row'

export default function HomeBanner() {
  const { eType } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const history = useHistory()

  const method = useForm({
    mode: 'all',
    defaultValues: {
      oComponentInput: normalizeHomeBannerComponent()
    }
  })

  const { handleSubmit, reset } = method

  useQuery(GET_PAGE_COMPONENT, {
    variables: { input: { eType } },
    onCompleted: (data) => {
      if (data?.getComponent?.oComponent) {
        const component = data?.getComponent?.oComponent
        reset({
          oComponentInput: normalizeHomeBannerComponent(component)
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
    edit({ variables: { input: buildHomeBannerPayload(data) } })
  }

  return (
    <FormProvider {...method}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <InputArrayBox className="p-3 mt-3">
          <HomeBannerRow />
        </InputArrayBox>
        <Button variant="primary" type="submit" className="m-2" disabled={loading}>
          <FormattedMessage id="update" />
          {loading && <Spinner animation="border" size="sm" />}
        </Button>
      </Form>
    </FormProvider>
  )
}
