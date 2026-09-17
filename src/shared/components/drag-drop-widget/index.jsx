import React from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import { Table } from 'react-bootstrap'

import DragIcon from 'assets/images/drag-icon.svg'
// import { ToastrContext } from 'shared/components/toastr'

function WidgetDragDrop({ pollList, setPollList }) {
  //   const { dispatch } = useContext(ToastrContext)

  const getItemStyle = (isDragging, draggableStyle) => ({
    background: isDragging ? 'var(--primary-400)' : 'transparent',
    ...draggableStyle
  })

  const handleDragEnd = (result, menu, setMenu) => {
    const { type, source, destination } = result
    if (!destination) return

    const reorder = (list, startIndex, endIndex) => {
      const result = Array.from(list)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      return result
    }

    // Reordering categories
    if (type === 'droppable-category') {
      const updatedCategories = reorder(menu, source.index, destination.index)

      setMenu(updatedCategories)
    }
  }

  return (
    <DragDropContext onDragEnd={(result) => handleDragEnd(result, pollList, setPollList)}>
      <Table className="table-borderless" responsive="sm">
        <thead>
          <tr>
            <th className="">#</th>
            <th><FormattedMessage id="type" /></th>
            <th><FormattedMessage id="name" /></th>
            <th><FormattedMessage id="action" /></th>
          </tr>
        </thead>
        <Droppable droppableId="droppable" type="droppable-category">
          {(provided) => {
            return (
              <tbody ref={provided.innerRef} {...provided.droppableProps}>
                {pollList?.map((category, categoryIndex) => {
                  return (
                    <Draggable key={category?._id} draggableId={category?._id} index={categoryIndex}>
                      {(provided, snapshot) => {
                        return (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                          >
                            <td>{categoryIndex + 1}</td>
                            <td className="text-uppercase">{category?.type}</td>
                            <td>{category?.sName}</td>
                            <td {...provided.dragHandleProps}>
                              <img src={DragIcon} alt="drag icon" width={20} height={20} />
                            </td>
                          </tr>
                        )
                      }}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </tbody>
            )
          }}
        </Droppable>
      </Table>
    </DragDropContext>
  )
}
WidgetDragDrop.propTypes = {
  pollList: PropTypes.array,
  setPollList: PropTypes.func
}
export default WidgetDragDrop
