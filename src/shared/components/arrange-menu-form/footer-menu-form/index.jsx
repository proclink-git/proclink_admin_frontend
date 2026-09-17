import { FormattedMessage } from 'react-intl'
import { useMutation, useQuery } from '@apollo/client'
import React, { useContext } from 'react'
import { Button, Form, Spinner } from 'react-bootstrap'
import { FormProvider, useForm } from 'react-hook-form'

import { ADD_FOOTER_MENU, FOOTER_MENU } from 'graph-ql/settings/arrange-menu'
import FooterMenu from './footer-menu'
import FooterLocation from './footer-location'
import CommonInput from 'shared/components/common-input'
import { TOAST_TYPE } from 'shared/constants'
import { removeTypenameKey } from 'shared/utils'
import PermissionProvider from 'shared/components/permission-provider'
import { ToastrContext } from 'shared/components/toastr'

function getDefaultAddress() {
  return { sLabel: '', sAddress: '' }
}

function getDefaultMenu() {
  return { sTitle: '', sSlug: '', eType: '' }
}

function normalizeFooterMenuItems(items = []) {
  if (!Array.isArray(items) || !items.length) return [getDefaultMenu()]

  return items
    .slice()
    .sort((firstItem, secondItem) => (firstItem?.nPriority || 0) - (secondItem?.nPriority || 0))
    .map((item) => ({
      sTitle: item?.sTitle || item?.eType || '',
      sSlug: item?.sSlug || '',
      eType: item?.eType || item?.sTitle || ''
    }))
}

function buildFooterMenuItems(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => ({
      sTitle: item?.sTitle?.trim() || '',
      sSlug: item?.sSlug?.trim() || '',
      eType: item?.eType?.trim() || item?.sTitle?.trim() || '',
      nPriority: index + 1
    }))
    .filter((item) => item?.sTitle || item?.sSlug || item?.eType)
}

function normalizeFooterMenu(data = {}) {
  const footerMenu = removeTypenameKey(data) || {}

  return {
    _id: footerMenu?._id,
    aAddresses:
      Array.isArray(footerMenu?.aAddresses) && footerMenu.aAddresses.length ? footerMenu.aAddresses.map((item) => ({
        sLabel: item?.sLabel || '',
        sAddress: item?.sAddress || ''
      })) : [getDefaultAddress()],
    aMenu: normalizeFooterMenuItems(footerMenu?.aMenu),
    aCMSMenu: normalizeFooterMenuItems(footerMenu?.aCMSMenu),
    sCopyrightLine: footerMenu?.sCopyrightLine || ''
  }
}

export default function FooterMenuForm() {
  const { dispatch } = useContext(ToastrContext)
  const methods = useForm({
    mode: 'onBlur',
    defaultValues: normalizeFooterMenu()
  })
  const {
    handleSubmit,
    reset,
    register,
    formState: { errors }
  } = methods

  useQuery(FOOTER_MENU, {
    onCompleted: (data) => {
      if (data?.getFooterMenu) {
        reset(normalizeFooterMenu(data.getFooterMenu))
      }
    }
  })

  const [updateMenu, { loading }] = useMutation(ADD_FOOTER_MENU, {
    onCompleted: (data) => {
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: data?.addFooterMenu, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
      })
    }
  })

  function onSubmit(data) {
    const d = {
      aAddresses: data?.aAddresses?.map(({ id, ...rest }) => rest),
      aMenu: buildFooterMenuItems(data?.aMenu),
      aCMSMenu: buildFooterMenuItems(data?.aCMSMenu),
      sCopyrightLine: data?.sCopyrightLine?.trim() || ''
    }

    updateMenu({ variables: { input: d } })
  }

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <div className="add-border">
          <h5 className="title-text title-font mb-3">Addresses</h5>
          <FooterLocation />
        </div>
        <FooterMenu name="aMenu" title="Menu" />
        <FooterMenu name="aCMSMenu" title="CMS Menu" />
        <div className="add-border mt-4">
          <h5 className="title-text title-font mb-3">Copyright</h5>
          <CommonInput
            type="text"
            register={register}
            errors={errors}
            className={errors?.sCopyrightLine && 'error'}
            name="sCopyrightLine"
            label="Copyright Line"
            disableDefaultMaxLength
          />
        </div>
        <PermissionProvider isAllowedTo="EDIT_MENU_ARRANGEMENT">
          <Button variant="primary" type="submit" className="mt-3" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : <FormattedMessage id="update" />}
          </Button>
        </PermissionProvider>
      </Form>
    </FormProvider>
  )
}
