import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { PREVIEW_URL } from 'shared/constants'

function ArticlePreview({ slug, isAmp, liveEventId }) {
  const [active, setIsActive] = useState('m')
  const token = localStorage.getItem('token')
  return (
    <>
      <ul className="device d-flex align-items-center justify-content-center p-0">
        <li className={active === 'm' ? 'active' : ''} onClick={() => setIsActive('m')}>
          <i className="icon-mobile" />
          <span>Mobile</span>
        </li>
        <li className={active === 't' ? 'active' : ''} onClick={() => setIsActive('t')}>
          <i className="icon-tablet" />
          <span>Tablet </span>
        </li>
        <li className={active === 'd' ? 'active' : ''} onClick={() => setIsActive('d')}>
          <i className="icon-desktop" />
          <span>Desktop</span>
        </li>
        {isAmp && (
          <li className={active === 'a' ? 'active' : ''} onClick={() => setIsActive('a')}>
            <i className="icon-amp" />
            <span>AMP</span>
          </li>
        )}
      </ul>
      <div className="preview w-100 d-flex justify-content-center">
        <iframe
          className={active}
          src={active === 'a' ? `${PREVIEW_URL}${slug}?amp=1&token=${token}` : `${PREVIEW_URL}${slug}?token=${token}`}
        ></iframe>
      </div>
    </>
  )
}
ArticlePreview.propTypes = {
  slug: PropTypes.string,
  liveEventId: PropTypes.string,
  isAmp: PropTypes.bool
}
export default ArticlePreview
