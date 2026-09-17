import React from 'react'
import PropTypes from 'prop-types'

export default function PdfUpload({ register, name }) {
  const oPdf = register(name)
  return (
    <>
      <input
        type="file"
        className="form-control"
        accept=".pdf"
        name="sUrl"
        {...oPdf}
        onChange={(e) => {
          oPdf.onChange(e)
        }}
      />
    </>
  )
}
PdfUpload.propTypes = {
  register: PropTypes.func,
  name: PropTypes.string
}
