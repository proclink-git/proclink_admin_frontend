import React from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'

import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import CommonInput from 'shared/components/common-input'
import CountInput from 'shared/components/count-input'
import InputArrayBox from 'shared/components/input-array-box'
import TitleFormatHint from 'shared/components/title-format-hint'
import { getDefaultIndustrialSectorCard } from './utils'
import useEnsureFieldArrayDefault from '../use-ensure-field-array-default'
import ImageDimensionNote from 'shared/components/image-dimension-note'

export default function IndustrialSectorsGridSection({
  basePath = 'oISG',
  sectionLabel = 'Industrial Sectors Grid',
  cardsLabel = 'Sector Cards'
}) {
  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    clearErrors,
    formState: { errors }
  } = useFormContext()

  const values = watch(basePath) || {}

  const fieldArrayName = `${basePath}.aCard`
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: fieldArrayName
  })
  useEnsureFieldArrayDefault({ fields, append, getValues, name: fieldArrayName, getDefaultValue: getDefaultIndustrialSectorCard })

  const handleDragEnd = (result) => {
    const { source, destination } = result

    if (!destination || source.index === destination.index) return

    move(source.index, destination.index)
  }

  return (
    <div className="p-3">
      <Form.Label className="text-uppercase small text-muted mb-3">{sectionLabel}</Form.Label>

      <CountInput type="text" currentLength={values?.sTitle?.length} register={register(`${basePath}.sTitle`)} error={errors} name={`${basePath}.sTitle`} label="Title" />
      <TitleFormatHint subject="title" />
      <CountInput textarea rows={6} currentLength={values?.sDescription?.length} register={register(`${basePath}.sDescription`)} error={errors} name={`${basePath}.sDescription`} label="Description" />

      <Form.Label className="text-uppercase small text-muted mb-2">{cardsLabel}</Form.Label>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="industrial-sector-cards" type="droppable-sector-card">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {fields.map((field, index) => (
                <Draggable key={field.id} draggableId={`industrial-sector-card-${field.id}`} index={index}>
                  {(dragProvided) => (
                    <div ref={dragProvided.innerRef} {...dragProvided.draggableProps}>
                      <InputArrayBox
                        className="mb-3"
                        actions={
                          <>
                            <div className="square icon-btn btn btn-link btn-sm" {...dragProvided.dragHandleProps}>
                              <i className="icon-drag-indicator d-block" />
                            </div>
                            {index + 1 === fields.length && (
                              <Button type="button" onClick={() => append(getDefaultIndustrialSectorCard())} variant="link" size="sm" className="square icon-btn">
                                <i className="icon-add d-block" />
                              </Button>
                            )}
                            {fields.length > 1 && (
                              <Button type="button" onClick={() => remove(index)} variant="link" size="sm" className="square icon-btn">
                                <i className="icon-delete d-block" />
                              </Button>
                            )}
                          </>
                        }
                      >
                        <Form.Label>Card {index + 1}</Form.Label>
                        <Row>
                          <Col md="8">
                            <CountInput type="text" currentLength={values?.aCard?.[index]?.sTitle?.length} register={register(`${basePath}.aCard[${index}].sTitle`)} error={errors} name={`${basePath}.aCard[${index}].sTitle`} label="Title" />
                            <CountInput textarea rows={6} currentLength={values?.aCard?.[index]?.sDescription?.length} register={register(`${basePath}.aCard[${index}].sDescription`)} error={errors} name={`${basePath}.aCard[${index}].sDescription`} label="Description" />
                            <CommonInput type="text" register={register} errors={errors} name={`${basePath}.aCard[${index}].sUrl`} label="Redirect Url" disableDefaultMaxLength />
                          </Col>
                          <Col md="4" className="add-article">
                            <ImageDimensionNote width={72} height={72} subject="industrial sectors grid icon" />
                            <CategoryPlayerTeamImage
                              galleryType="icon"
                              title="Icon"
                              name={`${basePath}.aCard[${index}].oIcon`}
                              register={register}
                              setValue={setValue}
                              values={getValues()}
                              errors={errors}
                              clearErrors={clearErrors}
                              hideCaption
                            />
                          </Col>
                        </Row>
                      </InputArrayBox>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}

IndustrialSectorsGridSection.propTypes = {
  basePath: PropTypes.string,
  sectionLabel: PropTypes.string,
  cardsLabel: PropTypes.string
}
