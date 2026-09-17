import React from 'react'
import placeholder from 'assets/images/placeholder.jpg'

function Img(props) {
  return (
    <img
      {...props}
      onError={({ currentTarget }) => {
        currentTarget.onerror = null
        currentTarget.src = placeholder
      }}
    />
  )
}
export default Img
