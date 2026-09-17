import React, { useEffect } from 'react'
import { Button, Form, Spinner } from 'react-bootstrap'
import DragIcon from 'assets/images/drag-icon.svg'
import PropTypes from 'prop-types'
import { Draggable } from 'react-beautiful-dnd'
import { useMutation } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'
import { useFieldArray } from 'react-hook-form'

import AddSubmenuIcon from 'assets/images/add-submenu-icon.svg'
import { Drop } from 'shared/components/drag-and-drop'
import SidebarDraggableSubMenu from '../sidebar-draggable-submenu'
import CommonInput from 'shared/components/common-input'
import { GENERATE_PRE_SIGNED } from 'graph-ql/generate-pre-signed-url'
import { uploadImage } from 'shared/functions/PreSignedData'
import ToolTip from 'shared/components/tooltip'
import { getS3Url } from 'shared/utils'

const SidebarDraggableMenu = ({ category, mainMenu, categoryIndex, append, remove, register, errors, setValue, control, watch }) => {
  const [image, setImage] = React.useState(null)
  const [imageLoading, setImageLoading] = React.useState(false)
  const { append: subAppend, remove: subRemove } = useFieldArray({
    control,
    name: `category[${categoryIndex}].aSlide`
  })
  const watchFields = watch(`category[${categoryIndex}].aSlide`)

  useEffect(() => {
    setImage(category?.oImg?.sUrl && { url: getS3Url(category?.oImg?.sUrl), s3Url: category?.oImg?.sUrl })
  }, [])

  useEffect(() => {
    setValue(`category[${categoryIndex}].oImg`, { sUrl: image?.s3Url })
  }, [image])

  const [generatePreSignedUrl] = useMutation(GENERATE_PRE_SIGNED)

  async function presignedProPic(file) {
    const profileInput = {
      sFileName: file.name.split('.')[0],
      sContentType: file.type,
      sType: 'sidemenu'
    }
    setImageLoading(true)
    const { data: preSignedData } = await generatePreSignedUrl({ variables: { generatePreSignedUrlInput: profileInput } })
    const uploadData = []
    uploadData.push({ sUploadUrl: preSignedData.generatePreSignedUrl[0].sUploadUrl, file })
    uploadImage(uploadData).then((res) => {
      setImage({ url: getS3Url(preSignedData.generatePreSignedUrl[0].sS3Url), s3Url: preSignedData.generatePreSignedUrl[0].sS3Url })
      setImageLoading(false)
      setValue(`category[${categoryIndex}].oImg`, { sUrl: preSignedData.generatePreSignedUrl[0].sS3Url })
    })
  }

  function handleImageChange(e) {
    // on Image Change
    if (e.target.files) {
      presignedProPic(e.target.files[0])
    }
  }
  return (
    <Draggable key={category?._id} draggableId={category?._id} index={categoryIndex}>
      {(provided, snapshot) => {
        return (
          <div ref={provided.innerRef} {...provided.draggableProps}>
            <Form.Group className="w-100 form-group d-flex flex-column justify-content-center">
              <div className="w-100 d-flex align-items-start" style={{ gap: '12px' }}>
                <input
                  type="file"
                  {...register(`category[${categoryIndex}].oImg`)}
                  id={`category[${categoryIndex}].oImg`}
                  accept=".jpg,.png,.jpeg,.webp"
                  name={`category[${categoryIndex}].oImg`}
                  hidden
                  onChange={(e) => {
                    handleImageChange(e)
                  }}
                />
                {image?.url &&
                  (imageLoading ? (
                    <Button variant="outlined" className="square icon-btn" style={{ width: '37px', height: '37' }}>
                      <Spinner animation="border" size="sm" />
                    </Button>
                  ) : (
                    <img
                      src={image?.url}
                      alt="menu image"
                      width={37}
                      height={37}
                      className="rounded"
                      style={{ objectFit: 'cover', backgroundColor: '#F2F2F2' }}
                    />
                  ))}
                <CommonInput
                  register={register}
                  errors={errors}
                  className={errors?.category?.[`${categoryIndex}`]?.sName && 'error'}
                  as="input"
                  placeholder={useIntl().formatMessage({ id: 'menu' })}
                  type="text"
                  name={`category[${categoryIndex}].sName`}
                  required
                >
                  {errors && errors?.category?.[`${categoryIndex}`]?.sName && (
                    <Form.Control.Feedback type="invalid">{errors?.category?.[`${categoryIndex}`]?.sName.message}</Form.Control.Feedback>
                  )}
                </CommonInput>
                {(category?.aSlide === undefined || category?.aSlide?.length < 1) && (
                  <CommonInput
                    register={register}
                    errors={errors}
                    className={errors?.category?.[`${categoryIndex}`]?.sSlug && 'error'}
                    as="input"
                    placeholder={useIntl().formatMessage({ id: 'menuSlug' })}
                    type="text"
                    name={`category[${categoryIndex}].sSlug`}
                    required
                  >
                    {errors && errors?.category?.[`${categoryIndex}`]?.sSlug && (
                      <Form.Control.Feedback type="invalid">{errors?.category?.[`${categoryIndex}`]?.sSlug.message}</Form.Control.Feedback>
                    )}
                  </CommonInput>
                )}
                <div className="w-100 d-flex align-items-center" style={{ gap: '12px' }}>
                  <Button variant="light" className="square icon-btn">
                    {image?.url ? (
                      <span className="icon-close" onClick={() => setImage(null)}></span>
                    ) : (
                      <label htmlFor={`category[${categoryIndex}].oImg`} style={{ cursor: 'pointer' }}>
                        <i className="icon-image d-block"></i>
                      </label>
                    )}
                  </Button>
                  <ToolTip toolTipMessage={<FormattedMessage id='addSubMenu'/>}>
                    <Button
                      variant="outline-secondary"
                      size="lg"
                      className="square icon-btn"
                      onClick={(item) => subAppend({ sName: '', sSlug: '' })}
                    >
                      <img src={AddSubmenuIcon} alt="add-submenu-icon" width={20} />
                    </Button>
                  </ToolTip>
                  <ToolTip toolTipMessage={<FormattedMessage id='addNewMenu'/>}>
                    <Button
                      variant="outline-primary"
                      size="lg"
                      className="square icon-btn"
                      onClick={() => append({ sTitle: '', sUrl: '', aSlide: [] })}
                    >
                      <i className="icon-add d-block" />
                    </Button>
                  </ToolTip>
                  {mainMenu?.length > 5 && (
                    <ToolTip toolTipMessage={<FormattedMessage id='delete'/>}>
                      <Button variant="outline-danger" onClick={() => remove(categoryIndex)} size="lg" className="square icon-btn">
                        <i className="icon-delete d-block" />
                      </Button>
                    </ToolTip>
                  )}
                  <img src={DragIcon} alt="drag-icon" {...provided.dragHandleProps} width={20} />
                </div>
              </div>

              <Drop key={category?._id} id={category?._id} type="droppable-item">
                {watchFields?.map((item, index) => {
                  return (
                    <SidebarDraggableSubMenu
                      key={item?.sSlug + index}
                      item={item}
                      categoryIndex={categoryIndex}
                      category={category}
                      index={index}
                      register={register}
                      errors={errors}
                      setValue={setValue}
                      subRemove={subRemove}
                    />
                  )
                })}
              </Drop>
            </Form.Group>
          </div>
        )
      }}
    </Draggable>
  )
}

SidebarDraggableMenu.propTypes = {
  category: PropTypes.object,
  categoryIndex: PropTypes.number,
  append: PropTypes.func,
  remove: PropTypes.func,
  register: PropTypes.func,
  errors: PropTypes.object,
  mainMenu: PropTypes.array,
  getValues: PropTypes.func,
  setValue: PropTypes.func,
  watch: PropTypes.func,
  control: PropTypes.any
}
export default SidebarDraggableMenu
