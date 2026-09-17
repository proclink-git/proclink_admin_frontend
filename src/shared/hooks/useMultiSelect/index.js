import { useRef, useState } from 'react'

function useMultiSelect(items, { selector = (data) => data }) {
  const [selectedMultiItems, setSelectedMultiItems] = useState([])
  const lastSelectedRef = useRef(0)
  function onClick(value, e) {
    const isShiftPressed = e.shiftKey
    setSelectedMultiItems(getNextValue(value, isShiftPressed))
    lastSelectedRef.current = value
  }

  function getNextValue(value, isShiftPressed) {
    const isSelected = selectedMultiItems?.includes(value)
    if (isShiftPressed) {
      const newSelectedItems = getNewSelectedItems(value)
      const allSelections = [...new Set([...selectedMultiItems, ...newSelectedItems])]
      if (isSelected) return allSelections?.filter((item) => !newSelectedItems.includes(item))
      return allSelections
    }
    return selectedMultiItems?.includes(value) ? selectedMultiItems?.filter((item) => item !== value) : [...selectedMultiItems, value]
  }

  function getNewSelectedItems(value) {
    const selectedItems = []
    const currentIndex = items?.findIndex((item) => selector(item) === value)
    const lastIndex = items?.findIndex((item) => selector(item) === lastSelectedRef.current)
    const isLastIndexGreater = lastIndex > currentIndex
    let start = isLastIndexGreater ? currentIndex : lastIndex
    const end = (isLastIndexGreater ? lastIndex : currentIndex) + 1
    for (start; start < end; start++) {
      selectedItems.push(start === -1 ? value : selector(items[start]))
    }
    return selectedItems
  }

  function resetSelected(e) {
    e && e.preventDefault()
    lastSelectedRef.current = -1
    setSelectedMultiItems([])
  }

  return { onClick, selectedMultiItems, resetSelected }
}

export default useMultiSelect
