import React from 'react'
import PropTypes from 'prop-types'

function LinkPreview({ data, url }) {
  const title = data.querySelector('title').textContent
  const description = data.querySelector('meta[name="description"]').getAttribute('content')
  const imageUrl = data.querySelector('meta[property="og:image"]').getAttribute('content')
  return (
    <div className='embed-link-preview link-preview-height w-100 mceNonEditable d-flex'>
      <a href={url} target='_blank' rel='noreferrer' className='link link-preview-height'></a>
      <div className='image-preview link-preview-height link-preview-width'>
        <img src={imageUrl} alt={title} className='link-preview-height link-preview-width' />
      </div>
      <div className='ctLinkPreview d-flex'>
        <div className='title link-preview-overflow line-height-color'>{title || ''}</div>
        <div className='description link-preview-overflow line-height-color'>{description || ''}</div>
        <div className='url d-flex align-items-end'><a href={url} target='_blank' rel='noreferrer' className='link-preview-overflow'>{url}</a></div>
      </div>
    </div>
  )
}
LinkPreview.propTypes = {
  data: PropTypes.object,
  url: PropTypes.string
}

export default LinkPreview
