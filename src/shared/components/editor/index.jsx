/* eslint-disable no-useless-escape */
import React, { useContext, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
// import { Editor } from '@tinymce/tinymce-react'
import { Controller, useWatch } from 'react-hook-form'
import { useMutation } from '@apollo/client'
import { FormattedMessage } from 'react-intl'
import { Form } from 'react-bootstrap'

import { validationErrors } from 'shared/constants/ValidationErrors'
import { GENERATE_PRE_SIGNED } from 'graph-ql/generate-pre-signed-url'
import { uploadImage } from 'shared/functions/PreSignedData'
import { HEADER_CATEGORY_SLUG, TOAST_TYPE } from 'shared/constants'
import { convertUrlToEmbed } from 'shared/lib/to-embed'
import { HTMLParser, getS3Url, graphQlToRest, isVideoMedia, removeStylesFromString } from 'shared/utils'
import { ToastrContext } from '../toastr'
import useModal from 'shared/hooks/useModal'
import MediaGallery from '../media-gallery'
import { GET_SERVER_URL } from 'graph-ql/common/query'
import LinkPreview from '../link-preview'
import BundledEditor from '../tinymce'
import BannerComponentModal from './banner-component-modal'
import VideoComponentModal from './video-component-modal'

const { renderToStaticMarkup } = require('react-dom/server')
const SocialLinkPreview = React.lazy(() => import('shared/components/social-link-preview'))
const defaultBannerContent = {
  title: 'Structuring Digital Initiatives for Real Operations',
  description: 'Explore how these ideas apply in your environment.',
  buttonLabel: 'START A CONVERSATION',
  buttonUrl: '/contact'
}
const defaultVideoComponentValues = {
  videoSourceMode: 'gallery',
  videoUrl: ''
}
const TINYMCE_ARTICLE_COMPONENT_PAGES = new Set(Object.values(HEADER_CATEGORY_SLUG))
const VIDEO_COMPONENT_LAYOUT_VERSION = 'stacked-v1'
const DEFAULT_TINY_API_KEY = 'fo3b51amf9nnt0puuj4wxlgypbk55qc1god22mvfhs9ltk54'

function TinyEditor({
  control,
  error,
  register,
  required,
  initialValue,
  values,
  disabled,
  name,
  onlyTextFormatting,
  setValue,
  isLiveArticle,
  togglePoll,
  commentary,
  categoryURL,
  minHeight,
  height,
  toolbarStickyOffset = 65
}) {
  const [content, setContent] = useState()
  const [galleryMediaType, setGalleryMediaType] = useState('image')
  const [gallerySelectionTarget, setGallerySelectionTarget] = useState('editor-media')
  const [isBannerComponentOpen, setIsBannerComponentOpen] = useState(false)
  const [isVideoComponentOpen, setIsVideoComponentOpen] = useState(false)
  const [bannerComponentFormValues, setBannerComponentFormValues] = useState(defaultBannerContent)
  const [videoComponentFormValues, setVideoComponentFormValues] = useState(defaultVideoComponentValues)
  const [selectedVideoComponentThumbnail, setSelectedVideoComponentThumbnail] = useState('')
  const [selectedVideoComponentSrc, setSelectedVideoComponentSrc] = useState('')
  const editorRef = useRef(null)
  const activeEditorComponentRef = useRef(null)
  const isNormalizingVideoComponentRef = useRef(false)
  const isValueSyncRef = useRef(false)
  const isEditorChangeRef = useRef(false)
  const [generatePreSignedUrl] = useMutation(GENERATE_PRE_SIGNED)
  const { isShowing, toggle, closeModal } = useModal()
  const { dispatch } = useContext(ToastrContext)
  const showArticleContentComponents = TINYMCE_ARTICLE_COMPONENT_PAGES.has(categoryURL)
  const tinyApiKey = localStorage.getItem('tinyApiKey') || DEFAULT_TINY_API_KEY
  const watchedEditorValue = useWatch({ control, name })
  async function uploadEditorAsset(file) {
    const payload = [
      {
        sFileName: file?.name?.split('.')[0] || '',
        sContentType: file?.type || '',
        sType: 'articleEditorMedia'
      }
    ]
    const { data } = await generatePreSignedUrl({ variables: { generatePreSignedUrlInput: payload } })
    const uploadData = [
      {
        sUploadUrl: data.generatePreSignedUrl[0].sUploadUrl,
        file
      }
    ]

    await uploadImage(uploadData)
    return getS3Url(data.generatePreSignedUrl[0].sS3Url)
  }

  async function handleImageUpload(callback, success, meta) {
    const blob = callback.blob()

    if (!blob) return ''

    try {
      const assetUrl = await uploadEditorAsset(blob)
      success(assetUrl)

      return assetUrl
    } catch (err) {
      console.log('Image upload error', err)
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: 'Failed to upload image.', type: TOAST_TYPE.Error }
      })
    }

    return ''
  }

  const handlePlugins = () => {
    if (onlyTextFormatting) {
      return 'lists link code table media wordcount'
    } else if (isLiveArticle) {
      return 'link media wordcount anchor autolink autoresize autosave codesample emoticons imagetools nonbreaking pagebreak quickbars searchreplace tabfocus table'
    } else {
      return 'lists link code preview charmap wordcount anchor fullscreen autolink autoresize autosave codesample directionality emoticons help hr imagetools importcss insertdatetime legacyoutput nonbreaking noneditable pagebreak print quickbars searchreplace tabfocus template textpattern toc visualblocks visualchars table'
    }
  }
  // fontfamily fontsize blocks
  const handleToolbar = () => {
    const articleComponentButtons = showArticleContentComponents ? ['videoGallery', 'ctaBanner'] : []

    if (onlyTextFormatting) {
      return [
        'fontsize',
        'backcolor',
        'forecolor',
        'charmap',
        'preview',
        'fullscreen',
        'anchor',
        'autolink',
        'autoresize',
        'restoredraft',
        'codesample',
        'ltr',
        'rtl',
        'emoticons',
        'hr',
        'pastetext',
        'insertdatetime',
        'nonbreaking',
        'pagebreak',
        'print',
        'quicktable',
        'searchreplace',
        'template',
        'toc',
        'visualblocks',
        'visualchars',
        'myCustomToolbarButton',
        'mediaGallery',
        ...articleComponentButtons
      ].join(' ')
    } else if (isLiveArticle) {
      return ['preview', 'emoticons', 'mediaGallery', ...articleComponentButtons, 'embedLink', 'removeformat', 'linkPoll', 'linkQuiz'].join(' ')
    } else {
      return [
        'fontsize',
        'backcolor',
        'forecolor',
        'charmap',
        'preview',
        'fullscreen',
        'anchor',
        'autolink',
        'autoresize',
        'restoredraft',
        'codesample',
        'ltr',
        'rtl',
        'emoticons',
        'hr',
        'pastetext',
        'insertdatetime',
        'nonbreaking',
        'pagebreak',
        'print',
        'quicktable',
        'searchreplace',
        'template',
        'toc',
        'visualblocks',
        'visualchars',
        'myCustomToolbarButton',
        'help',
        'mediaGallery',
        ...articleComponentButtons,
        'addTweet',
        'addInstagram',
        'adsButton',
        'liveArticle',
        'linkPoll',
        'linkQuiz'
      ].join(' ')
    }
  }

  const handleDefaultToolbar = () => {
    if (isLiveArticle) {
      return 'blocks bold italic blockquote underline strikethrough bullist numlist outdent indent alignleft aligncenter alignright alignjustify link code undo redo'
    } else {
      return 'blocks bold italic blockquote underline strikethrough bullist numlist outdent indent alignleft aligncenter alignright alignjustify link code undo redo'
    }
  }

  useEffect(() => {
    if (initialValue && !content) {
      setContent(initialValue)
    }
  }, [initialValue])

  useEffect(() => {
    if (!isEditorChangeRef.current) {
      isValueSyncRef.current = true
    }
    isEditorChangeRef.current = false
  }, [watchedEditorValue])

  const openMediaGallery = (mediaType = 'image', selectionTarget = 'editor-media') => {
    setGalleryMediaType(mediaType)
    setGallerySelectionTarget(selectionTarget)
    toggle()
  }

  const handleCloseMediaGallery = () => {
    setGalleryMediaType('image')
    setGallerySelectionTarget('editor-media')
    closeModal()
  }

  const clearActiveEditorComponent = () => {
    activeEditorComponentRef.current = null
  }

  const syncEditorContent = ({ shouldDirty = true, shouldTouch = true, shouldValidate = Boolean(required) } = {}) => {
    if (typeof setValue === 'function' && editorRef.current) {
      setValue(name, editorRef.current.getContent(), {
        shouldDirty,
        shouldTouch,
        shouldValidate
      })
    }
  }

  const getBannerComponentValues = (componentNode) => ({
    title: componentNode?.getAttribute('data-title') || defaultBannerContent.title,
    description: componentNode?.getAttribute('data-description') || defaultBannerContent.description,
    buttonLabel: componentNode?.getAttribute('data-button-label') || defaultBannerContent.buttonLabel,
    buttonUrl: componentNode?.getAttribute('data-button-url') || defaultBannerContent.buttonUrl
  })

  const getVideoComponentNodeData = (componentNode) => {
    const embeddedVideoNode = componentNode?.querySelector?.('iframe')
    const hostedVideoNode = componentNode?.querySelector?.('video')
    const hostedVideoSourceNode = hostedVideoNode?.querySelector?.('source')
    const thumbnailNode = componentNode?.querySelector?.('img')
    const thumbnailSrc = componentNode?.getAttribute('data-thumbnail-src') || thumbnailNode?.getAttribute('src') || ''
    const storedVideoSrc =
      componentNode?.getAttribute('data-video-src') ||
      embeddedVideoNode?.getAttribute('src') ||
      hostedVideoNode?.getAttribute('src') ||
      hostedVideoSourceNode?.getAttribute('src') ||
      ''
    const originalVideoSrc = componentNode?.getAttribute('data-original-video-src') || storedVideoSrc
    const sourceMode = componentNode?.getAttribute('data-source-mode')
    const videoType = componentNode?.getAttribute('data-video-type')
    const layoutVersion = componentNode?.getAttribute('data-layout-version') || ''

    return {
      thumbnailSrc,
      storedVideoSrc,
      originalVideoSrc,
      sourceMode,
      videoType,
      layoutVersion
    }
  }

  const getVideoComponentValues = (componentNode) => {
    const { thumbnailSrc, originalVideoSrc, sourceMode, videoType } = getVideoComponentNodeData(componentNode)
    const resolvedThumbnailSrc = getVideoThumbnailPreview(originalVideoSrc, thumbnailSrc)

    if (sourceMode === 'url' || videoType === 'embed') {
      return {
        formValues: {
          videoSourceMode: 'url',
          videoUrl: originalVideoSrc
        },
        thumbnailSrc: resolvedThumbnailSrc,
        videoSrc: ''
      }
    }

    return {
      formValues: {
        videoSourceMode: 'gallery',
        videoUrl: ''
      },
      thumbnailSrc: resolvedThumbnailSrc,
      videoSrc: originalVideoSrc
    }
  }

  const openBannerComponentModal = (componentNode = null) => {
    activeEditorComponentRef.current = componentNode
    setBannerComponentFormValues(componentNode ? getBannerComponentValues(componentNode) : defaultBannerContent)
    setIsBannerComponentOpen(true)
  }

  const handleCloseBannerComponentModal = () => {
    clearActiveEditorComponent()
    setBannerComponentFormValues(defaultBannerContent)
    setIsBannerComponentOpen(false)
  }

  const openVideoComponentModal = (componentNode = null) => {
    activeEditorComponentRef.current = componentNode

    if (componentNode) {
      const componentValues = getVideoComponentValues(componentNode)
      setSelectedVideoComponentThumbnail(componentValues.thumbnailSrc)
      setSelectedVideoComponentSrc(componentValues.videoSrc)
      setVideoComponentFormValues(componentValues.formValues)
    } else {
      setSelectedVideoComponentThumbnail('')
      setSelectedVideoComponentSrc('')
      setVideoComponentFormValues(defaultVideoComponentValues)
    }

    setIsVideoComponentOpen(true)
  }

  const handleCloseVideoComponentModal = () => {
    clearActiveEditorComponent()
    setVideoComponentFormValues(defaultVideoComponentValues)
    setSelectedVideoComponentThumbnail('')
    setSelectedVideoComponentSrc('')
    setIsVideoComponentOpen(false)
  }

  const upsertEditorComponent = (html) => {
    if (!editorRef.current) return false

    const editor = editorRef.current
    const activeComponentNode = activeEditorComponentRef.current
    const canReplaceNode = activeComponentNode && editor.getBody()?.contains(activeComponentNode)

    editor.undoManager.transact(() => {
      if (canReplaceNode) {
        activeComponentNode.outerHTML = html
      } else {
        editor.insertContent(html)
      }
    })

    clearActiveEditorComponent()
    editor.nodeChanged()
    syncEditorContent()

    return true
  }

  const normalizeVideoComponents = (editor) => {
    if (!editor || !showArticleContentComponents || isNormalizingVideoComponentRef.current) return

    const videoComponents = Array.from(editor.dom.select('.ct-video-component'))
    const staleVideoComponents = videoComponents.filter((componentNode) => {
      const { layoutVersion } = getVideoComponentNodeData(componentNode)
      return layoutVersion !== VIDEO_COMPONENT_LAYOUT_VERSION
    })

    if (!staleVideoComponents.length) return

    isNormalizingVideoComponentRef.current = true

    try {
      editor.undoManager.transact(() => {
        staleVideoComponents.forEach((componentNode) => {
          const { thumbnailSrc, originalVideoSrc, sourceMode } = getVideoComponentNodeData(componentNode)

          componentNode.outerHTML = renderVideoComponentHtml({
            thumbnailSrc,
            videoSrc: originalVideoSrc,
            sourceMode,
            originalVideoSrc
          })
        })
      })

      editor.nodeChanged()
      syncEditorContent({
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false
      })
    } finally {
      isNormalizingVideoComponentRef.current = false
    }
  }

  const handleMediaGalary = (data, tab) => {
    const assetUrl = tab === 'gifs' ? `${data?.sUrl}` : getS3Url(data?.sUrl)

    if (gallerySelectionTarget === 'video-thumbnail') {
      setSelectedVideoComponentThumbnail(assetUrl)
      handleCloseMediaGallery()
      return
    }

    if (gallerySelectionTarget === 'video-asset') {
      setSelectedVideoComponentSrc(assetUrl)
      handleCloseMediaGallery()
      return
    }

    const selectedVideo = galleryMediaType === 'video' || isVideoMedia(data?.sUrl)
    let mediaContent

    if (selectedVideo) {
      mediaContent = renderToStaticMarkup(
        <figure className="media">
          <video className="editor-video" controls playsInline preload="metadata" src={assetUrl} />
          {data?.sCaption ? <figcaption>{data?.sCaption}</figcaption> : null}
        </figure>
      )
    } else {
      mediaContent = renderToStaticMarkup(
        <figure className="image">
          <img src={assetUrl} alt={data?.sText} />
          {data?.sCaption ? <figcaption>{data?.sCaption}</figcaption> : null}
        </figure>
      )
    }

    editorRef.current && editorRef.current.insertContent(mediaContent)
    handleCloseMediaGallery()
  }

  // const handleTweet = (data) => renderToStaticMarkup(<CustomTweet post={data} />)
  const handleLinkPreview = (data, url) => renderToStaticMarkup(<LinkPreview data={data} url={url} />)

  const normalizeBannerUrl = (url = '') => {
    const trimmedUrl = url.trim()

    if (!trimmedUrl) return defaultBannerContent.buttonUrl
    if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(trimmedUrl)) return trimmedUrl

    return `https://${trimmedUrl}`
  }

  const normalizeVideoUrl = (url = '') => {
    const trimmedUrl = url.trim()

    if (!trimmedUrl) return ''
    if (/^(https?:\/\/|\/|#|blob:|data:)/i.test(trimmedUrl)) return trimmedUrl

    return `https://${trimmedUrl}`
  }

  const getVideoEmbedConfig = (url = '') => {
    const normalizedUrl = normalizeVideoUrl(url)

    if (!normalizedUrl) return { type: 'video', src: '' }

    if (normalizedUrl.includes('youtube.com') || normalizedUrl.includes('youtu.be')) {
      const youtubeRegEx = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
      const youtubeMatch = normalizedUrl.match(youtubeRegEx)

      if (youtubeMatch && youtubeMatch[2]?.length === 11) {
        return {
          type: 'embed',
          src: `https://www.youtube.com/embed/${youtubeMatch[2]}`
        }
      }
    }

    if (normalizedUrl.includes('vimeo.com')) {
      const vimeoRegex = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i
      const vimeoMatch = normalizedUrl.match(vimeoRegex)

      if (vimeoMatch && vimeoMatch[1]) {
        return {
          type: 'embed',
          src: `https://player.vimeo.com/video/${vimeoMatch[1]}`
        }
      }
    }

    return {
      type: 'video',
      src: normalizedUrl
    }
  }

  const getVideoSourceLabel = (url = '', videoType = 'video') => {
    const normalizedUrl = url.toLowerCase()

    if (normalizedUrl.includes('youtube.com') || normalizedUrl.includes('youtu.be')) {
      return 'YouTube'
    }

    if (normalizedUrl.includes('vimeo.com')) {
      return 'Vimeo'
    }

    if (videoType === 'embed') {
      return 'Embedded Video'
    }

    if (/\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(normalizedUrl)) {
      return 'Hosted Video'
    }

    return 'Video'
  }

  const getVideoThumbnailPreview = (url = '', explicitThumbnail = '') => {
    if (explicitThumbnail) return explicitThumbnail

    const normalizedUrl = normalizeVideoUrl(url)

    if (normalizedUrl.includes('youtube.com') || normalizedUrl.includes('youtu.be')) {
      const youtubeRegEx = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
      const youtubeMatch = normalizedUrl.match(youtubeRegEx)

      if (youtubeMatch && youtubeMatch[2]?.length === 11) {
        return `https://img.youtube.com/vi/${youtubeMatch[2]}/hqdefault.jpg`
      }
    }

    return ''
  }

  const renderBannerHtml = (bannerValues = {}) => {
    const title = bannerValues.title?.trim() || defaultBannerContent.title
    const description = bannerValues.description?.trim() || defaultBannerContent.description
    const buttonLabel = bannerValues.buttonLabel?.trim() || defaultBannerContent.buttonLabel
    const buttonUrl = normalizeBannerUrl(bannerValues.buttonUrl)

    return renderToStaticMarkup(
      <div
        className="ct-cta-banner mceNonEditable"
        data-title={title}
        data-description={description}
        data-button-label={buttonLabel}
        data-button-url={buttonUrl}
        style={{
          position: 'relative',
          overflow: 'hidden',
          margin: '32px 0',
          border: '1px solid #ef7b27',
          borderRadius: '24px',
          backgroundColor: '#121212',
          backgroundImage: 'linear-gradient(135deg, #181818 0%, #101010 100%)',
          boxShadow: '0 22px 40px rgba(0, 0, 0, 0.35)'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '54%',
            backgroundImage:
              'linear-gradient(90deg, rgba(18, 18, 18, 0) 0%, rgba(18, 18, 18, 0.12) 20%, rgba(18, 18, 18, 0.78) 100%), repeating-linear-gradient(-45deg, rgba(239, 123, 39, 0.2) 0px, rgba(239, 123, 39, 0.2) 8px, transparent 8px, transparent 24px)',
            opacity: 0.95,
            pointerEvents: 'none'
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '18px',
            maxWidth: '560px',
            padding: '54px 40px'
          }}
        >
          <div
            style={{
              color: '#ffffff',
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: '42px',
              lineHeight: 1.08,
              letterSpacing: '-0.02em'
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: 'rgba(255, 255, 255, 0.78)',
              fontSize: '18px',
              lineHeight: 1.7,
              maxWidth: '480px'
            }}
          >
            {description}
          </div>
          <a
            href={buttonUrl}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 26px',
              borderRadius: '999px',
              backgroundColor: '#ff7a1a',
              backgroundImage: 'linear-gradient(90deg, #ff7a1a 0%, #ff9e45 100%)',
              color: '#ffffff',
              textDecoration: 'none',
              textTransform: 'uppercase',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              lineHeight: 1
            }}
          >
            <span>{buttonLabel}</span>
            <span aria-hidden="true" style={{ fontSize: '18px', lineHeight: 1 }}>
              ↗
            </span>
          </a>
        </div>
      </div>
    )
  }

  const renderVideoComponentHtml = ({ thumbnailSrc = '', videoSrc = '', sourceMode = 'gallery', originalVideoSrc = '' }) => {
    const resolvedOriginalVideoSrc = normalizeVideoUrl(originalVideoSrc || videoSrc)
    const videoConfig = getVideoEmbedConfig(resolvedOriginalVideoSrc)
    const videoSourceLabel = getVideoSourceLabel(resolvedOriginalVideoSrc, videoConfig.type)
    const videoThumbnailPreview = getVideoThumbnailPreview(resolvedOriginalVideoSrc, thumbnailSrc)
    let mediaContent

    if (videoConfig.type === 'embed') {
      mediaContent = (
        <div
          style={{
            position: 'relative',
            width: '100%',
            paddingTop: '56.25%',
            overflow: 'hidden',
            borderRadius: '18px',
            backgroundColor: '#05070a'
          }}
        >
          <iframe
            src={videoConfig.src}
            title="Embedded video"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'block',
              border: 0,
              borderRadius: '18px'
            }}
          />
        </div>
      )
    } else {
      mediaContent = (
        <div
          style={{
            position: 'relative',
            width: '100%',
            paddingTop: '56.25%',
            overflow: 'hidden',
            borderRadius: '18px',
            backgroundColor: '#05070a'
          }}
        >
          <video
            controls
            playsInline
            preload="metadata"
            src={videoConfig.src}
            poster={videoThumbnailPreview || undefined}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              display: 'block',
              width: '100%',
              height: '100%',
              border: 0,
              borderRadius: '18px',
              backgroundColor: '#05070a',
              objectFit: 'contain',
              objectPosition: 'center center'
            }}
          />
        </div>
      )
    }

    return renderToStaticMarkup(
      <div
        className="ct-video-component mceNonEditable"
        data-video-src={videoConfig.src}
        data-thumbnail-src={videoThumbnailPreview}
        data-video-type={videoConfig.type}
        data-source-mode={sourceMode}
        data-original-video-src={resolvedOriginalVideoSrc}
        data-layout-version={VIDEO_COMPONENT_LAYOUT_VERSION}
        style={{
          margin: '32px 0',
          padding: '18px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          backgroundColor: '#172232',
          boxShadow: '0 18px 36px rgba(4, 8, 14, 0.24)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '16px'
          }}
        >
          <div
            style={{
              color: '#f3f7fb',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              lineHeight: 1.2
            }}
          >
            Featured Video
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px 12px',
              borderRadius: '999px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              color: 'rgba(243, 247, 251, 0.78)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap'
            }}
          >
            {videoSourceLabel}
          </div>
        </div>
        {videoThumbnailPreview && (
          <div style={{ marginBottom: '14px' }}>
            <div
              style={{
                marginBottom: '8px',
                color: 'rgba(243, 247, 251, 0.72)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
            >
              Thumbnail
            </div>
            <div
              style={{
                overflow: 'hidden',
                borderRadius: '18px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: '#0c121a'
              }}
            >
              <img
                src={videoThumbnailPreview}
                alt="Video thumbnail"
                style={{
                  display: 'block',
                  width: '100%',
                  aspectRatio: '16 / 9',
                  objectFit: 'cover',
                  objectPosition: 'center center'
                }}
              />
            </div>
          </div>
        )}
        <div>
          <div
            style={{
              marginBottom: '8px',
              color: 'rgba(243, 247, 251, 0.72)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}
          >
            Video
          </div>
          <div
            style={{
              overflow: 'hidden',
              borderRadius: '18px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: '#05070a'
            }}
          >
            {mediaContent}
          </div>
        </div>
      </div>
    )
  }

  const handleBannerInsert = (bannerValues) => {
    if (!editorRef.current) return false

    return upsertEditorComponent(renderBannerHtml(bannerValues))
  }

  const handleVideoComponentInsert = async ({ videoSourceMode, videoUrl }) => {
    if (!editorRef.current) return false

    const resolvedVideoUrl = normalizeVideoUrl(videoUrl)
    const finalVideoSrc = selectedVideoComponentSrc || resolvedVideoUrl
    const sourceMode = videoSourceMode === 'url' ? 'url' : 'gallery'
    const originalVideoSrc = sourceMode === 'url' ? resolvedVideoUrl : finalVideoSrc

    if (!finalVideoSrc) {
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: 'Select a video from media gallery or enter a video URL.', type: TOAST_TYPE.Error }
      })

      return false
    }

    try {
      upsertEditorComponent(
        renderVideoComponentHtml({
          thumbnailSrc: selectedVideoComponentThumbnail,
          videoSrc: finalVideoSrc,
          sourceMode,
          originalVideoSrc
        })
      )
      handleCloseVideoComponentModal()

      return true
    } catch (err) {
      console.log('Video component upload error', err)
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: 'Failed to insert video component.', type: TOAST_TYPE.Error }
      })
    }

    return false
  }

  async function handleSocialPreview(type) {
    let inputContent = values('social-url-preview')
    if (inputContent && !inputContent.trim()) return
    if (type === 'twitter') {
      const data = await convertUrlToEmbed(inputContent)
      editorRef.current.insertContent(data)
      setValue('social-url-preview', '')
    } else if (type === 'instagram') {
      const data = await convertUrlToEmbed(inputContent)
      editorRef.current.insertContent(data)
      setValue('social-url-preview', '')
    } else if (type === 'youtube') {
      const youtubeURL = 'https://www.youtube.com/embed/'
      inputContent = inputContent.trim()
      const youtubeRegEx = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
      const youtubeURLMatch = inputContent.match(youtubeRegEx)

      if (youtubeURLMatch && youtubeURLMatch[2].length === 11) {
        const embedUrl = youtubeURL + youtubeURLMatch[2]
        editorRef.current.insertContent(renderToStaticMarkup(<iframe src={embedUrl} />))
      }
      setValue('social-url-preview', '')
    } else {
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: <FormattedMessage id="invalidUrl" />, type: TOAST_TYPE.Error }
      })
    }
  }

  function handleModal(editor, media, label) {
    return {
      title: `Add ${media}`,
      body: {
        type: 'panel',
        items: [
          {
            type: 'input',
            name: 'type',
            label: `${media} ${label}`,
            flex: true
          }
        ]
      },
      onSubmit: async (api) => {
        const inputContent = api.getData().type
        const instaDomain = 'https://www.instagram.com/'
        if (media === 'Tweet' && inputContent?.length > 0) {
          const data = await convertUrlToEmbed(inputContent)
          editor.insertContent(data)
          api.close()
          // fetch(`${ARTICLE_BASE_URL}api/generate-twitter-data/${inputContent}`, {
          //   method: 'post',
          //   headers: { 'Content-Type': 'application/json' }
          // }).then((response) => {
          //   return response.json()
          // }).then((data) => {
          //   if (data?.message === 'Something went wrong') {
          //     dispatch({
          //       type: 'SHOW_TOAST',
          //       payload: { message: data?.message, type: TOAST_TYPE.Error }
          //     })
          //   } else {
          //     data && editor.insertContent(handleTweet(data))
          //     api.close()
          //   }
          // })
        } else if (media === 'Instagram' && inputContent?.includes(instaDomain) && inputContent?.length > 0) {
          const data = await convertUrlToEmbed(inputContent)
          editor.insertContent(data)
          api.close()
        } else if (media === 'Link Preview' && inputContent?.length > 0) {
          const html = await graphQlToRest(GET_SERVER_URL, { sUrl: inputContent }, 'getFrontUrlData')
          const data = HTMLParser(html)
          data && editor.insertContent(handleLinkPreview(data, inputContent))
          api.close()
        } else if (media === 'LiveEvent' && inputContent?.length > 0) {
          editor.insertContent(
            renderToStaticMarkup(
              <div className="ct-liveBlog mceNonEditable" id="ct-liveBlog">
                {inputContent}
              </div>
            )
          )
          api.close()
        } else {
          dispatch({
            type: 'SHOW_TOAST',
            payload: { message: <FormattedMessage id={`inValid${media}`} />, type: TOAST_TYPE.Error }
          })
        }
      },
      buttons: [
        {
          text: 'Close',
          type: 'cancel',
          onclick: 'close'
        },
        {
          text: 'Insert',
          type: 'submit',
          primary: true,
          enabled: true
        }
      ]
    }
  }
  // function handleTabChange(tab) {
  //   setTab(tab)
  // }

  return (
    <>
      <MediaGallery
        overRidePermission
        show={isShowing}
        handleHide={handleCloseMediaGallery}
        handleData={handleMediaGalary}
        isEditor
        mediaType={galleryMediaType}
      />
      {showArticleContentComponents && (
        <BannerComponentModal
          show={isBannerComponentOpen}
          onClose={handleCloseBannerComponentModal}
          onSubmit={handleBannerInsert}
          defaultValues={bannerComponentFormValues}
          isEditing={Boolean(activeEditorComponentRef.current && isBannerComponentOpen)}
        />
      )}
      {showArticleContentComponents && (
        <VideoComponentModal
          show={isVideoComponentOpen}
          onClose={handleCloseVideoComponentModal}
          onSubmit={handleVideoComponentInsert}
          onSelectThumbnail={() => openMediaGallery('image', 'video-thumbnail')}
          onSelectVideo={() => openMediaGallery('video', 'video-asset')}
          onClearThumbnail={() => setSelectedVideoComponentThumbnail('')}
          onClearVideo={() => setSelectedVideoComponentSrc('')}
          thumbnailPreview={selectedVideoComponentThumbnail}
          videoPreview={selectedVideoComponentSrc}
          defaultValues={videoComponentFormValues}
          isEditing={Boolean(activeEditorComponentRef.current && isVideoComponentOpen)}
        />
      )}
      <Controller
        name={name}
        control={control}
        rules={required && { required: validationErrors.required }}
        render={({ field: { onChange, value } }) => (
          <BundledEditor // tinymce api key
            apiKey={tinyApiKey}
            init={{
              block_formats: 'Paragraph=p;Header 2=h2;Header 3=h3;Header 4=h4;Header 5=h5;Header 6=h6;Preformatted=pre',
              extended_valid_elements:
                'script[language|type|src],img[class|src|alt|title|width|loading=lazy],iframe[allow|allowfullscreen|allowpaymentrequest|loading|height|name|referrerpolicy|sandbox|src|srcdoc|width|class],video[class|controls|playsinline|preload|src|width|height|poster],source[src|type]',
              allow_script_urls: true,
              menubar: !isLiveArticle,
              valid_children: '+*[*]',
              icons_url: '/icons/ct-editor/icons.js',
              icons: 'ct-editor',
              cleanup: false,
              valid_elements: '*[*],script[src|type]',
              plugins: handlePlugins(),
              toolbar1: handleDefaultToolbar(),
              toolbar2: handleToolbar(),
              skin: 'oxide-dark',
              content_css: ['dark', '/style.css'],
              toolbar_location: 'top',
              toolbar_sticky: true,
              toolbar_sticky_offset: toolbarStickyOffset,
              min_height: minHeight || 1000,
              height: height || 200,
              image_caption: true,
              invalid_styles: {
                // '*': 'font-family color background-color display',
                table: 'width height margin border-collapse',
                tr: 'width height',
                th: 'width height',
                td: 'width height'
              },
              content_style: `
              ::-moz-selection {
                color: #ffffff;
                background: #ffffff47;
              }
              
              ::selection {
                color: #ffffff;
                background: #ffffff47;
              }
              .mce-content-body [data-mce-selected=inline-boundary] { background-color: transparent }
              .twitter_frame{ overflow: hidden; }
              .twitter_frame iframe{ margin-top: -18px }
              gt-ads { border: 1px dashed white; display: block; }
              gt-ads:before { content: 'Advertisement'; }
              .cts-ads { border: 1px dashed white; display: block; }
              .cts-ads:before { content: 'Advertisement'; }
              .ct-liveBlog { border: 1px dashed white; display: block; }
              .ct-liveBlog:before { content: 'Live Event Will be load here ... '; }
              .ct-poll { border: 1px dashed white; display: block; }
              .ct-poll:before { content: 'Poll will be load here ... '; }
              .ct-box { border: 1px dashed white; display: block; margin-block-end: 1em;}
              .ct-box:before { content: attr(data-msg); }
              .ct-cta-banner { cursor: pointer; }
              .ct-video-component { cursor: pointer; }
              .youtube-ifm { aspect-ratio: 16 / 9; width: 100% }
              figure.media { margin: 1em 0; }
              .editor-video { display: block; max-width: 100%; height: auto; }
              `,
              images_upload_handler: handleImageUpload,
              media_live_embeds: true,
              setup: (editor) => {
                editorRef.current = editor
                editor.ui.registry.addButton('addTweet', {
                  icon: 'twitter',
                  onAction: (_) => {
                    editor.windowManager.open(handleModal(editor, 'Tweet', 'URL'))
                  }
                })
                editor.ui.registry.addButton('addInstagram', {
                  icon: 'instagram',
                  onAction: (_) => {
                    editor.windowManager.open(handleModal(editor, 'Instagram', 'URL'))
                  }
                })
                editor.ui.registry.addButton('mediaGallery', {
                  // icon: 'media-galary',
                  icon: 'gallery',
                  onAction: (_) => {
                    openMediaGallery('image')
                  }
                })
                if (showArticleContentComponents) {
                  editor.ui.registry.addButton('videoGallery', {
                    text: 'Video',
                    tooltip: 'Insert Video Component',
                    onAction: (_) => {
                      openVideoComponentModal()
                    }
                  })
                  editor.ui.registry.addButton('ctaBanner', {
                    text: 'Banner',
                    tooltip: 'Insert CTA Banner',
                    onAction: (_) => {
                      openBannerComponentModal()
                    }
                  })
                }
                // editor.ui.registry.addButton('poll', {
                //   icon: 'poll',
                //   onAction: (_) => {
                //     togglePoll()
                //   }
                // })
                editor.ui.registry.addButton('embedLink', {
                  icon: 'embedLink',
                  text: 'card',
                  onAction: (_) => {
                    editor.windowManager.open(handleModal(editor, 'Link Preview', 'URL'))
                  }
                })
                editor.addShortcut('meta+shift+p', 'Add pagebreak', () => {
                  editor.insertContent('<p><!-- pagebreak --></p>')
                })
                editor.on('PastePreProcess', async (e) => {
                  const content = e.content
                  e.content = ''
                  const data = await convertUrlToEmbed(content)
                  const removedStyleData = removeStylesFromString(data)
                  editor.insertContent(removedStyleData)
                })
                editor.on('click', (e) => {
                  if (!showArticleContentComponents) return

                  const bannerComponent = editor.dom.getParent(e.target, '.ct-cta-banner')

                  if (bannerComponent) {
                    e.preventDefault()
                    e.stopPropagation()
                    openBannerComponentModal(bannerComponent)
                    return
                  }

                  const videoComponent = editor.dom.getParent(e.target, '.ct-video-component')

                  if (videoComponent) {
                    e.preventDefault()
                    e.stopPropagation()
                    openVideoComponentModal(videoComponent)
                  }
                })
                editor.on('SetContent', () => {
                  normalizeVideoComponents(editor)
                })
                editor.on('init', () => {
                  normalizeVideoComponents(editor)
                })
                // const max = 20
                // editor.on('submit', (event) => {
                //   console.log('submit', editor.plugins.wordcount.body.getCharacterCount())
                //   const numChars = editor.plugins.wordcount.body.getCharacterCount()
                //   if (numChars > max) {
                //     alert('Maximum ' + max + ' characters allowed.')
                //     event.preventDefault()
                //     return false
                //   }
                // })
              }
            }}
            disabled={disabled}
            onEditorChange={(content) => {
              if (isValueSyncRef.current) {
                isValueSyncRef.current = false
                if (typeof setValue === 'function') {
                  setValue(name, content, {
                    shouldDirty: false,
                    shouldTouch: false,
                    shouldValidate: Boolean(required)
                  })
                  return
                }
              }
              isEditorChangeRef.current = true
              if (typeof setValue === 'function') {
                setValue(name, content, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: Boolean(required)
                })
                return
              }
              onChange(content)
            }}
            value={value}
          />
        )}
      />
      {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
      {isLiveArticle && <SocialLinkPreview register={register} handleSocialPreview={handleSocialPreview} />}
    </>
  )
}
TinyEditor.propTypes = {
  control: PropTypes.object,
  register: PropTypes.func,
  error: PropTypes.string,
  values: PropTypes.func,
  required: PropTypes.bool,
  initialValue: PropTypes.string,
  disabled: PropTypes.bool,
  onlyTextFormatting: PropTypes.bool,
  name: PropTypes.string,
  isLiveArticle: PropTypes.bool,
  togglePoll: PropTypes.func,
  setValue: PropTypes.func,
  commentary: PropTypes.bool,
  categoryURL: PropTypes.string,
  minHeight: PropTypes.number,
  height: PropTypes.number,
  toolbarStickyOffset: PropTypes.number
}
export default React.memo(TinyEditor)
