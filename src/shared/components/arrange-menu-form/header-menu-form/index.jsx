import React, { useContext } from 'react'
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { ADD_HEADER_MENU, HEADER_MENU } from 'graph-ql/settings/arrange-menu'
import { useMutation, useQuery } from '@apollo/client'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import HeaderDraggableMenu from './header-draggable-menu'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import { ToastrContext } from 'shared/components/toastr'
import { EMAIL, TOAST_TYPE, URL_REGEX } from 'shared/constants'
import PermissionProvider from 'shared/components/permission-provider'
import { removeTypenameKey } from 'shared/utils'
import InputArrayBox from 'shared/components/input-array-box'
import CommonInput from 'shared/components/common-input'
import Select from 'react-select'
import { validationErrors } from 'shared/constants/ValidationErrors'

const HEADER_SOCIAL_LINK_TYPES = [
  { value: 'i', label: 'Instagram' },
  { value: 'f', label: 'Facebook' },
  { value: 't', label: 'Twitter / X' },
  { value: 'l', label: 'LinkedIn' },
  { value: 'y', label: 'YouTube' }
]

const HeaderMenuForm = () => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    getValues,
    clearErrors,
    setValue,
    reset
  } = useForm({
    defaultValues: {
      category: getDefaultValue(),
      aHeaderSocial: getDefaultHeaderSocial(),
      oHeaderContact: getDefaultHeaderContact()
    }
  })

  const { fields, remove, insert } = useFieldArray({
    control,
    name: 'category'
  })
  const {
    fields: socialFields,
    append: appendSocial,
    remove: removeSocial
  } = useFieldArray({
    control,
    name: 'aHeaderSocial'
  })
  const { dispatch } = useContext(ToastrContext)
  const socialValues = watch('aHeaderSocial') || []

  // const watchFields = watch('category')

  const { refetch: refetchHeaderMenu } = useQuery(HEADER_MENU, {
    onCompleted: (data) => {
      reset({
        category: getDefaultValue(data?.getHeaderMenuV2),
        aHeaderSocial: getDefaultHeaderSocial(data?.getHeaderMenuV2?.aHeaderSocial),
        oHeaderContact: getDefaultHeaderContact(data?.getHeaderMenuV2?.oHeaderContact, data?.getHeaderMenuV2?.aMenu)
      })
    }
  })

  const [addHeaderMenu, { loading }] = useMutation(ADD_HEADER_MENU, {
    onCompleted: (data) => {
      refetchHeaderMenu()
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: data?.addHeaderMenuV2, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
      })
    }
  })

  function onSubmit(data) {
    const headerContact = prepareHeaderContact(data?.oHeaderContact)
    const headerSocial = prepareHeaderSocial(data?.aHeaderSocial)
    const headerData = removeTypenameKey(data?.category || []).map((rest, i) => ({
      ...prepareMenuItem(rest),
      nSort: i + 1
    }))

    addHeaderMenu({ variables: { input: headerData, aHeaderSocial: headerSocial, oHeaderContact: headerContact } })
  }

  function getDefaultValue(data) {
    const menuItems = Array.isArray(data) ? data : data?.aMenu

    if (menuItems?.length) {
      return menuItems.map((i) => getDefaultMenuItem(i))
    } else {
      return [{ ...getDefaultMenuItem(), _id: 'dragId' }]
    }
  }

  const nestingLimit = 5

  return (
    <div className="d-flex flex-column align-items-start">
      <div className="data-table w-100">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DragDropContext onDragEnd={(result) => handleDragEnd(result, setValue, getValues)}>
            <Droppable droppableId="droppable" type="droppable-category">
              {(provided) => {
                return (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {fields.map((category, categoryIndex) => {
                      return (
                        <HeaderDraggableMenu
                          key={category?.id}
                          level={0}
                          nestingLimit={nestingLimit}
                          category={category}
                          mainMenu={fields}
                          prefix={`category.${categoryIndex}.`}
                          categoryIndex={categoryIndex}
                          register={register}
                          errors={errors?.category?.[categoryIndex]}
                          formErrors={errors}
                          getValues={getValues}
                          clearErrors={clearErrors}
                          control={control}
                          setValue={setValue}
                          insert={insert}
                          remove={remove}
                        />
                      )
                    })}
                    {provided.placeholder}
                  </div>
                )
              }}
            </Droppable>
          </DragDropContext>
          <div className="add-border mt-4 pt-4">
            <h5 className="title-text title-font mb-3">Header Contact</h5>
            <Row>
              <Col md="6">
                <CommonInput
                  type="text"
                  register={register}
                  errors={errors}
                  className={errors?.oHeaderContact?.sEmail && 'error'}
                  name="oHeaderContact.sEmail"
                  label="Email"
                  validation={{ pattern: { value: EMAIL, message: validationErrors.email } }}
                  disableDefaultMaxLength
                />
              </Col>
              <Col md="6">
                <CommonInput
                  type="text"
                  register={register}
                  errors={errors}
                  className={errors?.oHeaderContact?.sPhone && 'error'}
                  name="oHeaderContact.sPhone"
                  label="Phone"
                  disableDefaultMaxLength
                />
              </Col>
            </Row>
          </div>

          <div className="add-border mt-4 pt-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="title-text title-font mb-0">Header Social Links</h5>
              <Button
                type="button"
                onClick={() => appendSocial(getDefaultHeaderSocialItem())}
                variant="link"
                className="square add-media hover-none"
                disabled={socialValues.some((item) => !item?.eType || !item?.sUrl)}
              >
                <i className="icon-add" />
                Add Social Link
              </Button>
            </div>
            {socialFields.length === 0 && (
              <Button type="button" onClick={() => appendSocial(getDefaultHeaderSocialItem())} variant="outline-primary" size="sm">
                Add Social Link
              </Button>
            )}
            {socialFields.map((field, index) => (
              <InputArrayBox
                key={field.id}
                className="mb-3"
                actions={
                  <>
                    {socialFields.length > 0 && (
                      <Button type="button" onClick={() => removeSocial(index)} variant="link" size="sm" className="square icon-btn">
                        <i className="icon-delete d-block" />
                      </Button>
                    )}
                  </>
                }
              >
                <Row>
                  <Col md="4">
                    <Form.Group className="form-group">
                      <Form.Label>Social Type*</Form.Label>
                      <i className="icon-chevron-down"></i>
                      <Controller
                        name={`aHeaderSocial[${index}].eType`}
                        control={control}
                        rules={{ required: validationErrors.required }}
                        render={({ field: { onChange, value, ref } }) => (
                          <Select
                            ref={ref}
                            value={HEADER_SOCIAL_LINK_TYPES.find((option) => option.value === value) || null}
                            options={getHeaderSocialOptions(socialValues, index)}
                            className={`react-select ${errors?.aHeaderSocial?.[index]?.eType ? 'error' : ''}`}
                            classNamePrefix="select"
                            isSearchable={false}
                            onChange={(selectedOption) => {
                              const nextValue = selectedOption?.value || ''
                              onChange(nextValue)
                              setValue(`aHeaderSocial[${index}].sIconKey`, nextValue)
                            }}
                          />
                        )}
                      />
                      {errors?.aHeaderSocial?.[index]?.eType && <Form.Control.Feedback type="invalid">{errors?.aHeaderSocial?.[index]?.eType.message}</Form.Control.Feedback>}
                    </Form.Group>
                    <input type="hidden" {...register(`aHeaderSocial[${index}].sIconKey`)} />
                  </Col>
                  <Col md="4">
                    <CommonInput
                      type="text"
                      register={register}
                      errors={errors}
                      className={errors?.aHeaderSocial?.[index]?.sHandle && 'error'}
                      name={`aHeaderSocial[${index}].sHandle`}
                      label="Handle"
                      disableDefaultMaxLength
                    />
                  </Col>
                  <Col md="4">
                    <CommonInput
                      type="text"
                      register={register}
                      errors={errors}
                      className={errors?.aHeaderSocial?.[index]?.sUrl && 'error'}
                      name={`aHeaderSocial[${index}].sUrl`}
                      label="URL*"
                      required
                      validation={{ pattern: { value: URL_REGEX, message: validationErrors.url } }}
                      disableDefaultMaxLength
                    />
                  </Col>
                </Row>
              </InputArrayBox>
            ))}
          </div>
          <PermissionProvider isAllowedTo="EDIT_MENU_ARRANGEMENT">
            <Button variant="primary" type="submit" className="mt-3">
              {loading ? <Spinner animation="border" size="sm" /> : <FormattedMessage id="update" />}
            </Button>
          </PermissionProvider>
        </form>
      </div>
    </div>
  )
}
export default HeaderMenuForm

function getDefaultMenuItem(item) {
  return {
    sTitle: item?.sTitle || '',
    aChildren: item?.aChildren?.map((child) => getDefaultMenuItem(child)) || [],
    sSlug: item?.sSlug || '',
    sUrl: item?.sUrl || '',
    bIsMulti: typeof item?.bIsMulti === 'boolean' ? item?.bIsMulti : false,
    bIsExternal: typeof item?.bIsExternal === 'boolean' ? item?.bIsExternal : false,
    eUrlTarget: item?.eUrlTarget || '_self',
    eMenuType: item?.eMenuType || 'self',
    oLogoOnly: getDefaultImageValue(item?.oLogoOnly),
    oLogoWithText: getDefaultImageValue(item?.oLogoWithText)
  }
}

function getDefaultHeaderSocialItem(item) {
  return {
    eType: item?.eType || '',
    sUrl: item?.sUrl || '',
    sHandle: item?.sHandle || '',
    sIconKey: item?.sIconKey || item?.eType || ''
  }
}

function getDefaultHeaderSocial(items = []) {
  return items?.length ? items.map((item) => getDefaultHeaderSocialItem(item)) : [getDefaultHeaderSocialItem()]
}

function getDefaultHeaderContact(contact, menuItems = []) {
  const fallbackContact = menuItems.find((item) => isContactMenuItem(item)) || menuItems.find((item) => item?.sContactEmail || item?.sContactPhone)

  return {
    sEmail: contact?.sEmail || fallbackContact?.sContactEmail || '',
    sPhone: contact?.sPhone || fallbackContact?.sContactPhone || ''
  }
}

function getDefaultImageValue(image) {
  if (!image) return undefined

  return {
    sText: image?.sText || '',
    sCaption: image?.sCaption || '',
    sAttribute: image?.sAttribute || '',
    sUrl: image?.sUrl || ''
  }
}

function prepareMenuItem(item, level = 0) {
  const payload = {
    sSlug: item?.sSlug,
    sTitle: item?.sTitle,
    aChildren: item?.aChildren?.map((child) => prepareMenuItem(child, level + 1)) || []
  }
  const sUrl = getNullableValue(item?.sUrl)

  if (typeof item?.bIsMulti === 'boolean') payload.bIsMulti = item?.bIsMulti
  if (level > 0 && typeof item?.bIsExternal === 'boolean') payload.bIsExternal = item?.bIsExternal
  if (sUrl) payload.sUrl = sUrl
  if (item?.eUrlTarget) payload.eUrlTarget = item?.eUrlTarget
  if (item?.eMenuType) payload.eMenuType = item?.eMenuType

  const logoOnly = prepareImageField(item?.oLogoOnly)
  const logoWithText = prepareImageField(item?.oLogoWithText)

  if (logoOnly) payload.oLogoOnly = logoOnly
  if (logoWithText) payload.oLogoWithText = logoWithText

  return payload
}

function getHeaderSocialOptions(items = [], currentIndex) {
  const selectedTypes = items.map((item, index) => (index === currentIndex ? null : item?.eType)).filter(Boolean)

  return HEADER_SOCIAL_LINK_TYPES.map((option) => ({
    ...option,
    isDisabled: selectedTypes.includes(option.value)
  }))
}

function prepareImageField(image) {
  if (!image) return undefined

  const payload = {
    sText: getNullableValue(image?.sText),
    sCaption: getNullableValue(image?.sCaption),
    sAttribute: getNullableValue(image?.sAttribute),
    sUrl: getNullableValue(image?.sUrl)
  }

  return payload.sText || payload.sCaption || payload.sAttribute || payload.sUrl ? payload : undefined
}

function prepareHeaderContact(contact) {
  const sEmail = getNullableValue(contact?.sEmail)
  const sPhone = getNullableValue(contact?.sPhone)

  if (!(sEmail || sPhone)) return null

  return {
    sEmail,
    sPhone
  }
}

function prepareHeaderSocial(items = []) {
  return items
    .filter((item) => item?.eType && item?.sUrl)
    .map((item) => ({
      eType: item.eType,
      sUrl: getNullableValue(item?.sUrl),
      sHandle: getNullableValue(item?.sHandle)
    }))
}

function getNullableValue(value) {
  if (typeof value !== 'string') return value || null

  const trimmedValue = value.trim()
  return trimmedValue.length ? trimmedValue : null
}

function isContactMenuItem(item) {
  const normalizedTitle = String(item?.sTitle || '').trim().toLowerCase()
  const normalizedSlug = `/${String(item?.sSlug || '').trim().replace(/^\/+|\/+$/g, '')}`

  return item?.eMenuType === 'contact' || normalizedTitle === 'contact' || normalizedSlug === '/contact'
}

const handleDragEnd = (result, setMenu, getMenu) => {
  const { type, source, destination } = result
  if (!destination) return
  const [sourceCategoryId, sourceKey] = source.droppableId.split(':')
  const [destinationCategoryId, destinationKey] = destination.droppableId.split(':')

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
  }

  if (type.startsWith('droppable-item:')) {
    // drag and dropping for the same category
    if (sourceCategoryId === destinationCategoryId) {
      const updatedOrder = reorder(getMenu(sourceKey), source.index, destination.index)

      setMenu(sourceKey, updatedOrder)
    } else {
      const sourceOrder = getMenu(sourceKey)
      const destinationOrder = getMenu(destinationKey)

      const [removed] = sourceOrder.splice(source.index, 1)
      destinationOrder.splice(destination.index, 0, removed)
      destinationOrder[removed] = sourceOrder[removed]
      delete sourceOrder[removed]
      setMenu(sourceKey, sourceOrder)
      setMenu(destinationKey, destinationOrder)
    }
  }

  // Reordering root level
  if (type === 'droppable-category') {
    const updatedCategories = reorder(getMenu('category'), source.index, destination.index)
    setMenu('category', updatedCategories)
  }
}
