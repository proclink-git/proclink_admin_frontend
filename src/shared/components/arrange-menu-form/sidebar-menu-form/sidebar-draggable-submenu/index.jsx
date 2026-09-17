import React from 'react'
import { Button, Form } from 'react-bootstrap'
import DragIcon from 'assets/images/drag-icon.svg'
import PropTypes from 'prop-types'
import { Draggable } from 'react-beautiful-dnd'
import { FormattedMessage, useIntl } from 'react-intl'

import CommonInput from 'shared/components/common-input'
import { CUSTOM_URL_WITH_SLASH } from 'shared/constants'
import { validationErrors } from 'shared/constants/ValidationErrors'
import ToolTip from 'shared/components/tooltip'

const SidebarDraggableSubMenu = ({ category, item, index, categoryIndex, register, errors, setValue, subRemove }) => {
  return (
    <Draggable key={item?._id || item?.sSlug + index} type="droppable-item" draggableId={item?._id || item?.sSlug + index} index={index}>
      {(provided, snapshot) => {
        return (
          <div ref={provided.innerRef} {...provided.draggableProps}>
            <div className="d-flex align-items-start justify-content-center" style={{ marginLeft: '24px', gap: '12px' }}>
              <CommonInput
                register={register}
                errors={errors}
                className={errors?.category?.[`${categoryIndex}`]?.aSlide?.[`${index}`]?.sName && 'error'}
                placeholder={useIntl().formatMessage({ id: 'subMenu' })}
                as="input"
                type="text"
                name={`category[${categoryIndex}].aSlide[${index}].sName`}
                required
              >
                {errors && errors?.category?.[`${categoryIndex}`]?.aSlide?.[`${index}`]?.sName && (
                  <Form.Control.Feedback type="invalid">
                    {errors?.category?.[`${categoryIndex}`]?.aSlide?.[`${index}`]?.sName.message}
                  </Form.Control.Feedback>
                )}
              </CommonInput>
              <CommonInput
                register={register}
                errors={errors}
                placeholder={useIntl().formatMessage({ id: 'subMenuSlug' })}
                validation={{
                  pattern: { value: CUSTOM_URL_WITH_SLASH, message: validationErrors.customURL }
                }}
                className={errors?.category?.[`${categoryIndex}`]?.aSlide?.[`${index}`]?.sSlug && 'error'}
                as="input"
                type="text"
                name={`category[${categoryIndex}].aSlide[${index}].sSlug`}
                required
              >
                {errors && errors?.category?.[`${categoryIndex}`]?.aSlide?.[`${index}`]?.sSlug && (
                  <Form.Control.Feedback type="invalid">
                    {errors?.category?.[`${categoryIndex}`]?.aSlide?.[`${index}`]?.sSlug.message}
                  </Form.Control.Feedback>
                )}
              </CommonInput>
              <div className="w-100 d-flex align-items-center" style={{ gap: '12px' }}>
                <ToolTip toolTipMessage={<FormattedMessage id='delete'/>}>
                  <Button variant="outline-danger" size="lg" className="square icon-btn" onClick={() => subRemove(index)}>
                    <i className="icon-delete d-block" />
                  </Button>
                </ToolTip>
                <img src={DragIcon} alt="drag-icon" width={20} {...provided.dragHandleProps} />
              </div>
            </div>
          </div>
        )
      }}
    </Draggable>
  )
}

SidebarDraggableSubMenu.propTypes = {
  item: PropTypes.object,
  index: PropTypes.number,
  categoryIndex: PropTypes.number,
  category: PropTypes.object,
  append: PropTypes.func,
  remove: PropTypes.func,
  register: PropTypes.func,
  errors: PropTypes.object,
  getValues: PropTypes.func,
  setValue: PropTypes.func,
  subRemove: PropTypes.func
}
export default SidebarDraggableSubMenu
