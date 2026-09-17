import React, { useContext, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { DragAndDrop, Drop } from '../../drag-and-drop'
import { ADD_SLIDER, GET_SLIDER } from 'graph-ql/settings/arrange-menu'
import { useMutation, useQuery } from '@apollo/client'
import { useFieldArray, useForm } from 'react-hook-form'
import SidebarDraggableMenu from './sidebar-draggable-menu'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import { handleDragEnd } from 'shared/utils'
import PermissionProvider from 'shared/components/permission-provider'

const SidebarMenuForm = () => {
  const { dispatch } = useContext(ToastrContext)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    getValues,
    watch,
    setValue,
    reset
  } = useForm({ defaultValues: { category: getDefaultValue() } })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'category'
  })

  const watchFields = watch('category')

  const [sidebarMenu, setSidebarMenu] = useState(fields)
  useQuery(GET_SLIDER, {
    onCompleted: (data) => {
      reset({ category: getDefaultValue(data?.getFrontSlider) })
    }
  })

  const [addSidebarMenu, { loading }] = useMutation(ADD_SLIDER, {
    onCompleted: (data) => {
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: data?.addSlider, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
      })
    }
  })

  function getDefaultValue(data) {
    if (data) {
      return data.map((i) => {
        return {
          _id: i?._id,
          __typename: i?.__typename,
          sName: i?.sName,
          aSlide: i?.aSlide || [],
          sSlug: i?.sSlug,
          oImg: i?.oImg,
          eType: i?.eType,
          bIsMulti: i?.bIsMulti || []
        }
      })
    } else {
      return [{ sName: '', sSlug: '', _id: 'sideBarDragId' }]
    }
  }

  function onSubmit(data) {
    const sidebarData = data?.category?.map((rest, i) => {
      return {
        aSlide: rest.aSlide.map((restSlide, i) => {
          return {
            sName: restSlide?.sName,
            sSlug: restSlide?.sSlug
          }
        }),
        oImg: rest?.oImg,
        bIsMulti: rest?.aSlide?.length > 0,
        eType: rest?.eType,
        nPriority: i + 1,
        sName: rest?.sName,
        sSlug: rest?.sSlug
      }
    })
    addSidebarMenu({ variables: { input: sidebarData } })
  }

  return (
    <div className='d-flex flex-column align-items-start'>
      <div className='data-table w-100'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DragAndDrop onDragEnd={(result) => handleDragEnd(result, 'aSlide', watchFields, setValue)}>
            <Drop id='droppable' type='droppable-category'>
              {watchFields.map((category, categoryIndex) => {
                return (
                  <SidebarDraggableMenu
                    key={category?._id}
                    category={category}
                    sidebarMenu={sidebarMenu}
                    mainMenu={watchFields}
                    setSidebarMenu={setSidebarMenu}
                    categoryIndex={categoryIndex}
                    register={register}
                    watch={watch}
                    errors={errors}
                    getValues={getValues}
                    control={control}
                    setValue={setValue}
                    append={append}
                    remove={remove}
                  />
                )
              })}
            </Drop>
          </DragAndDrop>
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
export default SidebarMenuForm
