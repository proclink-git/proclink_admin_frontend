import React from 'react'
import { Button, Form } from 'react-bootstrap'
import DragIcon from 'assets/images/drag-icon.svg'
import PropTypes from 'prop-types'
import { Draggable } from 'react-beautiful-dnd'
import CommonInput from 'shared/components/common-input'
import { useIntl } from 'react-intl'

const HeaderDraggableSubMenu = ({ item, index, categoryIndex, register, errors, subRemove }) => {
  return (
    <Draggable key={item?.id || item?.sSlug + index} type="droppable-item" draggableId={item?.id || item?.sSlug + index} index={index}>
      {(provided, snapshot) => {
        return (
          <div ref={provided.innerRef} {...provided.draggableProps}>
            <div className='d-flex align-items-start justify-content-center' style={{ marginLeft: '24px', gap: '12px' }}>
              <CommonInput
                register={register}
                errors={errors}
                className={errors?.category?.[`${categoryIndex}`]?.oChildren?.[`${index}`]?.sTitle && 'error'}
                placeholder={useIntl().formatMessage({ id: 'subMenu' })}
                as='input'
                type="text"
                name={`category[${categoryIndex}].oChildren[${index}].sTitle`}
                required
              >
                {errors && errors?.category?.[`${categoryIndex}`]?.oChildren?.[`${index}`]?.sTitle && <Form.Control.Feedback type="invalid">{errors?.category?.[`${categoryIndex}`]?.oChildren?.[`${index}`]?.sTitle.message}</Form.Control.Feedback>}
              </CommonInput>
              <CommonInput
                register={register}
                errors={errors}
                className={errors?.category?.[`${categoryIndex}`]?.oChildren?.[`${index}`]?.sSlug && 'error'}
                as='input'
                placeholder={useIntl().formatMessage({ id: 'subMenuSlug' })}
                type="text"
                name={`category[${categoryIndex}].oChildren[${index}].sSlug`}
                required
              >
                {errors && errors?.category?.[`${categoryIndex}`]?.oChildren?.[`${index}`]?.sSlug && <Form.Control.Feedback type="invalid">{errors?.category?.[`${categoryIndex}`]?.oChildren?.[`${index}`]?.sSlug.message}</Form.Control.Feedback>}
              </CommonInput>
              <div className='w-100 d-flex align-items-center' style={{ gap: '12px' }}>
              <Button variant="outline-danger" size="lg" className="square icon-btn" onClick={() => subRemove(index)}>
                <i className="icon-delete d-block" />
              </Button>
              <img src={DragIcon} alt="drag-icon" width={20} {...provided.dragHandleProps}/>
            </div>
          </div>
          </div>
        )
      }}
    </Draggable>
  )
}

HeaderDraggableSubMenu.propTypes = {
  item: PropTypes.object,
  index: PropTypes.number,
  categoryIndex: PropTypes.number,
  register: PropTypes.func,
  errors: PropTypes.object,
  subRemove: PropTypes.func
}
export default HeaderDraggableSubMenu
