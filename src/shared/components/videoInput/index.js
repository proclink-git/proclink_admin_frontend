import React from 'react'

import PropTypes from 'prop-types'
import CommonInput from '../common-input'
import { convertToEmbed } from 'shared/utils'

/* eslint-disable-next-line */
const urlRegex = /^(https?:\/\/)?(www\.)?(youtu\.be\/|youtube\.com\/(watch\?v=|embed\/|v\/|user\/.+\?v=))([^&?\/\s]+)(\?[^\s]*)?$/

function VideoInput({ register, errors, watch }) {
  const url = watch('oVideo.sUrl')
  return (
    <>
      <CommonInput
        type="text"
        register={register}
        errors={errors}
        name={'oVideo.sUrl'}
        label="Youtube Video"
        placeholder="https://www.youtube.com/watch?v=xyz"
        onBlur={(e) => {
          e.target.value = convertToEmbed(e.target.value)
        }}
      />
      {url && (
        <div className="ratio ratio-16x9">
          <iframe type="text/html" className="video" src={url}></iframe>
        </div>
      )}
    </>
  )
}

VideoInput.propTypes = {
  register: PropTypes.func,
  errors: PropTypes.object,
  watch: PropTypes.func,
  setError: PropTypes.func,
  clearErrors: PropTypes.func
}

export default VideoInput
