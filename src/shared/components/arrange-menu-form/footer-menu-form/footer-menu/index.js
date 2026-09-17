import React, { useEffect } from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { Button, Col, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'

import CommonInput from 'shared/components/common-input'
import InputArrayBox from 'shared/components/input-array-box'
import { DragAndDrop, Drop } from 'shared/components/drag-and-drop'
import DragIcon from 'assets/images/drag-icon.svg'
import PropTypes from 'prop-types'

function getDefaultMenu() {
  return {
    sTitle: '',
    sSlug: '',
    eType: ''
  }
}

FooterMenu.propTypes = {
  name: PropTypes.string,
  title: PropTypes.string
}

export default function FooterMenu({ name = 'aMenu', title = 'Menu' }) {
  const {
    control,
    setValue,
    register,
    watch,
    formState: { errors }
  } = useFormContext()

  const { fields, append, remove } = useFieldArray({
    control,
    name
  })

  const menuItems = watch(name) || []

  useEffect(() => {
    if (fields.length === 0) append(getDefaultMenu())
  }, [append, fields.length])

  function handleDragEnd(result) {
    const { source, destination } = result
    if (!destination || source.index === destination.index) return

    const updatedMenu = Array.from(menuItems)
    const [removed] = updatedMenu.splice(source.index, 1)
    updatedMenu.splice(destination.index, 0, removed)
    setValue(name, updatedMenu)
  }

  return (
    <div className="add-border mt-4">
      <h5 className="title-text title-font mb-3">{title}</h5>
      <DragAndDrop onDragEnd={handleDragEnd}>
        <Drop id={`${name}-droppable`} type={`${name}-droppable-category`}>
          {fields.map((field, index) => (
            <Draggable key={field.id} draggableId={`${name}-${field.id}`} index={index}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.draggableProps} className="mb-3">
                  <InputArrayBox
                    actions={
                      <>
                        {index + 1 === fields.length && (
                          <Button type="button" onClick={() => append(getDefaultMenu())} variant="link" size="sm" className="square icon-btn">
                            <i className="icon-add d-block" />
                          </Button>
                        )}
                        {fields.length > 1 && (
                          <Button type="button" onClick={() => remove(index)} variant="link" size="sm" className="square icon-btn">
                            <i className="icon-delete d-block" />
                          </Button>
                        )}
                        <div className="square icon-btn btn btn-link btn-sm" {...provided.dragHandleProps}>
                          <img src={DragIcon} alt="drag-icon" width={20} height={20} />
                        </div>
                      </>
                    }
                  >
                    <Row>
                      <Col md="6">
                        <CommonInput
                          type="text"
                          register={register}
                          errors={errors}
                          className={errors?.[name]?.[index]?.sTitle && 'error'}
                          name={`${name}[${index}].sTitle`}
                          label="Menu"
                          required
                        />
                      </Col>
                      <Col md="6">
                        <CommonInput
                          type="text"
                          register={register}
                          errors={errors}
                          className={errors?.[name]?.[index]?.sSlug && 'error'}
                          name={`${name}[${index}].sSlug`}
                          label="Slug"
                          required
                          disableDefaultMaxLength
                        />
                      </Col>
                    </Row>
                  </InputArrayBox>
                </div>
              )}
            </Draggable>
          ))}
        </Drop>
      </DragAndDrop>
    </div>
  )
}
