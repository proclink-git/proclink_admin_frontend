export const DLF_FORM_TYPE = {
  WEBINAR_REGISTER: 'w',
  WEBINAR_RECORDING: 'wr'
}

export const WEBINAR_TYPE_OPTIONS = [
  {
    value: DLF_FORM_TYPE.WEBINAR_REGISTER,
    label: 'Upcoming Webinar'
  },
  {
    value: DLF_FORM_TYPE.WEBINAR_RECORDING,
    label: 'On-demand Webinar'
  }
]

export function isUpcomingWebinar(eFormType = '') {
  return eFormType !== DLF_FORM_TYPE.WEBINAR_RECORDING
}

export function isOnDemandWebinar(eFormType = '') {
  return eFormType === DLF_FORM_TYPE.WEBINAR_RECORDING
}

export function inferWebinarFormType(oDLF = {}, oWebInar = {}, sThumbnailUrl = '') {
  if (oDLF?.eFormType === DLF_FORM_TYPE.WEBINAR_RECORDING) return DLF_FORM_TYPE.WEBINAR_RECORDING
  if (oDLF?.eFormType === DLF_FORM_TYPE.WEBINAR_REGISTER) return DLF_FORM_TYPE.WEBINAR_REGISTER

  const hasRecordingMedia = Boolean(getTrimmedValue(oDLF?.sThumbnailUrl) || getTrimmedValue(oDLF?.sLink) || getTrimmedValue(oDLF?.sMediaUrl))
  const hasUpcomingVideo = Boolean(getTrimmedValue(oWebInar?.sLink) || getTrimmedValue(sThumbnailUrl))

  if (hasRecordingMedia && !hasUpcomingVideo) return DLF_FORM_TYPE.WEBINAR_RECORDING

  return DLF_FORM_TYPE.WEBINAR_REGISTER
}

export const DLF_VIDEO_SOURCE = {
  EXTERNAL: 'external',
  UPLOAD: 'upload'
}

function getTrimmedValue(value) {
  return String(value || '').trim()
}

export function getDlfVideoSource(formValues = {}) {
  if (Object.values(DLF_VIDEO_SOURCE).includes(formValues?.videoSource)) return formValues.videoSource
  if (getTrimmedValue(formValues?.sMediaUrl)) return DLF_VIDEO_SOURCE.UPLOAD
  if (getTrimmedValue(formValues?.sLink)) return DLF_VIDEO_SOURCE.EXTERNAL
  return ''
}

export function getDefaultDlfValue() {
  return {
    eType: 'dlf',
    sTitle: '',
    sDescription: '',
    eFormType: '',
    oCta: {
      sLabel: '',
      sUrl: ''
    },
    sFooterNote: '',
    sThumbnailUrl: '',
    sMediaUrl: '',
    eMediaType: '',
    sLink: '',
    videoSource: ''
  }
}

export function buildDlfPayload(formValues = {}, fallbackFormType = '') {
  const eFormType = formValues?.eFormType || fallbackFormType || ''
  const shouldSendCtaUrl = ![DLF_FORM_TYPE.WEBINAR_REGISTER, DLF_FORM_TYPE.WEBINAR_RECORDING].includes(eFormType)
  const payload = {
    eType: 'dlf',
    sTitle: formValues?.sTitle || '',
    sDescription: formValues?.sDescription || '',
    eFormType,
    oCta: {
      sLabel: formValues?.oCta?.sLabel || '',
      sUrl: shouldSendCtaUrl ? formValues?.oCta?.sUrl || '' : ''
    },
    sFooterNote: formValues?.sFooterNote || ''
  }

  if (eFormType !== DLF_FORM_TYPE.WEBINAR_RECORDING) return payload

  const sThumbnailUrl = getTrimmedValue(formValues?.sThumbnailUrl)
  const sMediaUrl = getTrimmedValue(formValues?.sMediaUrl)
  const sLink = getTrimmedValue(formValues?.sLink)
  const videoSource = getDlfVideoSource(formValues)

  if (sThumbnailUrl) payload.sThumbnailUrl = sThumbnailUrl

  if (videoSource === DLF_VIDEO_SOURCE.EXTERNAL && sLink) {
    payload.sLink = sLink
  } else if (videoSource === DLF_VIDEO_SOURCE.UPLOAD && sMediaUrl) {
    payload.sMediaUrl = sMediaUrl
    payload.eMediaType = 'v'
  }

  return payload
}
