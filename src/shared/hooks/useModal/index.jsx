import { useState } from 'react'

const useModal = () => {
  const [isShowing, setIsShowing] = useState(false)

  function toggle() {
    setIsShowing(!isShowing)
  }

  function closeModal() {
    setIsShowing(false)
  }

  return {
    isShowing,
    toggle,
    closeModal
  }
}

export default useModal
