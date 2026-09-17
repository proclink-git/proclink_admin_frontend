import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import lottie from 'lottie-web'

import { getS3Url } from 'shared/utils'
import { getDotLottieAnimationData, isDotLottieSource } from 'shared/utils/dotlottie'

function getAssetBaseUrl(url = '') {
  const cleanUrl = String(url).split('?')[0].split('#')[0]
  const lastSlashIndex = cleanUrl.lastIndexOf('/')

  if (lastSlashIndex === -1) return ''

  return cleanUrl.slice(0, lastSlashIndex + 1)
}

const LottiePreview = ({ src, className = '', fallbackText = 'LOTTIE', loop = true, autoplay = true }) => {
  const containerRef = useRef(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const container = containerRef.current

    if (!container || !src) {
      setHasError(true)
      return undefined
    }

    setHasError(false)
    container.innerHTML = ''
    const resolvedSrc = getS3Url(src)
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
    let isActive = true
    let animation
    let objectUrls = []

    const handleLoadError = () => setHasError(true)

    const loadAnimationData = async () => {
      try {
        const response = await fetch(resolvedSrc, controller ? { signal: controller.signal } : undefined)

        if (!response.ok) throw new Error('There was an error loading the Lottie file.')

        const contentType = response.headers.get('content-type') || ''
        let animationData
        let dotLottieObjectUrls = []

        if (isDotLottieSource(resolvedSrc, contentType)) {
          const dotLottieData = getDotLottieAnimationData(await response.arrayBuffer(), { createAssetUrls: true })
          animationData = dotLottieData.animationData
          dotLottieObjectUrls = dotLottieData.objectUrls || []
        } else {
          animationData = contentType.includes('json') ? await response.json() : JSON.parse(await response.text())
        }

        objectUrls = dotLottieObjectUrls

        if (!isActive || !containerRef.current) return

        animation = lottie.loadAnimation({
          container,
          renderer: 'svg',
          loop,
          autoplay,
          animationData,
          assetsPath: getAssetBaseUrl(resolvedSrc),
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid meet',
            progressiveLoad: true
          }
        })

        animation.addEventListener('data_failed', handleLoadError)
      } catch (err) {
        if (err?.name === 'AbortError') return
        setHasError(true)
      }
    }

    loadAnimationData()

    return () => {
      isActive = false
      controller?.abort()
      if (animation) {
        animation.removeEventListener('data_failed', handleLoadError)
        animation.destroy()
      }
      objectUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl))
    }
  }, [autoplay, loop, src])

  return (
    <div className={`lottie-preview ${className}`}>
      <div ref={containerRef} className="lottie-preview__animation" />
      {hasError && <span className="lottie-preview__fallback">{fallbackText}</span>}
    </div>
  )
}

LottiePreview.propTypes = {
  src: PropTypes.string,
  className: PropTypes.string,
  fallbackText: PropTypes.string,
  loop: PropTypes.bool,
  autoplay: PropTypes.bool
}

export default LottiePreview
