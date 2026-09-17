import { Droppable } from 'react-beautiful-dnd'
import React from 'react'
import PropTypes from 'prop-types'

export const Drop = ({ id, type, ...props }) => {
  return (
    <Droppable droppableId={id} type={type}>
      {(provided) => {
        return (
          <div ref={provided.innerRef} {...provided.droppableProps} {...props}>
            {props.children}
            {provided.placeholder}
          </div>
        )
      }}
    </Droppable>
  )
}

Drop.propTypes = {
  id: PropTypes.any,
  type: PropTypes.any,
  children: PropTypes.any
}
