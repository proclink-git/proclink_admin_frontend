import React, { useContext } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { FormProvider, useForm } from 'react-hook-form'
import { Button, Form, Spinner } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { useHistory } from 'react-router'
import { useParams } from 'react-router-dom'

import { EDIT_PAGE_COMPONENT } from 'graph-ql/page-components/mutation'
import { GET_PAGE_COMPONENT } from 'graph-ql/page-components/query'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import { allRoutes } from 'shared/constants/AllRoutes'
import { removeTypenameKey } from 'shared/utils'
import ServiceListingAccordionSection from './section'
import { buildServiceListingSectionForSubmit, getDefaultServiceListingImage, getDefaultServiceListingSection, normalizeServiceListingSection } from './utils'

function normalizeImage(value = {}) {
  return {
    ...getDefaultServiceListingImage(),
    ...(removeTypenameKey(value) || {})
  }
}

export default function ServiceListingAccordion() {
  const { eType } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const history = useHistory()

  const methods = useForm({
    mode: 'all',
    defaultValues: {
      oComponentInput: getDefaultServiceListingSection()
    }
  })

  const { handleSubmit, reset } = methods

  useQuery(GET_PAGE_COMPONENT, {
    variables: { input: { eType } },
    onCompleted: (data) => {
      if (data?.getComponent?.oComponent) {
        reset({
          oComponentInput: normalizeServiceListingSection(removeTypenameKey(data?.getComponent?.oComponent), normalizeImage)
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
    edit({
      variables: {
        input: {
          eType,
          oComponentInput: buildServiceListingSectionForSubmit(data?.oComponentInput, normalizeImage)
        }
      }
    })
  }

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ServiceListingAccordionSection basePath="oComponentInput" />
        <Button variant="primary" type="submit" className="m-2" disabled={loading}>
          <FormattedMessage id="update" />
          {loading && <Spinner animation="border" size="sm" />}
        </Button>
      </Form>
    </FormProvider>
  )
}
